import { persistFSM } from '../tools';
// Question: When happens the timeout? When the payment expires?


export function getStartPaymentTransitions() {
  return [{
    name: 'paymentAckArrived',
    from: 'StartPayment',
    to: 'AckReceived'
  }, {
    name: 'error',
    from: 'StartPayment',
    to: function() {
      console.log("Payment attempt", this.args.paymentAttempts);
      return this.args.paymentAttempts <= 3 ? 'RecoverCoins' : 'PaymentFailed';
    }
  }, {
    name: 'timeout',
    from: 'StartPayment',
    to: function() {
      console.log("Payment attempt", this.args.paymentAttempts);
      return this.args.paymentAttempts <= 3 ? 'RecoverCoins' : 'PaymentFailed';
    }
  }];
}


export default function doStartPayment(fsm) {
  console.log("do"+fsm.state);

  const expires = getSecondsFromISODate(fsm.args.expires);
  const now = new Date().getTime() / 1000;
  // After here, no need to check if the payment expired, as we already called it.
  if (expires < now) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.timeout());
  }

  const getPaymentAck = (response) => {
    clearTimeout(timer);
    fsm.args.ack = response.PaymentAck;
    return fsm.paymentAckArrived();          
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.error();         
  };

  const MAX_MILLISECONDS = 2147483647;
  const timeout = Math.min(MAX_MILLISECONDS, 1000 * parseInt(fsm.args.time_budget || 60));
  // Bitcoin Express library also will handle the time_budget in the AJAX call timeout.
  let timer = setTimeout(() => { throw new Error("timeout") }, timeout); 

  fsm.args.paymentAttempts += 1;
  return BitcoinExpress.Host.Payment(fsm.args.payment, fsm.args.amount)
    .then(getPaymentAck)
    .catch(handleError);
};

