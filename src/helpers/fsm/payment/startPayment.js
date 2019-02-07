import { persistFSM } from '../tools';


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
      return this.args.paymentAttempts <= 3 ? 'RecoverCoins' : 'RecoverFailedCoins';
    }
  }, {
    name: 'timeout',
    from: 'StartPayment',
    to: function() {
      console.log("Payment attempt", this.args.paymentAttempts);
      return this.args.paymentAttempts <= 3 ? 'RecoverCoins' : 'RecoverFailedCoins';
    }
  }];
}


export default function doStartPayment(fsm) {
  console.log("do"+fsm.state);

  if (fsm.args.paymentAttempts > 3) {
    fsm.args.error = "Too many payment attempts";
    return Promise.resolve(fsm.error());
  }

  const getPaymentAck = (response) => {
    fsm.args.ack = response.PaymentAck;
    return fsm.paymentAckArrived();          
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.error();         
  };

  // Bitcoin Express library also will handle the time_budget in the AJAX call timeout.
  const MAX_MILLISECONDS = 2147483647;
  const timeBudget = parseInt(fsm.args.time_budget || 60);
  const timeout = Math.min(MAX_MILLISECONDS, 1000 * (timeBudget + 5));
  let timer = setTimeout(() => { throw new Error("timeout") }, timeout); 

  fsm.args.paymentAttempts += 1;
  return BitcoinExpress.Host.Payment(fsm.args.payment, fsm.args.amount)
    .then(getPaymentAck)
    .catch(handleError);
};

