import { persistFSM, getRecoveryCoins, getSecondsToISODate } from '../tools';


export function getVerifyPaymentCoinsTransaction() {
  return [{
    name: 'coinRecoveryComplete',
    from: 'VerifyPaymentCoins',
    to: 'Exit'
  }];
}


export default function doVerifyPaymentCoins(fsm) {
  console.log("do"+fsm.state);
  const {
    amount,
    currency,
    wallet,
  } = fsm.args;

  const {
    ISSUE_POLICY,
    DEFAULT_ISSUER,
    VERIFY_EXPIRE,
    COIN_STORE,
    storage,
  } = wallet.config;

  let coinsToRecover = _getRecoveryCoins(fsm.args);
  
  const args = {
    target: "0",
    // Coin is external. Already extracted from COIN_STORE
    external: true,
    newCoinList: [],
    action: 'payment',
    originalFaceValue: amount,
    comment: 'verify coins from payment failure',
    policy: wallet.getSettingsVariable(ISSUE_POLICY),
    domain: wallet.getSettingsVariable(DEFAULT_ISSUER),
    expiryPeriod_ms: wallet.getExpiryPeriod(VERIFY_EXPIRE),
  };

  let issuerService, fee;
  let payment = fsm.args.payment;

  const getVerificationFee = (resp) => {
    issuerService = resp.issuer[0];
    return wallet.getVerificationFee(amount, issuerService);
  };

  const notifyFeesToWallet = (resp) => {
    // Display fees to the wallet, and wait for user confimation.
    fee = resp;
    return fsm.args.notification("displayRecovery", {
      recoveryFee: fee,
    });
  };

  const getUserResponse = (wantsToRecover) => {
    // Response from the wallet, depending if the user wants to recover
    // the coins or retry the payment.
    if (!wantsToRecover) {
      return fsm.args.notification("displayLoader", {
        message: "Retrying your payment..."
      }).then(() => {
        throw new Error("payment");
      });
    }

    return fsm.args.notification("displayLoader", {
      message: "Recoverying your coins..."
    });
  };

  const addCoinsToRecoverInStore = (resp) => {
    let coins = resp.coin;
    if (resp.status == "coin value too small") {
      // Recover original coins, coins value too small to verify
      coins = coinsToRecover;
    }
    return storage.addAllIfAbsent(COIN_STORE, coins, false, currency);
  };

  const completeRecovery = (resp) => {
    fsm.args.error = fsm.args.error ? fsm.args.error + ". " : "";
    fsm.args.error += "Payment failed but coins were recovered";
    fsm.args.recoveredAmount = wallet.getSumCoins(coinsToRecover) - fee;
    return fsm.coinRecoveryComplete();
  };

  const handleError = (err) => {
    //Not sure what can be done about an error so just signal complete
    if (err.message && err.message == "payment") {
      fsm.args.payment = payment;
      return fsm.coinsReady();
    }
    fsm.args.error = err.message || err;
    return fsm.coinRecoveryComplete();       
  };

  // Unpersist Payment
  return persistFSM(wallet, null)
    .then(() => wallet.issuer("info", {}, null, "GET"))
    .then(getVerificationFee)
    .then(notifyFeesToWallet)
    .then(getUserResponse)
    .then(() => wallet.verifyCoins(coinsToRecover, args, false, currency))
    .then(addCoinsToRecoverInStore)
    .then(completeRecovery)
    .catch(handleError);
};

