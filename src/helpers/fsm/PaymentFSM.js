// PaymentRequest Finite State Machine
import doPrepareCurrency, { getPrepareCurrencyTransitions } from './payment/prepareCurrency';
import doConfirmPayment, { getConfirmPaymentTransitions } from './payment/confirmPayment';
import doSplitCoins, { getSplitCoinsTransitions } from './payment/splitCoins';
import doPaymentReady, { getPaymentReadyTransitions } from './payment/paymentReady';
import doStartPayment, { getStartPaymentTransitions } from './payment/paymentReady';
import doAckReceived, { getAckReceivedTransitions } from './payment/ackReceived';
import doSendAckAck, { getSendAckAckTransitions } from './payment/sendAckAck';
import doComplete, { getCompleteTransitions } from './payment/complete';
import doRecoverCoins, { getRecoverCoinsTransitions } from './payment/recoverCoins';
import doPaymentFailed, { getPaymentFailedTransitions } from './payment/paymentFailed';
import doExit, { getExitTransitions } from './payment/exit';
//import doPaymentInterrupted, { getPaymentInterruptedTransaction } from './payment/paymentInterrupted';
//import doVerifyPaymentCoins, { getVerifyPaymentCoinsTransaction } from './payment/verifyPaymentCoin';


let transitions = transitions.concat(getPrepareCurrencyTransitions());
transitions = transitions.concat(getConfirmPaymentTransitions());
transitions = transitions.concat(getSplitCoinsTransitions());
transitions = transitions.concat(getPaymentReadyTransitions());
transitions = transitions.concat(getStartPaymentTransitions());
transitions = transitions.concat(getAckReceivedTransitions());
transitions = transitions.concat(getSendAckAckTransitions());
transitions = transitions.concat(getCompleteTransitions());
transitions = transitions.concat(getRecoverCoinsTransitions());
transitions = transitions.concat(getPaymentFailedTransitions());
transitions = transitions.concat(getExitTransitions());
//transitions = transitions.concat(getPaymentInterruptedTransaction());
//transitions = transitions.concat(getVerifyPaymentCoinsTransaction());


var PaymentRequestFSM = new StateMachine.factory({
  init: 'PrepareCurrency',
  transitions,
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
  const {
    //exchangeRates,
    //expiryExchangeRates,
    paymentDetails,
    wallet,
  } = this.props;

  let baseArguments = {
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
    //other: {
    //  rates: exchangeRates,
    //  expiryExchangeRates,
    //},
  };

  const handleError = (err) => {
    console.log(err);
    if (this.state.paymentSessionStarted) {
      return wallet.config.storage.sessionEnd();
    }
  };

  const machine = new FSM("paymentRequest", Object.assign(baseArguments, paymentDetails));

  machine.run()
    .then(() => this.props.refreshCoinBalance())
    .then(() => storage.sessionEnd())
    .catch(handleError);
}


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
    doPaymentFailed,
    doExit,
    //doPaymentInterrupted,
    //doVerifyPaymentCoins,
  }
}

