import { getSecondsFromISODate, getSecondsToISODate } from '../tools';


export function getConfirmPaymentTransitions() {
  return [{
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
    name: 'error',
    from: 'ConfirmPayment',
    to: 'Exit'
  },
  {
    name: 'close',
    from: 'ConfirmPayment',
    to: 'FinalState'
  }];
};


export default function doConfirmPayment(fsm) {
  console.log("do"+fsm.state);

  const expires = getSecondsFromISODate(fsm.args.expires);
  const now = new Date().getTime() / 1000;
  if (expires < now) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  let timer;
  const getSplitFees = (fee) => {
    const MAX_MILLI_SECONDS = 2147483647;
    const timeoutSeconds = Math.min(MAX_MILLI_SECONDS, 1000 * (expires - now));
    timer = setTimeout(() => { throw new Error("paymentTimeout") }, timeoutSeconds);

    return fsm.args.notification("displayPayment", {
      amount: fsm.args.amount,
      splitFee: fee || 0,
      timeToExpire: timeoutSeconds,
    });
  };

  const doSplit = (withEmail) => {
    clearTimeout(timer);
    // withEmail is true, if the user enabled the checkbox for email recovery. 
    fsm.args.useEmail = withEmail;

    const message = "Sending coins...";
    fsm.args.notification("displayLoader", { message });
    return fsm.splitCoins();
  };

  const handleError = (err) => {
    switch (err.message) {
      case "paymentTimeout":
        fsm.args.error = "Payment request expired";
        return fsm.paymentTimeout();
    }

    fsm.args.error = err.message || err;
    return Promise.resolve(fsm.error()); 
  };

  return fsm.args.wallet.getBitcoinExpressFee(fsm.args.amount, fsm.args.currency)
    .then(getSplitFees)
    .then(doSplit)
    .catch(handleError);
};

