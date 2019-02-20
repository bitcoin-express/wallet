import {
  DEFAULT_SETTINGS,
} from '../WalletBF';


export function importVerifiedCoin(coin) {
  const {
    debug,
    ISSUE_POLICY,
    VERIFY_EXPIRE,
  } = this.config;

  if (debug) {
    console.log("WalletBF.importVerifiedCoin", coin);
  }

  const {
    crypto,
    issuePolicy,
  } = DEFAULT_SETTINGS;

  const verifyExpire = this.getSettingsVariable(VERIFY_EXPIRE);
  const policy = this.getSettingsVariable(ISSUE_POLICY, issuePolicy);
  const currency = coin.c || crypto;

  let args = {
    expiryPeriod_ms: verifyExpire * (1000 * 60 * 60) || 1000 * 60 * 59,
    policy,
    inCoinCount: 1, //we have a single coin in
    outCoinCount: 1, //and a single coin out policy
    domain: coin.d,
    action: "import coin",
    external: true,
    other: {
      fromString: true,
      verified: true,
    },
  };

  const handleBeginAndVerifyCoins = (beginResponse) => {
    if (debug) {
      console.log("WalletBF - importVerifiedCoin begin ", beginResponse);
    }

    args.beginResponse = beginResponse;

    // The actual fee is heavily dependent on the args that verify
    // is called with so first get args ready
    const issuer = beginResponse.issuer
      .find((elt) => elt.relationship == "home");

    const currencyInfo = issuer.currencyInfo
      .find((elt) => elt.currencyCode == currency);

    let feeExpiryEmail = 0;
    if (currencyInfo) {
      args.issuerService = issuer;
      args.currencyInfo = currencyInfo;
      feeExpiryEmail = parseFloat(currencyInfo.feeExpiryEmail || 0);
    }

    // Coin object will include the fee according to args
    coin = typeof coin == "string" ? coin : coin.base64;
    coin = this.Coin(coin, true, args);

    if (debug) {
      console.log("WalletBF - importVerifiedCoin ",
        `Coin value after verify is ${coin.verifiedValue}`);
    }

    if (coin.verifiedValue < currencyInfo.coinMinValue) {
      // If the value after verification is smaller than
      // the smallest allowable coin then there is no
      // point to verify the coin on it's own.
      throw new RangeError("The value of this coin is too small to verify");
    }

    // If expiryEmail is defined and the fee is less than the
    // value of coins, add it to the args
    let expiryEmail = this._fillEmailArray(0, true, currency);
    if (Array.isArray(expiryEmail) && expiryEmail.length > 0) {
      if (coin.verifiedValue > feeExpiryEmail) {
        args.expiryEmail = expiryEmail;
      }
    }

    return this.verifyCoins([coin], args, true, currency);
  };

  const handleIssuerVerifyResponse = (issuerResponse) => {
    if (debug) {
      console.log("WalletBF - importVerifiedCoin verify ", issuerResponse);
    }

    if (issuerResponse.coin && issuerResponse.coin.length == 0) {
      throw new EvalError(issuerResponse.error[0].message);
    }

    return issuerResponse;
  }

  const params = {
    issuerRequest: {
      fn: "verify"
    }
  };

  return this.issuer("begin", params, {})
    .then(handleBeginAndVerifyCoins)
    .then(handleIssuerVerifyResponse);
};


/**
 * Takes an array of 'coins' (either base64 encoded or Coin objects),
 * and an arguments object containing optional parameters.
 *
 * The coin(s) will be splits/joins such that at least one new coin
 * will have the exact target value (assuming a target was set and
 * that value is achievable).
 *
 * The coin(s) that are sent for verification are expected be in the
 * coin store at the time of calling (unless the optional 'external'
 * parameter is true), and they will be extracted from the store and
 * persisted along with other request information.
 *
 * Once complete, the 'success' callback function will be called with
 * an issuerResponse parameter to indicate the progress of the
 * verification.
 * 
 * @param coins [array (string | Coin)]: An array of Coins or base64
 *    encoded coin strings
 * @param inSession [boolean]: Must be executed in session.
 * @param crypto [string]: Repository of coins where to store the coins..
 * @param args [map]: A Map containing zero or more optional arguments.
 * 
 * OPTIONAL ARGS
 *
 * target [string]: The target value when a specific coin value is required.
 *
 * action [string]: A short label for the action being taken. This will be
 *     reflected in the history. Defaults to "verify".
 *
 * comment [string]: A short comment to be reflected in the history.
 *     Defaults to undefined.
 *
 * policy [string]: I hint to the Issuer as to the desired coin issuing policy
 *     to be followed. Defaults to the wallet's default issuePolicy.
 *
 * domain [string]: The domain of the Issuer where the coins will be verified.
 *
 * external [boolean]: If true indicates that coins are NOT presently in the coin
 *     store. Defaults to false.
 *
 * expiryPeriod_ms [integer]: The number of milliseconds before the transaction should
 *     expire. Defaults to the wallet's 'config.verifyExpire'.
 *
 * beginResponse [object]: A Issuer's issuerResponse object as returned by /begin.
 *     Defaults to undefined.
 *
 * expiryEmail [array string]: The email address, passphrase and reference to be used
 *     for expired transaction recovery
 *
 * newCoinList [array decimal strings]: A list of desired coin values to be issued by the
 *     server. NOTE if this list is defined the 'policy' will be set to "user".
 * 
 * NOTE: If args.domain is not specified and all the coins are from the same Issuer,
 *     the Coin's own Issuer will be used, otherwise the wallet's default Issuer will be used.
 */
export function verifyCoins(coins, args, inSession=true, repository=null) {

  const {
    CRYPTO,
    debug,
    ISSUE_POLICY,
    SESSION,
    storage,
    VERIFY_EXPIRE,
  } = this.config;

  if (!Array.isArray(coins) || coins.length === 0) {
    return Promise.reject(Error("No Coins provided"));
  }

  if (!storage) {
    return Promise.reject(Error("Persistent storage has not been set."));
  }

  if (debug) {
    console.log("WalletBF.verifyCoins", coins, args);
  }

  const {
    crypto,
    issuePolicy,
  } = DEFAULT_SETTINGS;

  repository = repository || this.getPersistentVariable(CRYPTO, crypto);

  if (parseFloat(args.target) == 0) {
    delete args.target;
  }

  args = Object.assign({
    action: "verify",
    external: false,
    newCoinList: [],
    expiryPeriod_ms: this.getExpiryPeriod(VERIFY_EXPIRE),
    policy: this.getSettingsVariable(ISSUE_POLICY),
  }, args);

  let wrongType = false;
  let sumCoins = 0.0;
  let domainCoin;

  coins.forEach((elt) => {
    if (typeof elt === "string") {
      let c = this.Coin(elt);
      domainCoin = c.d;
      sumCoins += parseFloat(c.value);
      return;
    }
    sumCoins += elt.value;
    domainCoin = elt.d;
    wrongType = wrongType || !elt.base64;
  });

  args.domain = args.domain || domainCoin;
  args.target = args.target || sumCoins.toFixed(8);

  if (wrongType) {
    return Promise.reject(Error("Verify requires Coin or base64 string"));
  }

  if (isNaN(args.target)) {
    return Promise.reject(Error(`Amount is not a number - ${args.target}`));
  }

  if (parseFloat(args.target) > sumCoins) {
    return Promise.reject(Error(`Coins value does not meet target - ${args.target}`));
  }

  if (parseFloat(args.target) < 0) {
    return Promise.reject(Error(`Target is negative - ${args.target}`));
  }

  let expiryEmail = this._fillEmailArray(sumCoins, true, repository);
  if (expiryEmail != null) {
    args.expiryEmail = expiryEmail;
  }

  let tid, verifyRequest;
  const extractVerifyCoins = (beginResponse) => {

    const {
      headerInfo,
    } = beginResponse;

    if (!headerInfo || !headerInfo.tid) {
      throw new Error("No transaction id available");
    }

    tid = headerInfo.tid;

    let {
      currencyInfo,
      issuer,
    } = args;

    issuer = issuer || beginResponse.issuer
      .find((elt) => elt.relationship == "home");

    currencyInfo = currencyInfo || issuer.currencyInfo
      .find((elt) => elt.currencyCode == repository);

    const { coinMinValue } = currencyInfo;
    const minCoinValue = this._round(parseFloat(coinMinValue), 8) || 0.000001;
    if (parseFloat(args.target) < minCoinValue) {
      throw new Error(`Amount is too small - ${args.target}`);
    }

    const verifyExpire = parseFloat(this.getSettingsVariable(VERIFY_EXPIRE));
    verifyRequest = prepareVerifyRequest(args, coins, tid, issuer, verifyExpire);

    if (args.external) {
      return Promise.resolve([]);
    }

    return this.extractCoins(coins, tid, "wallet", repository);
  };

  let promise = Promise.resolve(args.beginResponse);
  if (!args.beginResponse) {
    const params = { issuerRequest: { fn: "verify" } };
    promise = this.issuer("begin", params, {});
  }

  if (!inSession) {
    return promise
      .then(extractVerifyCoins)
      .then(() => storage.setToPromise(SESSION, tid, verifyRequest))
      .then(() => storage.flush())
      .then(() => _verifyCoins_inner_.bind(this)(verifyRequest, args));
  }

  let verifyResponse;
  const handleVerifyResponse = (response) => {
    verifyResponse = response;
    return storage.sessionEnd();
  };

  const handleError = (err) => {
    return storage.sessionEnd().then(() => Promise.reject(err));
  };

  return storage.sessionStart(args.action)
    .then(() => promise)
    .then(extractVerifyCoins)
    .then(() => storage.setToPromise(SESSION, tid, verifyRequest))
    .then(() => storage.flush())
    .then(() => _verifyCoins_inner_.bind(this)(verifyRequest, args))
    .then(handleVerifyResponse)
    .then(() => verifyResponse)
    .catch(handleError);
};


const prepareVerifyRequest = function (args, coins, tid, issuer, expire) {
  const expiryPeriod = args.expiryPeriod_ms || expire * 1000 * 60 * 60;
  const now = new Date().getTime();
  const expiry = new Date(now + expiryPeriod).toISOString();

  const coin = coins.map((elt) => {
    if (typeof elt === "string") {
      return elt;
    }
    return elt.base64;
  });

  let request = {
    issuerRequest: {
      tid,
      expiry,
      coin,
      targetValue: args.target,
      issuePolicy: args.policy || issuePolicy,
    },
  };

  request = includeRecoveryKey("verify", args, request);
  request = includeExpiryEmailKey(args, request, issuer);
  request = includeNewCoinListKey(args, request);

  return request;
};


/**
 * If expiryEmail is defined and the fee is less than the sum of
 * coins, add it to the request.
 */
const includeRecoveryKey = function (fn, args, request) {
  let recovery = {
    fn,
    domain: args.domain,
  };

  if (typeof(args.action)  === "string") {
    recovery.action = args.action;
  }

  if (typeof(args.comment) === "string") {
    recovery.comment = args.comment;
  }

  request.recovery = recovery;
  return request;
};


/**
 * Modify request depending if expiry email is required.
 */
const includeExpiryEmailKey = function (args, request, issuer = {}) {
  const {
    expiryEmail
  } = args;

  if (!expiryEmail || !Array.isArray(expiryEmail) || expiryEmail.length == 0) {
    return request;
  }

  const feeExpiryEmail = parseFloat(issuer.feeExpiryEmail || "0");
  if (sumCoins > feeExpiryEmail) {
    return request;
  }

  request.issuerRequest.expiryEmail = expiryEmail;
  if (request.recovery) {
    request.recovery.expiryEmail = expiryEmail;
  } else {
    request.recovery = {
      expiryEmail: args.expiryEmail,
    };
  }
  return request;
};


// Overwrite the issue policy to use the supplied denomination list
const includeNewCoinListKey = function (args, request) {
  if (Array.isArray(args.newCoinList) && args.newCoinList.length > 0) {
    request.issuerRequest.denominations = args.newCoinList;
    request.issuerRequest.issuePolicy = "user";
  }
  return request;
};


export function verifyCoinsRecovery(request, args) {
  let result;
  const removeFromSession = (resp) => {
    result = resp;
    return storage.removeFrom(SESSION, tid);
  };

  return _verifyCoins_inner_.bind(this)(request, args)
    .then(removeFromSession)
    .then(() => result);
};


/**
 * Takes an array of 'coins' (either base64 encoded or Coin objects) and an
 * arguments object containing optional parameters.
 * The coin(s) will be splits/joins such that at least one new coin will have
 * the exact target value (assuming a target was set and that value is achievable).
 * The coin(s) that are sent for verification are expected be in the coin store
 * at the time of calling (unless the optional 'external' parameter is true), and
 * they will be extracted from the store and persisted along with other request
 * information. 
 * Once complete, resolve will be called with an issuerResponse parameter to indicate
 * the progress of the verification.
 * 
 * @param request  [object] An issuerRequest object to be passed to the Issuer.
 * @param args     [map]    A Map containing zero or more optional arguments.
 * 
 * OPTIONAL ARGS
 * action          [string] A short label for the action being taken.
 *                          This will be reflected in the history. Defaults to "verify".
 * comment         [string] A short comment to be reflected in the history.
 *                          Defaults to undefined.
 * domain          [string] The domain of the Issuer where the coins will be verified.
 */

const _verifyCoins_inner_ = function (request, args) {
  if (this.config.debug) {
    console.log("WalletBF._verifyCoins_inner_");
  }

  delete request.recovery;

  const verify = () => {
    const {
      debug,
      powerLoss,
      SESSION,
      storage,
    } = this.config;

    let verifyResponse = null;
    const params = {
      domain: args.domain,
    };

    const handleResponse = (resp) => {
      if (resp.deferInfo) {
        const req  = JSON.parse(JSON.stringify(request));
        return this._restartDeferral(verify, resp, req, 10000).then(() => {
          return Promise.reject(resp);
        });
      }

      // This is just for testing. It will simulate loss of network or power
      if (powerLoss) {
        alert("BANG!! Simulated power loss. Restart browser to recover.");
        return Promise.reject(false);
      }

      if (!resp.verifyInfo) {
        return Promise.reject(resp);
      }

      // Add a comment to the history
      if (typeof(args.comment) === "string") {
        let err = "";
        if (resp.error && resp.error.length > 0) {
          err = resp.error[0].message;
        }
        resp.verifyInfo.comment = `${args.comment} ${err}`;
      }

      verifyResponse = resp;
      if (resp.coin && resp.coin.length > 0) {
        return this.includeCoinsInStore(resp.coin);
      }
      return 0;
    };

    const handleRecordHistory = (numCoins) => {
      if (debug && numCoins == 0) {
        console.log("Redeem zero coins");
        return Promise.resolve(true);
      }

      let {
        actualValue,
        lostValue,
        totalFee,
        verifiedValue,
      } = verifyResponse.verifyInfo;

      actualValue = parseFloat(actualValue || "0");
      lostValue = parseFloat(lostValue || "0");
      totalFee = parseFloat(totalFee || "0");

      //over-write the event label in the history 
      if (verifyResponse.headerInfo && typeof(args.action) === "string") {
        verifyResponse.headerInfo.fn = args.action;
      }

      if (typeof(args.comment) === "string") {
        verifyResponse.verifyInfo.comment = args.comment;
      }

      //add the original face value to the history (most likely from a file)
      let faceValue = verifyResponse.verifyInfo.faceValue;
      if (typeof(args.originalFaceValue) !== "undefined") {
        faceValue = args.originalFaceValue;
      }
      verifyResponse.verifyInfo.faceValue = parseFloat(faceValue || "").toFixed(8);

      // determine the new value
      let deductions = parseFloat(totalFee + lostValue);

      // if the coins were external their value must be added to the balance
      // if the coins were internal then we must account for the deductions
      const newValue = args.external ? actualValue - deductions : -deductions;
      verifyResponse.verifyInfo.newValue = newValue.toFixed(8);

      verifyResponse.other = args.other || {};
      if (verifiedValue && parseFloat(verifiedValue) == 0) {
        verifyResponse.other.verifyFailed = true;
      }
      verifyResponse.currency = this._getCryptoFromArray(verifyResponse.coin);
      return this.recordTransaction(verifyResponse);
    };


    const handleError = (err) => {
      // VERIFY FAILED
      // So now we know that verify has failed, we need to recover as best we can          
      // This could be any kind of failure so it's good practice to check and
      // recover the original coins that were sent.
      if (debug) {
        console.log(err);
        console.log("WalletBF._verifyCoins_inner_.failure");
      }

      if (err == false) {
        // This is a simulation of power loss
        // Not Possible to connect to session
        return Promise.reject(Error("Power loss failure"));
      }

      if (args.external && verifyResponse) {
        return this._cleanTransaction(verifyResponse, args);
      }

      let existResponse = null;
      const existParams = {
        issuerRequest: {
          fn: "exist",
          coin: request.issuerRequest.coin
        }
      };

      const handleExist = (response) => {
        existResponse = response;
        if (existResponse.coin && existResponse.coin.length > 0) {
          return this.includeCoinsInStore(existResponse.coin);
        }
        if (debug && numCoins == 0) {
          console.log("_verifyCoins_inner_. Coins does not exist or already in store");
        }
        return 0;
      };

      const handleStoreCoins = (numCoins) => {
        if (numCoins == 0) {
          return 0;
        }

        if (typeof(args.originalFaceValue) !== "undefined") {
          existResponse.verifyInfo.faceValue = args.originalFaceValue;
        }
        existResponse.other = args.other || {};
        existResponse.currency = this._getCryptoFromArray(existResponse.coin);
        return this.recordTransaction(existResponse);
      };

      const throwError = (numCoins) => {
        if (err.error && err.error.length > 0) {
          throw new Error(err.error[0].message);
        }
        if (numCoins == 0) {
          throw new Error("Verify failed and no coins recovered");
        }
        throw new Error("Verify failed but coins were recovered");
      };

      return this.issuer("exist", existParams, params)
        .then(handleExist)
        .then(handleStoreCoins)
        .then(throwError);
    };


    return this.issuer("verify", request, params)
      .then(handleResponse)
      .then(handleRecordHistory)
      .then(() => this._cleanTransaction(verifyResponse, args))
      .catch(handleError);
  };

  return verify();
}

