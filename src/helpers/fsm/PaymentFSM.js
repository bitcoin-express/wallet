/*
 * PaymentRequest Finite State Machine
 */
var PaymentRequestFSM = new StateMachine.factory({
  init: 'PrepareCurrency',
  transitions: [
    //PrepareCurrency
    {
      name: 'currencyReady',
      from: 'PrepareCurrency',
      to: 'ConfirmPayment'
    },
    {
      name: 'interrupted',
      from: 'PrepareCurrency',
      to: 'PaymentInterrupted'
    },
    {
      name: 'ackOk',
      from: 'PrepareCurrency',
      to: 'SendAckAck'
    },
    {
      name: 'error',
      from: 'PrepareCurrency',
      to: 'RecoverCoins'
    },
    {
      name: 'insufficientFunds',
      from: 'PrepareCurrency',
      to: 'Exit'
    },
    {
      name: 'paymentTimeout',
      from: 'PrepareCurrency',
      to: 'Exit'
    },
    {
      name: 'close',
      from: 'PrepareCurrency',
      to: 'FinalState'
    },
    //Exit
    {
      name: 'close',
      from: 'Exit',
      to: 'FinalState'
    },
    //ConfirmPayment
    {
      name: 'splitCoins',
      from: 'ConfirmPayment',
      to: 'SplitCoins'
    },
    {
      name: 'paymentTimeout',
      from: 'ConfirmPayment',
      to: 'Exit'
    },
    {
      name: 'close',
      from: 'ConfirmPayment',
      to: 'FinalState'
    },
    //SplitCoins
    {
      name: 'coinsReady',
      from: 'SplitCoins',
      to: 'PaymentReady'
    },
    {
      name: 'paymentTimeout',
      from: 'SplitCoins',
      to: 'Exit'
    },
    {
      name: 'error',
      from: 'SplitCoins',
      to: 'Exit'
    },
    {
      name: 'ratesTimeout',
      from: 'PrepareCurrency',
      to: 'PrepareCurrency'
    },
    //PaymentReady
    {
      name: 'startPayment',
      from: 'PaymentReady',
      to: 'StartPayment'
    },
    {
      name: 'error',
      from: 'PaymentReady',
      to: 'PrepareCurrency'
    },
    //PaymentInterrupted
    {
      name: 'coinsExist',
      from: 'PaymentInterrupted',
      to: 'VerifyPaymentCoins'
    },
    {
      name: 'coinsNotExist',
      from: 'PaymentInterrupted',
      to: 'StartPayment'
    },
    //VerifyPaymentCoins
    {
      name: 'coinRecoveryComplete',
      from: 'VerifyPaymentCoins',
      to: 'Exit'
    },
    //StartPayment
    {
      name: 'paymentAckArrived',
      from: 'StartPayment',
      to: 'AckReceived'
    },
    {
      name: 'error',
      from: 'StartPayment',
      to: function() {
        return this.args.paymentAttempts <= 0 ? 'PaymentInterrupted' : 'VerifyPaymentCoins';
      }
    },
    //AckReceived
    {
      name: 'ackOk',
      from: 'AckReceived',
      to: 'SendAckAck'
    },
    {
      name: 'error',
      from: 'AckReceived',
      to: 'RecoverCoins'
    },
    //SendAckAck
    {
      name: 'paymentComplete',
      from: 'SendAckAck',
      to: 'Complete'
    },
    //RecoverCoins
    {
      name: 'coinRecoveryComplete',
      from: 'RecoverCoins',
      to: 'Exit'
    },
    //Complete
    {
      name: 'close',
      from: 'Complete',
      to: 'FinalState'
    }
  ],
  data: function(param) {
    let defaultArgs = {
      interrupted: false,
      splitFee: 0,
      paymentAttempts: 0,
      signal: null
    };
    return {
      args: Object.assign({}, defaultArgs, param)
    }
  },
  methods: {
    onInvalidTransition: function(transition, from, to) {
      console.log("Exception: "+transition + " ignored from " + from + " to " + to);
      //throw new Exception("Invalid transition");
    },
    onPendingTransition: function(transition, from, to) {
      console.log("Exception: "+transition + " blocked from " + from + " to " + to);
      //throw new Exception("Transition already in progress");
    }
  }
});

var now = function() {
  // in seconds
  return new Date().getTime() / 1000;
}

var persistFSM = function(wallet, args) {
  let argsCloned = null;
  if (args !== null) {
    argsCloned = JSON.parse(JSON.stringify(args));
    delete argsCloned.wallet;
    delete argsCloned.notification;
    delete argsCloned.other;
  }
  return wallet.setPersistentVariable(wallet.config.FSM, argsCloned);
};

function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("://") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  if (!hostname || hostname == "") {
    return window.location.hostname;
  }

  return hostname;
}

var _getRecoveryCoins = function(args) {
  const {
    payment,
    ack,
  } = args;
  let result = [];

  if (payment && payment.coins) {
    result = result.concat(payment.coins);
  }
  if (ack && ack.coins) {
    result = result.concat(ack.coins);
  }

  return result;
}

var _prepareExpiryDate = function (expires) {
  if (!expires) {
    // Set expire for one day after. Should be less?
    return new Date(new Date().getTime() + 24 * 60 * 60 * 1000).getTime() / 1000;
  }
  return new Date(expires).getTime() / 1000;
}

/*
 * It also means there would be no need unpersist payment
 * if you also reverse the order of checking 'payment' and
 * 'ack' at the start of doPrepareCurrency.
 */
var doPrepareCurrency = function(fsm) {
  // args also contains:
  // wallet - walletBF
  // notification - function needed to be called to
  //                comunicate with the UI - React.
  // other - json with other relevant info
  //   * rates - rates from issuer
  const {
    ack,
    amount,
    currency,
    issuers,
    memo,
    other,
    payment,
    wallet,
  } = fsm.args;

  const {
    walletCurrencies,
  } = wallet.config;

  const expires = _prepareExpiryDate(fsm.args.expires);

  if (ack) {
    if (ack.status === "ok") {
      return Promise.resolve(fsm.ackOk());
    }
    return Promise.resolve(fsm.error()); 
  }

  if (payment) {
    return Promise.resolve(fsm.interrupted());
  }

  if (expires < now()) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  let errorList = [];
  // Check problems with currency
  if (!currency) {
    errorList.push("'currency undefined'");
  } else if (typeof currency == "string" && walletCurrencies.indexOf(currency) == -1) {
    errorList.push("'unsupported currency'");
  } else if (typeof currency !== "string") {
    errorList.push("'currency is not a string'");
  }
  // Check problems with amount
  if (isNaN(amount)) {
    errorList.push("'amount is not a number'");
  }
  // Check problems with issuer list
  if (wallet.config.debug) {
    console.log("Issuer accepted list - " + issuers);
  }
  if (!issuers) {
    errorList.push("'issuers undefined'");
  } else if (!Array.isArray(issuers) || issuers.length == 0) {
    errorList.push("'issuers list'");
  }
  // Check if memo is present
  if (!memo) {
    errorList.push("'memo undefined'");
  }

  let issuerList = wallet.getAcceptableDomains(issuers);
  if (issuerList.length == 0) {
    errorList.push("'no acceptable issuer domains'");
  }

  if (errorList.length > 0) {
    fsm.args.error = "Malformed payment request - " + errorList.join(", ");
    return Promise.resolve(fsm.error()); 
  }

  // Finally, start preparing the currencies amounts
  const {
    rates,
  } = other;

  const totalCurrency = wallet.getBalanceAs(currency, issuerList, rates);
  if (wallet.config.debug) {
    console.log("TOTAL CURRENCY - " + totalCurrency);
  }
  if (amount > totalCurrency) {
    fsm.args.error = "Insufficient funds to proceed with this payment";
    fsm.args.errorType = "insufficientFunds"
    return Promise.resolve(fsm.insufficientFunds());
  }
  let balance, service, emailRecovery;

  return wallet.Balance(currency).then((response) => {
    balance = parseFloat(response.toFixed(8));
    fsm.args.balance = balance;

    let swapList = {};
    if (amount > balance) {
      // Get swaps needed to reach the amount
      let toSwap = amount - balance;
      return wallet.getSwapCoins(currency, toSwap, rates).then((res) => {
        const {
          swapList,
          issuerService,
          emailVerify,
        } = res;

        emailRecovery = emailVerify;
        service = issuerService;

        return swapList;
      });
    }
    return {};
  }).then((swapList) => {
    if (Object.keys(swapList).length > 0) {
      // Prepare Swap Coins
      fsm.args.other.swapList = swapList;
      const {
        expiryExchangeRates,
      } = fsm.args.other;

      const expiryRates = new Date(expiryExchangeRates).getTime() / 1000;
      const secsToExpireRates = Math.ceil(expiryRates - now());
      const secsToExpire = parseInt(expires - now());

      const p1 = new Promise((resolve, reject) => { 
        let secs = Math.min(2147483647, 1000 * secsToExpire);
        console.log(`Payment expires in ${secs} sec`);
        setTimeout(resolve, secs, "expired"); 
      });
      const p2 = fsm.args.notification("displaySwap", {
        swapList,
        secsToExpire: Math.min(secsToExpireRates, secsToExpire),
      });
      const p3 = new Promise((resolve, reject) => { 
        let secs = Math.min(2147483647, 1000 * secsToExpireRates);
        console.log(`Rates expires in ${secs} sec`)
        setTimeout(() => {
          fsm.args.notification("disableSwap");
        }, secs);
        setTimeout(resolve, secs + 5000, "rateExpired"); 
      });

      return Promise.race([p1, p2, p3]).then((result) => {
        if (result == "expired") {
          return "paymentTimeout";
        }

        if (result == "rateExpired") {
          // TO_DO
          return fsm.args.notification("displayLoader", {
            message: "Fetching exchange rates..."
          }).then(() => {
            return wallet.getIssuerExchangeRates();
          }).then((resp) => {
            const {
              exchangeRates,
              expiry,
            } = resp;

            fsm.args.other.rates = exchangeRates;
            fsm.args.other.expiryExchangeRates = expiry;
            return "ratesTimeout";
          }).catch((err) => {
            fsm.args.error = err.message || err;
            return Promise.resolve(fsm.error()); 
          });
        }

        // Swap coins
        let promises = [];
        swapList.forEach((swap) => {
          let c = Object.keys(swap)[0];
          let {
            exchange,
            from,
            fee
          } = swap[c];

          let args = {
            source: {
              sourceValue: parseFloat(from.toFixed(8)),
              sourceCurrency: c,
            },
            target: {
              targetValue: parseFloat(exchange.toFixed(8)),
              targetCurrency: currency,
            },
            lastModified: null,
            emailRecovery,
            fee,
            maxSelected: false,
          };
          promises.push(wallet.atomicSwap(args, service, true));
        });
        return fsm.args.notification("displayLoader", {
          message: "Swapping coins..."
        }).then(() => {
          return Promise.all(promises);
        });
      }).catch((err) => {
        fsm.args.error = err.message || err;
        return Promise.resolve(fsm.error()); 
      });
    }
    return "currencyReady";
  }).then((response) => {
    switch(response) {
      case "ratesTimeout":
        return fsm.ratesTimeout();
      case "paymentTimeout":
        fsm.args.error = "Payment request expired";
        return fsm.paymentTimeout();
      default:
        return fsm.currencyReady();
    }
  }).catch((err) => {
    fsm.args.error = err.message || err;
    return Promise.resolve(fsm.error()); 
  });
};

var doConfirmPayment = function(fsm) {
  console.log("do"+fsm.state);

  const {
    amount,
    currency,
    other,
    wallet,
  } = fsm.args;

  const expires = _prepareExpiryDate(fsm.args.expires);
  
  //select coins to determine the split fee
  //display confirmation page
  //wait for confirm click
  if (expires < now()) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  let splitFee = 0;
  return wallet.getBitcoinExpressFee(amount, currency).then((fee) => {
    splitFee = fee;
    let timeToExpire = expires - now();

    const p1 = new Promise((resolve, reject) => { 
      let secs = Math.min(2147483647, 1000 * timeToExpire);
      setTimeout(resolve, secs, "expired"); 
    });
    const p2 = fsm.args.notification("displayPayment", {
      splitFee,
      timeToExpire,
    });

    console.log(other);
    return Promise.race([p1, p2]);
  }).then((resp) => {
    if (resp == "expired") {
      fsm.args.error = "Payment request expired";
      return fsm.paymentTimeout();
    }

    fsm.args.useEmail = resp;
    return fsm.args.notification("displayLoader", {
      message: "Sending coins..."
    });
  }).then((resp) => {
    if (resp == "expired") {
      fsm.args.error = "Payment request expired";
      return fsm.paymentTimeout();
    }
    return fsm.splitCoins();
  }).catch((err) => {
    fsm.args.error = err.message || err;
    return Promise.resolve(fsm.error()); 
  });
};

var doSplitCoins = function(fsm) {
  console.log("do"+fsm.state);

  const {
    amount,
    currency,
    wallet,
  } = fsm.args;

  const {
    EMAIL,
    storage,
  } = wallet.config;

  const expires = _prepareExpiryDate(fsm.args.expires);

  if (expires < now()) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  return wallet._getCoinsExactValue(amount, {}, false, currency).then((coins) => {
    // Construct a Payment object and add to the fsm  
    coins = coins.map((c) => typeof c == "string" ? c : c.base64);
    let payment = {
      id: Math.random().toString(36).replace(/[^a-z]+/g, ''),
      payment_id: fsm.args.payment_id,
      coins,
      merchant_data: fsm.args.merchant_data,
      client: "web",
      language_preference: "en_GB",
    };

    if (fsm.args.useEmail) {
      let email = wallet.getSettingsVariable(EMAIL);
      payment.receipt_to = { email };
      payment.refund_to = { email };
    }

    fsm.args.payment = payment;
    return fsm.coinsReady();
  }).catch((err) => {
    // The error transition goes to the Exit state which does not attempt 
    // to recover Coins. Therefore there is no need to get the recover coins
    // ready (which are still in the coin store) or to delete payment
    // (which hasn't actually been persisted at this point).
    fsm.args.error = err.message || err;
    return fsm.error(); 
  });
};

var doPaymentReady = function(fsm) {
  const {
    amount,
    currency,
    payment,
    wallet,
  } = fsm.args;

  const {
    coins,
  } = payment;

  if (wallet.config.debug) {
    console.log("do"+fsm.state);
  }

  // Extract coins from store
  const params = [coins, `buy item for ${currency} ${amount}`,
    "wallet", currency, false];

  return wallet.extractCoins(...params).then((resp) => {
    if (wallet.config.debug) {
      console.log("Coins extracted: " + resp);
    }
    // Persist the Payment record
    return persistFSM(wallet, fsm.args);
  }).then(() => {
    return wallet.config.storage.flush();
  }).then(() => {
    return fsm.startPayment();
  }).catch((err) => {
    fsm.args.error = err.message || err;
    delete fsm.args.payment;
    return fsm.error(); 
  });
};

var doStartPayment = function(fsm) {
  const {
    amount,
    payment,
    wallet,
  } = fsm.args;

  if (wallet.config.debug) {
    console.log("do"+fsm.state);
  }

  fsm.args.paymentAttempts += 1;
  return BitcoinExpress.Host.Payment(payment, amount).then((response) => {
    fsm.args.ack = response.PaymentAck;
    return fsm.paymentAckArrived();          
  }).catch((err) => {
    fsm.args.error = err.message || err;
    return fsm.error();         
  });
};

var doAckReceived = function(fsm) {
  const {
    ack,
    wallet,
  } = fsm.args;

  if (wallet.config.debug) {
    console.log("do"+fsm.state);
  }
  
  switch (ack.status) {
    case "ok":
      const {
        amount,
        balance,
        currency,
        memo,
        merchant_data,
        payment,
        payment_url,
      } = fsm.args;

      // The present version does not lock the coin store for the duration of
      // the payment. Therefore if another device were to cause the balance to
      // reduce, the history item may be incorrect.
      return persistFSM(wallet, fsm.args).then(() => {
        return wallet.Balance(currency);
      }).then((newBalance) => {
        // recordTransaction calls flush, at this point atomically
        // persists the tx in history and the FSM payment args.
        return wallet.recordTransaction({
          headerInfo: {
            fn: 'buy item',
            domain: ack.seller || extractHostname(document.referrer),
          },
          paymentInfo: {
            actualValue: amount,
            faceValue: amount,
            newValue: newBalance - balance,
            fee: 0,
          },
          coin: payment.coins,
          other: {
            target: amount,
            item: payment.payment_id,
          },
          currency,
        });
      }).then(() => {
        // Save in item store
        const domain = extractHostname(document.referrer);
        console.log("item referrer ", domain);
        const item = {
          paymentDetails: {
            payment_url,
            currency,
            domain,
            memo,
            amount,
          },
          paymentAck: ack,
        };
        fsm.args.item = item;
        return wallet.saveItem(item, currency);
      }).then(() => {
        return fsm.ackOk();
      }).catch((err) => {
        fsm.args.error = err.message || err;
        return fsm.error();
      });

    //Note sure if there is any special action we can take
    //upon these error
    case "bad_merchant_data":
    case "after_expires":
    case "insufficient_amount":
    case "bad_coins":
    case "retry_expired":
    default:
      fsm.args.error = "Returned bad PaymentAck";
      return Promise.resolve(fsm.error());                  
  }
};

var doSendAckAck = function(fsm) {
  const {
    wallet,
  } = fsm.args;

  const {
    debug,
    storage,
  } = wallet.config;

  if (debug) {
    console.log("do"+fsm.state);
  }

  return persistFSM(wallet, null).then(() => {
    return storage.flush();
  }).then(() => {
    delete fsm.args.ack.coins;
    return BitcoinExpress.Host.PaymentAckAck(fsm.args.ack);
  }).then(() => {
    return fsm.paymentComplete();
  }).catch(function(err) {
    fsm.args.error = err.message || err;
    return fsm.paymentComplete();
  });
};

var doComplete = function(fsm) {
  console.log("do"+fsm.state);

  const {
    ack,
    amount,
    currency,
    item,
    wallet,
  } = fsm.args;

  let msg = `Paid ${currency}${amount}`;
  return BitcoinExpress.Host.PopupMessage(msg, 5000).then(() => {
    return fsm.args.notification("displayItem", {
      item,
    });
  }).then(() => {
    return fsm.close();
  });
};

var doRecoverCoins = function(fsm) {
  console.log("do"+fsm.state);
  //record coin loss in history
  //unpersist PaymentAck
  //ATOMIC
  const {
    ack,
    amount,
    currency,
    error,
    merchant_data,
    payment,
    wallet,
  } = fsm.args;

  const {
    COIN_STORE,
    storage,
  } = wallet.config;

  /*
   * The three actions MUST be atomic:
   * Recover all coins;
   * Record coin loss in history;
   * Unpersist fsm.args;
   */
  let promise = Promise.resolve(storage.flush);
  let coinsToRecover = _getRecoveryCoins(fsm.args);
  if (coinsToRecover.length > 0) {
    const params = {
      issuerRequest: {
        fn: "exist",
        coin: coinsToRecover,
      }
    };

    let oldBalance;
    let coins;
    let message = error || "" + "- trying to recover your coins...";
    promise = fsm.args.notification("displayLoader", { message }).then(() => {
      return wallet.Balance(currency);
    }).then((value) => {
      oldBalance = value;
      return wallet.issuer("exist", params);
    }).then((response) => {
      if (response.deferInfo || response.status !== "ok") {
        return 0;
      }

      // TO_DO: Must be verified the coins?
      coins = response.coins;
      const params = [COIN_STORE, coins, false, currency];
      return storage.addAllIfAbsent(...params).then(() => coins.length);
    }).then((numCoins) => {
      return fsm.args.notification("displayLoader", {
        message: `Recovered ${numCoins} coins...`,
      }).then(() => numCoins);
    }).then((numCoins) => {
      if (numCoins == 0) {
        // Return old balance, no new coins included
        return oldBalance;
      }
      return wallet.Balance(currency);
    }).then((value) => {
      if (oldBalance == value) {
        // Flush for persistFSM
        return storage.flush();
      }
      const recoveredValue = value - oldBalance;
      if (recoveredValue > 0) {
        fsm.args.error += `. Recovered coins: ${currency} ${recoveredValue.toFixed(8)}.`;
        return wallet.recordTransaction({
          headerInfo: {
            fn: 'coin recovery',
            domain: merchant_data,
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
            target: amount,
            item: payment.payment_id,
          },
          currency,
        });
      }
      fsm.args.error += ". No coins recovered.";
      return true;
    });
  }

  return persistFSM(wallet, null).then(() => {
    return promise;
  }).then(() => {
    return BitcoinExpress.Host.PaymentAckAck(ack);
  }).then(function () {
    return fsm.coinRecoveryComplete();     
  }).catch(function (err) {
    //Not sure what can be done about an error so just signal complete
    fsm.args.error = err.message || err;
    return fsm.coinRecoveryComplete();       
  });
};

var doExit = function(fsm) {
  console.log("do"+fsm.state);
  //display final status
  //wait for close
  return fsm.args.notification("displayError", {
    error: fsm.args.error,
    errorType: fsm.args.errorType,
  }).then(() => {
    return fsm.close();
  });
};

var doPaymentInterrupted = function(fsm) {
  console.log("do"+fsm.state);
  let coins = _getRecoveryCoins(fsm.args);
  if (coins.length == 0) {
    return Promise.resolve(fsm.coinsNotExist());
  }
  // check if coins exists
  const params = [true, coins, fsm.args.currency];
  return fsm.args.wallet.existCoins(...params).then((resp) => {
    if (resp.deferInfo) {
      return fsm.coinsNotExist();
    }
    if (!isNaN(resp) && resp == coins.length) {
      // removed all the coins
      return fsm.coinsNotExist();
    }
    return fsm.coinsExist();
  });
};

var doVerifyPaymentCoins = function(fsm) {
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
  // fsm.args.payment.coins = coinsToRecover;

  // Unpersist Payment
  return persistFSM(wallet, null).then(() => {
    // TO_DO: get domain from coin
    return wallet.issuer("info", {}, null, "GET");
  }).then((resp) => {
    issuerService = resp.issuer[0];
    return wallet.getVerificationFee(amount, issuerService);
  }).then((resp) => {
    fee = resp;
    return fsm.args.notification("displayRecovery", {
      recoveryFee: fee,
    });
  }).then((resp) => {
    if (!resp) {
      // want to retry payment
      return fsm.args.notification("displayLoader", {
        message: "Retrying your payment..."
      }).then(() => {
        throw new Error("payment");
      });
    }
    return fsm.args.notification("displayLoader", {
      message: "Recoverying your coins..."
    });
  }).then(() => {
    const params = [coinsToRecover, args, false, currency];
    return wallet.verifyCoins(...params);
  }).then((resp) => {
    let coins = resp.coin;
    if (resp.status == "coin value too small") {
      // Recover coins
      coins = coinsToRecover;
    }
    const params = [COIN_STORE, coins, false, currency];
    return storage.addAllIfAbsent(...params).then(() => coins.length);
  }).then((resp) => {
    fsm.args.error = "Payment failed but coins were recovered";
    fsm.args.recoveredAmount = wallet.getSumCoins(coinsToRecover) - fee;
    return fsm.coinRecoveryComplete();
  }).catch(function (err) {
    //Not sure what can be done about an error so just signal complete
    if (err.message && err.message == "payment") {
      fsm.args.payment = payment;
      return fsm.coinsReady();
    }
    fsm.args.error = err.message || err;
    return fsm.coinRecoveryComplete();       
  });
};

export default {
  stateMachine: PaymentRequestFSM,
  fn: {
    doPrepareCurrency,
    doConfirmPayment,
    doSplitCoins,
    doAckReceived,
    doSendAckAck,
    doStartPayment,
    doPaymentReady,
    doComplete,
    doRecoverCoins,
    doExit,
    doPaymentInterrupted,
    doVerifyPaymentCoins,
  }
}
