import { persistFSM, getRecoveryCoins, getSecondsToISODate } from '../tools';


export function getPaymentInterruptedTransaction() {
  return [{
    name: 'coinsExist',
    from: 'PaymentInterrupted',
    to: 'VerifyPaymentCoins'
  }, {
    name: 'coinsNotExist',
    from: 'PaymentInterrupted',
    to: 'StartPayment'
  }];
}


export default function doPaymentInterrupted(fsm) {
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

