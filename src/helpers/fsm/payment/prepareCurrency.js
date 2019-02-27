import React from 'react';
import { getSecondsFromISODate, getSecondsToISODate } from '../tools';


export function getPrepareCurrencyTransitions () {
  return [{
    name: 'currencyReady',
    from: 'PrepareCurrency',
    to: 'ConfirmPayment'
  }, {
    name: 'ratesTimeout',
    from: 'PrepareCurrency',
    to: 'PrepareCurrency'
  }, {
    name: 'interrupted',
    from: 'PrepareCurrency',
    to: 'PaymentInterrupted'
  }, {
    name: 'ackOk',
    from: 'PrepareCurrency',
    to: 'SendAckAck'
  }, {
    name: 'error',
    from: 'PrepareCurrency',
    to: 'RecoverCoins'
  }, {
    name: 'insufficientFunds',
    from: 'PrepareCurrency',
    to: 'Exit'
  }, {
    name: 'malformedPayment',
    from: 'PrepareCurrency',
    to: 'Exit'
  }, {
    name: 'paymentTimeout',
    from: 'PrepareCurrency',
    to: 'Exit'
  }, {
    name: 'close',
    from: 'PrepareCurrency',
    to: 'FinalState'
  }];
};


export default function doPrepareCurrency(fsm) {

  if (fsm.args.ack) {
    const result = (fsm.args.ack.status === "ok") ? fsm.ackOk() : fsm.interrupted();
    return Promise.resolve(result);
  }

  if (fsm.args.payment) {
    return Promise.resolve(fsm.interrupted());
  }

  const now = new Date().getTime() / 1000;
  if (getSecondsFromISODate(fsm.args.expires) < now) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  const errors = getArgumentErrors(fsm.args);
  if (errors.length > 0) {
    fsm.args.error = <div>
      <b>Malformed payment request:</b><br/>
      { errors.join(", ") }
    </div>;
    return Promise.resolve(fsm.malformedPayment()); 
  }


  const getExchangeRates = (response) => {
    const {
      exchangeRates,
      expiry,
    } = response;

    fsm.args.other.rates = exchangeRates;
    fsm.args.other.expiryExchangeRates = expiry;

    const totalCurrency = fsm.args.wallet.getBalanceAs(fsm.args.currency, fsm.args.issuerList, exchangeRates);
    if (fsm.args.amount > totalCurrency) {
      throw new Error("insufficientFunds");
    }

    return response;
  };


  const getSwapList = (response) => {
    const balance = parseFloat(response.toFixed(8));
    fsm.args.balance = balance;

    // Enough balance to achieve payment.
    if (fsm.args.amount <= balance) {
      // returns an empty swapObject
      return {emailVerify: null, service: null, swapList: {}};
    }

    // Get swaps needed to reach the amount
    const amountToTarget = fsm.args.amount - balance;
    return wallet.getSwapCoins(fsm.args.currency, amountToTarget, fsm.args.other.rates);
  };


  let service, emailRecovery, timers = [];
  const prepareSwap = (response) => {
    const { swapList } = response;
    fsm.args.other.swapList = swapList;

    if (Object.keys(swapList).length == 0) {
      // No need to swap any coin.
      return true;
    }

    emailRecovery = response.emailVerify;
    service = response.issuerService;

    const secondsToExpirePayment = getSecondsToISODate(fsm.args.expires);
    const secondsToExpireSwapRates = getSecondsToExpireSwapRates(fsm.args);
    const countdown = Math.min(secondsToExpirePayment, secondsToExpireSwapRates);

    timers = getSwapTimers(fsm, secondsToExpirePayment, secondsToExpireSwapRates)

    // Wait for the user to confirm the swap by clicking the button, otherwise a timer will trigger.
    return fsm.args.notification("displaySwap", {
      swapList,
      secsToExpire: countdown,
    });
  };


  const doSwap = () => {
    if (Object.keys(fsm.args.other.swapList).length == 0) {
      // No need to swap any coin.
      return true;
    }

    // Clear all the timers
    timers.forEach((timer) => clearTimeout(timer));

    const message = "Fetching exchange rates...";
    fsm.args.notification("displayLoader", { message })

    return Promise.all(doSwapsFromList(fsm.args, service, emailRecovery));
  };


  const handleError = (err) => {

    switch (err.message) {
      case "insufficientFunds":
        fsm.args.error = "Insufficient funds to proceed with this payment";
        fsm.args.errorType = "insufficientFunds"
        return fsm.insufficientFunds();

      case "paymentTimeout":
        fsm.args.error = "Payment request expired";
        return fsm.paymentTimeout();

      case "ratesTimeout":
        return fsm.ratesTimeout();
    }

    fsm.args.error = err.message || err;
    return fsm.error(); 
  }

  return fsm.args.wallet.getIssuerExchangeRates()
    .then(() => fsm.args.wallet.Balance(fsm.args.currency))
    .then(getSwapList)
    .then(prepareSwap)
    .then(doSwap)
    .then(() => fsm.currencyReady())
    .catch(handleError);
};


/**
 * Returns the list of promises to resolve in other to proceed with all the swaps of coins required
 * for the actual payment.
 *
 * :param args: [obj] FSM arguments
 * :param service: [obj] issuer service, the object response from 'info' request to the issuer.
 * :param emailRecovery: [bool] user allow recovery at the wallet settings.
 *
 * :return: [array] the promises of swaps to resolve.
 */
function doSwapsFromList(args, service, emailRecovery) {
  return args.other.swapList.map((swap) => {
    const sourceCurrencyKey = Object.keys(swap)[0];
    const sourceCurrency = swap[sourceCurrencyKey];

    const args = {
      source: {
        sourceValue: parseFloat(sourceCurrency.from.toFixed(8)),
        sourceCurrency: sourceCurrencyKey,
      },
      target: {
        targetValue: parseFloat(sourceCurrency.exchange.toFixed(8)),
        targetCurrency: args.currency,
      },
      lastModified: null,
      emailRecovery,
      fee: sourceCurrency.fee,
      maxSelected: false,
    };
    return wallet.atomicSwap(args, service, true);
  });
};


/*
 * Returns the list of errors for the given state, if there is any.
 * :param args: [obj] FSM arguments
 * :return: [array] list of error string
 */
function getArgumentErrors(args) {
  const { wallet } = args;
  let errorList = [];

  const {
    amount,
    currency,
    acceptable_issuers,
    description,
  } = args;

  const {
    walletCurrencies,
  } = wallet.config;


  // Check problems with currency
  if (!currency) {
    errorList.push("'currency undefined'");
  } else if (typeof currency == "string" && walletCurrencies.indexOf(currency) == -1) {
    errorList.push("'unsupported currency'");
  } else if (typeof currency !== "string") {
    errorList.push("'currency is not a string'");
  }

  // Check problems with amount
  if (isNaN(amount)) {
    errorList.push("'amount is not a number'");
  }

  // Check problems with issuer list
  if (wallet.config.debug) {
    console.log("Issuer accepted list - " + acceptable_issuers);
  }

  if (!acceptable_issuers) {
    errorList.push("'acceptable_issuers undefined'");
  } else if (!Array.isArray(acceptable_issuers) || acceptable_issuers.length == 0) {
    errorList.push("'acceptable_issuers list'");
  } else if (wallet.getAcceptableDomains(acceptable_issuers).length == 0) {
    errorList.push("'no acceptable issuer domains'");
  }

  // Check if description is present
  if (!description) {
    errorList.push("'description undefined'");
  }

  return errorList;
};


/**
 * Creates all the timers that will timeout for all the expiry times throwing an error.
 *
 * :param fsm: [obj]
 * :param secsToPayment: [int] seconds for the payment to expire
 * :param secsToRates: [int] seconds for the swap rates to expire
 */
function getSwapTimers(fsm, secsToPayment, secsToRates) {
  const MAX_MILLISECONDS = 2147483647;
  const throwError = (key) => () => { throw new Error(key) };

  const payTimeout = Math.min(MAX_MILLISECONDS, 1000 * secsToPayment);
  const paymentTimer = setTimeout(throwError("paymentTimeout"), payTimeout); 

  const ratesTimeout = Math.min(MAX_MILLISECONDS, 1000 * secsToRates);
  const disableButtonTimer = setTimeout(throwError("disableSwap"), ratesTimeout);
  const swapRateTimer = setTimeout(throwError("ratesTimeout"), ratesTimeout + 5000); 

  return [paymentTimer, disableButtonTimer, swapRateTimer];
}


/**
 * From the list of swaps to proceed for the actual payment, get the earliest expiry time.
 * :param args: [obj] FSM arguments.
 * :return: [string] ISOString of the earliest expiry date.
 */
function getSecondsToExpireSwapRates(args) {
  // From all the involved currencies to swap, get the sooner expiry time
  const { currency } = args;
  const { expiryExchangeRates, swapList } = args.other;
  const swapExpiryISODate = _getEarliestExpiryTime(currency, expiryExchangeRates, swapList);
  return getSecondsToISODate(swapExpiryISODate);
}


function _getEarliestExpiryTime(currency, expiryRates, swapList) {
  if (typeof expiryRates == "string") {
    // It's already the expiry ISOString date
    return expiryRates;
  }

  // Get the earliest expiry time
  currency = currency.toUpperCase();
  const currencyKeys = Object.keys(swapList);

  let expiry;
  currencyKeys.forEach((currencyCode) => {
    const key = `${currencyCode.toUpperCase()}_${currency}`;
    const actualExpiry = expiryRates[key];
    if (!actualExpiry) {
      return;
    }

    const actualExpiryDate = new Date(actualExpiry).getTime();
    if (!expiry || actualExpiryDate < new Date(expiry).getTime()) {
      expiry = actualExpiry;
    }
  });
  return expiry;
};

