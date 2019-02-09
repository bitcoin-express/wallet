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

  if (!fsm.args.recovery || !fsm.args.ack || !fsm.args.ack.coins) {
    return recoverCoinsWithHomeIssuer(fsm);
      .then(() => persistFSM(wallet, null))
      .then(() => storage.flush())
      .then(() => fsm.coinRecoveryComplete())
      .catch((err) => fsm.failed());
  }

  const {
    ack,
    currency,
    notification,
    recovery,
  } = fsm.args;

  const {
    expiry,
    issuer,
    tid,
  } = recovery;

  const verifyArgs = {
    action: "recovery",
    beginResponse: {
      tid,
    },
    domain: issuer,
    expiryPeriod_ms: expiry,
    external: true,
    policy: wallet.getSettingsVariable(wallet.config.ISSUE_POLICY),
  };

  const retrieveCoins = (response) => {
    if (!response.coins || getCoinsValue(wallet, response.coins) == 0) {
      return 0;
    }

    fsm.args.recovery.coins = response.coins;
    return persistFSM(wallet, fsm)
      .then(wallet.storage.flush)
      .then(() => wallet.issuer("end", {issuerRequest: { tid }}, {domain: issuer}));
  }

  return verifyCoins(ack.coins, verifyArgs, notification, currency)
    .then(retrieveCoins)
    .then(() => recoverCoinsWithHomeIssuer(fsm))
    .then(() => persistFSM(wallet, null))
    .then(() => storage.flush())
    .then(() => fsm.coinRecoveryComplete())
    .catch((err) => fsm.failed());
};


function recoverCoinsWithHomeIssuer(fsm) {
  const { wallet } = fsm.args;

  let coinsList = _getCoinsLists(fsm);
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
    // TO_DO - check status code 1018
    const { coins } = response;
    fsm.args.notification("displayLoader", {
      message: `Storing ${coins.length} coins...`,
    });
    return storage.addAllIfAbsent(COIN_STORE, coins, false, fsm.args.currency);
  };

  return recoverCoins(coinsList.pop(), coinsList, fsm.args)
    .then(storeCoins);
};


function _getCoinsLists(fsm) {
  let coinsList = [];
  if (fsm.args.payment && fsm.args.payment.coins) {
    coinsList.push(fsm.args.payment.coins);
  }
  if (fsm.args.ack && fsm.args.ack.coins) {
    coinsList.push(fsm.args.ack.coins);
  }
  if (fsm.args.recovery && fsm.args.recovery.coins) {
    coinsList.push(fsm.args.recovery.coins);
  }
  return coinsList;
}


function recoverCoins(coins, coinList, args) {
  const { wallet } = args;
  const {
    COIN_STORE,
    DEFAULT_ISSUER,
    ISSUE_POLICY,
    VERIFY_EXPIRE,
  } = wallet.config;

  const doVerifyCoins = () => {
    const verifyArgs = {
      action: "recovery",
      domain: wallet.getSettingsVariable(DEFAULT_ISSUER),
      expiryPeriod_ms: wallet.getExpiryPeriod(VERIFY_EXPIRE),
      external: true,
      policy: wallet.getSettingsVariable(ISSUE_POLICY),
    };

    return verifyCoins(coins, verifyArgs, args.notification, args.currency) 
  };

  const responseContainsCoins = (response) => {
    if (response.coins && getCoinsValue(wallet, response.coins) > 0) {
      return response;
    }
    if (coinList.length == 0) {
      // has_coins == false
      throw new Error("failed");
    }
    // Iterative, call to the next list (in this particular case, original coins)
    return recoverCoins(coinList.pop(), coinList, args);
  };

  // TO_DO: Improve for multi-issuer situation
  return doVerifyCoins().then(responseContainsCoins);
};


function verifyCoins(coins, args, notification, currency) {
  notification("displayLoader", {
    message: `Verifying ${coins.length} coins...`,
  });
  return wallet.verifyCoins(coins, args, false, currency);
}


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

