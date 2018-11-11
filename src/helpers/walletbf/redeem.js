import coinSelection, { parseBitcoinURI, round } from './coinSelection';


this.getStoredCoins(false, "XBT")
this.Balance("XBT")

const params = {
  issuerRequest: {
    fn: "redeem"
  }
};
this.issuer("begin", params)

redeemCoins(coins, address, args, crypto=null)

/**
 * Transfer funds from the Wallet to a standard Bitcoin address.
 *
 * @param uri [string] A bitcoin uri that complies with BIP:21
 *
 * @param speed [string] Indicates the urgency of this payment.
 *   Note: the current balance must be sufficient to pay an appropriate
 *   fee for the specified speed.
 *
 * @param confirmation [function] (optional) A function to be called to
 *   allow the user to confirm the payment.
 */
export default function transferBitcoin(uri, speed, confirmation) {
  let payment = parseBitcoinURI(uri);

  if (!payment) {
    throw new Error ("Invalid Bitcoin uri");
    return;
  }

  const {
    amount,
    address,
    message,
    label,
  } = payment;

  let comment = null;
  if (message) {
    comment = message;
  }
  if (label) {
    comment = comment ? `${comment} | ${label}` : label;
  }

  // The total value redeemed must include the bitcoin
  // transaction fee.
  // The transaction fee is optional but if the fee paid
  // is too little it is likely to take a long time to complete.
  const params = {
    issuerRequest: {
      fn: "redeem"
    }
  };
  let balance = 0;

  return this.Balance("XBT").then((res) => {
    balance = res;
    if (balance < amount) {
      throw new Error("Insufficient funds");
    }
    return this.issuer("begin", params);
  }).then((beginResponse) => {
    if (beginResponse.deferInfo) {
      throw new Error(beginResponse.deferInfo.reason);
      return;
    } else if (beginResponse.status !== "ok") {
      throw new Error("Problem on initialiting issuer");
      return;
    }

    const recommendedFees = beginResponse.issuer[0].bitcoinFees;
    const bitcoinFee = recommendedFees[speed] || 0;

    let paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      throw new Error("Amount must be positive");
      return;
    }

    let txAmount = round(paymentAmount + bitcoinFee, 8);
    if (txAmount > balance) {
      throw new Error("Insufficient funds to pay fees");
      return;
    }

    let args = {
      singleCoin: false, //false so as to minimise the fee element
      beginResponse: beginResponse,
      target: amount,
      speed: speed,
      comment: comment,
      action: `send XBT${amount}`,
      uri: uri,
      address: address,
    };

    let selection = coinSelection(txAmount, this.getStoredCoins(false, "XBT"), args);

    if (!selection.targetValue || Number.isNaN(selection.targetValue)) {
      throw new Error("Amount is not a number");
      return;
    }

    // coinSelection will select coins expecting to pay a fee.
    // However, redeemCoins does not attract a fee if the change
    // is smaller than the smallest coin sent. For this reason we
    // need to remove the smallest coins so long as there are
    // sufficient funds to satisfy the transactionAmount 
    if (selection.targetValue !== 0 && selection.faceValue >= txAmount) {
      let allCoins = selection.toVerify.concat(selection.selection);
      
      allCoins.sort((a,b) => {
        //we need allCoins in smallest value order
        if (a.value < b.value) { return -1; }
        if (a.value > b.value) { return 1; }
        return 0;
      });

      let change = round(selection.faceValue - txAmount, 8);
      while(allCoins.length > 1) {
        if ((change < allCoins[0].value)) {
          break;
        }
        // remove extra coin
        change -= allCoins.shift().value;
      }

      args.inCoinCount = allCoins.length;
      args.outCoinCount = 1;

      confirmation = confirmation || function (_x, _y, fn) { fn(); };
      return new Promise((resolve, reject) => {
        confirmation(parseFloat(amount), bitcoinFee, () => {
          const params = [allCoins, address, args, "XBT"];
          redeemCoins(...params).then(resolve).catch(reject);
        });
      });
    } else {
      return Promise.reject(Error("Insufficient funds"));
    }
  });
}


/**
 * Transfer the total value of coin(s) to a standard Bitcoin using
 * the 'address' provided.
 *
 * If 'args.target' value is defined and > zero and that value is achievable
 * given the set of 'coins' provided, the target amount will be transferred
 * and any 'change' will be returned in the issuerResponse.
 *
 * Finally, either 'success' or 'args.failure' will be called with an
 * issuerResponse parameter to indicate the progress of the transfer.
 *
 * @param coins [array] An array of one or more Coins (either base64 encoded or Coin objects).
 * @param address [string] The Bitcoin address to be used for the transfer.
 * @param args [map] A set of optional arguments as detailed below:
 * @element failure [function]  The function to be called on unsuccessful completion of the transfer.
 * @element target [string] The target value in case an exact amount is to be transferred, otherwise
 *    the whole amount will be transfered.
 * @element speed   [string]  Indicates the urgency with which this transfer should be completed on
 *    the blockchain.
 * @element comment [string]  A comment to be added to the History. 
 * @element action  [string]  A short label for the action being taken. This will be reflected in the
 *    history. Defaults to "redeem".
 * @element policy  [string]  The desired coin issuing policy for the Issuer to follow when issuing
 *    change. If not supplied, the wallet's default policy will be requested.
 * @element domain  [string]  The domain of the Issuer to be used. If not provided the default Issuer
 *    will be used. If beginResponse is provided this element is ignored. 
 * @element beginResponse [Object] Include this if /begin has been called. If not present redeemCoins
 *    will first call /begin to obtain a transaction ID.
 */
function redeemCoins(coins, address, args, crypto=null) {
  if (this.config.debug) {
    console.log("WalletBF.redeemCoins",coins,address,args);
  }

  const {
    bitcoinSpeed,
    COIN_STORE,
    CRYPTO,
    debug,
    ISSUE_POLICY,
    REDEEM_EXPIRE,
    SESSION,
    storage,
  } = this.config;

  let defaults = {
    target: "0",
    action: "redeem",
    newCoinList: [],
    speed: bitcoinSpeed,
    expiryPeriod_ms: this.getExpiryPeriod(REDEEM_EXPIRE),
    policy: this.getSettingsVariable(ISSUE_POLICY),
  };

  args = $.extend({}, defaults, args);

  if (typeof(address) !== 'string') {
    // Cannot recover
    if (debug) {
      console.log("WalletBF.redeemCoins - Bitcoin address was not a String");
    }
    return Promise.reject(Error("Bitcoin address was not a String"));
  }

  if (!$.isArray(coins) || coins.length==0) {
    if (debug) {
      console.log("WalletBF.redeemCoins - No Coins provided");
    }
    return Promise.reject(Error("No Coins provided"));
  }

  if (!storage) {
    if (debug) {
      console.log("WalletBF.redeemCoins - Storage has not been installed");
    }
    return Promise.reject(Error("Persistent storage has not been installed"));
  }

  let wrongType = false;
  let base64Coins = new Array();
  let sumCoins = 0.0;
  coins.forEach(function(elt) {
    if (typeof elt === "string") {
      let c = this.Coin(elt);
      sumCoins += parseFloat(c.value);
      base64Coins.push(elt);
    } else {
      sumCoins += elt.value;
      if ("base64" in elt) {
        base64Coins.push(elt.base64);
      } else {
        wrongType = wrongType || true;
      }
    }
  });

  let expiryEmail = this._fillEmailArray(sumCoins);
  if (expiryEmail != null) {
    args.expiryEmail = expiryEmail;
  }

  if (wrongType) {
    // Cannot recover
    return Promise.reject(Error("Redeem requires Coin or base64 string"));
  }

  // TO_DO is promise??? Is it worth???
  this._ensureDomainIsSet(args, coins);

  let startRedeem = (beginResponse) => {
    args.beginResponse = args.beginResponse || beginResponse;

    const tid = beginResponse.headerInfo.tid;
    const redeemExp = parseFloat(this.getSettingsVariable(REDEEM_EXPIRE)) * (1000 * 60 * 60);
    const now = new Date().getTime();
    const newExpiry = isNaN(args.expiryPeriod) ? now + redeemExp : args.expiryPeriod;

    if (!crypto) {
      crypto = this.getPersistentVariable(CRYPTO, "XBT");
    }

    let redeemRequest = {
      issuerRequest: {
        tid: tid,
        expiry: new Date(newExpiry).toISOString(),
        fn: "redeem",
        bitcoinAddress: address,
        coin: base64Coins,
        issuePolicy: args.policy || DEFAULT_SETTINGS.issuePolicy,
        bitcoinSpeed: args.speed,
      },
      recovery: {
        fn: "redeem",
        domain: beginResponse.headerInfo.domain,
        action: args.action,
      },
    };

    if (args.target > 0) {
      redeemRequest.issuerRequest.targetValue = args.target;
    }

    if (typeof(args.comment) === "string") {
      redeemRequest.recovery.comment = args.comment;
    }

    // if expiryEmail is defined and the fee is less than the sum of coins,
    // add it to the request 
    if (Array.isArray(args.expiryEmail) && args.expiryEmail.length > 0) {
      let issuer = args.beginResponse.issuer.find((elt) =>  {
        return elt.relationship == "home";
      });
      let feeExpiryEmail = issuer ? Number.parseFloat(issuer.feeExpiryEmail || "0") : 0;
      let change = (sumCoins - args.target - issuer.bitcoinFees[args.speed]);
      if (change > feeExpiryEmail) {
        redeemRequest.issuerRequest.expiryEmail = args.expiryEmail;
        redeemRequest.recovery.expiryEmail = args.expiryEmail;
      }
    }

    let redeemResponse;
    return storage.sessionStart("Redeem coins").then(() => {
      return storage.setToPromise(SESSION, tid, redeemRequest);
    }).then(() => {
      return storage.flush();
    }).then(() => {
      return this.extractCoins(base64Coins, tid);
    }).then(() => {
      return _redeemCoins_inner_(redeemRequest, args, crypto);
    }).then((response) => {
      redeemResponse = response;
      return storage.sessionEnd();
    }).then(() => {
      return redeemResponse;
    }).catch((err) => {
      if (debug) {
        console.log(`WalletBF.redeemCoins - Error: ${err.message}`);
        console.log("WalletBF.redeemCoins - Adding coins back to store");
      }
      return storage.addAllIfAbsent(COIN_STORE, base64Coins, false, crypto).then(() => {
        storage.sessionEnd();
        return Promise.reject(err);
      }).catch((err) => {
        storage.sessionEnd();
        return Promise.reject(err);
      });
    });
  };

  if (args.beginResponse) {
    return startRedeem(args.beginResponse);
  } else {
    const params = {
      issuerRequest: {
        fn: "redeem"
      }
    };
    return this.issuer("begin", params, args).then(startRedeem);
  }
}

function _redeemCoins_inner_(request, args, crypto = null) {
  let req = JSON.parse(JSON.stringify(request));
  // clone the request in case of deferral
  delete request.recovery;

  let redeem = () => {
    let resp = null;

    const {
      COIN_STORE,
      CRYPTO,
      debug,
      SESSION,
      storage,
    } = this.config;

    if (!crypto) {
      crypto = this.getPersistentVariable(CRYPTO, "XBT");
    }

    return this.issuer("redeem", request, args).then((redeemResponse) => {
      resp = redeemResponse

      if (resp.deferInfo) {
        return this._restartDeferral(redeem, resp, req, 15000).then(() => {
          return Promise.reject(Error("Redeem deferred"));
        });
      }

      if (resp.status !== "ok") {
        let errMsg = "Error on redeem response status";
        if (resp.error && resp.error.length > 0) {
          errMsg = resp.error[0].message;
        }
        return Promise.reject(Error(errMsg));
      }

      if (resp.redeemInfo && args.comment) {
        // used mainly when for bitcoin uri has a message or lable
        resp.redeemInfo.comment = args.comment;
      }
      if (resp.headerInfo && args.action) {
        resp.headerInfo.fn = args.action;
      }

      if (resp.coin && resp.coin.length > 0) {
        return storage.addAllIfAbsent(COIN_STORE, resp.coin, false, crypto);
      }
      return 0;
    }).then((numCoins) => {
      if (debug && numCoins == 0) {
        console.log("Redeem zero coins");
      }
      resp.other = Object.assign({}, args.other || {}, resp.redeemInfo);
      resp.currency = crypto;
      return this.recordTransaction(resp);
    }).then(() => {
      return storage.removeFrom(SESSION, resp.headerInfo.tid);
    }).then(() => {
      const context = {
        issuerRequest: {
          tid: resp.headerInfo.tid,
        }
      };
      return this.issuer("end", context, {
        domain: args.domain,
      });
    }).then(() => {
      return resp;
    });
  };

  return redeem();
}
