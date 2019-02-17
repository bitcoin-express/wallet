import Tools from './Tools';
import GoogleDrive from './persistence/GoogleDrive';
import LocalStorage from './persistence/LocalStorage';

/**
 * A thin wrapper to hide the variations between persistence services.
 */

export const PERSISTENCE_TYPES = ['localStorage', 'googleDrive'];

export default class Persistence {

  constructor(handleDataLocked, defaultSettings) {

    if (!handleDataLocked) {
      throw new Error('No handleDataLocked in Persistence');
      return;
    }

    if (typeof handleDataLocked != 'function') {
      throw new Error('handleDataLocked is not a function in Persistence');
      return;
    }

    this.config = {
      type: 'localStorage',
      version: 'v0.2.0',
      lastUpdate: '2017-12-20'
    };

    this.gdrive = new GoogleDrive(handleDataLocked, defaultSettings);
    this.lstorage = new LocalStorage();

    this.tools = new Tools();

    this.needsAuthentication = this.needsAuthentication.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.setPasswordAndUpdate = this.setPasswordAndUpdate.bind(this);
  }

  setType(type) {
    if (PERSISTENCE_TYPES.indexOf(type) == -1) {
      throw new Error('Persistence type not defined');
      return;
    }

    this.config.name = type;
    switch (type) {
      case 'localStorage':
        this.storage = this.lstorage;
        break;
      case 'googleDrive':
        this.storage = this.gdrive;
        break;
    }
  }

  readWallet() {
    return this.storage._readWallet();
  }

  sessionStart(action, device, timeout=30000) {
    if (!device) {
      device = this.tools.getBrowserName();
    }
    return this.storage.sessionStart(action, device, timeout);
  }

  sessionEnd() {
    return this.storage.sessionEnd();
  }

  flush() {
    return this.storage.flush();
  }

  setPassword(pwd="") {
    return this.storage.setPassword(pwd);
  }

  needsAuthentication() {
    return this.storage.needsAuthentication();
  }

  setPasswordAndUpdate(pwd="") {
    return this.storage.setPasswordAndUpdate(pwd);
  }

  //Container access setTo, getFrom and removeFrom
  /**
  * Persist the named element into the named container.
  * If the container does not exit, it will be created.
  * This will overwrite any element with the same key.
  */
  setTo(container, key, el) {
    var cont = this.get(container);
    if(!this.isPlainObject(cont)) {
      cont = new Object();
    }
    var old = cont[key];
    cont[key] = el;
    this.set(container, cont);
    return old;
  }

  setToPromise(container, key, el) {
    var cont = this.get(container);
    if (!this.isPlainObject(cont)) {
      cont = new Object();
    }
    var old = cont[key];
    cont[key] = el;
    return this.set(container, cont);
  }

  getFrom(container, key) {
    var cont = this.get(container);
    if(!this.isPlainObject(cont)) {
      return null;
    }
    return cont[key];
  }

  removeFrom(container, key) {
    // delete an object from a container and return it
    var cont = this.get(container);

    if (!this.isPlainObject(cont)) {
      cont = new Object();
    }

    var el = cont[key];
    if (el !== null) {
      delete cont[key];
      return this.set(container, cont);
    }

    return Promive.resolve(el);
  }

  set(key, value, subkey = null) {
    if (subkey != null) {
      let obj = this.storage.get(key);
      obj[subkey] = value;
      value = obj;
    }

    return this.storage.set(key, value);
  }

  get(key, def) {
    return this.storage.get(key, def);
  }

  P_get	(key, def) {
    return Promise.resolve(this.storage.get(key, def));
  }

  // delete an object from storage and return it
  remove(key) {
    var obj = this.get(key);
    this.storage.deleteKey(key);
    return obj;
  }

  // delete an object from storage and return it
  P_remove(key, subkey = null) {
    if (subkey != null) {
      let obj = this.storage.get(key);
      delete obj[subkey];
      return this.set(key, obj);
    }
    return Promise.resolve(this.storage.deleteKey(key));
  }

  // delete the indexed element of an array and return it
  // or null if not found
  removeArrayElement(key, index) {
    var list = this.get(key);
    if (list !== null && Array.isArray(list)) {
      var el = list.splice(index, 1)[0];
      this.set(key, list);
      return el;
    }
    return null;
  }

  // Removes all Coin objects in the toRemoveList from the stored Coin objects
  removeAllCoins(container, toRemoveList, crypto) {
    if (!crypto) {
      return Promise.reject(Error("removeAllCoins missing crypto string value"));
    }

    if (!Array.isArray(toRemoveList) || toRemoveList.length == 0) {
      return Promise.reject(Error("removeAllCoins only works with non-empty Coin arrays"));
    }

    var store = this.get(container, {});
    if (Object.keys(store).indexOf(crypto) == -1) {
      return Promise.reject(Error("removeAllCoins no list for this crypto currency"));
    }

    var list = store[crypto];
    var listLength = list.length;
    if (!Array.isArray(list) || list.length == 0) {
      let msg = "removeAllCoins only works with non-empty container arrays";
      return Promise.reject(Error(msg));
    }

    toRemoveList.forEach(function(el) {
      var base64 = el.base64 || el;
      list = list.filter(function(c) {
        if (typeof(c) !== 'string') {
          if ("base64" in c) {
            return c.base64 != base64;
          }
          return true;
        }
        return c != base64;
      });
    });

    if (listLength == list.length) {
      return Promise.resolve(true);
    }

    store[crypto] = list;
    return this.set(container, store);
  }

  //Add an element to the end of a named container array.
  //If the container doesn't yet exit, then create it.
  addToEnd(container, el, key=null) {
    return this.addAllToEnd(container, [el], key);
  }

  //Add an element to the beginning of a named container array.
  //If the container doesn't yet exit, then create it.
  addFirst(container, el, key=null) {
    return this.addAllFirst(container, [el], key);
  }

  //Add all elements of array to the end of the named container Array.
  //If the container doesn't yet exit, then create it.
  addAllToEnd(container, array, key=null) {
    return this._addAll(container, array, false, key);
  }

  //Add all elements of array to the beginning of the named container Array.
  //If the container doesn't yet exit, then create it.
  addAllFirst(container, array, key=null) {
    return this._addAll(container, array, true, key);
  }

  /*
   * Adds all elements of array to the container Array either at the
   * beginning (if first is true), otherwise the end.
   * If the container doesn't yet exit, then create it.
   */
  _addAll(container, arr, first, key) {

    if (!Array.isArray(arr) || arr.length === 0) {
      return Promise.resolve(false);
    }

    let def = new Array();
    if (key != null) {
      def = {};
    }

    let store = this.get(container, def);
    let list = store;

    if (key != null) {
      list = list[key] || new Array();
    }
    list = first ? arr.concat(list) : list.concat(arr);

    if (key != null) {
      store[key] = list;
      return this.set(container, store);
    }

    return this.set(container, list);
  }

  // Given an array of Coins (or base64 encoded coins), and a persistent container name,
  // add to the container all elements of the array that are NOT already present.
  // if @param extend = false return the number of coins added to the container array
  // if @param extend = true return the array of coins added to the container array
  addAllIfAbsent(container, coins, extend = false, crypto) {
    if (!crypto) {
      return Promise.reject(Error("addAllIfAbsent missing crypto string value"));
    }

    let defaultResult = 0;
    if (extend) {
      defaultResult = [];
    }

    if (!Array.isArray(coins) || coins.length == 0) {
      return Promise.resolve(defaultResult);
    }

    let store = this.get(container, {});
    if (Object.keys(store).indexOf(crypto) == -1) {
      store[crypto] = coins;
      return this.set(container, store).then(() => {
        if (extend) {
          return coins;
        }
        return coins.length;
      });
    }

    let existing = store[crypto];
    let newCoins = this._addAllIfAbsent(existing, coins);
    if (newCoins.length == 0) {
      return Promise.resolve(defaultResult);
    }

    store[crypto] = existing;
    return this.set(container, store).then(() => {
      if (extend) {
        return newCoins;
      }
      return newCoins.length;
    });
  }

  /*
   * Add all elements of the coins array to the existing array if the coins elements
   * are NOT already in existing.
   */
  _addAllIfAbsent(existing, coins) {
    let newCoins = new Array();
    if (Array.isArray(coins) && coins.length > 0) {
      coins.forEach((elt) => {
        //to test equality the base64 strings are compared
        //finally the coin is stored in the format that is sent as
        //this may contain additional elements such as 'reference' etc.
        var coinToAdd = elt;
        if (this.isPlainObject(elt) && "base64" in elt) {
          coinToAdd = elt.base64;
        }

        var exists = existing.find((element) => {
          var existingCoin = element;
          if (this.isPlainObject(element) && "base64" in element) {
            existingCoin = element.base64;
          }
          return existingCoin === coinToAdd;
        });

        if(typeof(exists) === 'undefined') {
          existing.push(elt);
          newCoins.push(elt);
        }
      });
    }
    return newCoins;
  }

  localStorageSupported() {
    try {
      return "localStorage" in window && window["localStorage"] !== null;
    } catch (e) {
      return false;
    }
  }

  isPlainObject(value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      return false;
    } else {
      var prototype = Object.getPrototypeOf(value);
      return prototype === null || prototype === Object.prototype;
    }
  }
}
