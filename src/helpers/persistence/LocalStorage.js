import { encrypt, decrypt } from './Encrypt';

export default class LocalStorage {
  constructor() {
    // this.storage = window.$.jStorage;
    this.storage = localStorage;
    this.root = "__be_wallet_lstorage__";
    this.encrypt = false;
    this.encryption = "";

    // previous version migration
    let wallet = localStorage.getItem("jStorage");
    if (wallet) {
      wallet = JSON.parse(wallet);
      delete wallet.__jstorage_meta;
      this._setWallet(wallet);
      localStorage.removeItem("jStorage");
      localStorage.removeItem("jStorage_update");
    }
  }

  clean() {
    localStorage.removeItem(this.root);
  }

  // Called when login
  setPassword(pwd="") {
    this.encryption = pwd;
    if (!this._getWallet()) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  // Called in settings
  setPasswordAndUpdate(pwd="") {
    const oldWallet = this._getWallet();
    this.encrypt = pwd != "";
    this.encryption = pwd;
    this._setWallet(oldWallet);
    return Promise.resolve(true);
  }

  needsAuthentication() {
    const wallet = JSON.parse(this.storage.getItem(this.root));
    if (!wallet) {
      return Promise.resolve(false);
    }
    const keys = Object.keys(wallet);
    this.encrypt = keys.indexOf("iv") > -1 && keys.indexOf("cipher") > -1;
    return Promise.resolve(this.encrypt);
  }

  _readWallet() {
    return Promise.resolve(true);
  }

  sessionStart(action, device, timeout) {
    return Promise.resolve(true);
  }

  sessionEnd() {
    return Promise.resolve(true);
  }

  flush() {
    return Promise.resolve(true);
  }

  _getWallet() {
    let wallet = this.storage.getItem(this.root);

    if (!wallet) {
      return {};
    }

    if (this.encrypt) {
      wallet = decrypt(wallet, this.encryption);
    }
    return JSON.parse(wallet);
  }

  _setWallet(wallet) {
    let result = JSON.stringify(wallet);
    if (this.encrypt) {
      result = encrypt(result, this.encryption);
    }
    try {
      return this.storage.setItem(this.root, result);
    }
    catch (e) {
      console.log("Local storage is full");
      throw new Error(e.message);
    }
  }

  set(key, value) {
    let wallet = this._getWallet();
    wallet[key] = value;
    return Promise.resolve(this._setWallet(wallet))
  }

  get(key, def) {
    let wallet = this._getWallet();
    return wallet[key] || def;
  }

  deleteKey(key) {
    let wallet = this._getWallet();
    const value = wallet[key];
    delete wallet[key];
    return value;
    //return Promise.resolve(this._setWallet(wallet));
  }
}
