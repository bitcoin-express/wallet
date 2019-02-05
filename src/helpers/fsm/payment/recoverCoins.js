import { persistFSM, getRecoveryCoins } from '../tools';
// Question: What happens when an error is triggered?


export function getRecoverCoinsTransitions() {
  return [{
    name: 'coinRecoveryComplete',
    from: 'RecoverCoins',
    to: 'Exit'
  }];
}


export default function doRecoverCoins(fsm) {
  console.log("do"+fsm.state);

  const { wallet } = fsm.args;
  const { COIN_STORE, storage } = wallet.config;

  let recoverCoinsPromise;
  const coinsToRecover = getRecoveryCoins(fsm.args);

  if (coinsToRecover.length > 0) {

    const message = (fsm.args.error || "") + "- trying to recover your coins...";
    fsm.args.notification("displayLoader", { message });

    let oldBalance;
    const checkCoinsExistance = (value) => {
      oldBalance = value;
      return wallet.issuer("exist", {
        issuerRequest: {
          fn: "exist",
          coin: coinsToRecover,
        }
      });
    }

    let coins;
    const storeCoins = (response) => {
      if (response.deferInfo || response.status !== "ok") {
        return 0;
      }
      // TO_DO: Must we verify the coins?
      coins = response.coins;
      fsm.args.notification("displayLoader", {
        message: `Recovering ${coins.length} coins...`,
      });
      return storage.addAllIfAbsent(COIN_STORE, coins, false, fsm.args.currency);
    };

    const recordTransaction = (value) => {
      if (oldBalance == value) {
        return storage.flush();
      }

      const recoveredValue = value - oldBalance;
      if (recoveredValue == 0) {
        fsm.args.error += ". No coins recovered.";
        return true;
      }

      fsm.args.error += `. Recovered coins: ${fsm.args.currency} ${recoveredValue.toFixed(8)}.`;
      return wallet.recordTransaction({
        headerInfo: {
          fn: 'coin recovery',
          domain: fsm.args.order_id,
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
          target: fsm.args.amount,
          item: fsm.args.payment.transaction_id,
        },
        currency: fsm.args.currency,
      });
    };

    recoverCoinsPromise = wallet.Balance(fsm.args.currency)
      .then(checkCoinsExistance)
      .then(storeCoins)
      .then(() => wallet.Balance(fsm.args.currency))
      .then(recordTransaction);

  } else {
    recoverCoinsPromise = Promise.resolve(storage.flush());
  }

  return Promise.all([persistFSM(wallet, null), recoverCoinsPromise])
    .then(() => BitcoinExpress.Host.PaymentAckAck(fsm.args.ack))
    .then(() => fsm.coinRecoveryComplete())
    .catch(() => fsm.coinRecoveryComplete());
};

