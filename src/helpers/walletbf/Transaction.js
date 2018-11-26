import Time from '../Time'

export default class Transaction {

  constructor (resp, balance, info = {}) {
    const response = JSON.parse(JSON.stringify(resp));
    const now = new Date();
    const time = new Time();

    const currency = info.currency || "XBT";
    delete info.currency;

    this.history = {
      id: this._generateUUID(),
      balance: this._number(balance),
      date: now.toISOString(),
      action: response.headerInfo.fn,
      domain: response.headerInfo.domain,
      currency,
      info: {},
    };

    this.history.str_filter = `${this._number(this.history.balance)} ${this.history.action} `; 
    this.history.str_filter += `${time.formatDate(now, true)} ${this.history.domain} `;
    this.history.str_filter += `${time.formatHistoryDate(now)} `;

    delete response.headerInfo;
    delete response.status;

    if (response.coin) {
      this.history.info.totalCoins = response.coin.length;
      delete response.coin;
    }

    if (response.error) {
      this.history.error = response.error;
      delete response.error;
    }

    if (response.other) {
      Object.keys(response.other).forEach((key) => {
        this.history.info[key] = response.other[key];
      });
      delete response.other;
    }

    this.type = Object.keys(response)[0];
    this.response = response[this.type];

    // record the fee
    if (!this.response.fee) {
      this.response.fee = this.response.totalFee;
    }

    this._recordTransation = this._recordTransaction.bind(this);
    this._recordTransation();
  }

  get() {
    return this.history;
  }

  _generateUUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  _number(value) {
    return parseFloat(value || "0").toFixed(8);
  }

  /**
   * Face value is the value written in the coins used for this transaction.
   * Actual value is the value of the coins as reported by the Issuer.
   * New value is the value of how affect the transaction in the balance.
   */
  _recordTransaction() {
    let {
      faceValue,
      actualValue,
      newValue,
      comment,
      fee,
      reference,
      issuePolicy,
    } = this.response;

    let args = {
      issuer: {
        faceValue: this._number(faceValue || 0),
        actualValue: this._number(actualValue || 0),
        newValue: this._number(newValue || 0),
        fee: this._number(fee || 0),
      },
    };

    if (comment) {
      args.comment = comment;
    }
    if (reference) {
      args.issuer.reference = reference;
    }
    if (issuePolicy) {
      args.issuer.issuePolicy = issuePolicy;
    }

    switch (this.type) {

      case "exportInfo":
        this.history.type = "export";
        break;

      case "importInfo":
        this.history.type = "import";
        break;

      case "redeemInfo":
      case "issueInfo":
        this.history.type = this.type == "issueInfo" ? "issue" : "redeem";
        let {
          blockchainAddress,
          blockchainFee,
          blockchainTxid,
          blockchainRef,
          issueValue,
          lostValue,
        } = this.response;

        blockchainFee = parseFloat(blockchainFee || 0);
        issueValue = parseFloat(issueValue || 0);
        lostValue = parseFloat(lostValue || 0);

        this.history.info.blockchainFee = this._number(blockchainFee);
        this.history.info.lostValue = this._number(lostValue);

        if (this.type == "issueInfo") {
          args.issuer.actualValue = this._number(issueValue + lostValue);
          args.issuer.faceValue = this._number(issueValue + lostValue);
          // this._number(actualValue + blockchainFee);
          args.issuer.newValue = this._number(issueValue);
          args.issuer.fee = "0.00000000";
        }

        if (blockchainTxid) {
          this.history.info.blockchainTxid = blockchainTxid;
        }
        if (blockchainRef) {
          this.history.info.blockchainRef = blockchainRef;
        }
        if (blockchainAddress) {
          this.history.info.blockchainAddress = blockchainAddress;
        }
        break;

      case "verifyInfo":
        const {
          verifiedValue,
        } = this.response;

        this.history.type = "verify";
        args.issuer.verifiedValue = this._number(verifiedValue);
        break;

      case "expiredInfo":
        this.history.type = "expired";
        break;

      case "walletInfo":
        this.history.type = "wallet";
        break;

      case "paymentInfo":
        this.history.type = "payment";
        break;
    }

    this.history.str_filter += `${args.issuer.faceValue} ${args.issuer.actualValue} `;
    this.history.str_filter += `${args.issuer.fee} `; 
    Object.assign(this.history, args);
  }
}
