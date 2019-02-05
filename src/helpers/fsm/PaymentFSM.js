// PaymentRequest Finite State Machine
import {
  extractHostname,
  getSecondsFromISODate,
  getSecondsToISODate,
} from './tools';

import doPrepareCurrency, { getPrepareCurrencyTransitions } from './payment/prepareCurrency';
import doConfirmPayment, { getConfirmPaymentTransitions } from './payment/confirmPayment';
import doSplitCoins, { getSplitCoinsTransitions } from './payment/splitCoins';
import doPaymentReady, { getPaymentReadyTransitions } from './payment/paymentReady';
import doStartPayment, { getStartPaymentTransitions } from './payment/paymentReady';
import doAckReceived, { getAckReceivedTransitions } from './payment/ackReceived';
import doSendAckAck, { getSendAckAckTransitions } from './payment/sendAckAck';
import doComplete, { getCompleteTransitions } from './payment/complete';
import doRecoverCoins, { getRecoverCoinsTransitions } from './payment/recoverCoins';


let transitions = [
  //Exit
  {
    name: 'close',
    from: 'Exit',
    to: 'FinalState'
  },
];
transitions = transitions.concat(getPrepareCurrencyTransitions());
transitions = transitions.concat(getConfirmPaymentTransitions());
transitions = transitions.concat(getSplitCoinsTransitions());
transitions = transitions.concat(getPaymentReadyTransitions());
transitions = transitions.concat(getStartPaymentTransitions());
transitions = transitions.concat(getAckReceivedTransitions());
transitions = transitions.concat(getSendAckAckTransitions());
transitions = transitions.concat(getCompleteTransitions());
transitions = transitions.concat(getRecoverCoinsTransitions());


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
      name: 'ratesTimeout',
      from: 'PrepareCurrency',
      to: 'PrepareCurrency'
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

