import { persistFSM } from '../tools';


export function getPaymentReadyTransitions() {
  return [{
    name: 'startPayment',
    from: 'PaymentReady',
    to: 'StartPayment'
  },
  {
    name: 'error',
    from: 'PaymentReady',
    to: 'PrepareCurrency'
  }];
}


export default function doPaymentReady(fsm) {
  const {
    payment,
    wallet,
  } = fsm.args;
  console.log("do"+fsm.state);

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    delete fsm.args.payment;
    return fsm.error(); 
  };

  const msg = `buy item for ${fsm.args.currency} ${fsm.args.amount}`;
  return wallet.extractCoins(payment.coins, msg, "wallet", fsm.args.currency, false)
    .then(() => persistFSM(wallet, fsm.args))
    .then(() => wallet.config.storage.flush())
    .then(() => fsm.startPayment())
    .catch(handleError);
};

