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
    clearTimeout(timer);
    fsm.args.ack = response.PaymentAck;
    return fsm.paymentAckArrived();          
  };

  // Bitcoin Express library also will handle the time_budget in the AJAX call timeout.
  let timer; 
  const timerPromise = new Promise((resolve, reject) => {
    const MAX_MILLISECONDS = 2147483647;
    const timeBudget = parseInt(fsm.args.time_budget || 60);
    const timeout = Math.min(MAX_MILLISECONDS, 1000 * (timeBudget + 5));
    timer = setTimeout(() => reject(new Error("timeout")), timeout); 
  });

  const handleError = (err) => {
    clearTimeout(timer);
    console.log(err);
    fsm.args.error = err.message || err;
    return fsm.error();         
  };

  let payment = {
    "Payment": fsm.args.payment,
  };

  if (fsm.args.forceBrokenPayment) {
    console.log("force broken payment");
    payment.Payment["forceBroken"] = true;
  }

  fsm.args.paymentAttempts += 1;

  const promises = [
    timerPromise,
    BitcoinExpress.Host.Payment(payment, fsm.args.amount)
  ];

  return Promise.race(promises)
    .then(getPaymentAck)
    .catch(handleError);
};

