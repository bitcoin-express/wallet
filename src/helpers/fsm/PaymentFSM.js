// PaymentRequest Finite State Machine
import {
  extractHostname,
  getSecondsFromISODate,
  getSecondsToISODate,
} from './tools';

import {
  getEarliestExpiryTime,
  getPaymentOptions,
  getSwapPromisesList,
} from './payment/tools';


var PaymentRequestFSM = new StateMachine.factory({
  init: 'PrepareCurrency',
  transitions: [
    //PrepareCurrency
    {
      name: 'currencyReady',
      from: 'PrepareCurrency',
      to: 'ConfirmPayment'
    },
    {
      name: 'interrupted',
      from: 'PrepareCurrency',
      to: 'PaymentInterrupted'
    },
    {
      name: 'ackOk',
      from: 'PrepareCurrency',
      to: 'SendAckAck'
    },
    {
      name: 'error',
      from: 'PrepareCurrency',
      to: 'RecoverCoins'
    },
    {
      name: 'insufficientFunds',
      from: 'PrepareCurrency',
      to: 'Exit'
    },
    {
      name: 'paymentTimeout',
      from: 'PrepareCurrency',
      to: 'Exit'
    },
    {
      name: 'close',
      from: 'PrepareCurrency',
      to: 'FinalState'
    },
    //Exit
    {
      name: 'close',
      from: 'Exit',
      to: 'FinalState'
    },
    //ConfirmPayment
    {
      name: 'splitCoins',
      from: 'ConfirmPayment',
      to: 'SplitCoins'
    },
    {
      name: 'paymentTimeout',
      from: 'ConfirmPayment',
      to: 'Exit'
    },
    {
      name: 'close',
      from: 'ConfirmPayment',
      to: 'FinalState'
    },
    //SplitCoins
    {
      name: 'coinsReady',
      from: 'SplitCoins',
      to: 'PaymentReady'
    },
    {
      name: 'paymentTimeout',
      from: 'SplitCoins',
      to: 'Exit'
    },
    {
      name: 'error',
      from: 'SplitCoins',
      to: 'Exit'
    },
    {
      name: 'ratesTimeout',
      from: 'PrepareCurrency',
      to: 'PrepareCurrency'
    },
    //PaymentReady
    {
      name: 'startPayment',
      from: 'PaymentReady',
      to: 'StartPayment'
    },
    {
      name: 'error',
      from: 'PaymentReady',
      to: 'PrepareCurrency'
    },
    //PaymentInterrupted
    {
      name: 'coinsExist',
      from: 'PaymentInterrupted',
      to: 'VerifyPaymentCoins'
    },
    {
      name: 'coinsNotExist',
      from: 'PaymentInterrupted',
      to: 'StartPayment'
    },
    //VerifyPaymentCoins
    {
      name: 'coinRecoveryComplete',
      from: 'VerifyPaymentCoins',
      to: 'Exit'
    },
    //StartPayment
    {
      name: 'paymentAckArrived',
      from: 'StartPayment',
      to: 'AckReceived'
    },
    {
      name: 'error',
      from: 'StartPayment',
      to: function() {
        return this.args.paymentAttempts <= 3 ? 'PaymentInterrupted' : 'VerifyPaymentCoins';
      }
    },
    //AckReceived
    {
      name: 'ackOk',
      from: 'AckReceived',
      to: 'SendAckAck'
    },
    {
      name: 'error',
      from: 'AckReceived',
      to: 'RecoverCoins'
    },
    //SendAckAck
    {
      name: 'paymentComplete',
      from: 'SendAckAck',
      to: 'Complete'
    },
    //RecoverCoins
    {
      name: 'coinRecoveryComplete',
      from: 'RecoverCoins',
      to: 'Exit'
    },
    //Complete
    {
      name: 'close',
      from: 'Complete',
      to: 'FinalState'
    }
  ],
  data: function(param) {
    let defaultArgs = {
      interrupted: false,
      splitFee: 0,
      paymentAttempts: 0,
      signal: null
    };
    return {
      args: Object.assign({}, defaultArgs, param)
    }
  },
  methods: {
    onInvalidTransition: function(transition, from, to) {
      console.log("Exception: "+transition + " ignored from " + from + " to " + to);
      //throw new Exception("Invalid transition");
    },
    onPendingTransition: function(transition, from, to) {
      console.log("Exception: "+transition + " blocked from " + from + " to " + to);
      //throw new Exception("Transition already in progress");
    }
  }
});


var runPaymentFSM =  function() {
  let {
    exchangeRates,
    expiryExchangeRates,
    loading,
    paymentDetails,
    refreshCoinBalance,
    snackbarUpdate,
    wallet,
  } = this.props;

  const {
    storage,
  } = wallet.config;

  let machine = new FSM("paymentRequest", Object.assign({
    // Only for payment request
    //use by PaymentInterrupted
    coinsExist: false,
    //Simulates that Payment has failed
    failPayment: false,

    // These are needed by the state machine
    // if > 0 causes SplitCoin to be executed
    splitFee: 0,
    // when true simulates restart after power failure
    interrupted: false,

    // ALWAYS include when creating an FSM
    wallet: wallet,
    notification: this.notificationFSM,
    other: {
      rates: exchangeRates,
      expiryExchangeRates,
    },
  }, paymentDetails));

  const handleError = (err) => {
    console.log(err);
    if (this.state.paymentSessionStarted) {
      return storage.sessionEnd();
    }
  };

  machine.run()
    .then(() => refreshCoinBalance())
    .then(() => storage.sessionEnd())
    .catch(handleError);
}


var now = function() {
  // in seconds
  return ;
}


var persistFSM = function(wallet, args) {
  let argsCloned = null;
  if (args !== null) {
    argsCloned = JSON.parse(JSON.stringify(args));
    delete argsCloned.wallet;
    delete argsCloned.notification;
    delete argsCloned.other;
  }
  return wallet.setPersistentVariable(wallet.config.FSM, argsCloned);
};


var _getRecoveryCoins = function(args) {
  const {
    payment,
    ack,
  } = args;
  let result = [];

  if (payment && payment.coins) {
    result = result.concat(payment.coins);
  }
  if (ack && ack.coins) {
    result = result.concat(ack.coins);
  }

  return result;
}


/*
 * It also means there would be no need unpersist payment
 * if you also reverse the order of checking 'payment' and
 * 'ack' at the start of doPrepareCurrency.
 */
var doPrepareCurrency = function(fsm) {
  // args also contains:
  // wallet - walletBF
  // notification - function needed to be called to
  //                comunicate with the UI - React.
  // other - json with other relevant info
  //   * rates - rates from issuer
  const {
    ack,
    amount,
    currency,
    issuers,
    memo,
    other,
    payment,
    wallet,
  } = fsm.args;

  const {
    walletCurrencies,
  } = wallet.config;

  const expires = getSecondsFromISODate(fsm.args.expires);

  if (ack) {
    if (ack.status === "ok") {
      return Promise.resolve(fsm.ackOk());
    }
    return Promise.resolve(fsm.error()); 
  }

  if (payment) {
    return Promise.resolve(fsm.interrupted());
  }

  if (expires < now()) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  let errorList = [];
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
    console.log("Issuer accepted list - " + issuers);
  }
  if (!issuers) {
    errorList.push("'issuers undefined'");
  } else if (!Array.isArray(issuers) || issuers.length == 0) {
    errorList.push("'issuers list'");
  }
  // Check if memo is present
  if (!memo) {
    errorList.push("'memo undefined'");
  }

  let issuerList = wallet.getAcceptableDomains(issuers);
  if (issuerList.length == 0) {
    errorList.push("'no acceptable issuer domains'");
  }

  if (errorList.length > 0) {
    fsm.args.error = "Malformed payment request - " + errorList.join(", ");
    return Promise.resolve(fsm.error()); 
  }

  // Finally, start preparing the currencies amounts
  const {
    rates,
  } = other;

  const totalCurrency = wallet.getBalanceAs(currency, issuerList, rates);

  if (wallet.config.debug) {
    console.log("TOTAL CURRENCY - " + totalCurrency);
  }

  if (amount > totalCurrency) {
    fsm.args.error = "Insufficient funds to proceed with this payment";
    fsm.args.errorType = "insufficientFunds"
    return Promise.resolve(fsm.insufficientFunds());
  }

  let balance, service, emailRecovery;
  const getSwapRequired = (response) => {
    balance = parseFloat(response.toFixed(8));
    fsm.args.balance = balance;

    if (amount <= balance) {
      // Enough balance to achieve payment.
      return {};
    }

    const retrieveSwapList = (response) => {
      const {
        swapList,
        issuerService,
        emailVerify,
      } = response;

      emailRecovery = emailVerify;
      service = issuerService;
      return swapList;
    };

    // Get swaps needed to reach the amount
    const amountToTarget = amount - balance;
    return wallet.getSwapCoins(currency, amountToTarget, rates)
      .then(retrieveSwapList);
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return Promise.resolve(fsm.error()); 
  }

  const swapCoinsIfRequired = (swapList) => {

    if (Object.keys(swapList).length == 0) {
      return "currencyReady";
    }

    // Prepare Swap Coins
    fsm.args.other.swapList = swapList;
    const {
      expiryExchangeRates,
    } = fsm.args.other;


    const swapAllRequired = (result) => {
      if (result == "expired") {
        return "paymentTimeout";
      }

      if (result == "rateExpired") {
        // TO_DO
        const notifyRatesTimeout = (response) => {
          const {
            exchangeRates,
            expiry,
          } = response;

          fsm.args.other.rates = exchangeRates;
          fsm.args.other.expiryExchangeRates = expiry;
          return "ratesTimeout";
        }

        const message = "Fetching exchange rates...";
        return fsm.args.notificationList("displayLoader", { message })
          .then(() => wallet.getIssuerExchangeRates())
          .then(notifyRatesTimeout)
          .catch(handleError);
      }

      // Suceed - Swap coins
      const swapPromises = getSwapPromisesList(swapList, currency, service, emailRecovery);
      const message = "Fetching exchange rates...";
      return fsm.args.notification("displayLoader", { message })
        .then(() => Promise.all(swapPromises));
    };

    const swapExpiryISODate = getEarliestExpiryTime(currency, expiryExchangeRates, swapList);

    const secondsToSwapExpire = getSecondsToISODate(swapExpiryISODate);
    const secondsToExpire = getSecondsToISODate(fsm.args.expires);

    const promiseExpiryTimeout = new Promise((resolve, reject) => { 
      const millisecondsToExpire = 1000 * secondsToExpire;
      const expiryTimeout = Math.min(2147483647, millisecondsToExpire);
      console.log(`Payment expires in ${expiryTimeout} sec`);
      setTimeout(resolve, expiryTimeout, "expired"); 
    });

    const promiseUserConfirms = fsm.args.notification("displaySwap", {
      swapList,
      secsToExpire: Math.min(secondsToSwapExpire, secondsToExpire),
    });

    const promiseSwapTimeout = new Promise((resolve, reject) => { 
      const millisecondsToExpire = 1000 * secondsToSwapExpire;
      const expiryTimeout = Math.min(2147483647, millisecondsToExpire);
      console.log(`Swap expires in ${expiryTimeout} sec`)
      setTimeout(() => fsm.args.notification("disableSwap"), expiryTimeout);
      setTimeout(resolve, expiryTimeout + 5000, "rateExpired"); 
    });

    return Promise.race([promiseExpiryTimeout, promiseUserConfirms, promiseSwapTimeout])
      .then(swapAllRequired)
      .catch(handleError);
  };

  const handleResponse = (response) => {
    switch(response) {
      case "ratesTimeout":
        return fsm.ratesTimeout();
      case "paymentTimeout":
        fsm.args.error = "Payment request expired";
        return fsm.paymentTimeout();
      default:
        return fsm.currencyReady();
    }
  };

  return wallet.Balance(currency)
    .then(getSwapRequired)
    .then(swapCoinsIfRequired)
    .then(handleResponse)
    .catch(handleError);
};


//select coins to determine the split fee
//display confirmation page
//wait for confirm click
var doConfirmPayment = function(fsm) {
  console.log("do"+fsm.state);

  const {
    amount,
    currency,
    other,
    wallet,
  } = fsm.args;

  const expires = getSecondsFromISODate(fsm.args.expires);
  if (expires < now()) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  let splitFee = 0;
  const waitForUserConfirmation = (fee) => {
    splitFee = fee;
    let timeToExpire = expires - now();

    const promiseTimeExpired = new Promise((resolve, reject) => { 
      let secs = Math.min(2147483647, 1000 * timeToExpire);
      setTimeout(resolve, secs, "expired"); 
    });
    const promiseUserConfirms = fsm.args.notification("displayPayment", {
      splitFee,
      timeToExpire,
    });

    console.log(other);
    return Promise.race([promiseTimeExpired, promiseUserConfirms]);
  };

  const handleUserConfirmation = (resp) => {
    if (resp == "expired") {
      fsm.args.error = "Payment request expired";
      return fsm.paymentTimeout();
    }

    fsm.args.useEmail = resp;
    return fsm.args.notification("displayLoader", {
      message: "Sending coins..."
    });
  };

  const callSplitCoinsState = (resp) => {
    if (resp == "expired") {
      fsm.args.error = "Payment request expired";
      return fsm.paymentTimeout();
    }
    return fsm.splitCoins();
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return Promise.resolve(fsm.error()); 
  };

  return wallet.getBitcoinExpressFee(amount, currency)
    .then(waitForUserConfirmation)
    .then(handleUserConfirmation)
    .then(callSplitCoinsState)
    .catch(handleError);
};


var doSplitCoins = function(fsm) {
  console.log("do"+fsm.state);

  const {
    amount,
    currency,
    policies,
    wallet,
  } = fsm.args;

  const {
    storage,
  } = wallet.config;

  const expires = getSecondsFromISODate(fsm.args.expires);

  if (expires < now()) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  const buildPaymentResponse = (coins) => {
    // Construct a Payment object and add to the fsm  
    // TO_DO: Include notification message from the user + password/reference for encryption.
    const options = getPaymentOptions(fsm.args.useEmail, wallet, policies);

    const payment = {
      id: Math.random().toString(36).replace(/[^a-z]+/g, ''),
      payment_id: fsm.args.payment_id,
      coins: coins.map((c) => typeof c == "string" ? c : c.base64),
      merchant_data: fsm.args.merchant_data,
      client: "web",
      language_preference: "en_GB",
      options,
    };
    fsm.args.payment = payment;

    return fsm.coinsReady();
  };

  // The error transition goes to the Exit state which does not attempt 
  // to recover Coins. Therefore there is no need to get the recover coins
  // ready (which are still in the coin store) or to delete payment
  // (which hasn't actually been persisted at this point).
  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.error(); 
  };

  return wallet._getCoinsExactValue(amount, {}, false, currency)
    .then(buildPaymentResponse)
    .catch(handleError);
};


// [wallet] --- extract coins for payment --> [wallet]
var doPaymentReady = function(fsm) {
  const {
    amount,
    currency,
    payment,
    wallet,
  } = fsm.args;

  const {
    coins,
  } = payment;

  if (wallet.config.debug) {
    console.log("do"+fsm.state);
  }

  const persistState = (resp) => {
    if (wallet.config.debug) {
      console.log("Coins extracted: " + resp);
    }
    // Persist the Payment record
    return persistFSM(wallet, fsm.args);
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    delete fsm.args.payment;
    return fsm.error(); 
  };

  // Extract coins from store
  const msg = `buy item for ${currency} ${amount}`;
  return wallet.extractCoins(coins, msg, "wallet", currency, false)
    .then(persistState)
    .then(() => wallet.config.storage.flush())
    .then(() => fsm.startPayment())
    .catch(handleError);
};


// [wallet] --- payment_url ---> [merchant]
var doStartPayment = function(fsm) {
  const {
    amount,
    payment,
    wallet,
  } = fsm.args;

  if (wallet.config.debug) {
    console.log("do"+fsm.state);
  }

  const storePaymentAck = (response) => {
    fsm.args.ack = response.PaymentAck;
    return fsm.paymentAckArrived();          
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.error();         
  };

  fsm.args.paymentAttempts += 1;
  return BitcoinExpress.Host.Payment(payment, amount)
    .then(storePaymentAck)
    .catch(handleError);
};


// [wallet] <--- PaymentAck --- [merchant]
var doAckReceived = function(fsm) {
  const {
    ack,
    wallet,
  } = fsm.args;

  if (wallet.config.debug) {
    console.log("do"+fsm.state);
  }
  
  switch (ack.status) {
    case "ok":
      const {
        amount,
        balance,
        currency,
        memo,
        merchant_data,
        payment,
        payment_url,
      } = fsm.args;

      const recordTransaction = (newBalance) => {
        // recordTransaction calls flush, at this point atomically
        // persists the tx in history and the FSM payment args.
        return wallet.recordTransaction({
          headerInfo: {
            fn: 'buy item',
            domain: ack.seller || extractHostname(document.referrer),
          },
          paymentInfo: {
            actualValue: amount,
            faceValue: amount,
            newValue: newBalance - balance,
            fee: 0,
          },
          coin: payment.coins,
          other: {
            target: amount,
            item: payment.payment_id,
          },
          currency,
        });
      };

      const storeItemInWallet = () => {
        // Save in item store
        const domain = extractHostname(document.referrer);
        console.log("item referrer ", domain);
        const item = {
          paymentDetails: {
            amount,
            currency,
            domain,
            memo,
            payment_url,
          },
          paymentAck: ack,
        };
        fsm.args.item = item;
        return wallet.saveItem(item, currency);
      };

      const handleError = (err) => {
        fsm.args.error = err.message || err;
        return fsm.error();
      };

      // The present version does not lock the coin store for the duration of
      // the payment. Therefore if another device were to cause the balance to
      // reduce, the history item may be incorrect.
      return persistFSM(wallet, fsm.args)
        .then(() => wallet.Balance(currency))
        .then(recordTransaction)
        .then(storeItemInWallet)
        .then(() => fsm.ackOk())
        .catch(handleError);

    //Note sure if there is any special action we can take
    //upon these error
    case "issuer-error":
      return Promise.resolve(fsm.paymentRecovery());

    case "payment-unknown":
      fsm.args.error = "Seller could not identify the sale item";
      break;

    case "after-expires":
      fsm.args.error = "The offer to sell has expired";
      break;

    case "insufficient-amount":
      fsm.args.error = "The payment failed because we didn't send enough funds";
      break;

    case "bad-coins":
      fsm.args.error = "One or more Coins were unexpectidly invalid";
      break;

    case "retry-expired":
      fsm.args.error = "Seller no longer permitting access to the product url";
      break;

    case "rejected":
      fsm.args.error = "Seller rejected this payment";
      break;

    case "failed":
      fsm.args.error = "The payment failed for an unspecified reason";
      break;

    default:
      fsm.args.error = "Received a bad PaymentAck";
      break;
  }
  return Promise.resolve(fsm.error());                  
};


// [wallet] ---- PaymentAck ---> [Bitcoin-express.js]
var doSendAckAck = function(fsm) {
  const {
    wallet,
  } = fsm.args;

  const {
    debug,
    storage,
  } = wallet.config;

  if (debug) {
    console.log("do"+fsm.state);
  }

  const sendAckToBitcoinExpress = () => {
    delete fsm.args.ack.coins;
    return BitcoinExpress.Host.PaymentAckAck(fsm.args.ack);
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.paymentComplete();
  };

  return persistFSM(wallet, null)
    .then(() => storage.flush())
    .then(sendAckToBitcoinExpress)
    .then(() => fsm.paymentComplete())
    .catch(handleError);
};

var doComplete = function(fsm) {
  console.log("do"+fsm.state);

  const {
    ack,
    amount,
    currency,
    item,
    wallet,
  } = fsm.args;

  let msg = `Paid ${currency}${amount}`;
  return BitcoinExpress.Host.PopupMessage(msg, 5000).then(() => {
    return fsm.args.notification("displayItem", {
      item,
    });
  }).then(() => {
    return fsm.close();
  });
};

var doRecoverCoins = function(fsm) {
  console.log("do"+fsm.state);
  //record coin loss in history
  //unpersist PaymentAck
  //ATOMIC
  const {
    ack,
    amount,
    currency,
    error,
    merchant_data,
    payment,
    wallet,
  } = fsm.args;

  const {
    COIN_STORE,
    storage,
  } = wallet.config;

  /*
   * The three actions MUST be atomic:
   * Recover all coins;
   * Record coin loss in history;
   * Unpersist fsm.args;
   */
  let promise = Promise.resolve(storage.flush);
  let coinsToRecover = _getRecoveryCoins(fsm.args);
  if (coinsToRecover.length > 0) {
    const params = {
      issuerRequest: {
        fn: "exist",
        coin: coinsToRecover,
      }
    };

    let oldBalance;
    let coins;
    let message = error || "" + "- trying to recover your coins...";
    promise = fsm.args.notification("displayLoader", { message }).then(() => {
      return wallet.Balance(currency);
    }).then((value) => {
      oldBalance = value;
      return wallet.issuer("exist", params);
    }).then((response) => {
      if (response.deferInfo || response.status !== "ok") {
        return 0;
      }

      // TO_DO: Must be verified the coins?
      coins = response.coins;
      const params = [COIN_STORE, coins, false, currency];
      return storage.addAllIfAbsent(...params).then(() => coins.length);
    }).then((numCoins) => {
      return fsm.args.notification("displayLoader", {
        message: `Recovered ${numCoins} coins...`,
      }).then(() => numCoins);
    }).then((numCoins) => {
      if (numCoins == 0) {
        // Return old balance, no new coins included
        return oldBalance;
      }
      return wallet.Balance(currency);
    }).then((value) => {
      if (oldBalance == value) {
        // Flush for persistFSM
        return storage.flush();
      }
      const recoveredValue = value - oldBalance;
      if (recoveredValue > 0) {
        fsm.args.error += `. Recovered coins: ${currency} ${recoveredValue.toFixed(8)}.`;
        return wallet.recordTransaction({
          headerInfo: {
            fn: 'coin recovery',
            domain: merchant_data,
          },
          paymentInfo: {
            actualValue: recoveredValue,
            faceValue: recoveredValue,
            newValue: recoveredValue,
            comment: "recovery from payment failure",
            fee: 0,
          },
          coin: coins,
          other: {
            target: amount,
            item: payment.payment_id,
          },
          currency,
        });
      }
      fsm.args.error += ". No coins recovered.";
      return true;
    });
  }

  return persistFSM(wallet, null).then(() => {
    return promise;
  }).then(() => {
    return BitcoinExpress.Host.PaymentAckAck(ack);
  }).then(function () {
    return fsm.coinRecoveryComplete();     
  }).catch(function (err) {
    //Not sure what can be done about an error so just signal complete
    fsm.args.error = err.message || err;
    return fsm.coinRecoveryComplete();       
  });
};

var doExit = function(fsm) {
  console.log("do"+fsm.state);
  //display final status
  //wait for close
  return fsm.args.notification("displayError", {
    error: fsm.args.error,
    errorType: fsm.args.errorType,
  }).then(() => {
    return fsm.close();
  });
};


var doPaymentInterrupted = function(fsm) {
  console.log("do" + fsm.state);

  let coins = _getRecoveryCoins(fsm.args);
  if (coins.length == 0) {
    return Promise.resolve(fsm.coinsNotExist());
  }

  const checkCoinsExistence = (resp) => {
    if (resp.deferInfo) {
      return fsm.coinsNotExist();
    }
    if (!isNaN(resp) && resp == coins.length) {
      // removed all the coins
      return fsm.coinsNotExist();
    }
    return fsm.coinsExist();
  };

  // check if coins exists
  return fsm.args.wallet.existCoins(true, coins, fsm.args.currency)
    .then(checkCoinsExistence);
};


var doVerifyPaymentCoins = function(fsm) {
  console.log("do"+fsm.state);
  const {
    amount,
    currency,
    wallet,
  } = fsm.args;

  const {
    ISSUE_POLICY,
    DEFAULT_ISSUER,
    VERIFY_EXPIRE,
    COIN_STORE,
    storage,
  } = wallet.config;

  let coinsToRecover = _getRecoveryCoins(fsm.args);
  
  const args = {
    target: "0",
    // Coin is external. Already extracted from COIN_STORE
    external: true,
    newCoinList: [],
    action: 'payment',
    originalFaceValue: amount,
    comment: 'verify coins from payment failure',
    policy: wallet.getSettingsVariable(ISSUE_POLICY),
    domain: wallet.getSettingsVariable(DEFAULT_ISSUER),
    expiryPeriod_ms: wallet.getExpiryPeriod(VERIFY_EXPIRE),
  };

  let issuerService, fee;
  let payment = fsm.args.payment;

  const getVerificationFee = (resp) => {
    issuerService = resp.issuer[0];
    return wallet.getVerificationFee(amount, issuerService);
  };

  const notifyFeesToWallet = (resp) => {
    // Display fees to the wallet, and wait for user confimation.
    fee = resp;
    return fsm.args.notification("displayRecovery", {
      recoveryFee: fee,
    });
  };

  const getUserResponse = (wantsToRecover) => {
    // Response from the wallet, depending if the user wants to recover
    // the coins or retry the payment.
    if (!wantsToRecover) {
      return fsm.args.notification("displayLoader", {
        message: "Retrying your payment..."
      }).then(() => {
        throw new Error("payment");
      });
    }

    return fsm.args.notification("displayLoader", {
      message: "Recoverying your coins..."
    });
  };

  const addCoinsToRecoverInStore = (resp) => {
    let coins = resp.coin;
    if (resp.status == "coin value too small") {
      // Recover original coins, coins value too small to verify
      coins = coinsToRecover;
    }
    return storage.addAllIfAbsent(COIN_STORE, coins, false, currency);
  };

  const completeRecovery = (resp) => {
    fsm.args.error = fsm.args.error ? fsm.args.error + ". " : "";
    fsm.args.error += "Payment failed but coins were recovered";
    fsm.args.recoveredAmount = wallet.getSumCoins(coinsToRecover) - fee;
    return fsm.coinRecoveryComplete();
  };

  const handleError = (err) => {
    //Not sure what can be done about an error so just signal complete
    if (err.message && err.message == "payment") {
      fsm.args.payment = payment;
      return fsm.coinsReady();
    }
    fsm.args.error = err.message || err;
    return fsm.coinRecoveryComplete();       
  };

  // Unpersist Payment
  return persistFSM(wallet, null)
    .then(() => wallet.issuer("info", {}, null, "GET"))
    .then(getVerificationFee)
    .then(notifyFeesToWallet)
    .then(getUserResponse)
    .then(() => wallet.verifyCoins(coinsToRecover, args, false, currency))
    .then(addCoinsToRecoverInStore)
    .then(completeRecovery)
    .catch(handleError);
};


export default {
  stateMachine: PaymentRequestFSM,
  fn: {
    doPrepareCurrency,
    doConfirmPayment,
    doSplitCoins,
    doAckReceived,
    doSendAckAck,
    doStartPayment,
    doPaymentReady,
    doComplete,
    doRecoverCoins,
    doExit,
    doPaymentInterrupted,
    doVerifyPaymentCoins,
  }
}

