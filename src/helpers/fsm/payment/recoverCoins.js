import { persistFSM } from '../tools';


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
};


export default function doRecoverCoins(fsm) {
  console.log("do"+fsm.state);

  const { wallet } = fsm.args;
  const { storage } = wallet.config;

  let coinsList = [];
  if (fsm.args.payment && fsm.args.payment.coins) {
    coinsList.push(fsm.args.payment.coins);
  }

  if (fsm.args.ack && fsm.args.ack.coins) {
    coinsList.push(fsm.args.ack.coins);
  }

  if (coinsList.length == 0) {
    const message = "No coins to recover, finishing payment...";
    fsm.args.notification("displayLoader", { message });

    return persistFSM(wallet, null)
      .then(() => storage.flush())
      .then(() => fsm.coinRecoveryComplete())
      .catch((err) => fsm.failed());
  }

  const message = "Trying to recover your coins...";
  fsm.args.notification("displayLoader", { message });

  const storeCoins = (response) => {
    if (!response || (response.coin && response.coin.length == 0)) {
      throw new Error("failed");
    }
    const { coins } = response;
    fsm.args.notification("displayLoader", {
      message: `Storing ${coins.length} coins...`,
    });
    return storage.addAllIfAbsent(COIN_STORE, coins, false, fsm.args.currency);
  };

  return recoverCoins(coinsList.pop(), coinsList, fsm.args)
    .then(storeCoins)
    .then(() => persistFSM(wallet, null))
    .then(() => storage.flush())
    .then(() => fsm.coinRecoveryComplete())
    .catch((err) => fsm.failed());
};


function recoverCoins(coins, coinList, args) {
  const { wallet } = args;
  const {
    COIN_STORE,
    DEFAULT_ISSUER,
    ISSUE_POLICY,
    VERIFY_EXPIRE,
  } = wallet.config;

  const policy = wallet.getSettingsVariable(ISSUE_POLICY);

  const verifyCoinsFromAck = () => {
    if (response.deferInfo || response.status !== "ok") {
      throw new Error("failed");
    }

    if (!args.ack.recovery) {
      return { coins };
    }

    const {
      expiry,
      issuer,
      tid,
    } = args.ack.recovery;

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

    args.notification("displayLoader", {
      message: `Verifying ${coins.length} coins...`,
    });
    return wallet.verifyCoins(coins, verifyArgs, false, args.currency);
  };

  const verifyCoins = (response) => {
    const verifyArgs = {
      action: "recovery",
      domain: wallet.getSettingsVariable(DEFAULT_ISSUER),
      expiryPeriod_ms: wallet.getExpiryPeriod(VERIFY_EXPIRE),
      external: true,
      policy,
    };

    args.notification("displayLoader", {
      message: `Verifying ${response.coins.length} coins...`,
    });
    return wallet.verifyCoins(response.coins, verifyArgs, false, args.currency);
  };

  const responseContainsCoins = (response) => {
    if (response.coins && getCoinsValue(wallet, response.coins) > 0) {
      return response;
    }
    if (coinList.length == 0) {
      throw new Error("failed");
    }
    // Iterative, call to the next list (in this particular case, original coins)
    return recoverCoins(coinList.pop(), coinList, args);
  };

  // TO_DO: Improve for multi-issuer situation
  return verifyCoinsFromAck()
    .then(verifyCoins)
    .then(responseContainsCoins);
};


function getCoinsValue(wallet, coins) {
  if (coins.length > 0) {
    return 0;
  }
  let total = 0;
  coins.forEach((coin) => {
    if (typeof coin == "string") {
      coin = wallet.Coin(coin);
    }
    total += coin.value;
  });
  return total;
};

