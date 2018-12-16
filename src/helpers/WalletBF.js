import Transaction from './walletbf/Transaction'
import SwapBF from './walletbf/SwapBF'

import {
  depositIntent,
  getDepositRef,
  getDepositRefList,
  removeDepositRef,
  removeFromDepositStore,
  setDepositRef,
} from './walletbf/DepositReference'

import {
  importVerifiedCoin,
  verifyCoins,
  verifyCoinsRecovery,
} from './walletbf/ImportBF'

import FSM from './FSM';

 // "be.ap.rmp.net";
const defaultIssuer = "eu.carrotpay.com";

export const DEFAULT_SETTINGS = {
  acceptableIssuers: [
    "eu.carrotpay.com",
    "be.ap.rmp.net"
  ],
  btcdisplay: "XBT",
  crypto: "XBT",
  currency: "USD", // "GBP", "EUR"
  defaultIssuer,
  email: "",
  emailEncrypt: false,
  emailRecovery: false,
  issueExpire: 0.5,
  issuePolicy: "single",
  issuerProtocol: "https://",
  redeemExpire: 0.5,
  separator: ".", // ".", ","
  // keep history track for each currency
  transactions: {
    BTC: [],
    BCH: [],
    ETH: [],
    CRT: [],
  },
  transactionExpire: false,
  verifyExpire: 0.5,
  walletDriveName: "",
  walletLocalName: "",
};

/**
 * Wallet Class.
 * The Wallet provides a number of support functions that help to manage
 * the Wallet more methodically. This Wallet code is compatible with 
 * Bitcoin-fast Issuer v1.
 */
export default class WalletBF extends SwapBF {

  constructor() {
    super();

    this.config = {
      version: window.version,
      lastUpdate: '2017-05-12',
      // available Wallet currency profiles, "CRT"
      walletCurrencies: ["XBT", "BCH", "ETH"],
      currencies: {
        XBT: {
          name: "Bitcoin",
          color: "#f7931a",
          code: "BTC",
        },
        BCH: {
          name: "Bitcoin Cash",
          color: "#8dc351",
          code: "BCH",
        },
        ETH: {
          name: "Ethereum",
          color: "#627eea",
          code: "ETH",
        },
        CRT: {
          name: "Carrot Coin",
          color: "#627eea",
          code: "CRT",
        },
      },
      defaultExpiryHours: (24 * 3)-1,
      defaultExpiryPeriod: (1000 * 60 * 60) * ((24 * 3)-1),
      AVAILABLE_CURRENCIES: "currencies",
      COMBINATION_SEARCH: 10,
      SESSION: "session",
      PASSPHRASE_LIST: "passphraseList",
      PERSISTENT: "persistent",
      HISTORY: "transactions",
      DEPOSIT: "deposit",
      ISSUE_POLICY: "issuePolicy",
      COIN_SWAP: "coinsSwap",
      COIN_STORE: "coinsStore",
      COIN_PENDING: "coinsPending",
      COIN_RECOVERY: "coinsRecovery",
      COIN_SELECTION: "coinsSelection",
      COIN_SELECTION_FN: "coinSelectionFn",
      CRYPTO:  "crypto",
      DEFAULT_ISSUER: "defaultIssuer",
      FSM: "fsm",
      ITEM_STORE: "itemsStore",
      ISSUER_PROTOCOL: "issuerProtocol", // "https://",
      SETTINGS: "walletSettings",
      VERIFY_EXPIRE: "verifyExpire",
      ISSUE_EXPIRE: "issueExpire",
      REDEEM_EXPIRE: "redeemExpire",
      WALLET_LOCAL_NAME: "walletLocalName", // LocalStorage wallet name
      WALLET_DRIVE_NAME: "walletDriveName", // Google Drive wallet name
      SEPARATOR: "separator",
      CURRENCY: "currency",
      BTC_DISPLAY: "btcdisplay",
      ISSUER_PATH: "/Bitcoin-express/v1/issuer/",
      MAGIC_IV: new Uint8Array([43, 101, 66, 140, 220, 254, 133,
        109, 74, 11, 4, 220, 154, 219, 175, 10]),
      ALG: "AES-CBC",
      DIGEST: "SHA-256",
      EMAIL: "email",
      EMAIL_RECOVERY: "emailRecovery",
      EMAIL_ENCRYPT: "emailEncrypt",
      ENCRYPT_TYPE: "encryptType", // 0 - auto. 1 - manual
      PASSWORD_ENCRYPT: "passwordEncrypt",
      MIN_TRANSACTION: "minTransaction",
      MIN_TRANSACTION_VALUE: "minTransactionValue", // 0 - user. 1 - auto
      TRANSACTION_EXPIRE: "transactionExpire",
      TRANSACTION_EXPIRE_VALUE: "transactionExpireValue",
      SPREAD_COIN_COUNT: 6,
      MAX_COINS_PER_TRANSACTION: 25,
      //use only to simulate broken transactions
      powerLoss: false,
      //use to force on redeem
      forceDefer: false,
      debug: true,
      blockchainSpeed: "fastestFee",
      wholeCoinCount: 0,
      issuers: new Object(),
      storage : null,
    };

    // Deposit reference functions
    this.depositIntent = depositIntent.bind(this);
    this.getDepositRef = getDepositRef.bind(this);
    this.getDepositRefList = getDepositRefList.bind(this);
    this.removeDepositRef = removeDepositRef.bind(this);
    this.setDepositRef = setDepositRef.bind(this);
    this.removeFromDepositStore = removeFromDepositStore.bind(this);

    // Import functions
    this.importVerifiedCoin = importVerifiedCoin.bind(this);
    this.verifyCoins = verifyCoins.bind(this);
    this.verifyCoinsRecovery = verifyCoinsRecovery.bind(this);
  }

  isGoogleDrive() {
    return this.config.storage.config.name == 'googleDrive';
  }

  /**
   * Stores a 'value' with the named 'key'. If the key already exists, the old value
   * will be replaced and returned in the result, other wise null will be returned.
   * @param key The name of the variable
   * @param value The value of the variable
   * @return null if the key was previously unused else the previous value is returned.
   */
  setPersistentVariable(key, value) {
    return this.config.storage.setToPromise(this.config.PERSISTENT, key, value);
  }

  /**
   * Retrieve a variable that has been persisted possibly across muliple invocations of the browser.
   * @param key The name of the variable
   * @return the value represented by this key else null if this key has no value.
   */
  getPersistentVariable(key, def = null) {
    const result = this.config.storage.getFrom(this.config.PERSISTENT, key);
    return result || def;
  }

  /**
   * Retrieve a variable that has been persisted possibly
   * across muliple invocations of the browser.
   * @param key The name of the variable
   * @return the value represented by this key else null
   *   if this key has no value.
   */
  getSettingsVariable(key, def = null) {
    const setts = this.config.storage.getFrom(this.config.PERSISTENT, this.config.SETTINGS);
    if (!setts || typeof setts !== "object" || Object.keys(setts).indexOf(key) == -1) {
      return def;
    }
    return setts[key];
  }

  /**
   * Set the key settings with the desired value 
   */
  setSettings(value) {
    const {
      debug,
      SETTINGS,
      storage,
      PERSISTENT,
    } = this.config;

    if (!storage) {
      if (debug) {
        console.log("WalletBF - setSettings: storage is null");
      }
      throw new Error("storage not defined");
    }

    return storage.setToPromise(PERSISTENT, SETTINGS, value);
  }

  /**
   * Turn debugging on or off (default off).
   */
  setDebug(debug) {
    this.config.debug = debug;
  }

  /**
   * Set the bitcoin redemption speed
   */
  setBitcoinSpeed(speed) {
    // if (this.config.debug) console.log("WalletBF setBitcoinSpeed="+speed);
    this.config.blockchainSpeed = speed;
    return this.config.storage.setToPromise(
      this.config.PERSISTENT, "blockchainSpeed", speed);
  }

  /**
   * @param storageMethod Install a storage module that complies with the WalletPersistence interface
   */
  setStorageMethod(storageMethod) {
    if (this.config.debug) {
      console.log("WalletBF setStorageMethod="+storageMethod);
    }
    this.config.storage = storageMethod;
  }

  /**
   * A constructor for the Coin type which is obtained from a raw base64 string.
   * If includeFee is true, use the issuerInfo data (obtained through this coin's domain
   * or the issuerService specified in args), to add verifiedValue and fee to the Coin.
   * @param base64 An encoded coin string
   * @param includeFee (optional) If true add 'verifiedValue' and 'fee' to the Object
   * @param args (optional) The arguments that will be applied to calculate verification fees.
   * @return A Coin object
   */
  Coin(base64, includeFee, args, passphrase) {
    try {
      let obj = JSON.parse(atob(base64));  
      obj.base64 = base64;
      obj.value = this._round(parseFloat(obj.v), 8);

      if (includeFee) {
        let fees = this._getVerificationFee(obj, args);
        obj.fee = this._round(fees.totalFee, 8);
        obj.verifiedValue = this._round(obj.value - obj.fee, 8);
      }
      return obj;
    } catch(err) {
      if (this.config.debug) {
        console.log('Error on creating coin: ', err.message || "");
      }
      return null;
    }
  }

  /*
   * Return amount needed to be swap in order to reach the amount indicated
   * 
   */
  getSwapCoins(currency, amount, rates) {
    let promises = [];
    let currencies = this.config[this.config.AVAILABLE_CURRENCIES];
    delete currencies[currency];

    Object.keys(currencies).forEach((code) => {
      promises.push(this.Balance(code));
    });
    currency = (currency == "BTC") ? "XBT" : currency;
    let issuerService = null;
    const emailVerify = this.getSettingsVariable(this.config.EMAIL_RECOVERY);

    return this.issuer("info", {}, null, "GET").then((resp) => {
      issuerService = resp.issuer[0];
      return Promise.all(promises);
    }).then((balances) => {
      let result = [];

      Object.keys(currencies).forEach((key, index) => {
        key = (key == "BTC") ? "XBT" : key;
        let rate = parseFloat(rates[`${key}_${currency}`]);
        result.push({
          [key]: {
            amount: balances[index],
            exchange: parseFloat(balances[index]) * rate,
          }
        });
      });

      return result.sort((a, b) => {
        let k1 = Object.keys(a)[0];
        let k2 = Object.keys(b)[0];
        return b[k2].exchange - a[k1].exchange;
      });
    }).then((coinList) => {
      let result = [];
      coinList.forEach((v) => {
        if (amount == 0) {
          return;
        }

        let k = Object.keys(v)[0];
        let rate = parseFloat(rates[`${k}_${currency}`]);

        if (parseFloat(v[k].exchange) - amount > 0) {
          const needed = amount / rate;
          const fee = this.getVerificationFee(needed, issuerService, emailVerify);

          if (fee + needed < v[k].amount) {
            result.push({
              [k]: {
                exchange: amount,
                from: needed,
                fee,
              }
            });
            amount = 0;
            return;
          }
        }

        // We need all the coins
        let fee = this.getVerificationFee(v[k].amount, issuerService, emailVerify);
        let exchange = parseFloat(rates[`${k}_${currency}`]) * (v[k].amount - fee)
        result.push({
          [k]: {
            exchange,
            from: v[k].amount,
            fee,
          }
        });
        amount = amount - exchange;
      });

      return {
        swapList: result,
        issuerService,
        emailVerify,
      };
    });
  }

  /**
   * Returns an object with each key representing a currency with
   * its value the list of coins.
   */
  getAllStoredCoins(extend = true, asArray = false) {
    const {
      walletCurrencies,
    } = this.config;

    if (asArray) {
      extend = false;
    }

    let result = asArray ? [] : {};
    let total = 0;
    walletCurrencies.forEach((code) => {
      const coins = this.getStoredCoins(true, code);
      if (asArray) {
        result.push(...coins);
        return;
      }
      result[code] = coins;
      total += result[code].length;
    });

    if (extend) {
      result["total"] = total;
    }
    return result;
  }

  /**
   * Returns the balance of all currencies exchanged to the specified currency
   * If domains list is defined, Coins will only be considered if their domains
   * is in the list.
   */
  getBalanceAs(currency, domains, rates) {
    let total = 0;
    this.getAllStoredCoins(false, true).forEach((coin) => {
      coin = typeof coin == "string" ? this.Coin(coin) : coin;
      if (domains.indexOf(coin.d) == -1) {
        return;
      }

      let code = coin.c;
      code = (code == "BTC") ? "XBT" : code;
      currency = (currency == "BTC") ? "XBT" : currency;

      if (code == currency) {
        total += parseFloat(coin.v);
        return;
      }
      total += parseFloat(coin.v) * parseFloat(rates[`${code}_${currency}`]);
    });
    return total;
  }

  getAcceptableDomains(issuers) {
    // TO_DO
    const {
      acceptableIssuers,
    } = DEFAULT_SETTINGS;

    return issuers.map((issuer) => {
      if (issuer.startsWith("(") && issuer.endsWith(")")) {
        return issuer.slice(1, issuer.length - 1);
      }
      return issuer;
    }).filter((val) => {
      return acceptableIssuers.indexOf(val) > -1;
    });
  }

  exchangeValue(value, sourceCurrency, targetCurrency, rates) {
    if (sourceCurrency == targetCurrency) {
      return value;
    }
  }

  /**
   * Find and return the XBT balance of the wallet. This is computed from the sum
   * of values of all the coins held in storage.
   * @return The wallet's balance as a decimal number
   */
  getBalance(crypto = null) {
    if (this.config.debug) {
      console.log("WalletBF getBalance");
    }

    if (!crypto) {
      crypto = "XBT";
    }

    let balance = 0;
    let coins = this.getStoredCoins(true, crypto);
    Object.keys(coins).forEach(function(i) {
      balance += parseFloat(coins[i].v);  
    });
    return this._round(balance,8);
  }

  getTotalFiatBalance(xr) {
    let promises = [];
    let currencies = this.config[this.config.AVAILABLE_CURRENCIES];
    Object.keys(currencies).forEach((code) => {
      promises.push(this.Balance(code));
    });

    return Promise.all(promises).then((balances) => {
      let total = 0.0;
      let available = false;

      Object.keys(currencies).forEach((key, index) => {
        let value = xr.getFloat(balances[index], 10, key);
        available = available || xr.hasRate(key);
        total += parseFloat(value)
      });

      if (!available) {
        return null;
      }
      return total
    });
  }

  Balance(code = null) {
    if (!this.config || !this.config.storage) {
      return Promise.resolve(0);
    }

    const {
      COIN_STORE,
      CRYPTO,
      storage,
    } = this.config;

    if (code == null) {
      code = this.getPersistentVariable(CRYPTO, "XBT");
    }

    return storage.P_get(COIN_STORE, {}).then((coinStore) => {
      if (Object.keys(coinStore).indexOf(code) == -1) {
        return 0;
      }
      const list = coinStore[code];
      if (Array.isArray(list)) {
        return parseFloat(this.getSumCoins(list).toFixed(8));
      }
      return Promise.reject(Error("Coin store is not an array"));
    });
  }

  /**
   * @return Get the storage module version number or null if no storage module is installed.
   */
  getStorageMethodVersion() {
    if ("storage" in this.config) {
      if (this.config.storage != null) {
        return this.config.storage.version;      
      }
    }
    return null;
  }

  getIssuerInfo(name) {
    // if (this.config.debug) console.log("WalletBF getIssuerInfo("+name+")");
    try {
      return this.config.issuers[name];
    }
    catch(err) {
      return null;
    }
  }

  getDefaultIssuerInfo() {
    const {
      debug,
      DEFAULT_ISSUER,
      issuers,
    } = this.config;

    if (debug) {
      console.log("WalletBF getDefaultIssuerInfo()");
    }

    const def = DEFAULT_SETTINGS.defaultIssuer;

    try {
      return issuers[this.getSettingsVariable(DEFAULT_ISSUER, def)];
    }
    catch(err) {
      return null;
    }
  }

  getAllIssuerInfo() {
    if (this.config.debug) {
      console.log("WalletBF getAllIssuerInfo");
    }

    return this.config.issuers;
  }

  /**
   * return
   *   the response from the issuer 'exist' if deferred object included in the response
   *   if not, an integer with the number of coins deleted that doesn't exist
   */
  existCoins(inSession = true, storedCoins = null, crypto = null) {
    const {
      COIN_STORE,
      CRYPTO,
      storage,
    } = this.config;

    if (crypto == null) {
      crypto = this.getPersistentVariable(CRYPTO, "XBT");
    }

    storedCoins = storedCoins || this.getStoredCoins(false, crypto);
    if (storedCoins.length == 0) {
      return Promise.resolve(0);
    }

    const params = {
      issuerRequest: {
        fn: "exist",
        coin: storedCoins,
      }
    };
    let toRemove = [];

    return this.issuer("exist", params).then((response) => {
      if (response.deferInfo) {
        return response;
      }

      if (response.status !== "ok") {
        const msg = this.getResponseError(response) || "Error on check exist coins";
        return Promise.reject(Error(msg));
      }

      let existingCoins = response.coin;
      if (!existingCoins) {
        existingCoins = [];
      }

      let difference = storedCoins.length - existingCoins.length;
      if (difference <= 0) {
        return 0;
      }

      toRemove = storedCoins.filter(e => existingCoins.indexOf(e) < 0);
      if (inSession) {
        return storage.sessionStart('Remove non-existent coins').then(() => {
          return storage.removeAllCoins(COIN_STORE, toRemove, crypto);
        }).then(() => {
          return storage.sessionEnd();
        });
      }
      return storage.removeAllCoins(COIN_STORE, toRemove, crypto);
    }).then(() => {
      return toRemove.length;
    }).catch((err) => {
      const msg = err.message || this.getResponseError(err);
      return Promise.reject(Error(msg));
    });
  }

  getStoredCoins(unpack, crypto = null) {
    const {
      COIN_STORE,
    } = this.config;

    return this._getCoinList(COIN_STORE, unpack, crypto);
  }

  /**
   * Given a reference, attempt to recover all coins that were exported
   *   with that reference from COIN_RECOVERY.
   * If the reference string is empty, then all coins will be recovered.
   *
   * @param reference [String]
   *
   * @return A Promise that resolves to a Number with the value in XBT
   *   of all coins recovered.
   */
  recoverRecoveryCoins(reference) {
    const {
      CRYPTO,
    } = this.config;

    const crypto = this.getPersistentVariable(CRYPTO, "XBT")
    const args = {
      crypto,
      empty: true,
    };
    return this.recoverCoins(reference, this.getRecoveryCoins(crypto), args);
  }

  /**
   * Recover all coins that have been exported from this wallet.
   *
   * @return A list of Coin objects with an added 'reference' and 'date' field.
   */
  getRecoveryCoins(crypto = null) {
    const {
      COIN_RECOVERY,
      CRYPTO,
      debug,
      storage,
    } = this.config;

    crypto = crypto || this.getPersistentVariable(CRYPTO, "XBT");
    let result = storage.get(COIN_RECOVERY, {});
    if (debug) {
      console.log("WalletBF getRecoveryCoins", result);
    }

    return result[crypto] || new Array();
  }

  /**
  * Given a reference, attempt to recover all coins that were exported
  * with that reference from the array of coins provided.
  * If the reference string is empty, then all coins will be recovered.
  *
  * @param reference [String]
  * @param coins [Array]
  * @param args [Object] with key values:
  *   - empty [Boolean]: (def. false) if true remove the whole COIN_STORE.
  *   - crypto [string]: code of the cryptocurrency to recover.
  *   - callback [function]: function called at the end - should
  *     return a Promise.
  * 
  * @return A Promise resolving with the value of the recovered coins.
  */
  recoverCoins(reference, coins, args={ empty: false }) {
    const {
      COIN_RECOVERY,
      COIN_STORE,
      CRYPTO,
      DEFAULT_ISSUER,
      storage,
    } = this.config;

    const crypto = args.crypto || this.getPersistentVariable(CRYPTO, "XBT");
    let storedCoins = this.getStoredCoins(false, crypto);
    let selectedCoins = coins.filter(function(elt) {
      return (reference == "" ? true : elt.ref == reference)
        && storedCoins.indexOf(elt.base64) === -1;
    });
    if (selectedCoins.length == 0) {
      return Promise.resolve(0);
    }
    
    let faceValue = this._arraySum(selectedCoins, "value", 0, selectedCoins.length);
    let recovered = new Array();
    selectedCoins.forEach(function(elt) {
      recovered.push(elt.base64);
    });

    let existResponse;
    let result = 0;
     return storage.sessionStart("Recover coins").then(() => {
      const params = {
        issuerRequest: {
          fn: "exist",
          coin: recovered,
        }
      };
      return this.issuer("exist", params);
    }).then((response) => {
      existResponse = response;
      if (response.status !== "ok") {
        return Promise.reject(Error('Coins does not exist'));
      }
      return storage.addAllIfAbsent(COIN_STORE, response.coin, false, crypto);
    }).then(() => {
      if (args.empty) {
        // Empty the coin recovery array
        return storage.P_remove(COIN_RECOVERY, crypto); 
      }
      // Remove coins from recovery coin array
      let recoveryCoins = this.getRecoveryCoins(crypto).filter((coin) => {
        let found = coins.find((recoveredCoin) => {
          return recoveredCoin.base64 == coin.base64;
        });
        return found !== undefined;
      });
      return storage.set(COIN_RECOVERY, recoveryCoins, crypto);
    }).then(() => {
      const {
        actualValue,
        totalFee,
        newValue,
      } = existResponse.verifyInfo;

      const {
        domain,
      } = existResponse.headerInfo;

      result = actualValue;

      return this.recordTransaction({
        walletInfo: {
          faceValue,
          actualValue,
          newValue,
          totalFee,
          comment: reference || ""
        },
        headerInfo:{
          fn: "coin recovery",
          domain,
        },
        currency: crypto,
      });
    }).then(() => {
      if (args.callback) {
        return args.callback();
      }
      return true;
    }).then(() => {
      return storage.sessionEnd();
    }).then(() => {
      return result;
    }).catch((err) => {
      storage.sessionEnd();
      return Promise.reject(err);
    });
  }

  getHistoryList() {
    const {
      CRYPTO,
      debug,
      HISTORY,
      storage,
    } = this.config;

    const {
      transactions,
    } = DEFAULT_SETTINGS;

    const crypto = this.getPersistentVariable(CRYPTO, "XBT");
    let hist = storage.get(HISTORY, {});
    hist = hist[crypto] || [];

    if (!storage) {
      return transactions;
    }

    if (typeof hist === "object" && !hist instanceof Array) {
      return transactions;
    }

    // simple deep clone
    return JSON.parse(JSON.stringify(hist));
  }

  /**
   * Collect together one or more coins having the exact targetValue and cause a file export
   * dialog to be displayed. Coins will be removed from the coinStore and sent to the recovery
   * store in case the coins need to be recovered at a later date.
   * If the exact coin value cannot be achieved (possibly after splitting a coin), the user will be shown an alert with the reason.
   * An args.optional comment will be added to both the export file and the transaction history.
   * If args.encrypt is true or args.expandCoins is false or missing, Coins will be added to the export file in their base64 form,
   * otherwise they will be in a JSON format.
   * @param exportAmount   [string]    The amount to be exported.
   * @param args      [object]    (optional) Set of arguments that may modify the export
   * @element  filename  [string]    The proposed name of the export file. The value of the export and .json will be appended.
   * @element comment    [string]     A comment string to be added to the export file along with the coin(s).
   * @element expandCoins  [boolean]    If true coins will be exported in JSON format otherwise as a base64 encoded string.
   * @element encrypt    [boolean]    If true coins will be encrypted.
   * @element passphrase  [string]    A user specified password
   * @element expiryPeriod_ms  [integer]  The number of milliseconds before the transaction should expire. Defaults to the wallet's 'config.verifyExpire'.
   * If no element is provided the 'File Save' dialog will automatically be triggered.
   * @return A Promise that resolves to a JSON object with the contents of the export file OR an error.
   */
  exportFile(amount, args) {
    const {
      CRYPTO,
      debug,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF exportFile", amount, args);
    }

    const crypto = args.currency || this.getPersistentVariable(CRYPTO, "XBT");
    let target = parseFloat(amount);

    if (isNaN(target)) {
      return Promise.reject(Error("Export amount is not a number"));
    }

    if (target <= 0) {
      return Promise.reject(Error("Export amount must be positive"));
    }

    let callerArgs = Object.assign({
      passphrase: "",
      expandCoins: false,
      filename: `${crypto}${target.toFixed(8)}`,
    }, args);

    if (callerArgs.encrypt && callerArgs.passphrase.trim().length == 0) {
      return Promise.reject(Error("Password required for encryption"));
    }

    let now = new Date().toISOString();
    let auxCoins, coinObj, exportRef;


    const startTransaction = () => {
      return this.issuer("begin", {
        issuerRequest: {
          fn: "verify"
        }
      }, callerArgs);
    }


    const getCoins = (response) => {
      if (response.status == "defer") {
        return Promise.reject(Error("Issuer begin status response is deferred"));
      }

      let verifyArgs = {
        beginResponse: response,
        action: "export split"
      };

      if (callerArgs.expiryPeriod_ms) {
        verifyArgs.expiryPeriod_ms = callerArgs.expiryPeriod_ms
      }

      return this._getCoinsExactValue(target, verifyArgs, false, crypto);
    }


    const prepareCoins = (coins) => {
      auxCoins = coins;

      if (coins == null || coins.length == 0) {
        const msg = "Cannot create export file with the " +
          "requested value " + `${crypto}${target.toFixed(8)}`;
        return Promise.reject(Error(msg));
      }

      if (callerArgs.encrypt) {
        return this.encryptCoins(coins, callerArgs.passphrase);
      }

      let outCoins = {
        [crypto]: []
      };
      try {
        coins.forEach((elt) => {
          const isString = typeof elt == "string";
          if (callerArgs.expandCoins) {
            outCoins[crypto].push(isString ? this.Coin(elt) : this.Coin(elt.base64));
          } else {
            outCoins[crypto].push(isString ? elt : elt.base64);
          }
        });
        auxCoins = coins;
        return outCoins;
      }
      catch(err) {
        throw new Error("Coin has no base64 definition");
      }
    };


    const extractCoinsFromStore = (coin) => {
      coinObj = coin;
      exportRef = `Export ${callerArgs.filename} ${now}`;
      return this.extractCoins(auxCoins, exportRef, "wallet", crypto);
    };


    const recordTransaction = (coinsRemoved) => {
      return this.recordTransaction({
        headerInfo: {
          fn: `export ${auxCoins.length > 1 ? "file" : "coin file"}`,
          domain: "localhost",
        },
        exportInfo: {
          comment: callerArgs.comment,
          faceValue: target,
          actualValue: target,
          reference: exportRef,
          newValue: -target,
          fee: 0,
        },
        other: {
          file: {
            encrypt: callerArgs.encrypt,
            filename: `${callerArgs.filename}.json`,
            target,
          },
          recovery: coinsRemoved,
        },
        currency: crypto,
      });
    }


    const sessionEnd = () => {
      return storage.sessionEnd().then(() => {
        return {
          fileType: auxCoins.length > 1 ? "export" : "coin",
          reference: exportRef,
          value: target,
          date: now,
          comment: callerArgs.comment,
          coins: coinObj,
          callerArgs: callerArgs,
        };
      });
    };


    const handleError = (err) => {
      storage.sessionEnd();
      return Promise.reject(err);
    };


    return storage.sessionStart("Export split")
      .then(startTransaction)
      .then(getCoins)
      .then(prepareCoins)
      .then(extractCoinsFromStore)
      .then(recordTransaction)
      .then(sessionEnd)
      .catch(handleError);
  }

  _generateUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  getOutCoinCount() {
    // @param beginResponse ??
    let outCoinCount = 0;

    const {
      ISSUE_POLICY,
      SPREAD_COIN_COUNT,
    } = this.config;

    const spreadCoins = SPREAD_COIN_COUNT;
    switch (this.getSettingsVariable(ISSUE_POLICY)) {
      case 'spread':
        outCoinCount = spreadCoins;
        break;
      case 'repeated':
        outCoinCount = 25;
        break;
    }
    return outCoinCount;
  }

  processPayment(paymentDetails) {
    const {
      debug,
      DEFAULT_ISSUER,
      EMAIL,
      ISSUE_POLICY,
      VERIFY_EXPIRE,
      storage,
    } = this.config;

    if (debug) {
      console.log('WalletBF.processPayment', paymentDetails);
    }

    const defIssuer = DEFAULT_SETTINGS.defaultIssuer;
    const defPolicy = DEFAULT_SETTINGS.issuePolicy;
    let targetValue = parseFloat(paymentDetails.amount);

    if (Number.isNaN(targetValue)) {
      return Promise.reject(Error("Export amount is not a number"));
    }
    if (targetValue <= 0) {
      return Promise.reject(Error("Export amount must be positive"));
    }

    let tid, oldBalance;
    let faceValue = 0;
    let coinList;
    const itemId = this._generateUUID();

    const {
      currency,
    } = paymentDetails;

    return this.Balance(currency).then((balance) => {
      oldBalance = balance;

      const callerArgs = {
        comment: `payment for ${targetValue}`,
        passphrase: "",
        encrypt: false,
      };
      const params = {
        issuerRequest: {
          fn: "verify"
        }
      };

      return this.issuer("begin", params, callerArgs);
    }).then((response) => {
      tid = response.headerInfo.tid;

      const expiryEmail = this._fillEmailArray(0, true, currency);
      const policy = this.getSettingsVariable(ISSUE_POLICY, defPolicy);

      let verifyArgs = {
        beginResponse: response,
        action: "payment split",
        expiryPeriod_ms: this.getExpiryPeriod(VERIFY_EXPIRE),
        outCoinCount: this.getOutCoinCount(response, targetValue),
        policy,
        target: targetValue,
      };

      if (expiryEmail) {
        verifyArgs.expiryEmail = expiryEmail;
      }

      return this._getCoinsExactValue(targetValue, verifyArgs, false, currency);
    }).then((coins) => {
      const msgError = `Cannot pay the requested amount ${currency}${targetValue}`;
      if (!coins || !Array.isArray(coins) || coins.length == 0) {
        return Promise.reject(Error(msgError));
      }

      coinList = coins.map((c) => {
        faceValue += parseFloat(c.value);
        return c.base64;
      });

      let msg = `buy item for ${currency} ${targetValue}`;
      return this.extractCoins(coins, msg, "wallet", currency);
    }).then(() => {
      return storage.flush();
    }).then(() => {
      const params = {
        issuerRequest: {
          tid,
        }
      };
      const args = {
        domain: this.getSettingsVariable(DEFAULT_ISSUER, defIssuer),
      };

      return this.issuer("end", params, args);
    }).then(() => {
      return this.Balance(currency);
    }).then((newBalance) => {
      const {
        issuers,
        currency,
        memo,
        amount,
      } = paymentDetails;

      return this.recordTransaction({
        headerInfo: {
          fn: 'buy item',
          domain: issuers.join(', '),
        },
        paymentInfo: {
          actualValue: faceValue,
          faceValue: faceValue,
          newValue: newBalance - oldBalance,
          fee: 0,
        },
        coin: coinList,
        other: {
          target: amount,
          item: itemId,
        },
        currency,
      });
    }).then(() => {
      let payment = {
        id: itemId,
        coins: coinList,
        merchant_data: paymentDetails.merchant_data,
        client: "web",
        language_preference: "en_GB",
      };
      if (paymentDetails.includeEmail) {
        let email = this.getSettingsVariable(EMAIL);
        payment.receipt_to = { email };
        payment.refund_to = { email };
      }
      return payment;
    });
  }

  saveItem(item, currency=null) {
    const {
      DEFAULT_ISSUER,
      ITEM_STORE,
      storage,
    } = this.config;

    item.details = {
      domain: this.getSettingsVariable(DEFAULT_ISSUER),
      time: new Date().toISOString(),
    };
    return storage.addAllFirst(ITEM_STORE, [item], currency);
  }

  /**
   * This function handles the import of all types of files used by
   * a Bitcoin-fast wallet; namely funds export and backup files.
   * It is expected that this function will be attached to a file
   * input element and called as a result of a file being selected by
   * the user.
   * By default coins found within an 'export' file are destructively
   * verified whereas coins found within a 'backup' are only checked
   * for existance!
   * The default behavior can be overridden by setting forceVerify to
   * true or false.
   *
   * @param fileList [array] An array containing a single File object.
   * @param args [object] Set of arguments that may modify the export
   *   @element forceVerify [array] of objects containing
   *     "<file_type>: boolean" name value pair.
   *
   * If a file_type_name exists for a given file type, then the value
   * of the boolean overrides the default verification behavior for
   * that type.
   *
   * @return [array] of objects containing for each currency:
   *   @element coin [array] of String coins imported.
   *   @element crypto [string] code of the currency.
   *   @element fileInfo [object]
   *   @element fileObject [object]
   *   @element existResponse [object] response of the exist request.
   */
  importFile(fileList, args) {
    const {
      debug,
      COIN_SWAP,
      COIN_RECOVERY,
      DEPOSIT,
      HISTORY,
      ITEM_STORE,
      SETTINGS,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF importFile fileList=", fileList, args);
    }

    if (!fileList) {
      return Promise.reject(Error("No file found"));
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const allowedFiles = ["export", "coin", "backup", "refund"];

      reader.onload = (e) => {
        let importObject;
        try {
          importObject = JSON.parse(reader.result);
        } catch(e) {
          reject(e);
        }

        if (Object.keys(importObject).indexOf("atomicSwapRequest") != -1) {
          // Presence of the atomicSwap request
          let {
            swapInfo,
          } = importObject.atomicSwapRequest;

          let {
            source,
            target,
          } = swapInfo;

          swapInfo.source = target;
          swapInfo.target = source;

          return resolve(this.issuer("info", {}, null, "GET").then((resp) => {
            swapInfo.issuerService = resp.issuer[0];
            console.log(swapInfo);
            return swapInfo;
          }));
        }

        let verify = false;
        let actionType = 'import backup file';

        const {
          fileType,
        } = importObject;

        if (!fileType || allowedFiles.indexOf(fileType) == -1) {
          return reject(Error("Could not recognise the file type"));
        }

        if (fileType === "export" || fileType === "coin") {
          actionType = 'import coin file';
          if (!importObject.coins) {
            return reject(Error("No coins found in file"));
          }
          verify = true;
        }

        if (args.forceVerify && fileType in args.forceVerify) {
          verify = args.forceVerify[fileType];
        }

        const savePersistent = () => {
          if (importObject.persistent) {
            // recover various backup data
            const {
              deposit,
              walletSettings,
            } = importObject.persistent;

            if (deposit) {
              this.setPersistentVariable(DEPOSIT, deposit);
            }
            if (walletSettings) {
              this.setPersistentVariable(SETTINGS, walletSettings);
            }
          }
        };

        const saveItemStore = () => {
          const {
            itemStore,
          } = importObject;

          if (itemStore) {
            storage.set(ITEM_STORE, itemStore);
          }
        };

        const saveTransactions = () => {
          const {
            recoverCoins,
            transactions,
            swapCoins,
          } = importObject;

          if (transactions) {
            storage.set(HISTORY, transactions);
          }
          if (recoverCoins) {
            storage.set(COIN_RECOVERY, recoverCoins);
          }
          if (swapCoins) {
            storage.set(COIN_SWAP, swapCoins);
          }
        };

        let params = Object.assign({}, importObject);
        params.coinsInFile = {};

        let { coins } = importObject;
        let coinObj = Object.assign({}, coins);
        let result;

        if (coins.coins) {
          coinObj = coins.coins;
          delete coins.coins;
          Object.keys(coinObj).forEach((key) => {
            let lcoins = coinObj[key];
            coinObj[key] = {
              coins: lcoins,
            };
            coinObj[key] = Object.assign(coinObj[key], coins);
          });
        }

        storage.sessionStart(actionType).then(() => {
          let isEncrypted = false;
          Object.keys(coinObj).forEach((crypto) => {
            isEncrypted = isEncrypted || coinObj[crypto].encrypted;
          });

          if (!isEncrypted) {
            return null;
          }

          const passphrase = this._findPassphraseFromSession(params.coins);
          if (passphrase) {
            return passphrase;
          }

          if (!args.getPassPhrase) {
            throw new Error("Passphrase not available to decrypt the file");
            return;
          }
          return args.getPassPhrase();
        }).then((passphrase) => {

          let promises = [];
          let removedCoins = {};
          Object.keys(coinObj).forEach((crypto) => {

            let listCoins = coinObj[crypto];
            if (!listCoins) {
              return;
            }
            if (Array.isArray(listCoins) && listCoins.length == 0) {
              return;
            }
            if (typeof listCoins == "object" && Object.keys(listCoins).length == 0) {
              return;
            }

            if (listCoins.coins) {
              params.coins = listCoins.coins;
              params.coinsInFile[crypto] = listCoins.coins.length;
            } else {
              params.coins = listCoins;
              params.coinsInFile[crypto] = listCoins.length;
            }

            if (passphrase) {
              let getEncryptedCoins = (coins, passphrase, crypto) => {
                return this.decryptCoins(coins, passphrase).then((clist) => {
                  removedCoins[crypto] = params.coinsInFile[crypto] - clist.length;
                  return this._setImportCoinsInStore(clist, params, verify, actionType, crypto);
                }).then((result) => {
                  params.removedCoins = removedCoins[crypto];
                  return Object.assign(result, {
                    finalCoins: result.coin.length,
                    fileObject: Object.assign({}, params, {
                      coinsInFile: params.coinsInFile[crypto],
                    }),
                    fileInfo: fileList[0],
                  });
                });
              };
              promises.push(getEncryptedCoins(listCoins, passphrase, crypto));
              return;
            }

            try {
              // Convert any Coin objects to simple Strings
              let coins = listCoins;
              if (listCoins.coins) {
                coins = listCoins.coins;
              }
              coins.map(coin => coin.base64 || coin);
              params.removedCoins = 0;

              let setParams = [coins, params, verify, actionType, crypto];
              let promise = this._setImportCoinsInStore(...setParams);

              promises.push(promise.then((result) => {
                let coinsInFile = params.coinsInFile[result.crypto]
                let fileObject = Object.assign({}, params);
                fileObject.coinsInFile = coinsInFile;
                return Object.assign({
                  finalCoins: result.coin.length,
                  fileObject,
                  fileInfo: fileList[0],
                }, result);
              }));

              return;
            } catch (err) {
              console.log(err);
              promises.push(Promise.reject(Error("No base64 definition in Coin")));
              return;
            }
          });

          savePersistent();
          saveItemStore();
          saveTransactions();

          if (promises.length > 0) {
            return Promise.all(promises);
          }
          return [];
        }).then((response) => {
          result = response;
          return storage.sessionEnd();
        }).then(() => {
          return resolve(result);
        }).catch((err) => {
          console.log(err);
          storage.sessionEnd();
          return reject(err);
        });
      };
      reader.readAsText(fileList[0]);
    });
  }


  /**
   * @ action: string representing the action
   * @ importObject: represents JSON file object
   * @ response: requestResponse
   */
  createImportTransaction(action, response) {
    const {
      actualValue,
      faceValue,
      totalFee,
      verifiedValue,
    } = response;

    return {
      headerInfo: {
        fn: action,
        domain: this.getSettingsVariable(this.config.DEFAULT_ISSUER),
      },
      importInfo: {
        faceValue,
        actualValue,
        verifiedValue,
        fee: totalFee,
      },
    }
  }

  getImportFileInfo(importObject, crypto) {
    let fileValue = importObject.value;
    if (typeof fileValue === "object") {
      fileValue = fileValue[crypto];
    }
    return {
      fileType: importObject.fileType,
      fileComment: importObject.comment,
      fileDate: importObject.date,
      fileValue: parseFloat(fileValue).toFixed(8).toString(), 
    };
  }

  /**
   * returns @param [object] with keys:
   *   'coin': list of new coins set in store
   *   'importInfo': importInfo value of request
   *   'verifyFailed': if true, verification failed but coin in store
   */ 
  _setImportCoinsInStore(coinList, importObject, verify, action, crypto=null) {
    const {
      COIN_STORE,
      CRYPTO,
      debug,
      DEFAULT_ISSUER,
      ISSUE_POLICY,
      VERIFY_EXPIRE,
      storage,
    } = this.config;

    let coinsToAdd = new Array();
    let coinsToRemove = new Array();
    const params = {
      issuerRequest: {
        fn: "exist",
        coin: coinList.slice(0, 99),
        // exist can only handle up to 100 coins
      },
    };

    if (crypto == null) {
      crypto = this.getPersistentVariable(CRYPTO, "XBT");
    }

    const defIssuer = DEFAULT_SETTINGS.defaultIssuer;
    const args = {
      domain: this.getSettingsVariable(this.config.DEFAULT_ISSUER, defIssuer),
    };

    let existResp;
    return this.issuer("exist", params, args).then((response) => {
      existResp = response;
      if (existResp.status == "refer") {
        return Promise.reject(existResp);
      }

      if (!existResp.coin || existResp.coin.length == 0) {
        console.log("/exist indicated zero value for the coins sent");
        return [];
      } 

      return storage.addAllIfAbsent(COIN_STORE, existResp.coin, true, crypto);
    }).then((coins) => {
      const numCoins = coins.length;
      if (numCoins === 0) {
        return {
          coin: [],
          existResponse: existResp,
          crypto,
        };
      }

      if (verify) {
        const args = {
          target: "0",
          external: false, // Coin is internal. Already added in COIN_STORE
          newCoinList: [],
          action,
          originalFaceValue: importObject.value,
          comment: importObject.comment,
          policy: this.getSettingsVariable(ISSUE_POLICY),
          domain: this.getSettingsVariable(DEFAULT_ISSUER),
          expiryPeriod_ms: this.getExpiryPeriod(VERIFY_EXPIRE),
        };
        return this.verifyCoins(coins, args, false, crypto).then((resp) => {
          if (resp.status == "ok" && resp.verifyInfo) {
            let importInfo = resp.verifyInfo;
            importInfo.fee = importInfo.fee || importInfo.totalFee;
            return {
              coin: resp.coin,
              existResponse: existResp,
              importInfo,
              crypto,
            };
          } else if (resp.status == "coin value too small") {
            return {
              coin: coins,
              existResponse: existResp,
              importInfo: resp.verifyInfo,
              verifyFailed: true,
              crypto,
            };
          } else {
            const msg = this.getResponseError(resp) || "Problem on verify coins";
            return Promise.reject(Error(msg));
          }
        });
      }

      let txArgs = this.getImportFileInfo(importObject, crypto);
      txArgs.numCoins = numCoins;
      txArgs.crypto = crypto;

      let importInfo = this.createImportTransaction(action, existResp.verifyInfo);
      importInfo.currency = crypto;

      return this.recordTransaction(importInfo, txArgs).then(() => {
        return {
          coin: coins,
          existResponse: existResp,
          importInfo,
          currency: crypto,
        };
      });
    }).catch((err) => {
      if (debug) {
        console.log(err);
      }
      return Promise.reject(err);
    });
  }

  /**
   * Given a 'coins' object (typically from an export file), find the passphrase
   * that was stored along with the original transaction.
   * @param coinsObject [object] An object that may contain an id that will be used to locate a passphrase 
   * @returns The stored passphrase or null if no corresponding passphrase was found
   */
  _findPassphraseFromSession(coinsObject) {
    //if (this.config.debug) console.log("WalletBF _findPassphraseFromSession coinsObject=",coinsObject);
    let result = null;
    if (coinsObject != null && "id" in coinsObject) {
      let session = this.config.storage.get(this.config.SESSION);
      if (session != null) {
        Object.keys(session).forEach(function(key,index) {
          let transaction = session[key];
          if (transaction != null && "recovery" in transaction && "expiryEmail" in transaction.recovery) {
            if (transaction.recovery.expiryEmail[2] == coinsObject.id) {
              result = transaction.recovery.expiryEmail[1];
              return;
            }
          }
        });
      }
    }
    if (result == null) {
      return this._findPassphrase(coinsObject);
    }
    return result;
  }

  /**
   * Given a 'coins' object (typically from an export file), find the passphrase
   * in the passphrase list.
   *
   * @param coinsObject [object] An object that may contain an id that will be
   *   used to locate a passphrase. 
   *
   * @returns [string] The stored passphrase or null if no corresponding
   *   passphrase was found.
   */
  _findPassphrase(coinsObject) {
    const {
      debug,
      PASSPHRASE_LIST,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF _findPassphrase coinsObject=",coinsObject);
    }

    if (!coinsObject || !("id" in coinsObject)) {
      return null;
    }

    let passphraseList = storage.get(PASSPHRASE_LIST);
    if (passphraseList != null && coinsObject.id in passphraseList) {
      if ("passphrase" in passphraseList[coinsObject.id]) {
        return passphraseList[coinsObject.id].passphrase;
      }
    }
    return null;
  }

  /**
   * Backup the contents of this Wallet to a file.
   *
   * @param args  [object] (optional) Set of arguments that may modify the
   * backup process.
   *
   *   @element filename [string] The proposed name of the export file. The
   *     value of the export and .json will be appended.
   *   @element comment [string] A comment string to be exported along with
   *     the coin(s) and transaction history.
   *   @element config [object] A JSON object containing wallet configuration
   *     data.
   *   @element expandCoins [boolean] If true, coins will be output in a human
   *     readable form. Defaults to false.
   *   @element encrypt [boolean] If true coins will be encrypted.
   *   @element autoPassword [boolean] If true the password will be invented.
   *   @element passphrase [string] A user specified password.
   *   @element saveHistory [boolean] true if wanted to save the backup in
   *     history
   *
   * @param inSession [boolean] open and close a storage session while creating
   *   the backup file.
   *
   * @return A Promise that resolves to JSON object containing the Backup file
   *   contents ('backup' key) and the file info ('fileInfo' key)
   */
  backupToFile(args, inSession = true) {
    const {
      debug,
      AVAILABLE_CURRENCIES,
      COIN_SWAP,
      ITEM_STORE,
      PASSPHRASE_LIST,
      PERSISTENT,
      storage,
      version,
    } = this.config;

    if (debug) {
      console.log("WalletBF.backupToFile", args);
    }

    let now = new Date().toISOString();
    let localArgs = $.extend({
      filename: "Wallet_backup_XBT"
    }, args);

    // JSON object will be stringify in order to get the file
    let result = {
      fileInfo: localArgs,
      backup: {
        version,
        fileType: "backup",
        date: now,
        value: {},
        comment: localArgs.comment,
        browser: this._browserIs(),
        storageMethod: storage.name,
        persistent: storage.get(PERSISTENT),
        passphraseList: storage.get(PASSPHRASE_LIST),
        coins: {},
        itemStore: storage.get(ITEM_STORE),
        swapCoins: storage.get(COIN_SWAP),
      },
    };

    if (args.saveHistory) {
      result.backup.transaction = this.getHistoryList();
      result.backup.recoverCoins = this.getRecoveryCoins();
    }

    const currencyList = this.config[AVAILABLE_CURRENCIES];
    let promises = [];

    Object.keys(currencyList).forEach((code) => {
      let promiseGetCoins = this.Balance(code).then((balance) => {
        result.backup.value[code] = balance.toFixed(8);
        let coins = this.getStoredCoins(false, code);
        let resultCoins = {};

        if (coins.length == 0) {
          resultCoins[code] = localArgs.encrypt ? {} : [];
          return resultCoins;
        }

        if (localArgs.encrypt) {
          return this.encryptCoins(coins, localArgs.passphrase);
        }

        try {
          resultCoins[code] = coins.map((coin) => {
            let str = typeof coin == "string" ? coin : coin.base64;
            if (localArgs.expandCoins) {
              return this.Coin(str);
            }
            return str;
          });
          return resultCoins;
        } catch (err) {
          return Promise.reject(Error("Coin has no base64 definition"));
        }
      });
      promises.push(promiseGetCoins);
    });

    if (inSession) {
      return storage.sessionStart("Backup").then(() => {
        return Promise.all(promises);
      }).then((coinsArray) => {

        const allCoins = Object.assign({}, ...coinsArray);
        result.backup.coins = allCoins;

        /*
        return this.recordTransaction({
          headerInfo: {
            fn: "backup",
            domain: "localhost",
          },
          exportInfo: {
            comment: localArgs.comment,
            faceValue: localArgs.balance,
            actualValue: localArgs.balance,
            fee: 0,
            newValue: 0,
          },
          coin: allCoins,
          other: {
            file: {
              encrypt: localArgs.encrypt,
              filename: `${localArgs.filename}${localArgs.balance}.json`,
              targetValue: parseFloat(localArgs.balance).toFixed(8),
            },
          },
        });
      }).then((history) => {
        if (debug) {
          console.log("after transaction stored", history);
        }*/

        return storage.sessionEnd();
      }).then(() => {
        return result;
      }).catch((err) => {
        return storage.sessionEnd().then(() => {
          return Promise.reject(err);
        });
      });
    } else {
      return Promise.all(promises).then((coinsArray) => {
        result.backup.coins = Object.assign({}, ...coinsArray);
        return result;
      });
    }
  }

  // cancel true when something wrong happened
  // switching the persistence
  recordMoveOutCoins(coin, actualValue, cancelled=false, crypto = "XBT") {
    // save in class the faceValue that will be used
    // to record transaction when recordMoveInCoins called. 
    if (!this.faceValueMoveCoins) {
      this.faceValueMoveCoins = {};
    }
    this.faceValueMoveCoins[crypto] = this.getSumCoins(coin).toFixed(8);
    let history = {
      walletInfo: {
        faceValue: this.faceValueMoveCoins[crypto],
        actualValue: parseFloat(actualValue).toFixed(8),
        newValue: parseFloat(cancelled ? actualValue : -actualValue).toFixed(8),
        fee: 0,
      },
      headerInfo:{
        fn: cancelled ? "cancel move storage location" : "move storage location",
        domain: "localhost",
      },
      other: {
        receive: cancelled,
        cancelled,
      },
      coin,
      currency: crypto,
    };
    return this.recordTransaction(history);
  }

  recordMoveInCoins(coin, actualValue, crypto = "XBT") {
    /*
     * face value should reflect the apparent sum value
     * of all the coins. The actualValue is the sum value
     * of coins that were checked.
     * NewValue is the increase in the balance.
     * */
    actualValue = parseFloat(actualValue).toFixed(8);
    let history = {
      walletInfo: {
        faceValue: this.faceValueMoveCoins[crypto],
        actualValue,
        newValue: actualValue,
        fee: 0,
      },
      headerInfo:{
        fn: "move storage location",
        domain: "localhost",
      },
      other: {
        receive: true,
      },
      coin,
      currency: crypto,
    };
    return this.recordTransaction(history);
  }



  /**
   * @return the null or the modified transaction.
   */
  modifyHistoryItem(transactionId, transaction, currency) {
    const {
      debug,
      HISTORY,
      storage,
    } = this.config;

    const defaultList = {
      [currency]: []
    };

    let result = null;

    let historyList = storage.get(HISTORY, defaultList);
    historyList = historyList[currency];

    historyList = historyList.map((histTx) => {

      if (histTx.id == transactionId) {
        if (debug) {
          console.log("WalletBF - replacing from to ", histTx, transaction)
        }

        Object.keys(transaction).forEach((k) => {
          histTx[k] = transaction[k];
        });
        result = histTx;
        return histTx;
      }

      return histTx;
    });

    storage.set(HISTORY, historyList, currency);
    return result;
  }


  /**
   * @return the null or the transaction if it was correctly replaced.
   */
  replaceHistoryItem(transactionId, transaction, currency) {
    const {
      debug,
      HISTORY,
      storage,
    } = this.config;

    const defaultList = {
      [currency]: []
    };

    let result = null;

    let historyList = storage.get(HISTORY, defaultList);
    historyList = historyList[currency];

    historyList = historyList.map((histTx) => {
      if (histTx.id == transactionId) {
        if (debug) {
          console.log("WalletBF - replacing from to ", histTx, transaction)
        }
        result = transaction;
        return transaction;
      }
      return histTx;
    });

    storage.set(HISTORY, historyList, currency);
    return result;
  }


  recordTransaction(response, args) {
    const {
      CRYPTO,
      debug,
      HISTORY,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF - recordTransaction", response);
    }

    let {
      currency,
    } = response;

    delete response.currency;
    currency = currency || this.getPersistentVariable(CRYPTO, "XBT");

    let result = null;
    const appendNewTransaction = (balance) => {
      result = new Transaction(response, balance, args);
      return storage.addFirst(HISTORY, result.get(), currency);
    };

    return this.Balance(currency)
      .then(appendNewTransaction)
      .then(() => result.get());
  }

  /**
   * Extract the specified coin from the coinStore.
   */
  extractCoin(coin, message, other = {}, crypto = null) {
    const {
      debug,
      COIN_STORE,
      CRYPTO,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF.extractCoin", coin);
    }

    crypto = crypto || this.getPersistentVariable(CRYPTO, "XBT");
    return storage.sessionStart(message).then(() => {
      return this.extractCoins([coin], message, 'user');
    }).then((coinRemoved) => {
      Object.assign(other, {
        recovery: coinRemoved,
      });
      return this.recordTransaction({
        headerInfo: {
          fn: "export coin",
          domain: "localhost",
        },
        exportInfo: {
          faceValue: coin.value,
          actualValue: coin.value,
          fee: 0,
          newValue: -coin.value,
        },
        coin: [coin],
        other,
        currency: crypto,
      });
    }).then(() => {
      return storage.sessionEnd();
    }).catch((err) => {
      return storage.addAllIfAbsent(COIN_STORE, [coin], false, crypto).then(() => {
        return storage.sessionEnd();
      }).then(() => {
        return Promise.reject(err);
      });
    });
  }

  importCoin(coin, comment, domain, crypto = null) {
    const {
      debug,
      COIN_STORE,
      CRYPTO,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF.importCoin", coin);
    }

    let params = {
      issuerRequest: {
        fn: "exist",
        coin: [ coin ]
      }
    };

    if (!crypto) {
      const newCoin = this.Coin(coin);
      if (!newCoin) {
        return Promise.reject("This is not a coin");
      }
      crypto = newCoin.c;
    }

    let verifyResponse;
    return this.issuer("exist", params, { domain }).then((resp) => {
      if (!resp.coin || resp.coin.length == 0) {
        throw new Error("Coin has no value");
      }
      verifyResponse = resp;
      return storage.sessionStart("import coin");
    }).then(() => {
      return storage.addAllIfAbsent(COIN_STORE, verifyResponse.coin, false, crypto);
    }).then((coinsAdded) => {
      if (verifyResponse.headerInfo) {
        verifyResponse.headerInfo.fn = "import coin";
      }
      verifyResponse.other = {
        fromString: true,
        verified: false,
      };
      verifyResponse.currency = crypto;
      return this.recordTransaction(verifyResponse);
    }).then(() => {
      return storage.sessionEnd();
    }).then(() => {
      return verifyResponse;
    }).catch((err) => {
      if (verifyResponse) {
        return storage.sessionEnd().then(() => Promise.reject(err));
      }
      return Promise.reject(err);
    });
  }

  /**
   * Extract the specified coins from the coinStore.
   * All extracted coins are archived in the Coin recovery list with a 'reference' as a fail-safe against coin loss.
   * @param coinsToRemove A list of Coin objects to be extracted from the coinStore and placed in recovery.
   * @param reference A reference string to tie together the recovery coins and a wallet event. 
   * @param actor (optional) Who caused the coins to be archived. Valid options are ['wallet','user']. Defaults to 'wallet'
   * @return true if all the coins were extracted, otherwise false.
   * NOTE: Either ALL or NONE of the coins will be extracted.
   */
  extractCoins(coinsToRemove, reference, actor, crypto = null) {
    const {
      COIN_RECOVERY,
      COIN_STORE,
      CRYPTO,
      debug,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF.extractCoins", coinsToRemove);
    }

    if (crypto == null) {
      crypto = this.getPersistentVariable(CRYPTO, "XBT");
    }

    let existingCoins = this.getStoredCoins(true, crypto);
    let removeCoins = coinsToRemove.slice();

    if (debug) {
      console.log("removeCoins", removeCoins);
      console.log("existingCoins", existingCoins);
    }

    let newCoins = new Array();
    actor = typeof(actor) === "string" ? actor : "wallet";

    // Copy every coin that is NOT in the coinsToRemove list
    existingCoins.forEach((a) =>  {
      let el = removeCoins.find((b, index, array) => {
        if (typeof b === "object") {
          return a.base64 === b.base64;
        }
        if (typeof b === "string" && a.base64 === b) {
          array[index] = this.Coin(b);
          return true;
        }
        return false;
      });
      if (typeof el === "undefined") {
        // The archive only needs raw base64 encoded coins
        newCoins.push(a.base64);
      }
    });

    if (debug) {
      console.log("newCoins", newCoins);
    }

    if ((newCoins.length + removeCoins.length) === existingCoins.length) {
      const now = new Date().toISOString();

      removeCoins = removeCoins.map((value) => {
        value.ref = reference;
        value.date = now;
        value.actor = actor;
        return value;
      });

      return storage.addAllFirst(COIN_RECOVERY, removeCoins, crypto).then(() => {
        let actual = storage.get(COIN_STORE, {});
        actual[crypto] = newCoins;
        return storage.set(COIN_STORE, actual);
      }).then(() => {
        return removeCoins;
      });
    } else {
      return Promise.reject(Error("Some coins missed while extracting coins"));
    }
  }

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
   *
   * @param refreshBalance [function] (optional) A function to be called
   *   when refresh wallet currency is needed. It must be called as:
   *       - refreshBalance(CURRENCY_CODE)
   */
  transferBitcoin(uri, speed, args) {
    if (this.config.debug) {
      console.log("WalletBF.transferBitcoin");
    }

    let {
      confirmation,
      success,
      deferredSuccess,
      refreshBalance,
    } = args;

    confirmation = confirmation || function (_x, _y, fn) { fn(); };

    let payment = this._parseBitcoinURI(uri);

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

      const recommendedFees = this.getBlockchainCurrencyInfo(beginResponse, "XBT");

      const bitcoinFee = parseFloat(recommendedFees[speed] || "0.0");
      let minValue = parseFloat(recommendedFees.minRedemptionValue || "0.0");
      let paymentAmount = parseFloat(amount);
      if (paymentAmount <= 0) {
        throw new Error("Amount must be positive");
        return;
      } else if (paymentAmount <= minValue) {
        throw new Error("Transfer amount too small for this blockchain");
        return;
      }

      let txAmount = this._round(paymentAmount + bitcoinFee, 8);
      if (txAmount > balance) {
        throw new Error("Insufficient funds to pay this blockchain fees");
        return;
      }

      let args = {
        singleCoin: false, //false so as to minimise the fee element
        beginResponse: beginResponse,
        target: amount,
        speed: speed,
        comment: comment,
        currency: "XBT",
        action: `send XBT${amount}`,
        uri: uri,
        address: address,
      };

      let coinList = this.getStoredCoins(false, "XBT");
      let selection = this._coinSelection(txAmount, coinList, args);
      if (this.config.debug) {
        console.log('args for WalletBF._coinSelection', args);
        console.log('list for WalletBF._coinSelection', selection);
      }

      if (!selection.targetValue || Number.isNaN(selection.targetValue)) {
        throw new Error("Amount is not a number");
        return;
      }

      // _coinSelection will select coins expecting to pay a fee.
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

        let change = this._round(selection.faceValue - txAmount, 8);
        while(allCoins.length > 1) {
          if ((change < allCoins[0].value)) {
            break;
          }
          // remove extra coin
          change -= allCoins.shift().value;
        }

        args.inCoinCount = allCoins.length;
        args.outCoinCount = 1;

        return new Promise((resolve, reject) => {
          confirmation(parseFloat(amount), bitcoinFee, () => {
            args.firstTimeCalled = true;
            const params = [allCoins, address, args, "XBT", {
              deferredSuccess,
              refreshBalance,
              success,
            }];
            this.redeemCoins(...params).then(resolve).catch(reject);
          });
        });
      } else {
        return Promise.reject(Error("Insufficient funds"));
      }
    });
  }

  getBitcoinExpressFee(amount, crypto) {

    const {
      debug,
      ISSUE_POLICY,
      VERIFY_EXPIRE,
    } = this.config;

    const params = {
      issuerRequest: {
        fn: "verify"
      }
    };

    const defPolicy = DEFAULT_SETTINGS.issuePolicy;

    // Split required
    return this.issuer("begin", params).then((beginResponse) => {
      const expiryEmail = this._fillEmailArray(0, true, crypto);

      let args = {
        beginResponse,
        expiryPeriod_ms: this.getExpiryPeriod(VERIFY_EXPIRE),
        outCoinCount: this.getOutCoinCount(beginResponse),
        policy: this.getSettingsVariable(ISSUE_POLICY, defPolicy),
        target: amount,
        currency: crypto,
      };

      if (expiryEmail) {
        args.expiryEmail = expiryEmail;
      }

      let splitList = this._getCoinsToSplit(amount, new Array(), args, crypto);
      if (debug) {
        console.log('args for WalletBF._getCoinsToSplit', args);
        console.log('list for WalletBF._getCoinsToSplit', splitList);
      }

      if (!splitList) {
        return Promise.reject(Error("Target couldn't be reached"))
      }

      if (splitList.length != 0) {
        const mockCoin = {
          value: this._arraySum(splitList, "value", 0, splitList.length),
        };
        return this._getVerificationFee(mockCoin, args).totalFee;
      }
      return 0;
    });
  }

  _fillEmailArray(target = 0, persistent = true, crypto = "XBT") {
    const {
      EMAIL,
      EMAIL_RECOVERY,
      MIN_TRANSACTION_VALUE,
      EMAIL_ENCRYPT,
      ENCRYPT_TYPE,
      PASSWORD_ENCRYPT,
      PASSPHRASE_LIST,
      storage,
    } = this.config;

    let email = [this.getSettingsVariable(EMAIL)];
    const emailRecovery = this.getSettingsVariable(EMAIL_RECOVERY);

    const minTxObject = this.getSettingsVariable(MIN_TRANSACTION_VALUE);
    if (!minTxObject || !minTxObject[crypto]) {
      return null;
    }
    const minTransaction = parseFloat(minTxObject[crypto]);

    if (!emailRecovery || target < minTransaction || !email) {
      return null;
    }
    
    const emailEncrypt = this.getSettingsVariable(EMAIL_ENCRYPT);
    const encryptType = this.getSettingsVariable(ENCRYPT_TYPE);
    if (emailEncrypt && encryptType == 1) {
      // manual
      email[1] = this.getSettingsVariable(PASSWORD_ENCRYPT);
      email[2] = this._Uint8ArrayToBase64();
    } else if (emailEncrypt) {
      // auto
      email[1] = this._Uint8ArrayToBase64();
      email[2] = this._Uint8ArrayToBase64();

      if (persistent) {
        let rec = {
          passphrase: email[1],
          timestamp: Date.now()
        };
        // store the passphrase and timestamp against the reference
        storage.setTo(PASSPHRASE_LIST, email[2], rec);
      }
    }

    return email;
  }

  /**
   * Check returns the expiry period time.
   *
   * @param type [string] Type of the expiry time to retrieve.
   * @param isDate [boolean] If true, return it as a date adding now time.
   *    Otherwise, return the milliseconds to expire.
   *
   * @return [float] sum of the coins values
   */
  getExpiryPeriod(type, isDate=false) {
    let expiryPeriod = this.getSettingsVariable(type, DEFAULT_SETTINGS[type]);
    expiryPeriod = parseFloat(expiryPeriod) * (1000 * 60 * 60);

    return isDate ? (new Date()).getTime() + expiryPeriod : expiryPeriod;
  }

  /**
   * Check with an Issuer if new funds have arrived and if so persist the new coins.
   * Once the new coins have been safely stored away, remove the deposit reference and close the transaction.
   * This is the second part of a three part process to be followed by _issueCollect_inner.
   * The second part will marshal the parameters and persist the call for later recovery - if needed.
   * @param args [map] Optional Arguments:
   * @element beginResponse [map] The response from the first stage of the process.
   * @element target   The target value of if a specific coin value is desired.
   * @element policy   The desired coin issuing policy for the Issuer to follow when issuing change. If not supplied, the wallet's default policy will be requested.
   */
  issueCollect(args) {
    const {
      debug,
      ISSUE_EXPIRE,
      ISSUE_POLICY,
      SESSION,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF.issueCollect", args);
    }

    if (!storage) {
      const err = Error("Persistent storage has not been installed");
      return Promise.reject(err);
    }

    if (args.beginResponse === null) {
      const err = Error("Couldn't find a reference to collect issued coins");
      return Promise.reject(err);
    }

    const prepareRequestAndStartSession = (beginResponse) => {
      const expiryPeriod_ms = this.getExpiryPeriod(ISSUE_EXPIRE, true);
      const policy = this.getSettingsVariable(ISSUE_POLICY);

      args = Object.assign({
        action: "issue",
        beginResponse,
        expiryPeriod_ms,
        newCoinList: [],
        policy,
      }, args);

      tid = args.beginResponse.headerInfo.tid;
      issueRequest = {
        issuerRequest: {
          fn: args.action,
          tid: tid,
          targetValue: args.target,
          expiry: (new Date(args.expiryPeriod_ms)).toISOString(),
          // issuePolicy: args.policy,
          currency: "XBT",
          blockchainAddress: args.beginResponse.issueInfo.blockchainAddress,
        },
        recovery: {
          // will be persisted but removed before sending to server
          fn: args.action,
          domain: args.beginResponse.headerInfo.domain
        }
      };
      return storage.sessionStart("Issue collect");
    };

    const saveResponseAndCloseSession = (response) => {
      issueResponse = response;
      return storage.sessionEnd();
    };

    const handleError = (err) => {
      if (debug) {
        print(err);
      }
      return storage.sessionEnd()
        .then(() => Promise.reject(err));
    };


    let tid, issueRequest, issueResponse = null;

    return this.getDepositRef()
      .then(prepareRequestAndStartSession)
      .then(() => storage.setToPromise(SESSION, tid, issueRequest))
      .then(() => storage.flush())
      .then(() => this._issueCollect_inner_(issueRequest, args))
      .then(saveResponseAndCloseSession)
      .then(() => issueResponse)
      .catch(handleError);
  }

  /**
   * Check with an Issuer if new funds have arrived and if so persist the new coins.
   * Once the new coins have been safely stored away, remove the deposit reference and close the transaction.
   * This is the second part of a two part function normally preceded by issueCollect.
   * The second part calls the Issuer, stores the collected coins and records the event in the history.
   * @param request  [map]    The request parameters to be sent to the Issuer.
   * @param args    [map]    Optional arguments
   * @element failure  The function to be called if anything goes wrong.
   * @element target   The target value if a specific coin value is desired.
   * @element policy   The desired coin issuing policy for the Issuer to follow when issuing change.
   *    If not supplied, the wallet's default policy will be requested.
   */
  _issueCollect_inner_(request, args) {
    if (this.config.debug) {
      console.log("WalletBF._issueCollect_inner_", args);
    }

    // Clone the request in case of deferral
    let req = JSON.parse(JSON.stringify(request));
    delete request.recovery;

    // Collect coins function from deposit reference
    const collect = () => {
      const {
        debug,
        SESSION,
        storage,
      } = this.config;

      let resp = null;
      let tid;

      return this.issuer("issue", request, args).then((issueResponse) => {
        resp = issueResponse;
        if (resp.deferInfo) {
          // Add the deferInfo to the recovery
          const ms = 10 * 60 * 1000;
          let timer = this._restartDeferral(collect, resp, req, ms);
          // clearTimeout(timer);
          throw new Error(resp.deferInfo.reason || "Collect deferred");
          return;
        }

        if (resp.status == "bad request") {
          let msg = resp.error ? resp.error[0].message : "Bad request";
          throw new Error(msg);
          return;
        }

        if (resp.coin && resp.coin.length > 0) {
          // We use ifAbsent in case this is triggered
          // by a recovery and the coins have actually
          // been received already.
          if (debug) {
            console.log("WalletBF._issueCollect_inner_", resp.coin);
          }
          return this.includeCoinsInStore(resp.coin);
        } else if (debug) {
          // WHAT TO DO?
          console.log("WalletBF._issueCollect_inner_ No coins returned!");
        }
        return 0;
      }).then((numCoins) => {
        if (debug && numCoins == 0) {
          console.log("Collected zero coins");
          return 0;
        }
        resp.other = args.other || {};
        resp.currency = this._getCryptoFromArray(resp.coin);
        return this.recordTransaction(resp);
      }).then(() => {
        return this.removeDepositRef(resp.coin, false);
      }).then(() => {
        // Now that the new coins have been persisted,
        // we can end the transaction
        tid = resp.headerInfo.tid;
        return storage.removeFrom(SESSION, tid);
      }).then(() => {
        const context = {
          issuerRequest: {
            tid,
          }
        };
        return this.issuer("end", context, { domain: args.domain });
      }).then(() => {
        return resp;
      }).catch((err) => {
        if (debug) {
          console.log("Error on collect coins:", err.message || "");
        }
        return Promise.reject(err);
      });
    };

    return collect();
  }

  includeCoinsInStore(coins) {
    const {
      COIN_STORE,
      debug,
      storage,
    } = this.config;

    const crypto = this._getCryptoFromArray(coins) || "XBT";
    if (debug) {
      console.log("WalletBF.includeCoinsInStore", crypto, coins.length);
    }

    let argsCall = [COIN_STORE, coins, false, crypto];
    return storage.addAllIfAbsent(...argsCall);
  }

  _getCryptoFromArray(coins) {
    if (typeof(coins[0]) === "string") {
      return this.Coin(coins[0]).c || "XBT";
    }
    return coins[0].c || "XBT";
  }

  /**
   * Sum and return the total coins values from the list
   * @param coins [Array] list of ooins
   * @return [float] sum of the coins values
   */
  getSumCoins(coins) {
    let sumCoins = 0;
    coins.forEach((elt) => {
      if (typeof elt === "string") {
        sumCoins += this.Coin(elt).value || 0;
      } else {
        sumCoins += elt.value || 0;
      }
    });
    return sumCoins;
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
  redeemCoins(coins, address, args, crypto=null, params={}) {

    if (this.config.debug) {
      console.log("WalletBF.redeemCoins",coins,address,args, params);
    }

    const dummyFn = resp => Promise.resolve(true);
    let refreshBalance = params.refreshBalance || dummyFn;
    args.success = params.success || dummyFn;
    args.deferredSuccess = params.deferredSuccess || dummyFn;

    const {
      blockchainSpeed,
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
      speed: blockchainSpeed,
      expiryPeriod_ms: this.getExpiryPeriod(REDEEM_EXPIRE),
      policy: this.getSettingsVariable(ISSUE_POLICY),
    };

    args = $.extend({}, defaults, args);

    if (typeof(address) !== 'string') {
      if (debug) {
        console.log("WalletBF.redeemCoins - Bitcoin address was not a String");
      }
      return Promise.reject(Error("Bitcoin address was not a String"));
    }

    if (!Array.isArray(coins) || coins.length==0) {
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

    if (!crypto) {
      crypto = this.getPersistentVariable(CRYPTO, "XBT");
    }

    let expiryEmail = this._fillEmailArray(sumCoins, true, crypto);
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
      const redeemExp = this.getExpiryPeriod(REDEEM_EXPIRE, true);
      const newExpiry = isNaN(args.expiryPeriod) ? redeemExp : args.expiryPeriod;

      let redeemRequest = {
        issuerRequest: {
          tid: tid,
          expiry: new Date(newExpiry).toISOString(),
          fn: "redeem",
          blockchainAddress: address,
          coin: base64Coins,
          issuePolicy: args.policy || DEFAULT_SETTINGS.issuePolicy,
          blockchainSpeed: args.speed,
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

      // If expiryEmail is defined and the fee is less than the sum of coins,
      // add it to the request 
      if (Array.isArray(args.expiryEmail) && args.expiryEmail.length > 0) {

        let issuer = args.beginResponse.issuer.find((elt) =>  {
          return elt.relationship == "home";
        });
        let feeExpiryEmail = issuer ? Number.parseFloat(issuer.feeExpiryEmail || "0") : 0;
        let bitcoinFees = this.getBlockchainCurrencyInfo(issuer, crypto);
        let change = (sumCoins - args.target - parseFloat(bitcoinFees[args.speed]));
        if (change > feeExpiryEmail) {
          redeemRequest.issuerRequest.expiryEmail = args.expiryEmail;
          redeemRequest.recovery.expiryEmail = args.expiryEmail;
        }
      }

      const refreshWalletBalance = (removedCoins) => {
        if (debug) {
          console.log(`Removed ${removedCoins.length} coins on redeem`);
        }
        return refreshBalance(crypto);
      }

      const redeemIssuerCoins = (balance) => {
        if (debug) {
          console.log(`New balance ${crypto}${balance}.`);
        }
        return this._redeemCoins_inner_(redeemRequest, args, crypto);
      }

      const saveResponseAndRefreshBalance = (response) => {
        redeemResponse = response;
        return refreshBalance(crypto);
      };

      const handleError = (err) => {
        if (debug) {
          console.log(err);
          console.log("WalletBF.redeemCoins - Adding coins back to store");
        }

        // Coins are lost, and no longer available so no need to put them
        // back in the store.
        if (err.message == "Redeem deferred") {
          return storage.sessionEnd()
            .then(() => Promise.reject(err));
        }

        const storeCoinsIfRequired = (resp) => {
          if (!resp.coin || resp.coin.length == 0) {
            return 0;
          }

          let numCoins = 0;
          const storeNumCoins = (resp) => {
            numCoins = resp;
            return refreshBalance(crypto);
          }

          return this.includeCoinsInStore(resp.coin)
            .then(storeNumCoins)
            .then(() => numCoins);
        }

        const handleRecoverError = (err) => {
          if (debug) {
            console.log(err);
          }
          storage.sessionEnd();
          return Promise.reject(err);
        }

        const existParams = {
          issuerRequest: {
            fn: "exist",
            coin: base64Coins
          }
        };

        const params = {
          domain: beginResponse.headerInfo.domain,
        };

        return this.issuer("exist", existParams, params)
          .then(storeCoinsIfRequired)
          .then(() => storage.sessionEnd())
          .then(() => Promise.reject(err))
          .catch(handleRecoverError);
      };

      let redeemResponse;
      return storage.sessionStart("Redeem coins")
        .then(() => storage.setToPromise(SESSION, tid, redeemRequest))
        .then(() => storage.flush())
        .then(() => this.extractCoins(base64Coins, tid, "localhost", "XBT"))
        .then(refreshWalletBalance)
        .then(redeemIssuerCoins)
        .then(saveResponseAndRefreshBalance)
        .then(() => storage.sessionEnd())
        .then(() => redeemResponse)
        .catch(handleError);
    };

    if (args.beginResponse) {
      return startRedeem(args.beginResponse);
    }

    const beginParams = {
      issuerRequest: {
        fn: "redeem"
      }
    };

    return this.issuer("begin", beginParams, args)
      .then(startRedeem);
  }

  _redeemCoins_inner_(request, args, crypto = null) {
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

      const handleResponse = (redeemResponse) => {
        resp = redeemResponse;

        const hasCoins = resp.coin && Array.isArray(resp.coin) &&
          resp.coin.length > 0;

        if (resp.deferInfo) {

          const txObj = Object.assign({}, {
            currency: crypto,
            headerInfo: {
              fn: `send XBT${args.target} deferred`,
              domain: args.domain,
            },
            other: Object.assign({}, args.other || {}, resp.redeemInfo),
          }, resp);

          if (debug) {
            console.log("WalletBF - redeem deferred transaction object ", txObj);
          }

          let promise = Promise.resolve(true);

          if (hasCoins && args.firstTimeCalled) {
            if (debug) {
              console.log("WalletBF - Deferred but got change from issuer", resp.coin);
            }
            args.firstTimeCalled = false;
            promise = this.includeCoinsInStore(resp.coin).then(() => {
              return this.recordTransaction(txObj);
            }).then((tx) => {
              if (debug) {
                console.log("WalletBF - Saving deferred transaction with id", tx.id);
              }
              args.transactionId = tx.id;
              return tx;
            });
          } else if (args.firstTimeCalled) {
            args.firstTimeCalled = false;
            promise = this.recordTransaction(txObj).then((tx) => {
              console.log("Saving deferred transaction with id", tx.id);
              args.transactionId = tx.id;
              return tx;
            });
          }

          return promise.then(() => {
            return this._restartDeferral(redeem, resp, req, 60000);
          }).then(() => {
            return Promise.reject(Error("Redeem deferred"));
          });
        }

        if (resp.status !== "ok") {
          let errMsg = "Redeem response status is " + resp.status;
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

        if (hasCoins) {
          return storage.addAllIfAbsent(COIN_STORE, resp.coin, false, crypto);
        }
        return 0;
      };


      const recordResponse = (numCoins) => {
        if (debug && numCoins == 0) {
          console.log("WalletBF - Redeem zero coins");
        }
        resp.other = Object.assign({}, args.other || {}, resp.redeemInfo);
        resp.currency = crypto;

        const {
          firsTimeCalled,
          target,
          transactionId,
        } = args;

        if (!firsTimeCalled && transactionId) {
          const auxTx = new Transaction(resp, 0, {}).get();
          if (debug) {
            console.log("WalletBF- modify redeem history item", auxTx);
          }

          const modifiedTx = {
            action: `send XBT${target}`,
            info: auxTx.info,
            issuer: auxTx.issuer,
          };

          return this.modifyHistoryItem(transactionId, modifiedTx, crypto);
        }

        return this.recordTransaction(resp);
      };


      const finishTransaction = () => {
        const tid = resp.headerInfo.tid;

        const context = {
          issuerRequest: {
            tid,
          }
        };
        const params = {
          domain: args.domain,
        };

        return storage.removeFrom(SESSION, tid)
          .then(() => this.issuer("end", context, params));
      };


      const walletCallback = () => {
        if (args.firstTimeCalled && args.success) {
          return args.success(resp);
        }
        if (!args.firstTimeCalled && args.deferredSuccess) {
          return args.deferredSuccess(resp);
        }
        return resp;
      }


      return this.issuer("redeem", request, args)
        .then(handleResponse)
        .then(recordResponse)
        .then(finishTransaction)
        .then(walletCallback);
    };

    return redeem();
  }

  // Remove transaction from the server and call 'end' to the issuer
  _cleanTransaction(response, args) {
    const {
      debug,
      SESSION,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF._cleanTransaction");
    }

    return storage.removeFrom(SESSION, response.headerInfo.tid).then(() => {
      return storage.flush();
    }).then(() => {
      const params = {
        issuerRequest: {
          tid: response.headerInfo.tid
        }
      };
      //Just to be certain our coins are not still being held in
      //a server transaction, we end it
      return this.issuer("end", params, { domain: args.domain });
    }).then(() => {
      return response;
    });
  };

  /**
   * Persist the request after adding the deferral information and restart the Issuer function that has been deferred.
   * @param fn [function] The function to be called once the deferral period of over, the function must return a promise to be resolved/rejected
   * @param response [object] The issuerResponse object containing the deferInfo object
   * @param request [object] The issuerRequest object originally triggered the call to the Issuer
   * @param defaultRetry [integer] The default delay in ms that should be used if the deferInfo does not contain a valid retry time.
   * @return A reference to the timer that will restart the Issuer function.
   */
  _restartDeferral(fn, response, request, defaultRetry) {
    const {
      debug,
      SESSION,
      storage,
    } = this.config;

    let deferUntil = NaN;
    if (response.deferInfo && response.deferInfo.after) {
      deferUntil = Date.parse(response.deferInfo.after);
    }
    if (isNaN(deferUntil)) {
      response.deferInfo.after = new Date(Date.now() + defaultRetry).toISOString();
      deferUntil = Date.parse(response.deferInfo.after);
    }

    if (debug) {
      console.log(response.deferInfo.reason + ". Deferred until", new Date(deferUntil).toISOString());
    }
    
    // add deferInfo to the recovery object and persist the request together
    // with the recovery
    request.recovery.deferInfo = response.deferInfo;
    return storage.setToPromise(SESSION, response.deferInfo.tid, request).then(() => {
      return window.setTimeout(() => {
        return storage.sessionStart("Execute deferred request").then(() => {
          return fn();
        }).then(() => {
          return storage.sessionEnd();
        }).catch((err) => {
          storage.sessionEnd();
          return Promise.reject(err);
        });
      }, deferUntil - Date.now());
    });
  }

  /**
   * Fetch Issuer information, caches the info records and returns the issuerResponse via a Promise.
   * @param domain     [string]  The domain of the Issuer who's information is being sort.
   * @return A Promise that resolves to an issuerResponse.
   */
  issuerInfo(domain) {
    if (this.config.debug) {
      console.log("WalletBF.issuerInfo "+domain);
    }
    return new Promise((resolve,reject) => {
      this.issuer("info", {}, { domain }).then((response) => {
        if ("deferInfo" in response) {
          return reject(response);
        }
        let issuerSet = this.config.issuers;
        //Record the issuer info
        response.issuer.forEach(function(el) {
          issuerSet[el.domain] = el;
        });
        resolve(response);
      }).catch((response) => {
        reject(response);
      });
    });
  }

  /**
   * Provides access to the Bitcoin-fast Issuer service.
   * @param fn    [string]    The name of the Issuer end-point function to be called.
   * @param params  [map]      A JSON object containing parameters to be passed to the Issuer.
   * @param args    [map]      A JSON object containing zero or more optional arguments.
   * 
   * OPTIONAL ARGS
   * beginResponse  [object]    An Issuer's issuerResponse object as returned by /begin.
   * domain       [string]    The domain of the Issuer where the coins will be verified.
   * timeout      [integer]    Number of seconds to wait for a server response. Defaults to 30s. 
   */
  issuer(fn, params, args, method="POST") {

    const {
      debug,
      forceDefer,
    } = this.config;

    const forceDeferFns = ["issue", "exist", "recover", "redeem", "atomicSwap", "verify"];

    if (forceDefer && forceDeferFns.indexOf(fn) > -1) {
      params.issuerRequest.atomic = true;
    }

    if (debug) {
      console.log(`WalletBF.issuer -> ${fn}`);
    }

    let localArgs = Object.assign({ timeout: 30 }, args);
    this._ensureDomainIsSet(localArgs, params.coin);

    const endpoint = this._getIssuerEndpoint(fn, localArgs.domain);
    const bodyData = method == "POST" ? JSON.stringify(params || {}) : null;

    return new Promise((resolve, reject) => {

      const handleSuccess = (response) => {
        const {
          issuerResponse,
        } = response;

        // Update Bitcoin fees for future use
        this._updateBitcoinFees(fn, issuerResponse);

        if (issuerResponse && issuerResponse.status) {
          return resolve(issuerResponse);
        }
        if (issuerResponse) {
          return reject(issuerResponse);
        }
        return reject(Error("Unexpected response from server"));
      };

      const handleError = (xhr, status, err) => {
        if (debug) {
          console.log(xhr, status, err);
        }

        let message = "Can't connect to the issuer";
        if (status === "timeout") {
          message = `Server did not respond within ${localArgs.timeout} sec.`;
        }

        return reject(Error(message));
      };

      $.ajax({
        url: endpoint,
        data: bodyData,
        type: method,
        accepts: {
          json: "application/json",
        },
        contentType: "application/json",
        dataType: "json",
        timeout: (localArgs.timeout * 1000),
        async: true,
        success: handleSuccess,
        error: handleError
      });
    });
  }

  /**
   * Given a function and an optional domain name, construct and return the endpoint
   * of an Issuer service.
   *
   * @param fn The endpoint's function name
   * @param domain (Optional) The domain of the Issuer service.
   *   If domain is NOT provided a default issuer will be used.
   * @return The url of the endpoint to be used
   */
  _getIssuerEndpoint(fn, domain) {
    if (this.config.debug) {
      console.log("WalletBF._getIssuerEndpoint", fn, domain);
    }

    if (!domain || typeof domain !== 'string') {
      domain = this.getSettingsVariable(this.config.DEFAULT_ISSUER) || DEFAULT_SETTINGS.defaultIssuer;
    }
    const protocol = this.getSettingsVariable(this.config.ISSUER_PROTOCOL) || "https://";
    return protocol + domain + this.config.ISSUER_PATH + fn;
  }

  _updateBitcoinFees(fn, resp) {
    if (["begin", "info"].indexOf(fn) == -1) {
      return;
    }

    if (!resp.issuer || !resp.issuer[0] || !resp.issuer[0].currencyInfo) {
      return;
    }

    if (this.config.debug) {
      console.log("WalletBF._updateBitcoinFees");
    }

    // Update the class object
    this.bitcoinFees = this.getBlockchainCurrencyInfo(resp, "XBT");
  }

  getBitcoinFees(reload=false) {
    if (!reload && this.bitcoinFees) {
      const {
        expiry,
      } = this.bitcoinFees;

      if (expiry && new Date(expiry) > new Date()) {
        return Promise.resolve(this.bitcoinFees);
      }
    }

    return this.issuer("info", {}, null, "GET")
      .then((resp) => this.getBlockchainCurrencyInfo(resp, "XBT"));
  }

  getBlockchainCurrencyInfo(issuerInfo, currency) {
    let issuer = issuerInfo;
    if (issuerInfo.issuer) {
      issuer = issuerInfo.issuer[0];
    }

    const { blockchainInfo } = issuer.currencyInfo.find((elt) => {
      return elt.currencyCode == currency;
    });
    return blockchainInfo;
  }

  getIssuerExchangeRates() {
    return this.issuer("exchange", {}, null, "GET").then((response) => {
      if (response.status != "ok") {
        return Promise.reject(Error("Error on calling exchange"));
      }

      let currencies = [];
      let sourceCurrencies = [];
      const {
        expiry,
        rates,
      } = response.exchangeInfo;

      let result = {
        exchangeRates: {},
        expiry,
      };
      const now = new Date();

      rates.forEach((exchange) => {
        sourceCurrencies.push(exchange[0]);
        currencies.push(exchange[0]);
        currencies.push(exchange[1]);
        let key = `${exchange[0].toUpperCase()}_${exchange[1].toUpperCase()}`;
        if (new Date(expiry) > now) {
          result.exchangeRates[key] = parseFloat(exchange[2]);
        }
      });
      result['currencies'] = Array.from(new Set(currencies));
      result['sourceCurrencies'] = Array.from(new Set(sourceCurrencies));

      if (this.config.debug) {
        console.log("WalletBF.getIssuerExchangeFees", result);
      }
      return result;
    });
  }

  /**
   * Takes a 'targetValue' and a list of Coin objects which must all be
   * in the coinStore on entry.
   * The Coins will be join/split (using the verify function), such that
   * a new coin is created having a value of exactly 'targetValue'.
   * If called with a single coin and 'targetValue' is the same as the
   * 'coin.value', the Coin will NOT be split but simply passed to 'success'.
   * If 'targetValue' is undefined or is less than or equal to zero, the
   * Coin will NOT be split and 'success'
   * will be called with null to indicate there was nothing to split.
   * Once split, both the target value Coin and any 'change' Coin will
   * be returned to the coinStore.
   * If an attempted split was unsuccessful, the failure function will be
   * called with a message indicating what went wrong.
   * 
   * @param targetValue  [number] A decimal number indicating the desired
   *                              value of a new Coin after the split.
   * @param coins [Array string | Coin]  A list of one or more coin strings or Coin objects
   * @param args      [map]          A Map containing zero or more optional arguments.
   * @param inSession      [boolean]          verify coins in session.
   * 
   * failure      [function]        The function to be called on unsuccessful completion of the verification.
   * action       [string]        A short label for the action being taken. This will be reflected in the history. Defaults to "verify".
   * comment       [string]        A short comment to be reflected in the history. Defaults to "".
   * domain       [string]        The domain of the Issuer where the coins will be verified.
   * beginResponse  [object]        An Issuer's issuerResponse object as returned by /begin. If present 'domain' will be ignored.
   * policy        [string]        The desired coin issuing policy for the Issuer to follow. If not supplied, the wallet's default policy will be requested.
   * newCoinList    [array decimal strings] The list of desired coin values to be issued by the server. NOTE if this list is defined the iPolicy will be set to "user".
   */
  splitCoins(targetValue, coins, args, inSession=true, crypto=null) {
    return new Promise((resolve, reject) => {
      if (this.config.debug) {
        console.log("WalletBF.splitCoins", targetValue, coins, args);
      }

      let defaults = {
        action: "split coin",
        policy: this.getSettingsVariable(this.config.ISSUE_POLICY),
        domain: this.getSettingsVariable(this.config.DEFAULT_ISSUER),
        external: false,
        newCoinList: [],
      };
      args = $.extend({}, defaults, args);

      if (coins === null || coins.length === 0) {
        reject(Error("Found no coins to split"));
      }

      if (typeof(targetValue) !== "number" || targetValue <= 0) {
        resolve(null);
      }

      //determine if coins have sufficient value to satisfy the targetValue once verified
      let verifiedValue = this._arrayTotalValue(coins, args);
      if (verifiedValue < targetValue) {
        // There is no point in verifying
        reject(Error("Coin value too small once verified"));
      }

      args.target = targetValue;
      this.verifyCoins(coins, args, inSession, crypto).then((verifyResponse) => {
        //verify success
        let newCoins = new Array();
        Object.keys(verifyResponse.coin).forEach((key) => {
          // Convert the base64 version into a more useful Coin object
          newCoins.push(this.Coin(verifyResponse.coin[key]));
        });

        let splitTarget = newCoins.find((elt) => {
          // Find the target coin
          return (args.target === elt.value);
        });

        if (typeof splitTarget === "undefined") {
          reject(Error("Verify did not split the coin as expected"));
        } else {
          resolve(splitTarget);
        }
      }).catch(reject);
    });
  }


  paymentRecovery(notification) {
    const {
      debug,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF.paymentRecovery");
    }

    let paymentFSM = this.getPersistentVariable(this.config.FSM, null);
    if (!paymentFSM) {
      return Promise.resolve(true);
    }

    paymentFSM.wallet = this;
    paymentFSM.notification = notification || function () {
      return Promise.resolve(true);
    };

    return this.getIssuerExchangeRates().then((response) => {
      const {
        exchangeRates,
      } = response;
      paymentFSM.other = {
        other: {
          exchangeRates,
        },
      };
      return storage.sessionStart("Payment recovery")
    }).then(() => {
      let machine = new FSM("paymentRequest", paymentFSM);
      return machine.run();
    }).then(function() {
      console.log("PaymentRequest has run to completion");
      return storage.sessionEnd();
    }).catch(function(err){
      console.log(err);
      return storage.sessionEnd();
    });
  }


  /**
   * This function should be called once when the browser starts.
   * It will detect if any Issuer transaction was interrupted and will restart the function in order to fetch outstanding coins.
   * @param success  A callback function to be called upon successful recovery of an Issuer function
   * @param failure (optional) A callback function to be called upon a recovery failure.
   */
  recovery(success, failure) {
    const {
      PASSPHRASE_LIST,
      SESSION,
      storage,
    } = this.config;

    if (this.config.debug) {
      console.log("WalletBF.recovery");
    }
    if (typeof(failure) !== 'function') {
      return Promise.reject(Error("'failure' callback is not a function"));
    }
    if (typeof(success) !== 'function') {
      return Promise.reject(Error("'success' callback is not a function"));
    }
    if (!storage) {
      return Promise.reject(Error("Persistent storage not yet installed"));
    }

    let session = storage.get(SESSION);
    if (!session || session.length == 0) {
      return Promise.resolve(0);
    }

    let promises = [];
    let result = -1; // num txs recovered
    return storage.sessionStart("Recover transactions in Session").then(() => {

      Object.keys(session).forEach((tid, index) => {
        let request = session[tid];

        if (!this._isPlainObject(request)) {
          console.log("Recovery: No issuerRequest", request);
          return;
        }

        let {
          issuerRequest,
        } = request;
        if (!issuerRequest) {
          console.log("Recovery without issuerRequest: Found ", request);
          return;
        }

        if (Date.parse(issuerRequest.expiry) < Date.now()) {

          // Although this transaction has expired we could
          // yet receive the coins via email
          let headerInfo = {
            fn: "transaction expired",
            domain: "unknown",
          };

          if (request.recovery && request.recovery.expiryEmail) {
            let rec = {
              passphrase: request.recovery.expiryEmail[1],
              timestamp: Date.now()
            };
            //store the passphrase and timestamp against the reference
            //TO_DO
            storage.setTo(PASSPHRASE_LIST, request.recovery.expiryEmail[2], rec);
            headerInfo.fn = request.recovery.fn;
            headerInfo.domain = request.recovery.domain;
          }
          //Now we can record the loss and remove the transaction
          //TODO needs real value
          /*let expiredInfo = {
            faceValue: 0,
            actualValue: 0,
            newValue: 0,
            totalFee: 0,
            bitcoinRef: "",
            comment: ""
          };
          this.recordTransaction({
            headerInfo,
            expiredInfo
          }).then(function() {
            storage.removeFrom(SESSION, tid);
          });*/
          promises.push(storage.removeFrom(SESSION, tid));

        } else if (request.recovery) {
          const {
            action,
            comment,
            deferInfo,
            domain,
            fn,
          } = request.recovery;

          // If the function has been deferred, skip the recovery
          // until 'after' the deferral date/time.
          if (deferInfo && deferInfo.after) {
            if (Date.now() < Date.parse(deferInfo.after)) {
              console.log(`Skiped recovery of '${fn}' until ${deferInfo.after}`);
              return;
            }
          }

          let args = {
            failure: (resp) => failure(resp),
            domain,
          };

          let previousAction =  typeof(action) === "string" ? " of "+ action : "";
          args.action  = "recovery" + previousAction;
          let previousComment = typeof(comment) === "string" ? " recovered ("+ comment + ")" : "";
          args.comment = "Auto start" +  previousComment;
          
          console.log("Attempting to recover", request.recovery);
          let result;
          switch(fn) {
            case "issue":
            case "receive funds":
              const handleResponse = (resp) => {
                result = resp;
                return storage.removeFrom(SESSION, tid);
              };

              const issuePromise = this._issueCollect_inner_(request, args)
                .then(handleResponse)
                .then(() => success(result))
                .catch(failure);

              promises.push(issuePromise);
              break;
            
            case "verify":
              const verifyPromise = this.verifyCoinsRecovery(request, args)
                .then((resp) => success(resp))
                .catch(failure);

              promises.push(verifyPromise);
              break;
            
            case "redeem":
              const handleRedeemResponse = (resp) => {
                result = resp;
                return storage.removeFrom(SESSION, tid);
              };

              const redeemPromise = this._redeemCoins_inner_(request, args)
                .then(handleRedeemResponse)
                .then(() => success(result))
                .catch(failure);

              promises.push(redeemPromise);
              break;
          }
        } else {
          console.log("Expected recovery object to have a recovery element but only found", request); 
        }
      });

      if (promises.length == 0) {
        return [];
      }
      return Promise.all(promises);
    }).then((values) => {
      result = values.length;
      return storage.sessionEnd();
    }).then(() => {
      return result;
    }).catch((err) => {
      storage.sessionEnd();
      return Promise.reject(Error(err.message || `Error on recovering transactions: ${result}`));
    });
  }

  /*
   * Send blocks of coins from the coin recovery list to the Issuer
   * indicated by 'domain'.
   * On return from checking each block, remove all the coins from
   * recovery and move any coins that still exist into a pending list
   * until all blocks have been processed.
   * Once the coin recovery list is empty (i.e all coins have been checked),
   * move any coins that still exist, back into the recovery list.  
   */
  checkRecoveryCoins(domain) {
    const {
      COIN_PENDING,
      COIN_RECOVERY,
      CRYPTO,
      debug,
      storage,
    } = this.config;

    if (debug) {
      console.log("WalletBF.checkRecoveryCoins");
    }

    let wrongType = false;
    let base64Coins = new Array();
    let coins = this.getRecoveryCoins();
    const crypto = this.getPersistentVariable(CRYPTO, "XBT");

    if (coins.length === 0) {
      // having cleared all the recovery coins, put back all that were recovered
      let pending = this._getCoinList(COIN_PENDING, true);
      pending.forEach(function(elt) {
        console.log("pending coin", elt);
      });
      // TO_FIX TO_DO
      if (pending.length > 0) {
        storage.addAllIfAbsent(COIN_RECOVERY, pending, false, crypto);
        storage.removeAllCoins(COIN_PENDING, pending, crypto);
      }
      return;
    }

    let coinsToCheck = JSON.parse(JSON.stringify(coins.slice(0, 50)));
    // Deep copy of first 50 elements of the coin recovery array

    coinsToCheck.forEach(function(elt) {
      if (typeof(elt) === "string") {
        base64Coins.push(elt);
      } else if ("base64" in elt) {
        base64Coins.push(elt.base64);
      } else {
        wrongType = wrongType || true;
      }
    });
      
    if (wrongType) {
      // Cannot recover
      console.log("/exist requires base64 strings");
      return;
    }
      
    if (typeof(domain) !== 'string') {
      // Set the domain if all coins come from the same Issuer
      domain = this._getSameDomain(coinsToCheck);
    }
    
    const args = {
      issuerRequest: {
        fn: "exist",
        coin: base64Coins
      }
    };

    this.issuer("exist", args, { domain: domain }).then((existResponse) => {

      if ("coin" in existResponse && existResponse.coin.length > 0) {
        let forRecovery = new Array();
        Object.keys(existResponse.coin).forEach((key) => {
          console.log(existResponse.coin[key]);
          let coin = coinsToCheck.find(function(element) {
            return element.base64 === existResponse.coin[key];
          });
          if (typeof(coin) !== "undefined") {
            console.log("coin still exists - should still have their ref etc", coin);
            forRecovery.push(coin);
          } else {
            console.log("/exist returned a coin that was not found in the list that was sent!", base64);
          }
        });
        storage.addAllIfAbsent(COIN_PENDING, forRecovery, false, crypto);
      }
      storage.removeAllCoins(COIN_RECOVERY, coinsToCheck, crypto);
      window.setTimeout(this.checkRecoveryCoins.bind(this), 100, domain); // TO_FIX
    }).catch((err) => {
      console.log("checkRecoveryCoins failed to return OK", err);
    });
  }

  /**
   * Given an issuerResponse, extract and return any error message.
   */
  getResponseError(resp) {
    if (resp.error && Array.isArray(resp.error) && resp.error[0]) {
      return resp.error[0].message ? Error(resp.error[0].message) : resp;
    }
    return null;
  }


  ///////////////// Internal functions ///////////////////
  /**
   * Ensure that the best available Issuer is used. If no explicit domain is
   * available and all the coin's are from the same Issuer, that Issuer will
   * be used, otherwise the Wallet's default Issuer is used.
   *
   * @param args [object] An object containing 'beginResponse' and/or 'domain'
   * @param coins [array] A list of coins to be sent to an Issuer.
   */
  _ensureDomainIsSet(args, coins) {
    let self = this;
    //When /begin has already returned a response, we must use that Issuer's domain 
    if ("beginResponse" in args && "headerInfo" in args.beginResponse && "domain" in args.beginResponse.headerInfo) {
      args.domain = args.beginResponse.headerInfo.domain;
    //} else if (typeof(args.domain) === "undefined") {
      //Set the domain if all coins come from the same Issuer
      //args.domain = self._getSameDomain(coins); 
    }
    //finally use the default issuer 
    if (args.domain === null) {
      args.domain = self.getSettingsVariable(self.config.DEFAULT_ISSUER);
    }
  }

  // Returns the list of coin selections for analysis. Only used for testing
  _getCoinSelections(unpack) {
    if (this.config.debug) {
      console.log("WalletBF._getCoinSelections");
    }
    // let selection = this.config.storage.get(this.config.COIN_SELECTION);
    let selection = localStorage.getItem(this.config.COIN_SELECTION);
    if ($.isArray(selection)) {
      return selection;
    }
    return new Array();
  }


  /*
   * Gets the named list of coins from the store and returns then in an Array.
   * If 'unpack' is true, the returned coins will be Coin objects otherwise they
   * will be base64 encoded strings.
   *
   * Coin object include all the raw String elements plus a Numeric 'value' and
   * String 'base64', which is a copy of the original encoded coin.
   */
  _getCoinList(container, unpack, crypto = null) {
    const {
      CRYPTO,
      storage,
    } = this.config;

    if (crypto == null) {
      crypto = this.getPersistentVariable(CRYPTO, "XBT");
    }

    let coins = new Array();
    let store = storage.get(container, {});
    if (Object.keys(store).indexOf(crypto) == -1) {
      return coins;
    }
    let list = store[crypto];

    if (Array.isArray(list)) {  
      if (typeof(unpack) !== "boolean") {
        unpack = false;
      }
      list.forEach((el) => {
        if (typeof(el) === "string") {
          coins.push(unpack ? this.Coin(el, false) : el);
        } else {
          if (this._isPlainObject(el) && "base64" in el) {
            coins.push(unpack ? el : el.base64);
          }
        }
      });
    }
    return coins;
  }

  /**
   * Extract coins from the coin store who's sum is the exact value of the target.
   * If the exact target value is not readily available join/split a coin(s) to make it so.
   * Once the coins are ready, they are passed in an array to the callback function.
   * If it is not possible to attain the exact value the array passed to the callback will be empty.
   *
   * @param target [number] A number representing the target value required.
   * @param args [map] Contains a list of optional arguments
   */
  _getCoinsExactValue(target, args={}, inSession=true, crypto = null) { 

    if (Number.isNaN(target)) {
      return Promise.reject(Error("Target value is not a number"));
    }

    if (!crypto) {
      crypto = this.getPersistentVariable(this.config.CRYPTO, "XBT");
    }

    return this.Balance(crypto).then((balance) => {
      if (target > balance) {
        // insufficient funds
        return new Array();
      }

      if (target == balance) {
        // already have the exact value 
        return this.getStoredCoins(false, crypto);
      }

      let promise = Promise.resolve(args.beginResponse);
      if (!args.beginResponse) {
        promise = this.issuer("begin", {
          issuerRequest: {
            fn: "verify"
          }
        }, args);
      }

      return promise.then((response) => {
        args.beginResponse = response;
        return this._selectAndSplitCoins(target, args, inSession, crypto);
      }).then((coins) => {
        if (this.config.debug) {
          console.log('args for _selectAndSplitCoins', args);
          console.log('list for _selectAndSplitCoins', coins);
        }
        return coins;
      });
    });
  }

  _selectAndSplitCoins(target, args, inSession, crypto = null) {
    let selection = new Array();

    if (!crypto) {
      crypto = this.getPersistentVariable(this.config.CRYPTO, "XBT");
    }

    return new Promise((resolve, reject) => {
      let splitList = this._getCoinsToSplit(target, selection, args, crypto);

      if (!splitList) {
        // apparently the target couldn't be reached
        reject(Error("Coin selection failed for " + crypto + target));
        return;
      }

      if (splitList.length === 0) {
        // no split required
        resolve(selection);
        return;
      }

      let { targetValue } = splitList[splitList.length - 1];
      let params = [targetValue, splitList, args, inSession, crypto];
      this.splitCoins(...params).then((newSplitCoin) => {
        // split success
        if (newSplitCoin) {
          selection.push(newSplitCoin);
          resolve(selection);
        } else {
          reject(Error("No coin came back from splitCoins"));
        }
      }).catch(reject);
    });
  }

  /**
   * Determine a selection of coins needed to attain a target value and identify the most suitable coin(s)
   * to be join/split in order to attain that exact value.
   * If a split is required, the returned Coin objects will contain a 'targetValue' element that can be used
   * by the caller to join/split the coins.
   * If the exact target value is available without the need to split any coin, the returned Coin's
   * 'targetValue' will be set to 'value'.
   * If there are no suitable coins this function will return null.
   * @param target [number] The target value being sort
   * @param selection [array] A list where the selected coins that are NOT to be split will be placed
   * @param args [object] A set of attributes for this transaction
   * @return [array] A list of coins to be join/split
   */
  _getCoinsToSplit(target, selection, args, crypto) {
    if (this.config.debug) {
      console.log("WalletBF._getCoinsToSplit", target, selection, args);
    }

    if (!crypto) {
      crypto = this.getPersistentVariable(this.config.CRYPTO, "XBT");
    }
    args.currency = crypto;

    let startTime = new Date().getTime();
    if (typeof target === "undefined" || target <= 0) {
      this._archiveCoinSelection("_getCoinsToSplit:00 No target set", target, startTime, 0, 1, {selection:[],toVerify:[]});
      return null;
    }

    let storedCoins = this.getStoredCoins(false, crypto);
    if (storedCoins.length === 0) {
      this._archiveCoinSelection("_getCoinsToSplit:01 No coins available", target, startTime, 0, 1, {selection:[],toVerify:[]});
      return null;
    }
    
    if (storedCoins.length === 1) {
      //As there is only one coin we split it to the target value
      let base64 = storedCoins[0];
      let theCoin = this.Coin(base64,true,args);
      theCoin.targetValue = (typeof(target) == "number") ? target : Number.parseFloat(target);
      
      //As the balance is >= target and this is the only coin, it must be the correct coin to split
      this._archiveCoinSelection("_getCoinsToSplit:02 Only one coin available", target, startTime, 0, 1, {selection:[],toVerify:[theCoin]});
      return [theCoin];
    }

    let selectionResponse = this._coinSelection(target, storedCoins, args);
    console.log("_coinSelection came back with selectionResponse", selectionResponse);

    if ( selectionResponse.targetValue === null || selectionResponse.targetValue === NaN ||
      typeof(selectionResponse.targetValue) === "undefined" || selectionResponse.targetValue === 0) {
      return null;
    }
    
    selectionResponse.selection.forEach(function(elt, i, array) {
      selection.push(elt);
    });
    
    if (selectionResponse.toVerify.length > 0) {
      selectionResponse.toVerify[selectionResponse.toVerify.length - 1].targetValue = selectionResponse.targetValue;
    }
    
    return selectionResponse.toVerify;
  }

  /**
   * Select coins from the 'coins' array, such that after verification (if required),
   * they sum to a value greater than or equal to the 'target'.
   *
   * On exit, a result Object is returned:
   * The result.selection array will contain Coin objects each with a 'value' and 'base64' element.
   * One or more Coins at the end of the selection list may include a 'targetValue' attribute that
   * may be used to determine if that Coin is to be used in a subsequent join/split in order to
   * attain the exact desired 'target' value.
   * The value of the final Coin having a 'targetValue' should be used to set the actual/verify target.
   *
   * @param target [Number] The target value of the coins to be selected.
   * @param coins [Array] The set of base64 encoded coins that are available for selection.
   * @param args [map] Optional arguments needed to support the selection process:
   *   issuerService [object] An object containing the Issuer's service information.
   *   currencyInfo [object] An object containing the Issuer's fee information.
   *   outCoinCount [integer] The number of new coins to be create, not including the target and change (if any).
   *   expiryPeriod_ms [integer] The number of milliseconds before dropping the Issuer transaction.
   *   singleCoin [boolean] Set to true if the caller is wanting a single coin of the target value.
   *   currency [String]
   *
   * @return [Object]  A JSON object with the following elements:
   *   @element  targetValue [Number]  The value to be used when sending coins to /verify.
   *                     If 'targetValue' is anything other than a valid number, other elements may not be included.
   *                     Zero (0), if there are insufficient funds to satisfy the target value.
   *                     null if no coins were provided.
   *                     NaN if the target was not a number.
   *                     undefined if the process failed for any reason (e.g. no Issuer service supplied).
   *   @element singleCoin [boolean] True if the selection process is intended to create a single coin.
   *   @element faceValue [Number] The combined face value of all the coins returned.
   *   @element verifiedValue [Number] The combined value of all coins after verification of the coin(s) to be verified.
   *   @element toVerify [Array] A list of coins that should be verified in order to attain the target value.
   *   @element selection [Array] A list of coins that do not need to be verified.
   */
  _coinSelection(target, coins, args) {
    if (this.config.debug) {
      console.log("WalletBF._coinSelection",target,args);
    }

    //As this function can take a (very), long time
    //we want to record the duration at least during testing
    let startTime = new Date().getTime();
    let self = this;

    //Activity: 'verify inputs' test case#0
    if(args.debug) console.log("Activity: 'verify inputs'");
    if(coins===null || coins.length==0) {
      self._archiveCoinSelection("CS:00 coins null or empty", 0, startTime, 0, 0, {selection:[], toVerify:[]});
      return {targetValue:null};
    }

    if(typeof(target) != 'number') {
      if(typeof(target) == 'string') {
        target = Number.parseFloat(target);
        if(isNaN(target)) {
          self._archiveCoinSelection("CS:01  "+target+" is NaN", 0, startTime, 0, 0, {selection:[],toVerify:[]});
//EXIT POINT ********
          return {targetValue:NaN}; // indicating the string sent wasn't a decimal number
        }
      } else {
        self._archiveCoinSelection("CS:02 "+target+" is NaN", 0, startTime, 0, 0, {selection:[],toVerify:[]});
//EXIT POINT ********
        return {targetValue:NaN}; // indicating no value target was set
      }
    }

    if(target == 0) {
        self._archiveCoinSelection("CS:03 target is zero", 0, startTime, 0, 0, {selection:[],toVerify:[]});
//EXIT POINT ********
        return {targetValue:undefined};
    }

    // Ensure that args is defined and has a singleCoin element
    args = $.extend({}, {singleCoin:false,debug:false,target:target,mustVerify:false}, this._isPlainObject(args) ? args : {});

    // To hold the set of working coins
    let wkCoins = new Array();
    // Holds the set of coins that do not need to be split
    let selection = new Array();
    // Needed because the target will be adjusted if there are pre-selected coins
    let realTarget = target;
    // This will be set to a coin having the smallest value that's also larger
    // than the target - if one exists
    let defaultCandidate = null;
    let reducedTargetDefaultCandidate = null;
    let sum=0, x=0, y=0, i=0, ix=0;
    let totalNumberOfCoins = coins.length;
    let ops=0;

    let issuer = null;
    if (args.issuerService) {
      issuer = args.issuerService;
    } else if(args.beginResponse) {
      issuer = args.beginResponse.issuer[0];
    } else if(args.domain) {
      issuer = this.getIssuerInfo(args.domain);
    } else if(self._getSameDomain(coins) != null) {
      issuer = this.getIssuerInfo(self._getSameDomain(coins));
    } else {
      issuer = this.getIssuerInfo(self.config.DEFAULT_ISSUER);
    }

    let currency = null;
    if (args.currency) {
      currency = args.currency;
    } else if (typeof coins[0] == "string") {
      currency = this.Coin(coins[0]).c;
    } else if (typeof coins[0] == "object") {
      currency = coins[0].c;
    }

    let currencyInfo =  null;
    if (args.currencyInfo) {
      currencyInfo = args.currencyInfo;
    } else if (issuer && issuer.currencyInfo && currency) {
      currencyInfo = issuer.currencyInfo.find((elt) => {
        return elt.currencyCode == currency;
      });
    }

    if (!issuer || !currencyInfo) {
      console.log("No info found for Issuer");
//EXIT POINT ********
      self._archiveCoinSelection("CS:04 no issuer", undefined, startTime, ops, totalNumberOfCoins, {selection:[],toVerify:[]});
      return {
        targetValue: undefined,
      };
    }

    args.issuerService = issuer;
    args.currencyInfo = currencyInfo;
    let coinMinValue = Number.parseFloat(currencyInfo.coinMinValue);

    if(args.debug) {
      console.log("WalletBF._coinSelection using issuerService", issuer);
    }

//Activity: 'prepare coin objects'
    if(args.debug) {
      console.log("Activity: 'prepare coin objects'");
    }

    let responseObj;
    for (i=0; i<coins.length; i++) {
      ops++;
      let el = coins[i];
      let coinObj = JSON.parse(atob(el)); //decode the base64 into an object
      coinObj.base64 = el; //include the original base64 encoding
      self._setVerifiedValue(coinObj,args);

//Activity: 'single coin has exact value' TEST CASE#1
      if (args.mustVerify) {
        if (target == coinObj.verifiedValue) {
          if (this.config.debug) {
            console.log("Activity: 'single verified coin has exact value'");
          }
          //This coin happens to be the exact target value after verification
          responseObj =  {targetValue:target, selection:[], toVerify:[coinObj], singleCoin:args.singleCoin, faceValue:coinObj.value, verifiedValue:coinObj.verifiedValue};
          self._archiveCoinSelection("CS:05.1 single verified coin has exact value", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
          this.config.wholeCoinCount = this.config.wholeCoinCount + 1;
//EXIT POINT ********
          return responseObj;
        }
      } else {
        if (target == coinObj.value) {
          if (this.config.debug) {
            console.log("Activity: 'single coin has exact value'");
          }
          //This coin happens to be the exact target value we need
          responseObj =  {targetValue:target, selection:[coinObj], toVerify:[], singleCoin:args.singleCoin, faceValue:coinObj.value, verifiedValue:coinObj.verifiedValue};
          self._archiveCoinSelection("CS:05 single coin has exact value", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
          this.config.wholeCoinCount = this.config.wholeCoinCount + 1;
//EXIT POINT ********
          return responseObj;
        }
      }
      wkCoins.push(coinObj); //to build up the working set of coins
    }

    //We want to process the smallest valued coins first (hence pay the smallest fee)
    //Activity: 'sort coins by value'
    wkCoins.sort(function(a,b) {
      if(a.value > b.value) { return 1; }
      if(a.value < b.value) { return -1; }
      return 0;
    });

    let faceValue = self._arraySum(wkCoins, "value", 0, wkCoins.length);
    let verificationFee = args.singleCoin ? self._calcVerificationFee(faceValue, wkCoins.length, args) : {totalFee:0};
    let verifiedValue = self._round(faceValue - verificationFee.totalFee,8);

    //Activity: 'insufficient funds' TEST CASE#5_5
    if (target > faceValue) {
      if (args.debug) {
        console.log("Activity: 'insufficient funds'");
      }
      responseObj =  {targetValue:0, selection:[], toVerify:[], singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
      self._archiveCoinSelection("CS:06 TC5_5 All coins having insufficient value for fee - multi-coin", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
      return responseObj;
    }
//???
//Activity: 'check equal or (almost)' TEST CASE#2
    if (!args.mustVerify && !args.singleCoin && wkCoins.length > 1) {
      if (faceValue >= target && target >= verifiedValue) {
        //this coin is so close we cannot do any better
        if (args.debug) {
          console.log("Activity: 'check equal or (almost)'");
        }
        responseObj = {
          targetValue: target,
          selection: wkCoins,
          toVerify: [],
          singleCoin: args.singleCoin,
          faceValue: faceValue,
          verifiedValue: verifiedValue
        };
        self._archiveCoinSelection("CS:07 TC2,4 All coins equal or having insufficient value for fee - multi-coin", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
        return responseObj;
      }
    }

    if (args.debug) {
      console.log("### 1. working coins "+wkCoins.length, "sum", self._arrayTotalValue(wkCoins, args), wkCoins);
    }

    let originalNumberOfCoins = wkCoins.length; //for reporting

    if (args.debug) {
      console.log("### 2. working coins "+wkCoins.length,wkCoins);
    }

//Activity: 'establish default single coin'
//Find the smallest single coin that can completely satisfy the target value after the fee is deducted
    let defaultCandidateIndex = wkCoins.findIndex(function(el) {
      if (el.verifiedValue >= target) {
        return true;
      }
    });

    if (args.debug) {
      console.log("defaultCandidateIndex is ",defaultCandidateIndex,(defaultCandidateIndex >= 0) ? wkCoins[defaultCandidateIndex] : {});
    }

    if (defaultCandidateIndex >= 0) {
      //This coin can satisfy the target on it's own and is the fallback choice if no other combination can reach the target
      defaultCandidate = wkCoins[defaultCandidateIndex];
      defaultCandidate.fallback = true;
      //The list of working coins (to be combined with each split candidate in turn), may also
      //be reduced by removing all coins that have a greater value than the target.
      wkCoins = wkCoins.slice(0, defaultCandidateIndex);

      if (wkCoins.length > 0) {
        faceValue = self._arraySum(wkCoins, "value", 0, wkCoins.length);
        verificationFee = args.singleCoin ? self._calcVerificationFee(faceValue, wkCoins.length, args) : {totalFee:wkCoins[0].fee};
        verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
      } else {
        faceValue = 0;
        verifiedValue = 0;
      }
    }

    if (args.debug) {
      console.log("### 3. working coins "+wkCoins.length, wkCoins, "max. possible value", verifiedValue);
    }

    if(target > verifiedValue && defaultCandidate !== null) {
        //Activity: 'select defaultCandidate if sum wkCoins is insufficient - has default' TEST CASE#9
        if(args.debug) console.log("select defaultCandidate if sum wkCoins is insufficient");
        responseObj =  {targetValue:target, selection:[], toVerify:[defaultCandidate], singleCoin:args.singleCoin, faceValue:defaultCandidate.value, verifiedValue:defaultCandidate.verifiedValue};
        self._archiveCoinSelection("CS:08 TC9 Default candidate selected", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
        return responseObj;
    }

    //For large numbers of coins searching ALL the possible combinations gets really expensive.
    //Better that we find a less perfect set of coins than having it blow up.

    //Some coins are not cost effective to split when used on their own but may be used in combination
    //as their combined value will not increase the minimum fee.
//Activity: 'consolidate small coins'
    let valueAttractingMinFee = self._round(((currencyInfo.feeMin - currencyInfo.feeFixed) / currencyInfo.feeVariable), 8);
    let joinCandidates = new Array();
    let joinCandidateSum = 0;
    while(wkCoins.length > 0 && (joinCandidateSum + wkCoins[0].value) <= valueAttractingMinFee) {
        joinCandidateSum += wkCoins[0].value;
        joinCandidates.push(wkCoins.shift());
    }
    joinCandidateSum = self._round(joinCandidateSum,8);

    if(args.debug) console.log("### 4. working coins "+wkCoins.length,wkCoins,joinCandidates.length,joinCandidates);

    //Now we need to know what the fee will be for verification of these joinCandidates
    let joinCandidateContribution = 0; //the contribution to the targetValue once fee has been deducted
    if(joinCandidates.length > 1) {
        let verifyAllCoins = true;
        joinCandidateContribution = self._arrayTotalValue(joinCandidates, args, verifyAllCoins);
    } else if(joinCandidates.length === 1) {
        joinCandidateContribution = joinCandidates[0].verifiedValue;
    }

    if(args.debug) console.log("minFeeTarget",valueAttractingMinFee,"joinCandidateSum",joinCandidateSum,"joinCandidateContribution",joinCandidateContribution,"joinCandidates",joinCandidates);

//Activity: 'joinCandidate is sufficient' TEST CASE#11
    if(joinCandidateContribution >= target) {
        responseObj =  {targetValue:target, selection:[], toVerify:joinCandidates, singleCoin:args.singleCoin, faceValue:joinCandidateSum, verifiedValue:joinCandidateContribution};
        self._archiveCoinSelection("CS:09 TC11 Join contribution candidate >= target", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
        return responseObj;
    }

    //The purpose of this step is to reduce the number of coins being considered by pre-selecting
    //the largest coins thereby including only the smaller coins that make up the balance.
    //For fewer than about 10 coins most systems will be able to cope with searching All possibilities.
//Activity: 'pre-select coins'
    let preSelectedCoinCount = 0;
    let preSelectedSum = 0; //holds the faceValue sum of all pre-selected coins
    while(wkCoins.length > self.config.COMBINATION_SEARCH) {
        let largestCoinIndex = wkCoins.length - 1;
        faceValue = self._round(preSelectedSum + wkCoins[largestCoinIndex].value,8);
        verificationFee = args.singleCoin ? self._calcVerificationFee(faceValue, (++preSelectedCoinCount), args) : {totalFee:0};
        verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
        if(args.debug) console.log("preSelectedSum",preSelectedSum,"wkCoins[largestCoinIndex].value", wkCoins[largestCoinIndex].value, "target",target);

        if(verifiedValue > target) break; //This may already be too large so no point in pre-selecting more coins

        let preSelectedCoin = wkCoins.pop();
        preSelectedCoin.preselected = true; //just to indicate how this was selected
        selection.push(preSelectedCoin);
        preSelectedSum = faceValue;
    }

    if(args.debug) console.log("### 5. working coins "+wkCoins.length,wkCoins);

    if(preSelectedSum > 0) { //adjust the target and possibly remove larger coins
        if(args.debug) console.log("preSelectedSum",preSelectedSum,"joinCandidateSum",joinCandidateSum, "total face value",preSelectedSum + joinCandidateSum);
        faceValue = self._round(preSelectedSum + joinCandidateSum,8);
        if(args.singleCoin) {
            verificationFee = self._calcVerificationFee(faceValue, (joinCandidates.length +  selection.length), args);
        } else {
            verificationFee = self._calcVerificationFee(joinCandidateSum, joinCandidates.length, args);
        }
        verifiedValue = self._round(faceValue - verificationFee.totalFee,8);

        if(args.debug) console.log("verifiedValue",verifiedValue,"verificationFee.totalFee",verificationFee.totalFee,"target",target);

        if(verifiedValue >= target) { //we may have a solution
//Activity: 'preselected + joinCandiates is sufficient' TEST CASE#14
            if(args.debug) console.log("preselected + joinCandiates is insufficient");

            let toVerify = args.singleCoin ? joinCandidates.concat(selection): joinCandidates;
            let tv = args.singleCoin ? target : self._round(target - preSelectedSum,8);

            if(tv >= coinMinValue) {
                responseObj =  {targetValue:tv, selection: args.singleCoin ? [] : selection, toVerify:toVerify, singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
                self._archiveCoinSelection("CS:10 TC14 pre-selected + join candidates", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
                return responseObj;
            }
        }

//Activity: 'adjust target for pre-selected coins'
        target = self._round(target - preSelectedSum, 8);
if(args.debug) console.log("New target is ",target,"and joinCandidateContribution is ",joinCandidateContribution,"pre-selection",selection);

        //Having changed the target it's possible that wkCoins now contains one or more coins
        //that are larger than the new target. If so, these must to be removed and a new
        //reduced default set up.
        let index = wkCoins.findIndex(function(el) { return (el.verifiedValue >= target); });

        if(index >= 0) {
            reducedTargetDefaultCandidate = wkCoins[index];
            reducedTargetDefaultCandidate.fallback = true;
            wkCoins = wkCoins.slice(0, index);
        }
    }

    if(args.debug) console.log("### 6. working coins "+wkCoins.length,wkCoins,"originally coin length was "+originalNumberOfCoins);

    if(wkCoins.length == 0) {//Looks like the solution can come from the pre-selected coins
//Activity: 'working coins now empty'
        if(args.singleCoin) {
            let sum = self._arrayTotalValue(selection, args); //pre-selected coins
            let reducedDefaultVerifiedValue = reducedTargetDefaultCandidate !== null ? reducedTargetDefaultCandidate.verifiedValue : 0;
            if((sum + reducedDefaultVerifiedValue) >= realTarget) {
                if(reducedDefaultVerifiedValue > 0) {
                    selection.push(reducedTargetDefaultCandidate);
                }
                faceValue = self._arraySum(selection, "value", 0, selection.length);
                verificationFee = self._calcVerificationFee(faceValue, selection.length, args);
                verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
                responseObj =  {targetValue:realTarget, selection:[], toVerify:selection, singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
                self._archiveCoinSelection("CS:12 TC15 Join candidate + reduced target - single coin", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
                return responseObj;
            }
        } else {
            let joinSum = self._arraySum(joinCandidates, "value", 0, joinCandidates.length);
            verificationFee = self._calcVerificationFee(joinSum, joinCandidates.length, args);
            let preSelectedSum = self._arraySum(selection, "value", 0, selection.length);
            let tv = self._round(realTarget - preSelectedSum,8);
            if(tv > coinMinValue && tv < (joinSum - verificationFee.totalFee)) {
                faceValue = self._round(preSelectedSum + joinSum, 8);
                verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
                responseObj =  {targetValue:tv, selection:selection, toVerify:joinCandidates, singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
                self._archiveCoinSelection("CS:13 TC16 Join candidate + reduced target - multi coin", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
                return responseObj;
            } else {
                if(args.debug) console.log("Expected to obtain a solution from: target=",realTarget,"selection",selection,"joinCandidates",joinCandidates);
                if(args.debug) console.log("tv",tv,"coinMinValue",coinMinValue,"verified value",joinSum - verificationFee.totalFee);
            }
        }
    }

    //Now record the index in each coin so we can map coins back to the working list
    wkCoins.forEach(function(elt, ix) {
        elt.ix = ix;
    });

    //A function to sort a powerSet
    let pwrSort = function(a,b) {
        if(a.s < b.s) { return -1; }
        if(a.s > b.s) { return  1; }
        //When sum is the same select fewer coins first
        if(a.l.length < b.l.length) { return -1; }
        if(a.l.length > b.l.length) { return  1; }
        return 0;
    };

    //A function to select an exact match combination of coins
    let pwrSearch = function(element) {
        let val = self._round(target - element.s,8);
        if(val <= 0) {
            return false;
        }

        let matchedSet = self._getBestCoin(pwr, {min:val,max:val});
        if(matchedSet == null || matchedSet.length == 0) {
            return false;
        }

        let exactMatch = matchedSet[0];

        for(i=0; i<exactMatch.l.length; i++) {
            selection.push(wkCoins[exactMatch.l[i]]);
        }
        return true;
    };

//THIS IS WHERE IT CAN GET EXPENSIVE SO HOPFULLY THE WORKING SET IS SMALL ENOUGH
//Activity: 'build the power set'
    let pwr = self._powerSet(wkCoins);

//Step 6. Now sort the combinations of working coins in ascending order of their sum value
//Finds all combinations of the working set - this is 2^n so will fail for large numbers of coins
    pwr.sort(pwrSort);

//If there are join candidates they may individually (or in combination), combine with
//elements of the power set to offer a no-split solution
    let pwrJ = new Array();
    if(joinCandidates.length > 0) {
        pwrJ = self._powerSet(joinCandidates);
        pwrJ.sort(pwrSort);
    }

    //We also need to check if the target can be reached without any join candidates
    pwrJ.push({"s":0,"l":[]}); //Causes the full target value (i.e. target - 0), to be checked at last.

//Activity: 'search for no-split solution' TEST CASE#5
    if(!args.singleCoin && pwr.length > 0) { //Look for combinations that don't require a split, hence no fee
        for(let j=0; j < pwrJ.length; j++)
        {
            let element = pwrJ[j];
            if(pwrSearch(element)) { //we have a hit
                for(let i=0; i < element.l.length; i++) {
                    selection.push(joinCandidates[element.l[i]]);
                }
                faceValue = self._arraySum(selection, "value", 0, selection.length);
                verificationFee = self._calcVerificationFee(faceValue, selection.length, args);
                verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
                responseObj =  {targetValue:realTarget, selection:selection, toVerify:[], singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
                self._archiveCoinSelection("CS:14 TC5 Combination of whole coins", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
                self.config.wholeCoinCount = self.config.wholeCoinCount + 1;
//EXIT POINT ********
                return responseObj;
            }
            // else continue with the next joinCandidates element
        }
    }

//Activity: 'pre-select join candidates'
    if(joinCandidateSum > 0) {
        //We couldn't use the joinCandidates as the split element but it's still a
        //good idea to pre-select them in case this whole selection is joined
        joinCandidates.forEach(function(elt) {
            elt.preselected = true;
            selection.push(elt);
        })

        //need to sort 'selection' because _arrayTotalValue needs to access the smallest coin
        selection.sort(function(a,b) {
            if(a.value > b.value) { return 1; }
            if(a.value < b.value) { return -1; }
            return 0;
        });

        target = self._round(target - joinCandidateSum, 8); //reduce the target by the join candidate sum
        if(args.debug) console.log("target is "+target+" after reducing joinCandidateSum which was "+joinCandidateSum,"selection",selection,"selection total value",self._arrayTotalValue(selection, args));

        //Once again having reduced the target we may need to remove larger coins
        let index = wkCoins.findIndex(function(el) {
            if(el.verifiedValue > target) {
                return true;
            }
        });

        if(index >= 0) {
            reducedTargetDefaultCandidate = wkCoins[index];
            reducedTargetDefaultCandidate.fallback = true;
            wkCoins = wkCoins.slice(0, index);

            //Rebuild the power set for fewer coins
            pwr = self._powerSet(wkCoins);
            pwr.sort(pwrSort);
        }
    }

    if (args.singleCoin) {
//Activity: 'establish min/max fees'
      let singleCoinMinFee = self._calcVerificationFee(realTarget, selection.length + 1, args);
      //The plus one is because at least one more coin needs to be added

      let singleCoinMaxFee = 100; //Make the max fee massively large
      if(reducedTargetDefaultCandidate != null) {
        singleCoinMaxFee == reducedTargetDefaultCandidate.fee;
      } else if(defaultCandidate != null) {
        singleCoinMaxFee = defaultCandidate.fee;
      }
      if(singleCoinMinFee.totalFee >= singleCoinMaxFee) {
        //suggests the max fee will be applied so any combination will be fine
        singleCoinMaxFee = 100;//way over the max possible fee
      }

//Activity: 'search for combination' TEST CASE#10
      let j;
      let matchList = self._getBestCoin(pwr, {min:(target + singleCoinMinFee.totalFee), max:(target + singleCoinMaxFee)});
      if(matchList != null) { //we may have a hit
        for(j=0; j<matchList.length; j++) {
          let wk = JSON.parse(JSON.stringify(selection)); //Deep copy of selection array
          let match = matchList[j];
          for(i=0; i<match.l.length; i++) {
            wk.push(wkCoins[match.l[i]]);
          }
          faceValue = self._arraySum(wk, "value", 0, wk.length);
          verificationFee = self._calcVerificationFee(faceValue, wk.length, args);
          verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
          if(verifiedValue >= realTarget) {
            responseObj =  {targetValue:realTarget, selection:[], toVerify:wk, singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
            self._archiveCoinSelection("CS:15 TC10 singleCoin - combination of coins", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
            return responseObj;
          }
        }
      }
    } else {
//Activity: 'establish unique split candidates'
      //Now remove duplicate candidate values because the fee will be the same
      let uniqueCandidate = self._uniqueValues(wkCoins.slice(0, wkCoins.length));

      //The uniqueCandidate array now holds all viable coins that could be split to reach
      //the target value once they are combined with other coins.

//        if(self.config.debug) console.log("uniqueCandidate",uniqueCandidate,"wkCoins",wkCoins);

//Activity: 'search for combination with unique candidate' TEST CASE#11
      //Step 9. Now that the candidate list has been reduced to its minimal set of viable values,
      //process from smallest to largest combining with the other values, until all combinations have been checked.
      for(ix=0; ix < uniqueCandidate.length; ix++) {

        let candidateToSplit = uniqueCandidate[ix];
        //If the split candidate is used it's target must be as least coinMinValue
        let candidateTargetMin = target - (candidateToSplit.verifiedValue - coinMinValue);
        let candidateTargetMax = target;

//This time we are looking for combinations that don't include the candidateToSplit

        let matchList = self._getBestCoin(pwr, {min:candidateTargetMin,max:candidateTargetMax}, candidateToSplit.ix);
        if(matchList != null) { //we may have a hit
          for(let j=0; j<matchList.length; j++) {
            let match = matchList[j];
            let wk = JSON.parse(JSON.stringify(selection)); //Deep copy of selection array
            for(let i=0; i<match.l.length; i++) {
              wk.push(wkCoins[match.l[i]]);
            }
            let sum = self._arraySum(wk, "value", 0, wk.length);
            let tv = self._round(realTarget - sum,8);
            if(tv >= coinMinValue) {
              //Issuer will reject any target value smaller than minCoinValue
              faceValue = self._round(sum + candidateToSplit.value,8);
              verifiedValue = self._round(faceValue - candidateToSplit.fee,8);
              if(verifiedValue >= realTarget) {
                responseObj =  {targetValue:tv, selection:wk, toVerify:[candidateToSplit], singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
                self._archiveCoinSelection("CS:16 TC11 Combination with unique split candidate", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
                return responseObj;
              }
            } else {
              console.log("WARNING!! attempting to use targetValue of "+tv+" which is smaller than the minimum denomination of "+coinMinValue);
            }
          }
        }
      } //end of unique candidates
    }

    if(args.debug) console.log("Fell through to check on reducedTargetDefaultCandidate ",reducedTargetDefaultCandidate);

    if(reducedTargetDefaultCandidate != null) {
//Activity: 'revert to reduced target default candidate - single coin' TEST CASE#7
        if(args.singleCoin) {
            selection.push(reducedTargetDefaultCandidate);
            faceValue = self._arraySum(selection, "value", 0, selection.length);
            verificationFee = self._calcVerificationFee(faceValue, selection.length, args);
            verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
            if(verifiedValue >= realTarget) {
                responseObj =  {targetValue:realTarget, selection:[], toVerify:selection, singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
                self._archiveCoinSelection("CS:17 TC7 Default reduced candidate selected", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
                return responseObj;
            }
        } else {
//Activity: 'revert to reduced target default candidate - multi coin' TEST CASE#8
            if(args.debug) console.log("Activity: 'revert to reduced target default candidate - multi coin' TEST CASE#8");
            let sum = self._arraySum(selection, "value", 0, selection.length);
            let tv = self._round(realTarget - sum,8);
            verifiedValue = self._round(reducedTargetDefaultCandidate.verifiedValue + sum,8);
            if(tv >= coinMinValue && tv <= verifiedValue) {
                faceValue = self._round(reducedTargetDefaultCandidate.value + sum,8);
                responseObj =  {targetValue:tv, selection:selection, toVerify:[reducedTargetDefaultCandidate], singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
                self._archiveCoinSelection("CS:18 TC8 Default reduced candidate selected", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
                return responseObj;
            }
        }
    }

    if(args.debug) console.log("Activity: 'revert to the default candidate' TEST CASE#3,4,6");
//Activity: 'revert to the default candidate' TEST CASE#3,4,6
    //Finally as no other combination has been able to satisfy the target,
    //we go back to the smallest single coin that is larger than the target
    if(defaultCandidate != null) {
        responseObj =  {targetValue:realTarget, selection:[], toVerify:[defaultCandidate], singleCoin:args.singleCoin, faceValue:defaultCandidate.value, verifiedValue:defaultCandidate.verifiedValue};
        self._archiveCoinSelection("CS:19 TC3,4,6 Default candidate selected", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
        return responseObj;
    }

    //Apparently nothing is suitable but we know there are sufficient funds so use everything
    let allCoins = new Array();
    for(i=0; i<coins.length; i++)
    {
        let el = coins[i];
        let coinObj = JSON.parse(atob(el)); //decode the base64 into an object
        coinObj.base64 = el; //include the original base64 encoding
        self._setVerifiedValue(coinObj,args);
        allCoins.push(coinObj);
    }
    if(args.debug) console.log("All coins",allCoins);

    if(args.singleCoin) {
//Activity: 'revert to all coins - single coin' TEST CASE#12
        faceValue = self._arraySum(allCoins, "value", 0, allCoins.length);
        verificationFee = self._calcVerificationFee(faceValue, allCoins.length, args);
        verifiedValue = self._round(faceValue - verificationFee.totalFee,8);
console.log(faceValue+"|"+verificationFee.totalFee+"|"+verifiedValue+"|"+realTarget);
        if(verifiedValue >= realTarget) {
            responseObj =  {targetValue:realTarget, selection:[], toVerify:allCoins, singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
            self._archiveCoinSelection("CS:20 TC12 All coins", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
            return responseObj;
        }
    } else {
//Activity: 'revert to all coins - multi coin' TEST CASE#13
        allCoins.sort(function(a,b) {
            if(a.value > b.value) { return 1; }
            if(a.value < b.value) { return -1; }
            return 0;
        });

        faceValue = self._arraySum(allCoins, "value", 0, allCoins.length);
        let tv = realTarget;//default to whole amount
        let coinToSplitIndex = allCoins.findIndex(function(element) {
            let remainder = faceValue - element.value;
            tv = self._round(realTarget - remainder,8);
            return (coinMinValue <= tv && tv <= element.verifiedValue); //looks like this coin can be split to the desired value
        });

        let coinToSplit = coinToSplitIndex >= 0 ? allCoins[coinToSplitIndex] : null;
        if(args.debug) console.log("coinToSplit",coinToSplit);
        selection.length = 0;
        allCoins.forEach(function(elt, i, array) {
            if(coinToSplitIndex != i) {
                selection.push(elt);
            }
        })

        verifiedValue = self._round((coinToSplit === null ? 0 : coinToSplit.verifiedValue) + self._arraySum(selection, "value", 0, allCoins.length),8);
        responseObj =  {targetValue:tv, selection:selection, toVerify:coinToSplit === null ? [] : [coinToSplit], singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
        self._archiveCoinSelection("CS:21 TC13 All coin", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
        return responseObj;
    }

    responseObj =  {targetValue:0, selection:[], toVerify:[], singleCoin:args.singleCoin, faceValue:faceValue, verifiedValue:verifiedValue};
    self._archiveCoinSelection("CS:22 TC9 insufficient funds", responseObj.targetValue, startTime, ops, totalNumberOfCoins, responseObj);
//EXIT POINT ********
    return responseObj;
  }

  /**
   * This function returns the best possible totalValue of the coins in the list assuming the list is verified in some way.
   * When args has singleCoin set, the result will be the actual contributing value
   * otherwise the actual totalValue may be less than this function returns because higher valued coin(s) may be verified.
   * @param arr [Array] A list of coins
   * @param args[Object] A JSON object containing attributes of a verification
   * @param verifyAllCoins [boolean] If defined, always assume all coins will be verified
   * @return The sum of the array values
   */
  _arrayTotalValue(arr, args, verifyAllCoins) { if (this.config.debug) console.log("WalletBF._arrayTotalValue",arr,args);

    if (arr.length == 0) return 0;
    let sum = this._arraySum(arr, "value", 0, arr.length);

    let defaults = {
      inCoinCount: arr.length
    };
    let localArgs = $.extend({}, defaults, this._isPlainObject(args) ? args : {});

    if (!("issuerService" in localArgs)) {
      if ("beginResponse" in localArgs && "issuer" in localArgs.beginResponse) {
        localArgs.issuerService = localArgs.beginResponse.issuer[0];
      }
    }
    
    if (typeof(verifyAllCoins) !== "undefined")
    {
      localArgs.singleCoin = localArgs.singleCoin || verifyAllCoins;
    }
    
    //The fee will differ depending on the setting of verifyAllCoins/singleCoin.
    //If singleCoin or verifyAllCoins is set then fee is calculated on the sum,
    //otherwise it's calculated on the first coin in the list
    let coin = {
      value: localArgs.singleCoin ? sum : arr[0].value
    };
    let fees = this._getVerificationFee(coin, localArgs);
    
    if (this.config.debug) console.log("array sum=",sum,"totalFee=",fees.totalFee,"totalValue=",this._round(sum - fees.totalFee,8));
     
    return this._round(sum - fees.totalFee,8);
  }

  /**
   * Add the 'value', 'verifiedValue' and 'fee' as a Number to this coin (i.e. verifiedValue = faceValue - verificationFee).
   */
  _setVerifiedValue(coinObj, args) {
    //if (this.config.debug) console.log("WalletBF._setVerifiedValue",coinObj);

    let value = Number.parseFloat(coinObj.v);
    coinObj.value = this._round(value, 8);
    
    let fees = this._getVerificationFee(coinObj,args);
    coinObj.fee = fees.totalFee;
    coinObj.verifiedValue = this._round(value - fees.totalFee, 8);
    coinObj.variableFee = fees.variableFee;
    coinObj.variableValue = this._round(value - fees.variableFee, 8); 
  }


  /**
   * Calculate the verification fee given the amount target and the
   * issuer service information.
   * @param target [Number] Amount to calculate the verification fee..
   * @param issuerService [object] Service information with fees with
   *   the following key values:
   *     - currencyInfo: Array with the currency information
   *     - domain: domain name
   *     - relationship
   * @param emailVerify [boolean] If there is email verification
   * 
   * @return the total fee of verifying the amoun provided
   */
  getVerificationFee(target, issuerService, emailVerify = true, currency) {
    const {
      EMAIL_RECOVERY,
      VERIFY_EXPIRE,
    } = this.config;

    if (!issuerService || !target) {
      return 0;
    }

    if (!emailVerify) {
      emailVerify = this.getSettingsVariable(EMAIL_RECOVERY) || true;
    }

    const expiryPeriod_ms = this.getExpiryPeriod(VERIFY_EXPIRE);
    const expiryEmail = this._fillEmailArray(target, false, currency);
    let args = {
      singleCoin: true,
      issuerService,
      currency,
      outCoinCount: this.getOutCoinCount(),
      expiryPeriod_ms,
    };

    if (expiryEmail && emailVerify) {
      args.expiryEmail = expiryEmail;
    }

    const {
      totalFee,
    } = this._calcVerificationFee(target, 0, args);

    return totalFee || 0;
  }

  /**
   * Calculate the verification fee for this (possibly pseudo) coin
   * when verified at this issuer, assuming numCoins are to be verified.
   * @param aCoin [object] A Coin object.
   * @param args [map] A map containing arguments needed to calculate the fee
   * 
   * issuerService [object] An object containing the Issuer's fee information.
   * inCoinCount [integer] The number of input coins to be processed.
   * outCoinCount [integer] The number of output coins requested.
   * 
   * @return a JSON object containing the "totalFee" and the "variableFee"
   */
  _getVerificationFee(aCoin, args) {
    if (!this._isPlainObject(args)) {
      // If no specific issuer service is supplied then assume the coin's
      // own issuer will be used
      let issuer = this.getIssuerInfo(aCoin.d);
      if (issuer === null) {
        console.log("No Issuer info available for "+aCoin.d+", using default.");
      } else {
        args = {"issuerService": issuer};
      }
    } else if (!("issuerService" in args)) {
      if ("beginResponse" in args && "issuer" in args.beginResponse) {
        args.issuerService = args.beginResponse.issuer[0];
      } else {
        // If no specific issuer service is supplied then assume the
        // coin's own issuer will be used
        let domain = ("domain" in args) ? args.domain : aCoin.d;
        let issuer = this.getIssuerInfo(domain);
        if (issuer === null) {
          console.log("No Issuer info available for "+domain+", using default values.");
        } else {
          args.issuerService = issuer;
        }
      }
    }

    let defaults = {
      //If issuerService is not available, choose some 'reasonable' default values.
      issuerService: {
        currencyInfo: [{
          currencyCode: "XBT",
          feeMax: "0.00015000",
          feeMin: "0.00000150",
          feeFixed: "0.00000050",
          feeVariable: "0.00750000",
          feeExpiry: "0.00000010",
          feePerCoin: "0.00000005",
          freeCoins: "3"
        }],
      },
      inCoinCount: 1,
      outCoinCount: 1,
      expiryPeriod_ms: this.config.defaultExpiryPeriod
    };
    let localArgs = $.extend({}, defaults, this._isPlainObject(args) ? args : {});
    
    if (!("value" in aCoin)) {
      aCoin.value = this._round(Number.parseFloat(aCoin.v), 8);
    }

    return this._calcVerificationFee(aCoin.value, localArgs.inCoinCount, localArgs);
  }
  /*
   * Given the value of a set of coins, the number of input coins and verification args,
   * calculate the Issuer's verification fee.
   * @param value [Number] The face value of the coins to be verified.
   * @param inCoinCount [Integer] The number of coins that make up the total value.
   * @param args [Object] A set of verification arguments that must include:
   * 
   * @param issuerService [Object] As returned by the Issuer service
   * @param outCoinCount [Integer] The number of extra coins to be generated by the Issuer.
   * @param expiryPeriod_ms [Integer] The time to hold the transaction open in milliseconds.
   * @param target [Number] The target value or undefined if no target set.
   * @param currency [String] The currency to use to.
   * 
   * @return [Object] An object containing the 'variableFee' and the 'totalFee'.
   */
  _calcVerificationFee(value, inCoinCount, args) {
    const {
      CRYPTO,
      debug,
    } = this.config;

    if (debug) {
      console.log("_calcVerificationFee", value, inCoinCount, args);
    }

    let {
      issuerService,
      currency,
    } = args;

    if (!currency) {
      currency = this.getPersistentVariable(CRYPTO, "XBT");
    }

    let service = null;
    if (issuerService.currencyInfo && Array.isArray(issuerService.currencyInfo)) {
      issuerService.currencyInfo.forEach((serv) => {
        if (serv["currencyCode"] == currency) {
          service = serv;
        }
      });
    }

    if (!service) {
      throw new Error("No currency info found for the issuer service");
    }
  
    let feeMax = parseFloat(service.feeMax);
    let feeMin = parseFloat(service.feeMin);
    let freeCoins = service.freeCoins ? Number.parseFloat(service.freeCoins) : 3;

    let feePerCoin = parseFloat(service.feePerCoin);
    let feeExpiry = parseFloat(service.feeExpiry);

    let coinCount = (inCoinCount + args.outCoinCount + (typeof(args.target) == "number" ? 1 : 0) - freeCoins);
    // The first three coins are processed for free
    // Cannot have a negative coin count
    let coinCountFee = coinCount > 0 ? coinCount * service.feePerCoin : 0;
    let expiryHours= Math.floor(Number.isInteger(args.expiryPeriod_ms) ? args.expiryPeriod_ms / (1000 * 60 * 60) : 0);
    let expiryFee = this._round(expiryHours * feeExpiry, 8);

    let expiryEmailFee = 0;
    if (args.expiryEmail && args.expiryEmail.length > 0) {
      expiryEmailFee= this._round(Number.parseFloat(service.feeExpiryEmail), 8);
    }

    let variableFee  = this._round(value * Number.parseFloat(service.feeVariable), 8);
    let naturalFee = variableFee + Number.parseFloat(service.feeFixed);

    let totalFee = 0;
    if (naturalFee > feeMax) {
      totalFee = (feeMax + expiryFee + coinCountFee + expiryEmailFee);
    } else if ((naturalFee + expiryFee) < feeMin) {
      totalFee = (feeMin + coinCountFee + expiryEmailFee);
    } else {
      totalFee = (naturalFee + expiryFee + coinCountFee + expiryEmailFee);
    }
    
    return {
      variableFee: this._round(variableFee,8),
      totalFee: this._round(totalFee,8)
    };
  }



  ///////////////// Utilities ///////////////////

  //This function takes an array of Coin objects and returns an array containing
  //coins with only unique values (i.e. all duplicate values removed).
  _uniqueValues(coins) { if (this.config.debug) console.log("WalletBF._uniqueValues",coins);
    let self = this;
      let seen = {};
      return coins.filter(function(item) {
      if (!self._isPlainObject(item)) { return false; }
      let elt = "value" in item ? item.value.toString() : Number(item.v).toString();
          return seen.hasOwnProperty(elt) ? false : (seen[elt] = true);
      });
  }

  _isPlainObject(value) {
      if (Object.prototype.toString.call(value) !== '[object Object]') {
          return false;
      } else {
          let prototype = Object.getPrototypeOf(value);
          return prototype === null || prototype === Object.prototype;
      }
  }

  _browserIs(isCode = false) {
    let ua = navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [],
        parse = (name) => {
          if (isCode) {
            return name.toLowerCase().split(" ")[0];
          }
          return name;
        };

    if (/trident/i.test(M[1])) {
      tem =  /\brv[ :]+(\d+)/g.exec(ua) || [];
      return parse('IE '+(tem[1] || ''));
    }
    if (M[1]=== 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem!= null) {
        return parse(tem.slice(1).join(' ').replace('OPR', 'Opera'));
      }
    }
    M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if ((tem= ua.match(/version\/(\d+)/i))!= null) {
      M.splice(1, 1, tem[1]);
    }
    return parse(M.join(' '));
  }

  /**
   * Sums 'n' 'item' elements of 'array' starting from element 'begin' modulus the length of the array.
   * @param array  [Array]    The array containing objects
   * @param item  [String]  The name of the element to be summed
   * @param begin  [integer]  The array index of the first element to be summed
   * @param n    [integer]  The number of elements to be summed
   */
  _arraySum(array,item,begin,n) {
    let sum=0, x=0;
    for(x=0; x < n; x++) {
      let ix = ((begin+x) % array.length);
      sum += array[ix][item];
    }
    return this._round(sum,8);
  }

  _sumCoinValue(src, arr) {
    let sum=0, x=0, l = arr.length;
    for(x=0; x<l; x++) {
  //TODO &&&
      sum += src[arr[x]].value;
    }
    return this._round(sum,8);
  }

  /**
   * Summing from the smallest, return the number of Coins with a value greater than or equal to the target. 
   * @param arr A list of Coins sorted in ascending order of value
   * @param target The target value for the sum of values
   * @return The number of element from the start of the array
   */
  _sumToTarget(arr, target) { console.log("_sumToTarget reducing for target ", target);
    let sum = 0, x = 0, l = arr.length;
    while(x<l) {
      sum += arr[x++].value;
      if (sum >= target) {
        if (this.config.debug) console.log("_sumToTarget reduced ", l, " to ", x);
        return x;
      }
    }
    return l;
  }

  /**
   * Given the number of elements and the starting index, return a String
   * that can be used as a key to store the summed value.
   */
  _sumKey(array, begin, n) {
    return begin.toString() + "-" + n.toString();
  }

  /**
   * NO LONGER USED - I THINK
   * Determines if a 'candidate' is included in a range for a given array.
   */
  _isInRange(array, begin, n, candidate) {  if (this.config.debug) console.log("_isInRange",begin,n,candidate,array);

    if (candidate < 0) return false;
    let i = 0;
    for(; i<n; i++) {
      if (((begin + i) % array.length)===candidate) {
        console.log("skip because "+candidate+" is between "+begin+" and "+((begin + n) % array.length));
        return true;
      }
    }
    return false;
  }

  /**
   * Iterates through an array of Coins (or base64 encoded coins),
   * and returns the common domain if they are all the same or null if not. 
   */
  _getSameDomain(list) {
    let self = this;
    let domain = null;
    if ($.isArray(list)) {
      if (!list.some(function(el) {
        if (!self._isPlainObject(el)) {
          el = self.Coin(el);
        }
        if (domain === null) domain = el.d;
        return (domain !== el.d);
      })) {
        return null;
      }
    }
    return domain;
  }

  /**
   * Archive coin selection data for analysis.
   * @param description      [String]  A very brief description of the nature of the selection
   * @param target        [Number]  The original target value
   * @param startTime        [Integer]  The time in ms when the selection process started
   * @param cycles        [Integer]  A number to approximate the work that was done.
   * @param numberOfCoins      [Number]  The total number of coins held in the wallet at the time the coins were selected
   * @param coinSelectionResponse  [Object]  The result object returned from coinSelection.
   * 
   * @element  targetValue      [Number]  The target value to be sent to /verify
   * @element selection      [Array]    A list of Coins that are NOT to be verified
   * @element toVerify      [Array]    A list of Coins that should be verified
   * @element singleCoin      [Boolean]  True if the selection was intended for a single coin
   * @element faceValue      [Number]  The total face value of all coins selected
   * @element verifiedValue    [Number]  The expected value of all selected coins after coins have been verified.
   */
  _archiveCoinSelection(description, target, startTime, cycles, numberOfCoins, coinSelectionResponse) {
    let arch = new Object();
    arch.date = new Date().toISOString();
    arch.description = description;
    arch.target = target;
    arch.elapsedTime_ms = (new Date().getTime() - startTime);
    arch.cycles = cycles;
    arch.totalCoins = numberOfCoins;
    let str = "";
    let sep = "";
    let sum = 0;
    coinSelectionResponse.selection.forEach(function(elt, i, array) {
      sum += elt.value;
      str += (sep + elt.v);
      sep = ", ";
    });
    str += " [";
    coinSelectionResponse.toVerify.forEach(function(elt, i, array) {
      sum += elt.value;
      str += (sep + elt.v);
      sep = ", ";
    });
    str += "] (sum="+this._round(sum,8)+")";
    arch.selection = str;
    
    let coinSelection = JSON.parse(localStorage.getItem(this.config.COIN_SELECTION) || "[]"); 
    coinSelection.unshift(arch); // addFirst
    localStorage.setItem(this.config.COIN_SELECTION, JSON.stringify(coinSelection));

    let part = description.split(" ");
    console.log(arch.date+" | "+description+" | "+target+" | "+arch.elapsedTime_ms+"mS Cycles="+cycles+" for "+numberOfCoins+" coins.", coinSelectionResponse.selection,coinSelectionResponse.toVerify);
    if (part.length > 0) {
      let FNcount = JSON.parse(localStorage.getItem(this.config.COIN_SELECTION_FN)) || new Array();
      let fnIndex = FNcount.findIndex(function(elt) {
        return (elt.fn === part[0]);
      });
      if (fnIndex >= 0 ){
        FNcount[fnIndex].count = FNcount[fnIndex].count + 1;
      } else {
        FNcount.push({fn:part[0], count:1});
      }
      localStorage.setItem(this.config.COIN_SELECTION_FN, JSON.stringify(FNcount));
    }
  }

  _parseBitcoinURI(url) {
    let r = /^bitcoin:([a-zA-Z0-9]{27,34})(?:\?(.*))?$/;
    let match = r.exec(url);
    if (!match) return null;

    let parsed = { url: url }

    if (match[2]) {
      let queries = match[2].split('&');
      for (let i = 0; i < queries.length; i++) {
        let query = queries[i].split('=');
        if (query.length == 2) {
          parsed[query[0]] = decodeURIComponent(query[1].replace(/\+/g, '%20'));
        }
      }
    }

    parsed.address = match[1];
    return parsed;
  }

  _powerSet( coins ) {

    let tm = Date.now();  
    let l = coins.length;
    let list = Array(l);
    while(l--) list[l] = l;

      let set = [],
          listSize = list.length,
          combinationsCount = (1 << listSize),
          combination;

      for (let i = 1; i < combinationsCount ; i++ ){
          let combination = [];
          for (let j=0;j<listSize;j++){
              if ((i & (1 << j))){
                  combination.push(list[j]);
              }
          }
        let sum = this._sumCoinValue(coins, combination);
          set.push({"s":sum,"l":combination});
      }
      console.log("Built powerSet["+set.length+"] in "+(Date.now() - tm)+"ms", set);
      return set;
  }

  /**
   * Return a list of CoinSet from the list who's sum value is at least equal to target.min and is not larger than target.max.
   * @param list      [Array]    A list of CoinSet objects sorted by their sum in ascending order.
   * @param target    [Object]  The target range containing min and max elements.
   * @param ignoreIndex  [integer]  (Optional) The index of a Coin that must not be included in the set.
   * 
   * @return        [Array]    Return an array of elements from the list in order of their element.s value (i.e their sum value).
   *                   Returned elements will be such that target.min <= element.s <= target.max.
   *                  If target.min is NOT positive or if target.max < target.min, return null.
   */
  _getBestCoin(list, target, ignoreIndex) { //if (this.config.debug) console.log("_getBestCoin",target, ignoreIndex, list);

    if (target == null || target.min <= 0 || target.min > target.max) return null; 
    let ignore = (typeof(ignoreIndex) === 'number') ? (function(elt) { return (elt.l.indexOf(ignoreIndex) !== -1); }) : (function(elt) { return false; });
    
  //TODO replace with a binary search - but actually don't think I can?
    let index = list.findIndex(function(elt) {
      return (!ignore(elt) && elt.s >= target.min && elt.s <= target.max);
    });
    
    let result = new Array();

    while(index >= 0) {
      result.push(list[index++]);

      if (index == list.length || list[index].s < target.min || list[index].s > target.max) {
        index = -1;
      }
    }

    return result;
  }

  //************************* Encryption functions ****************************//
  _convertStringToArrayBufferView (str) {
    let bytes = new Uint8Array(str.length);
    for (let iii = 0; iii < str.length; iii++) {
      bytes[iii] = str.charCodeAt(iii);
    }
    return bytes;
  }

  _convertArrayBufferViewtoString (buffer) {
    let str = "";
    for (let iii = 0; iii < buffer.byteLength; iii++) {
      str += String.fromCharCode(buffer[iii]);
    }
    return str;
  }

  _Base64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
    }));
  }

  _Base64DecodeUnicode(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  /**
   * Convert a Base64 String to an array of unsigned bytes
   */
  _Base64ToUint8Array(base64) {
    let raw = window.atob(base64); //this._Base64DecodeUnicode(base64); //
    let rawLength = raw.length;
    let array = new Uint8Array(new ArrayBuffer(rawLength));

    for(let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }

  /**
   * Convert an array of unsigned bytes to a Base64
   * bytes Uint8Array The binary data to be encoded
   * urlCharset boolean (defaults to false) If set, the uri encodeing will be used
   * returns A String containing the Base64 encoding of the binary data
   */
  _Uint8ArrayToBase64(bytes, urlCharset) {
    if (!bytes) {
      bytes = window.crypto.getRandomValues(new Uint8Array(8));
    }

    let base64    = '';
    let encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    encodings += urlCharset ? '-_' : '+/';

    let byteLength    = bytes.byteLength;
    let byteRemainder = byteLength % 3;
    let mainLength    = byteLength - byteRemainder;

    let a, b, c, d;
    let chunk = null;

    // Main loop deals with bytes in chunks of 3
    for (let i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048)   >> 12; // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032)     >>  6; // 4032     = (2^6 - 1) << 6
      d = chunk & 63;               // 63       = 2^6 - 1
      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
      chunk = bytes[mainLength];
      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2;
      // Set the 4 least significant bits to zero
      b = (chunk & 3)   << 4 // 3   = 2^2 - 1;
      base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
      a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008)  >>  4; // 1008  = (2^6 - 1) << 4
      // Set the 2 least significant bits to zero
      c = (chunk & 15)    <<  2; // 15    = 2^4 - 1
      base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }
    return base64;
  }

  _Uint8arrayToStr(buf) {
    return String.fromCharCode.apply(null, buf);
  }

  _round(number, precision) {
      let factor = Math.pow(10, precision);
      let tempNumber = number * factor;
      let roundedTempNumber = Math.round(tempNumber);
      return roundedTempNumber / factor;
  }

  _convertStringToArrayBufferView (str) {
      let bytes = new Uint8Array(str.length);
      for (let iii = 0; iii < str.length; iii++)
      {
          bytes[iii] = str.charCodeAt(iii);
      }

      return bytes;
  }

  _convertArrayBufferViewtoString (buffer) {
      let str = "";
      for (let iii = 0; iii < buffer.byteLength; iii++)
      {
          str += String.fromCharCode(buffer[iii]);
      }

      return str;
  }

  /**
  * @returns a Promise that resolves to a String
  */  
  _decrypt_data (algorithm, vector, key, encrypted_data) {
    // console.log("_decrypt_data",algorithm, vector, key, encrypted_data);
    return window.crypto.subtle.decrypt({name: algorithm, iv: vector}, key, encrypted_data).then((result) => {
      return this._convertArrayBufferViewtoString(new Uint8Array(result));
    });
  }

  /**
  * @returns a Promise that resolves to a Uint8Array
  */  
  _encrypt_data(algorithm, vector, key, data) {
    console.log("_encrypt_data", algorithm, vector, key, data);
      return window.crypto.subtle.encrypt({name: algorithm, iv: vector}, key, this._convertStringToArrayBufferView(data))
      .then(function(result){
        return new Uint8Array(result);
      });
  }
  /**
  * Encrypt a list of Strings.
  * @param list [array] A list of strings
  * @param passphrase [string] A key used to encrypt the strings
  * @param args [object] An optional set of encryption arguments
  *   @element alg [string] The encryption algorithm to be used
  *     (default to config.ALG which is normally "AES-CBC")
  *   @element digest [string] The key digest algorithm to be used
  *     (default to config.DIGEST which is normally "SHA-256")
  *   @element iv [array] The initial vector to be used during encryption
  *     (default to config.MAGIC_IV)
  *
  * @return A Promise that resolves to an object containing non-default
  * encryption arguments and an encrytped array of strings called "coins"
  */  
  encryptCoins(list, passphrase, args, crypto=null) {
    const {
      debug,
      CRYPTO,
    } = this.config;

    if (debug) {
      console.log("WalletBF.encryptCoins", list, passphrase, args, crypto);
    }

    if (crypto == null) {
      crypto = this._getCryptoFromArray(list);
    }

    if (passphrase === null || passphrase === undefined || passphrase.length==0) {
      return Promise.reject(Error("Passphrase is empty"));
    }

    let result = $.extend({}, args);
    result[crypto] = {
      coins: [],
      encrypted: true,
    };

    let localArgs = $.extend({
      alg: this.config.ALG,
      digest: this.config.DIGEST,
      iv: window.crypto.getRandomValues(new Uint8Array(16))
    }, args);

    result[crypto].iv = this._Uint8ArrayToBase64(localArgs.iv);
    let textBuffer = new TextEncoder().encode(passphrase);
    
    return window.crypto.subtle.digest(localArgs.digest, textBuffer).then((digest) => {
      let byteBuffer = new Uint8Array(digest);
      let digestBuffer = "";
      for (let i=0; i< digest.byteLength; i++) {
        digestBuffer += (byteBuffer[i]+" ");
      }
      return window.crypto.subtle.importKey("raw", digest, {
        name: localArgs.alg,
      }, false, ["encrypt"]);
    }).then((key) => {
      let coins = [];
      list.forEach((elt) => {
        const {
          alg,
          iv,
        } = localArgs;
        let coinCode = typeof elt == "string" ? elt : elt.base64;
        coins.push(this._encrypt_data(alg, iv, key, coinCode));
      });
      return Promise.all(coins);
    }).then((encryptedCoins) => {
      encryptedCoins.forEach((elt) => {
        result[crypto].coins.push(btoa(this._Uint8arrayToStr(elt)));
      });
      return result;
    });
  }

  /**
  * Decrypt an encrypted array of Strings (i.e Base64 encoded Coins).
  * @param wrapper [object] An object containing an array of strings called "coins" and optionally a set of non-default arguments used during encryption. 
  * @param passphrase [string] The key used to encrypt the strings
  * @return An array of plain-text Strings
  */  
  decryptCoins(wrapper, passphrase) {
    // console.log(wrapper,passphrase);
    const {
      ALG,
      DIGEST,
    } = this.config;

    let localArgs = Object.assign({
      alg: ALG,
      digest: DIGEST,
    }, wrapper);

    let iv = this._Base64ToUint8Array(wrapper.iv);
    passphrase = new TextEncoder().encode(passphrase);

    return window.crypto.subtle.digest(localArgs.digest, passphrase).then((response) => {
      // Returns the digest
      return window.crypto.subtle.importKey("raw", response, {
        name: localArgs.alg,
      }, false, ["decrypt"]);
    }).then((key) => {
      let coins = [];
      wrapper.coins.forEach((elt) => {
        let b64 = this._Base64ToUint8Array(elt);
        coins.push(this._decrypt_data(localArgs.alg, iv, key, b64));
      });
      return Promise.all(coins);
    });
  }

}//end of class 

/**
 * Performs a binary search on the host array. This method can either be
 * injected into Array.prototype or called with a specified scope like this:
 * binaryIndexOf.call(someArray, searchElement);
 *
 * @param {*} searchElement The item to search for within the array.
 * @return {Number} The index of the element which defaults to -1 when not found.
 */
function binaryIndexOf(searchElement) { console.log("binaryIndexOf",searchElement, this.length);
  'use strict';

  let minIndex = 0;
  let maxIndex = this.length - 1;
  let currentIndex;
  let currentElement;
  let resultIndex;

  while (minIndex <= maxIndex) {
    resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
    currentElement = this[currentIndex].s;

    if (currentElement < searchElement) {
      minIndex = currentIndex + 1;
    }
    else if (currentElement > searchElement) {
      maxIndex = currentIndex - 1;
    }
    else {
      return currentIndex;
    }
  }

  return ~maxIndex;
}

/*
Array.prototype.binaryIndexOf = binaryIndexOf;
let arr = [0, 1, 2, 4, 5, 6, 6.5, 7, 8, 9];
arr.splice(Math.abs(arr.binaryIndexOf(3)), 0, 3);
document.body.textContent = JSON.stringify(arr);
*/
