/**
 * Declare the user's intent to deposit a standard Bitcoin with the
 * Bitcoin-fast Issuer.
 *
 * The Issuer will return a Bitcoin address for the user to send funds.
 * If the 'args.target' value is defined and is > zero the Issuer
 * will indicate how many confirmations are required before the fast
 * coin will be available for collection.
 *
 * Finally, either 'success' or 'args.failure' will be called with an
 * issuerResponse parameter to indicate the Bitcoin address or reason
 * for failure.
 *
 * This is typically the first part of a three part process; intent,
 * marshall, collect.
 *
 * @param success [function] The function to be called when the Bitcoin
 *   address is available.
 *
 * @param args [object] Optional Arguments:
 *   @element target [string] The decimal target value if the deposit
 *     amount is known.
 *   @element domain [string] The Issuer's domain. If domain is
 *     undefined the default Issuer will be used.
 *   @element timeout [integer] The number of seconds this function
 *     should wait for the server to respond. 
 */
export function depositIntent(args) {
  const {
    debug,
    storage,
  } = this.config;

  if (!storage) {
    return Promise.reject(Error("Persistent storage has not been installed"));
  }
  
  let params = {
    issuerRequest: {
      fn: "issue"
    }
  };

  if (typeof(args.target) === 'string' && args.target) {
    params.issuerRequest.targetValue = args.target;
  }

  // TO_DO - Do we need it?
  let email = this._fillEmailArray(parseFloat(args.target), true, "XBT");
  if (email) {
    params.issuerRequest.expiryEmail = email;
  }

  if (debug) {
    console.log("WalletBF.depositIntent", params, args);
  }

  if (!params.issuerRequest.currency) {
    params.issuerRequest.currency = "XBT";
  }

  let beginResponse;
  const startSession = (response) => {
    beginResponse = response;
    if (!response.issueInfo) {
      throw new Error(response.status);
    }
    if (email) {
      beginResponse.expiryEmail = email;
    }
    return storage.sessionStart("Deposit intent");
  };

  // We persist the Issuer response so that coins can
  // be collected once the funds have been transferred
  const storeDepositReference = () => {
    if (debug) {
      console.log('depositIntent', beginResponse);
    }
    return this.setDepositRef(beginResponse);
  }

  return this.issuer("begin", params, args)
    .then(startSession)
    .then(storeDepositReference)
    .then(() => storage.sessionEnd())
    .then(() => beginResponse);
}


/************************************************************
 * The deposit reference holds the response of the Issuer and
 * includes the 'tid' and number of 'confirmations' and expiry.
 * It is held in persistent storage and will be included in
 * any backup and recovered when WalletBF recovery() is called.
 * Use set, get and removeDepositRef to manage this value. 
 */
export function setDepositRef(obj) {
  const {
    debug,
    DEPOSIT,
  } = this.config;

  if (debug) {
    console.log("WalletBF setDepositRef", obj);
  }

  let list = this.getPersistentVariable(DEPOSIT);
  if (!Array.isArray(list)) {
    list = new Array();
  }
  list.unshift(obj);

  return this.setPersistentVariable(DEPOSIT, list)
    .then(() => obj);
}


export function getDepositRef() {
  const {
    debug,
    DEFAULT_ISSUER,
    DEPOSIT,
    storage,
  } = this.config;

  if (debug) {
    console.log("WalletBF getDepositRef");
  }

  if (!storage) {
    return Promise.resolve(null);
  }

  const homeIssuer = this.getSettingsVariable(DEFAULT_ISSUER);
  const list = this.getPersistentVariable(DEPOSIT);
  if (!Array.isArray(list) || list.length == 0 || list[0].complete) {
    return Promise.resolve(null);
  }

  let {
    expiry,
  } = list[0].headerInfo;
  expiry = new Date(expiry);

  // Remove reference
  if (expiry < new Date()) {
    return this.removeDepositRef()
      .then(() => null);
  }
  let depositReference = list[0];
  const { domain } = depositReference.headerInfo;
  depositReference["isDefaultIssuer"] = domain == homeIssuer;
  return Promise.resolve(depositReference);
}


export function getDepositRefList() {
  return this.getPersistentVariable(this.config.DEPOSIT);
}


export function removeDepositRef(coin = null, inSession = true) {
  const {
    DEPOSIT,
    storage,
  } =  this.config;

  if (!storage) {
    return null;
  }

  const removeReference = () => {
    let list = this.getPersistentVariable(DEPOSIT);
    if (Array.isArray(list) && list.length > 0) {
      let obj = list[0];
      delete obj.issuer; // free space
      obj.coin = coin;
      obj.complete = true;
      list[0] = obj;
    }
    return this.setPersistentVariable(DEPOSIT, list);
  };

  if (!inSession) {
    return removeReference();
  }

  const action = "Remove deposit reference";
  return storage.sessionStart(action)
    .then(removeReference)
    .then(() => storage.sessionEnd())
    .then(() => true);
}

export function removeFromDepositStore(transactionId) {
  const {
    DEPOSIT,
    storage,
  } =  this.config;

  if (!storage) {
    return null;
  }

  let list = this.getPersistentVariable(DEPOSIT);
  const removeReference = () => {
    if (Array.isArray(list) && list.length > 0) {
      list = list.filter((deposit) => {
        return deposit.id != transactionId;
      });
      return this.setPersistentVariable(DEPOSIT, list);
    }
    return Promise.resolve(true);
  };

  const action = "Remove deposit history reference";
  return storage.sessionStart(action)
    .then(removeReference)
    .then(() => storage.sessionEnd())
    .then(() => list);
}
