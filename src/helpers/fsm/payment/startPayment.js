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
      return this.args.paymentAttempts <= 3 ? 'PaymentInterrupted' : 'VerifyPaymentCoins';
    }
  }, {
    name: 'timeout',
    from: 'StartPayment',
    to: function() {
      console.log("Payment attempt", this.args.paymentAttempts);
      return this.args.paymentAttempts <= 3 ? 'PaymentInterrupted' : 'VerifyPaymentCoins';
    }
  }];
}


export default function doStartPayment(fsm) {
  console.log("do"+fsm.state);

  const expires = getSecondsFromISODate(fsm.args.expires);
  const now = new Date().getTime() / 1000;
  if (expires < now) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.timeout());
  }

  const getPaymentAck = (response) => {
    fsm.args.ack = response.PaymentAck;
    return fsm.paymentAckArrived();          
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.error();         
  };

  fsm.args.paymentAttempts += 1;
  return BitcoinExpress.Host.Payment(fsm.args.payment, fsm.args.amount)
    .then(getPaymentAck)
    .catch(handleError);
};

