import { persistFSM, getRecoveryCoins } from '../tools';
// Question: What happens when an error is triggered?


export function getRecoverCoinsTransitions() {
  return [{
    name: 'coinRecoveryComplete',
    from: 'RecoverCoins',
    to: 'PaymentFailed'
  }, {
    name: 'failed',
    from: 'RecoverCoins',
    to: 'StartPayment'
  }];
}


export default function doRecoverCoins(fsm) {
  console.log("do"+fsm.state);

  const { wallet } = fsm.args;
  const {
    COIN_STORE,
    DEFAULT_ISSUER,
    ISSUE_POLICY,
    storage,
    VERIFY_EXPIRE,
  } = wallet.config;

  let recoverCoinsPromise;
  const coinsToRecover = getRecoveryCoins(fsm.args);

  if (coinsToRecover.length > 0) {

    const message = (fsm.args.error || "") + "- trying to recover your coins...";
    fsm.args.notification("displayLoader", { message });

    const policy = wallet.getSettingsVariable(ISSUE_POLICY);

    let coins, oldBalance;
    const verifyCoins = (value) => {
      oldBalance = value;

      if (response.deferInfo || response.status !== "ok") {
        throw new Error("failed");
      }

      fsm.args.notification("displayLoader", {
        message: `Verifying ${coinsToRecover.length} coins...`,
      });

      if (!fsm.args.ack.recovery) {
        const verifyArgs = {
          action: "recovery",
          domain: wallet.getSettingsVariable(DEFAULT_ISSUER),
          expiryPeriod_ms: wallet.getExpiryPeriod(VERIFY_EXPIRE),
          external: true,
          policy,
        };
        return wallet.verifyCoins(coinsToRecover, verifyArgs, false, fsm.args.currency);
      }

      const {
        expiry,
        issuer,
        tid,
      } = fsm.args.ack.recovery;

      const verifyArgs = {
        action: "recovery",
        beginResponse: {
          tid,
        },
        domain: issuer,
        expiryPeriod_ms: expiry,
        external: true,
        policy,
      };

      return wallet.verifyCoins(coinsToRecover, verifyArgs, false, fsm.args.currency);
    };

    const storeCoins = (response) => {
      if (!response || (response.coin && response.coin.length == 0)) {
        throw new Error("failed");
      }

      coins = response.coins;
      fsm.args.notification("displayLoader", {
        message: `Recovering ${coins.length} coins...`,
      });
      return storage.addAllIfAbsent(COIN_STORE, coins, false, fsm.args.currency);
    };

    recoverCoinsPromise = wallet.Balance(fsm.args.currency)
      .then(verifyCoins)
      .then(storeCoins);

  } else {
    recoverCoinsPromise = Promise.resolve(storage.flush());
  }

  return Promise.all([persistFSM(wallet, null), recoverCoinsPromise])
    .then(() => fsm.coinRecoveryComplete())
    .catch((err) => fsm.failed());
};

