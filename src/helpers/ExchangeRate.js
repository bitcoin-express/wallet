import Time from "./Time";

export default class ExchangeRate {

  constructor(currency="USD") {
    // blockchain.info
    this.exchangeRateSource = "coinmarketcap.com";
    this.exchangeRateURL = {
      // BTC: "https://blockchain.info/ticker",
      OTHER_EUR: "https://api.coinmarketcap.com/v1/ticker/?convert=EUR",
      OTHER_GBP: "https://api.coinmarketcap.com/v1/ticker/?convert=GBP",
    };

    this.currencies = ["USD", "GBP", "EUR"];
    this.currency = currency;
    this.separator = ".";

    this.btcdisplay = "BTC";
    this.currdisplay = ["BTC", "ETH", "BTG", "BCH", "CRT"];

    this.time = new Time();

    const initialRate = {
      time: {
        updated: null,
        updatedUK: null,
      },
      USD: {
        code: "USD",
        symbol: "$",
        symbolCent: "¢",
        entity: "&#36;",
        word: "US dollar",
        rate: null
      },
      GBP: {
        code: "GBP",
        symbol: "£",
        symbolCent: "p",
        entity: "&pound;",
        word: "British pound",
        rate: null
      },
      EUR: {
        code: "EUR",
        symbol: "€",
        symbolCent: "¢",
        entity: "&euro;",
        word: "Euro",
        rate: null
      }
    };

    this.rates = {
      XBT: JSON.parse(JSON.stringify(initialRate))
    };

    this.currdisplay.forEach((key) => {
      this.rates[key] = JSON.parse(JSON.stringify(initialRate));
    });

    this.getRates = this.getRates.bind(this);
    this.getLastUpdatedDate = this.getLastUpdatedDate.bind(this);
    this.getStringAmount = this.getStringAmount.bind(this);
    this.getBTCDisplay = this.getBTCDisplay.bind(this); 
    this.hasRate = this.hasRate.bind(this); 
    this.setBTCDisplay = this.setBTCDisplay.bind(this); 
    this.getExchangeRate = this.getExchangeRate.bind(this);
    this.refreshExchangeRates = this.refreshExchangeRates.bind(this);
  }

  getRates(ico="BTC") {
    if (ico == "XBT") {
      ico="BTC";
    }
    return this.rates[ico];
  }

  getLastUpdatedDate(ico="BTC", uk=false) {
    if (ico == "XBT") {
      ico="BTC";
    }
    if (uk) {
      return this.rates[ico].time.updatedUK;
    }
    return this.rates[ico].time.updated;
  }

  getExchangeRate(ico="BTC", refresh=false) {
    if (ico == "XBT") {
      ico="BTC";
    }

    let info = this.rates[ico][this.currency];
    if (!info.rate && !refresh) {
      return "not available";
    }
    if (!info.rate && refresh) {
      return this.refreshExchangeRates().then(() => {
        info = this.rates[ico][this.currency];
        return `${info.symbol}${parseFloat(info.rate).toFixed(2)}`;
      }).catch(() => {
        return "not available";
      });
    }
    return `${info.symbol}${parseFloat(info.rate).toFixed(2)}`;
  }

  refreshExchangeRates() {
    let arrPromises = [];
    const timeout = 30;
    const keys = ["bitcoin", "bitcoin-cash", "bitcoin-gold", "ethereum"];

    // Fees in EUR and USD
    arrPromises.push(new Promise((resolve, reject) => {
      $.ajax({
        url: this.exchangeRateURL.OTHER_EUR,
        type: "GET",
        accepts: { json: "application/json" },
        contentType: "text/plain",
        dataType: "json",
        timeout: timeout * 100,
        async: true,
        success: (response) => {
          const now = new Date();

          response.filter((c) => {
            return keys.indexOf(c.id) > -1;
          }).forEach((currency) => {
            switch(currency.id) {
              case "bitcoin":
                this.rates.BTC.EUR.rate = currency["price_eur"];
                this.rates.BTC.USD.rate = currency["price_usd"];
                this.rates.XBT.EUR.rate = currency["price_eur"];
                this.rates.XBT.USD.rate = currency["price_usd"];
                this.rates.BTC.time.updated = now;
                this.rates.XBT.time.updated = now;
                break;

              case "bitcoin-cash":
                this.rates.BCH.EUR.rate = currency["price_eur"];
                this.rates.BCH.USD.rate = currency["price_usd"];
                this.rates.BCH.time.updated = now;
                break;

              case "bitcoin-gold":
                this.rates.BTG.EUR.rate = currency["price_eur"];
                this.rates.BTG.USD.rate = currency["price_usd"];
                this.rates.BTG.time.updated = now;
                break;

              case "ethereum":
                this.rates.ETH.EUR.rate = currency["price_eur"];
                this.rates.ETH.USD.rate = currency["price_usd"];
                this.rates.ETH.time.updated = now;
                break;
            }
          });
          resolve(true);
        },
        error: (xhr, status, err) => {
          reject(err);
        }
      });
    }));

    // Fees in GBP
    arrPromises.push(new Promise((resolve, reject) => {
      $.ajax({
        url: this.exchangeRateURL.OTHER_GBP,
        type: "GET",
        accepts: { json: "application/json" },
        contentType: "text/plain",
        dataType: "json",
        timeout: timeout * 100,
        async: true,
        success: (response) => {
          const now = new Date();

          response.filter((c) => {
            return keys.indexOf(c.id) > -1;
          }).forEach((currency) => {
            switch(currency.id) {
              case "bitcoin":
                this.rates.BTC.GBP.rate = currency["price_gbp"];
                this.rates.XBT.GBP.rate = currency["price_gbp"];
                this.rates.BTC.time.updatedUK = now;
                this.rates.XBT.time.updatedUK = now;
                break;

              case "bitcoin-cash":
                this.rates.BCH.GBP.rate = currency["price_gbp"];
                this.rates.BCH.time.updatedUK = now;
                break;

              case "bitcoin-gold":
                this.rates.BTG.GBP.rate = currency["price_gbp"];
                this.rates.BTG.time.updatedUK = now;
                break;

              case "ethereum":
                this.rates.ETH.GBP.rate = currency["price_gbp"];
                this.rates.ETH.time.updatedUK = now;
                break;
            }
          });
          resolve(true);
        },
        error: (xhr, status, err) => {
          reject(err);
        }
      });
    }));

    return Promise.all(arrPromises).then(() => {
      this.updatedTime = this.time.formatDate(new Date(), true, true); 
      return true;
    }).catch((err) => {
      return new Error("Can't get response from coinmarketcap");
    });
  }

  hasRate(ico="BTC") {
    if (this.currency == "GBP") {
      return this.rates[ico].time.updatedUK != null;
    }
    return this.rates[ico].time.updated != null;
  }

  get(value, precision=2, ico="BTC") {
    let { symbol } = this.rates[ico][this.currency];
    let { time } = this.rates[ico];

    let updated = null;
    if (time) {
      updated = time.updated;
      if (this.currency == "GBP") {
        updated = time.updatedUK;
      }
    }

    if (!value || value == 0.0) {
      return `${symbol}0${this.separator}00`;
    }

    if (!updated) {
      return "not available";
    }

    value = this.getFloat(value, 4, ico);
    if (Math.abs(value) < 0.1) {
      value = this._round(value * 100, precision);
      symbol = this.rates[ico][this.currency].symbolCent;
      return this.getStringAmount(value, false) + symbol;
    }
    return symbol + value.toFixed(precision).toString().replace(".", this.separator);
  }

  getFloat(value, precision=2, ico="BTC") {
    return this._round(value * this.rates[ico][this.currency].rate, precision);
  }

  getStringAmount(value, isBitcoin=true) {

    // when no value provided
    if (!value || value == 0.0) {
      if (isBitcoin && this.btcdisplay.startsWith('m')) {
        return `0${this.separator}00000`;
      } else if (isBitcoin && this.btcdisplay.startsWith('&mu;')) {
        return `0${this.separator}00`;
      } else if (isBitcoin) {
        return `0${this.separator}00000000`;
      }
      return `0${this.separator}00`;
    }

    value = parseFloat(value);
    if (isBitcoin && this.btcdisplay.startsWith('m')) {
      value = (value * 1000).toFixed(5);
    } else if (isBitcoin && this.btcdisplay.startsWith('&mu;')) {
      value = (value * 1000000).toFixed(2);
    } else if (isBitcoin) {
      value = value.toFixed(8);
    }

    // replace separator
    return value.toString().replace(".", this.separator);
  }

  getCurrencySymbol(ico="BTC") {
    return this.rates[ico][this.currency].symbol;
  }

  getCurrencyCentSymbol(ico="BTC") {
    return this.rates[ico][this.currency].symbolCent;
  }

  getCurrencyWord(ico="BTC") {
    return this.rates[ico][this.currency].word;
  }

  setCurrency(currency) {
    this.currency = currency;
  }

  setSeparator(separator) {
    this.separator = separator;
  }

  setBTCDisplay(display, code="BTC") {
    this.btcdisplay = display;

    switch(code) {
      case "BTC":
        this.currdisplay[0] = display;
        break;
      case "XBT":
        this.currdisplay[0] = display;
        break;
      case "ETH":
        this.currdisplay[1] = display;
        break;
      case "BTG":
        this.currdisplay[2] = display;
        break;
      case "BCH":
        this.currdisplay[3] = display;
        break;
      case "CRT":
        this.currdisplay[4] = display;
        break;
    }
  }

  getBTCDisplay(code="BTC") {
    let value = "";
    switch(code) {
      case "BTC":
        value = this.currdisplay[0];
        break;
      case "XBT":
        value = this.currdisplay[0];
        break;
      case "ETH":
        value = this.currdisplay[1];
        break;
      case "BTG":
        value = this.currdisplay[2];
        break;
      case "BCH":
        value = this.currdisplay[3];
        break;
      case "CRT":
        value = this.currdisplay[4];
        break;
    }

    return this._decodeHtml(value);
  }

  _decodeHtml(html) {
    let txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  _round(number, precision) {
    // TO_DO _round is same function in WalletBF.js, create a helper for
    // number calculations including _round and import in every desired class.
    let factor = Math.pow(10, precision);
    let tempNumber = number * factor;
    let roundedTempNumber = Math.round(tempNumber);
    return roundedTempNumber / factor;
  }
}
