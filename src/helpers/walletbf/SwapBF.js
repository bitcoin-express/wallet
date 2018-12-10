import { DEFAULT_SETTINGS } from '../WalletBF';

export default class SwapBF {
  constructor() {
  }

  /**
   * Executes an atomic swap with the issuer.
   * @param args [object] Object with the following attributes:
   *   @element emailRecovery [boolean]
   *   @element source [object] with the sourceValue and sourceCurrency
   *   @element target [object] with the targetValue and targetCurrency
   * @param issuerService [object] Service information with fees.
   * 
   * @return a promise that resolves with an object that includes the
   *   swapInfo and the list of new coins from the targetCurrency.
   */
  atomicSwap(args, issuerService, isInSession=false) {
    const {
      debug,
      COIN_RECOVERY,
      COIN_STORE,
      DEFAULT_ISSUER,
      ISSUE_POLICY,
      VERIFY_EXPIRE,
      storage,
    } = this.config;

    const {
      emailRecovery,
      fee,
      lastModified,
      maxSelected,
      source,
      target,
    } = args;

    const {
      sourceValue,
      sourceCurrency,
    } = source;

    const {
      targetValue,
      targetCurrency,
    } = target;

    const expiryPeriod_ms = this.getExpiryPeriod(VERIFY_EXPIRE);
    const coinList = this.getStoredCoins(false, sourceCurrency);

    const defaultPolicy = DEFAULT_SETTINGS.issuePolicy;
    const issuePolicy = this.getSettingsVariable(ISSUE_POLICY, defaultPolicy);

    let toRemove = coinList;
    if (!maxSelected) {
      const totalSource = this._round(sourceValue, 8);
      const coinSelArgs = {
        singleCoin: true,
        mustVerify: true,
        currency: sourceCurrency,
        issuerService,
        outCoinCount: this.getOutCoinCount(),
        expiryPeriod_ms,
      };

      if (debug) {
        console.log("SwapBF._coinSelection totalSource", totalSource);
        console.log("SwapBF._coinSelection coinList", coinList);
        console.log("SwapBF._coinSelection args", coinSelArgs);
      }

      const sel = this._coinSelection(totalSource, coinList, coinSelArgs);

      toRemove = sel.toVerify;
      if (toRemove.length == 0) {
        toRemove = sel.selection;
      }
    }
    toRemove = toRemove.map(c => c.base64 || c);
    if (debug) {
      console.log("SwapBF.atomicSwap - Using coins", toRemove);
    }

    if (toRemove.length == 0) {
      return Promise.reject(Error("Can't obtain coins for this exchange"));
    }

    var fixedTo = function (num, precision) {
      return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
    };

    let beginResponse, result;

    console.log("lastModified", lastModified);

    let params = {
      issuerRequest: {
        targetValue: maxSelected || lastModified == "target" ? "0" :
          fixedTo(sourceValue, 8),
        coinSpec: {
          c: targetCurrency,
          v: maxSelected || lastModified == "source" ? "0" :
            fixedTo(targetValue, 8),
        },
        coin: toRemove,
        issuePolicy,
        atomic: false,
      }
    };

    if (emailRecovery) {
      const expiryEmail = this._fillEmailArray(targetValue, true, sourceCurrency);
      if (expiryEmail) {
        params.issuerRequest["expiryEmail"] = expiryEmail;
      }
    }


    const beginTransaction = () => {
      const beginArgs = {
        issuerRequest: {
          fn: "atomicSwap",
        }
      };

      return this.issuer("begin", beginArgs, {});
    };


    const issuerAtomicSwap = (response) => {
      let msg = "Issuer begin atomic swap response is deferred";
      if (response.status == "defer") {
        return Promise.reject(Error(msg));
      }
      
      if (response.error && response.error.length > 0) {
        return Promise.reject(Error(response.error[0].message));
      }

      beginResponse = response;
      params.issuerRequest["tid"] = response.headerInfo.tid;

      if (debug) {
        console.log("SwapBF.atomicSwap", params);
      }

      return this.issuer("atomicSwap", params, {
        beginResponse,
        domain: this.getSettingsVariable(DEFAULT_ISSUER),
      });
    };


    const storeSwapCoins = (response) => {
      if (debug) {
        console.log("SwapBF.atomicSwap", response);
      }

      const {
        coin,
        error,
        status,
        swapInfo,
      } = response;

      let msg = "Atomic swap request is deferred";
      if (status == "defer") {
        return Promise.reject(Error(msg));
      }
      
      if (status == "bad request") {
        msg = "Bad request for atomic swap";
        return Promise.reject(Error(msg));
      }

      if (error && error.length > 0) {
        return Promise.reject(Error(error[0].message));
      }

      result = {
        swapInfo,
        coin,
      };

      return this.includeSwapCoins(response, toRemove);
    }


    const endTransaction = () => {
      return this.issuer("end", {
        issuerRequest: {
          tid: params.issuerRequest.tid,
        },
      }, {
        domain: this.getSettingsVariable(DEFAULT_ISSUER),
      });
    };


    const endSession = () => {
      let promise = Promise.resolve(true);
      if (!isInSession) {
        promise = this.config.storage.sessionEnd();
      }
      
      return promise
        .then(() => result);
    };


    /**
     * We don't include back the coins, as they need to be
     * still in standby until the third party confirm the
     * swap or the swap request expires.
     */
    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }

      const args = {
        domain: this.getSettingsVariable(DEFAULT_ISSUER),
      };
      const endParams = {
        issuerRequest: {
          tid: params.issuerRequest.tid,
        },
      };

      if (!isInSession) {
        return this.config.storage.sessionEnd()
          .then(() => this.issuer("end", endParams, args))
          .then(() => Promise.reject(err));
      }

      return this.issuer("end", endParams, args)
        .then(() => Promise.reject(err));
    };


    let startSession = Promise.resolve(true);
    if (!isInSession) {
      startSession = storage.sessionStart("Swap with issuer");
    }

    return startSession
      .then(beginTransaction)
      .then(issuerAtomicSwap)
      .then(storeSwapCoins)
      .then(endTransaction)
      .then(endSession)
      .catch(handleError);
  }


  /**
   * Create a swap file
   * @param args [object] Object with the following attributes:
   *   @element emailRecovery [boolean]
   *   @element source [object] with the sourceValue and sourceCurrency
   *   @element target [object] with the targetValue and targetCurrency
   * @param issuerService [object] Service information with fees.
   * 
   * @return a promise that resolves with an object that includes the
   *   swapInfo and the list of new coins from the targetCurrency.
   */
  exportSwapCode(args, issuerService, tid = null) {
    const {
      COIN_RECOVERY,
      COIN_STORE,
      COIN_SWAP,
      debug,
      DEFAULT_ISSUER,
      ISSUE_POLICY,
      SESSION,
      storage,
      VERIFY_EXPIRE,
    } = this.config;

    const {
      emailRecovery,
      fee,
      source,
      target,
      expiryTime,
    } = args;

    const {
      sourceValue,
      sourceCurrency,
    } = source;

    const {
      targetValue,
      targetCurrency,
    } = target;

    const defaultPolicy = DEFAULT_SETTINGS.issuePolicy;
    const issuePolicy = this.getSettingsVariable(ISSUE_POLICY, defaultPolicy);
    const attempt = tid != null;

    let toRemove = [];
    if (attempt) {
      toRemove = storage.getFrom(COIN_SWAP, tid);
    } else {
      const expiryPeriod_ms = this.getExpiryPeriod(VERIFY_EXPIRE);
      const coinList = this.getStoredCoins(false, sourceCurrency);
      const totalSource = this._round(sourceValue, 8);
      const coinSelArgs = {
        expiryPeriod_ms,
        issuerService,
        outCoinCount: this.getOutCoinCount(),
        singleCoin: true,
        mustVerify: true,
      };

      if (debug) {
        console.log("WalletBF.exportSwapCode totalSource", totalSource);
        console.log("WalletBF.exportSwapCode coinList", coinList);
        console.log("WalletBF.exportSwapCode args", coinSelArgs);
      }

      const sel = this._coinSelection(totalSource, coinList, coinSelArgs);

      toRemove = sel.toVerify;
      if (toRemove.length == 0) {
        toRemove = sel.selection;
      }
    }

    if (toRemove.length == 0) {
      let msg = "Can't obtain coins for this exchange";
      return Promise.reject(Error(msg));
    }

    let totalRemoved = 0;
    toRemove = toRemove.map((c) => {
      if (typeof c == "string") {
        c = this.Coin(c);
      }
      totalRemoved += parseFloat(c.v) || 0;
      return c.base64 || c;
    });

    let result;
    let params = {
      issuerRequest: {
        targetValue: sourceValue.toFixed(8),
        coinSpec: {
          c: targetCurrency,
          v: targetValue.toFixed(8),
        },
        coin: toRemove,
        issuePolicy,
        atomic: true,
        expiry: expiryTime,
      }
    };

    let endParams = {};
    const endArgs = {
      domain: this.getSettingsVariable(DEFAULT_ISSUER),
    };


    const startSwapTransaction = () => {
      if (emailRecovery) {
        const expiryEmail = this._fillEmailArray(targetValue, true, targetCurrency);
        if (expiryEmail) {
          params.issuerRequest["expiryEmail"] = expiryEmail;
        }
      }

      if (attempt) {
        // Dummy response
        return {
          status: "ok",
          headerInfo: {
            tid,
          }
        };
      }

      const beginArgs = {
        issuerRequest: {
          fn: "atomicSwap",
        }
      };
      return this.issuer("begin", beginArgs, {});
    };


    const callSwapIssuer = (response) => {
      let msg = "Issuer begin atomic swap response is deferred";
      if (response.status == "defer") {
        return Promise.reject(Error(msg));
      }

      if (response.error && response.error.length > 0) {
        return Promise.reject(Error(response.error[0].message));
      }

      params.issuerRequest["tid"] = response.headerInfo.tid;
      endParams = {
        issuerRequest: {
          tid: response.headerInfo.tid,
        },
      };

      if (debug) {
        console.log("SwapBF.atomicSwap", params);
      }

      return this.issuer("atomicSwap", params, {
        domain: this.getSettingsVariable(DEFAULT_ISSUER),
      });
    };

    const handleResponse = (response) => {
      // Must return a deferInfo
      if (debug) {
        console.log("SwapBF.atomicSwap", response);
      }

      const { error } = response;
      if (error && error.length > 0) {
        throw new Error(error[0].message);
      }

      result = response;
      if (response.deferInfo && tid) {
        return true;
      }

      // No defer, we should include coins
      if (Object.keys(response).indexOf("deferInfo") == -1) {

        const removeSessionAndSwapCoins = () => {
          if (debug) {
            console.log("SwapBF.exportSwapCode", response);
          }

          const { tid } = response.headerInfo;

          return Promise.all([
            storage.removeFrom(COIN_SWAP, tid),
            storage.removeFrom(SESSION, tid),
          ]);
        };

        return this.includeSwapCoins(response, [])
          .then(removeSessionAndSwapCoins)
          .then(() => this.issuer("end", endParams, endArgs));
      }

      const { tid } = response.deferInfo;
      const session = Object.assign(result, {
        args,
        issuerService,
      });

      const extractCoins = () => {
        if (attempt) {
          // Coins already extracted
          return [];
        }
        let extParams = [toRemove, "Atomic Swap", "wallet", sourceCurrency];
        return this.extractCoins(...extParams);
      }

      const recordTransaction = (listCoins) => {
        if (listCoins.length == 0) {
          return true;
        }

        return this.recordTransaction({
          walletInfo: {
            faceValue: totalRemoved,
            actualValue: totalRemoved,
            fee,
          },
          headerInfo:{
            fn: "send swap",
            domain: "localhost",
          },
          other: {
            sourceCurrency: targetCurrency,
            removedCoin: toRemove,
          },
          coin: toRemove,
          currency: sourceCurrency,
        });
      };

      const promises = [
        storage.setToPromise(COIN_SWAP, tid, toRemove),
        storage.set(SESSION, {
          [tid]: session,
        })
      ];

      return Promise.all(promises)
        .then(extractCoins)
        .then(recordTransaction);
    };

    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }

      let errorList = [
        "Bad request [invalid coins]",
        "Bad request [previous response error]"
      ];
      // "Bad request [expired]"

      if (tid && errorList.indexOf(err.message) > -1) {
        // It seems the coins are invald or it expired
        let existingCoins;
        let totalExistingCoins = 0;

        const checkCoinsExist = () => {
          const params = {
            issuerRequest: {
              fn: "exist",
              coin: toRemove,
            }
          };

          return this.issuer("exist", params);
        };

        const addExistingCoins = (response) => {
          if (response && (response.deferInfo || response.status !== "ok")) {
            // Save coin list in recovery store just in case
            let params = [COIN_RECOVERY, toRemove, false, sourceCurrency];
            return storage.addAllIfAbsent(...params);
          }

          existingCoins = response.coin || [];
          existingCoins.forEach((c) => {
            if (typeof c == "string") {
              c = this.Coin(c);
            }
            totalExistingCoins += parseFloat(c.v) || 0;
          });

          let params = [COIN_STORE, existingCoins, false, sourceCurrency];
          return storage.addAllIfAbsent(...params);
        };

        const recordTransaction = () => {
          if (totalExistingCoins == 0) {
            return null;
          }

          return this.recordTransaction({
            walletInfo: {
              faceValue: totalExistingCoins,
              actualValue: totalExistingCoins,
              fee: 0,
            },
            headerInfo:{
              fn: "change from swap",
              domain: "localhost",
            },
            other: {
              type: "source",
              targetCurrency,
            },
            coin: existingCoins,
            currency: sourceCurrency,
          });
        };

        const handleRecoverCoinsError = (err) => {
          if (debug) {
            console.log(err);
          }
          return Promise.reject(err);
        };

        const removePromises = [
          storage.removeFrom(COIN_SWAP, tid),
          storage.removeFrom(SESSION, tid),
        ];

        return Promise.all(removePromises)
          .then(checkCoinsExist)
          .then(addExistingCoins)
          .then(recordTransaction)
          .then(() => storage.sessionEnd())
          .then(() => { return { cancelled: true }; })
          .catch(handleRecoverCoinsError);
      }

      return storage.sessionEnd()
        .then(() => Promise.reject(err));
    };

    return storage.sessionStart("Swap with other")
      .then(startSwapTransaction)
      .then(callSwapIssuer)
      .then(handleResponse)
      .then(() => storage.sessionEnd())
      .then(() => result)
      .catch(handleError);
  }


  importSwapCode(request, toRemove, fee) {
    const {
      debug,
      COIN_STORE,
      DEFAULT_ISSUER,
      storage,
    } = this.config;

    let params = {
      issuerRequest: {
        atomic: true,
        coinSpec: request.target,
        swapCode: request.swapCode,
        targetValue: request.source.v,
        coin: toRemove,
      },
    };

    let args = {
      domain: this.getSettingsVariable(DEFAULT_ISSUER),
    };

    const {
      issuerService,
    } = request;

    let result, tid;


    const beginTransaction = () => {
      let params = {
        issuerRequest: {
          fn: "verify",
        },
      };
      return this.issuer("begin", params, {});
    };

    const swapCoins = (beginResponse) => {
      tid = beginResponse.headerInfo.tid;
      params.issuerRequest["tid"] = tid;
      return this.issuer("atomicSwap", params, args);
    };

    const includeSwapCoins = (response) => {
      if (debug) {
        console.log("SwapBF.importSwapCode", response);
      }

      const {
        coin,
        error,
        status,
        swapInfo,
      } = response;

      let msg = "Atomic swap request is deferred";
      if (status == "defer") {
        return Promise.reject(Error(msg));
      }
      
      if (status == "bad request") {
        msg = "Bad request for atomic swap";
        return Promise.reject(Error(msg));
      }

      if (error && error.length > 0) {
        return Promise.reject(Error(error[0].message));
      }

      result = {
        swapInfo,
        coin,
      };

      return this.includeSwapCoins(response, toRemove);
    }


    const sessionEnd = () => {
      const context = {
        issuerRequest: {
          tid,
        },
      };

      return this.issuer("end", context, args)
        .then(() => storage.sessionEnd())
        .then(() => result);
    };


    const handleError = (err) => {
      const issuerEnd = () => {
        return this.issuer("end", {
          issuerRequest: {
            tid,
          },
        }, args);
      };

      return storage.addAllIfAbsent(COIN_STORE, toRemove, false, request.source.c)
        .then(this.config.storage.sessionEnd)
        .then(issuerEnd)
        .then(() => Promise.reject(err));
    };


    return storage.sessionStart("Confirm swap coins file")
      .then(beginTransaction)
      .then(swapCoins)
      .then(includeSwapCoins)
      .then(sessionEnd)
      .catch(handleError);
  }


  includeSwapCoins(swapResponse, toRemove) {
    const {
      coin,
      swapInfo,
      verifyInfo,
    } = swapResponse;

    const {
      COIN_RECOVERY,
      COIN_STORE,
      debug,
      DEFAULT_ISSUER,
      storage,
    } = this.config;

    const sourceCurrency = swapInfo.source.c;
    const targetCurrency = swapInfo.target.c;

    let totalTargetValue = 0;
    let totalSourceValue = 0;

    // Prepare the change received from the swap (source)
    let sCoins = coin.filter(c => this.Coin(c).c == sourceCurrency);
    let sourceCoins = sCoins.map((c) => {
      if (typeof c == "string") {
        c = this.Coin(c);
      }
      totalSourceValue += parseFloat(c.v) || 0;
      return c.base64 || c;
    });


    // Prepare the new coins of the swapped currency received (target)
    let tCoins = coin.filter(c => this.Coin(c).c == targetCurrency);
    let targetCoins = tCoins.map((c) => {
      totalTargetValue += this.Coin(c).v || 0;
      return (typeof c == "string") ? c : c.base64;
    });


    const addTargetCoins = () => {
      let promises = [
        storage.addAllFirst(COIN_RECOVERY, targetCoins, targetCurrency),
        storage.addAllIfAbsent(COIN_STORE, targetCoins, false, targetCurrency)
      ];
      return Promise.all(promises);
    };


    const recordTargetCoinsStore = (responses) => {
      return this.recordTransaction({
        walletInfo: {
          faceValue: totalTargetValue,
          actualValue: totalTargetValue,
          fee: 0,
        },
        headerInfo:{
          fn: "receive swap",
          domain: this.getSettingsVariable(DEFAULT_ISSUER),
        },
        other: {
          type: "target",
          sourceCurrency: sourceCurrency,
        },
        coin: targetCoins,
        currency: targetCurrency,
      });
    };

    const extractSourceCoins = (responses) => {
      if (toRemove.length == 0) {
        return true;
      }
      return this.extractCoins(toRemove, "Atomic Swap", "wallet", sourceCurrency);
    };


    const addSourceChange = (responses) => {
      let promises = [
        storage.addAllFirst(COIN_RECOVERY, sourceCoins, sourceCurrency),
        storage.addAllIfAbsent(COIN_STORE, sourceCoins, false, sourceCurrency)
      ];
      return Promise.all(promises);
    };


    const recordSwap = () => {
      const removedCoins = toRemove.map((c) => {
        return (typeof c == "string") ? c : c.base64;
      });

      if (debug) {
        console.log("SwapBF - Store in history transaction ", verifyInfo);
      }

      return this.recordTransaction({
        walletInfo: {
          faceValue: verifyInfo.faceValue,
          actualValue: verifyInfo.actualValue,
          fee: verifyInfo.totalFee,
        },
        headerInfo:{
          fn: "send swap",
          domain: this.getSettingsVariable(DEFAULT_ISSUER),
        },
        other: {
          sourceCurrency: targetCurrency,
          removedCoin: removedCoins,
        },
        coin: sourceCoins,
        currency: sourceCurrency,
      });
    };


    /**
     * @deprecated Since version 0.2.91.
     */
    const recordSourceChangeStore = () => {
      return this.recordTransaction({
        walletInfo: {
          faceValue: totalSourceValue,
          actualValue: totalSourceValue,
          fee: 0,
        },
        headerInfo:{
          fn: "change from swap",
          domain: this.getSettingsVariable(DEFAULT_ISSUER),
        },
        other: {
          type: "source",
          targetCurrency: targetCurrency,
        },
        coin: sourceCoins,
        currency: sourceCurrency,
      });
    };


    /**
     * @deprecated Since version 0.2.91.
     */
    const recordExtractSourceCoins = (resp) => {
      let totalRemoved = 0;
      let removedCoins = toRemove.map((c) => {
        totalRemoved += this.Coin(c).v || 0;
        return (typeof c == "string") ? c : c.base64;
      });

      return this.recordTransaction({
        walletInfo: {
          faceValue: totalRemoved,
          actualValue: totalRemoved,
          fee: totalRemoved - totalSourceValue - swapInfo.source.v,
        },
        headerInfo:{
          fn: "send swap",
          domain: this.getSettingsVariable(DEFAULT_ISSUER),
        },
        other: {
          sourceCurrency: targetCurrency,
          removedCoin: removedCoins,
        },
        coin: sourceCoins,
        currency: sourceCurrency,
      });
    }


    return addTargetCoins()
      .then(recordTargetCoinsStore)
      .then(extractSourceCoins)
      .then(addSourceChange)
      .then(recordSwap);

  }

  revertSwapRequest (swapTransaction, reason) {
    const {
      debug,
      SESSION,
      COIN_STORE,
      COIN_SWAP,
      storage,
    } = this.config;

    if (!swapTransaction) {
      const msg = "Swap transaction is null"
      return Promise.reject(new Error(msg));
    }

    const {
      tid,
      transaction,
    } = swapTransaction;

    const {
      sourceCurrency,
    } = transaction.args.source

    const {
      targetCurrency,
    } = transaction.args.target;
;

    let coinSwap = storage.get(COIN_SWAP);
    let totalExistingCoins = 0;

    coinSwap = coinSwap[tid];
    coinSwap.forEach((c) => {
      if (typeof c == "string") {
        c = this.Coin(c);
      }
      totalExistingCoins += parseFloat(c.v) || 0;
    });

    const updateWalletStorages = () => {
      return Promise.all([
        storage.removeFrom(SESSION, tid),
        storage.removeFrom(COIN_SWAP, tid),
        storage.addAllIfAbsent(COIN_STORE, coinSwap, false, sourceCurrency),
      ]);
    }

    const recordTransaction = () => {
      return this.recordTransaction({
        walletInfo: {
          faceValue: totalExistingCoins,
          actualValue: totalExistingCoins,
          fee: 0,
        },
        headerInfo:{
          fn: "revert swap",
          domain: "localhost",
        },
        other: {
          type: "source",
          targetCurrency,
        },
        coin: coinSwap,
        currency: sourceCurrency,
      });
    }

    const endTransaction = () => {
      const {
        DEFAULT_ISSUER,
      } = this.config;

      return this.issuer("end", {
        issuerRequest: {
          tid,
        },
      }, {
        domain: this.getSettingsVariable(DEFAULT_ISSUER),
      });
    };

    const msg = `Swap with other ${reason}`;
    return storage.sessionStart()
      .then(updateWalletStorages)
      .then(recordTransaction)
      .then(endTransaction)
      .then(() => storage.sessionEnd());
  }
}

