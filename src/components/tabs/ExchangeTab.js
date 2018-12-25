import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import LinearProgress from 'material-ui/LinearProgress';

import BitcoinCurrency from '../BitcoinCurrency';
import Button from '../Button';
import CoinSelector from '../CoinSelector';
import CurrencyItem from './exchange/CurrencyItem';
import ExchangeInfo from './exchange/ExchangeInfo';
import ExchangeTypeSelector from './exchange/ExchangeTypeSelector';
import HelpTooltip from '../HelpTooltip';
import RateLoader from './exchange/RateLoader';
import TimeCounter from './exchange/TimeCounter';

import SwapDialog from '../dialogs/SwapDialog';

import styles from '../../helpers/Styles';

class WaitingCounterparty extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      container: {
        margin: '30px 10px 15px 10px',
        textAlign: 'center',
      },
      linearProgress: {
        backgroundColor: styles.colors.mainTextColor,
        marginBottom: "30px",
        marginLeft: "30%",
        width: "40%",
      },
    };
  }

  render() {
    return <div style={ this.styles.container }>
      <p style={{
        color: '#434a63',
        fontFamily: 'Roboto, sans-serif',
      }}>
        Waiting for counterparty coins.
      </p>
      <LinearProgress
        mode="indeterminate"
        style={ this.styles.linearProgress }
        color="#8081ff"
      />
    </div>;
  }
}

class ExchangeTab extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: true,
      emailRecovery: true,
      expired: false,
      error: false,
      maxSelected: false,
      expiryTime: 60000 * 30, // 30min
      sourceCurrency: null,
      targetCurrency: null,
      source: 0,
      sourceKey: 1,
      target: 0,
      targetKey: 1,
      currencyBalances: {
        // TO_DO: initialze this info from wallet
        XBT: 0,
        BTG: 0,
        BCH: 0,
        ETH: 0,
        CRT: 0,
      },
      type: "issuer",
      issuerFee: 0,
      issuerService: null,
      lastModified: "source",
      ready: false,
      waitingToCollect: false,
    };

    // TO_DO: Get this info from wallet config
    this.currencies = {
      BTG: {
        name: "Bitcoin Gold",
        color: "#eba809",
        code: "BTG",
      },
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
    };

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);

    this.handleSourceChange = this.handleSourceChange.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleSourceCurrencyChange = this.handleSourceCurrencyChange.bind(this);
    this.handleTargetCurrencyChange = this.handleTargetCurrencyChange.bind(this);
    this.handleTypeChange = this.handleTypeChange.bind(this);

    // Click on buttons
    this.handleMaxClick = this.handleMaxClick.bind(this);
    this.handleConfirmClick = this.handleConfirmClick.bind(this);
    this.handleTimerClick = this.handleTimerClick.bind(this);
    this.handleCheckEmailRecovery = this.handleCheckEmailRecovery.bind(this);
    this.handleClickDownload = this.handleClickDownload.bind(this);

    this.getExpiredISOTime = this.getExpiredISOTime.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.refreshIssuerFee = this.refreshIssuerFee.bind(this);
    this.refreshRates = this.refreshRates.bind(this);
    this.updateBalances = this.updateBalances.bind(this);

    this.renderButtonsSection = this.renderButtonsSection.bind(this);
    this.getListTargetCurrencies = this.getListTargetCurrencies.bind(this);
    this.swapWithOther = this.swapWithOther.bind(this);
    this.getDeferredTransaction = this.getDeferredTransaction.bind(this);
  }

  componentDidMount() {
    const tx = this.getDeferredTransaction();
    if (!tx) {
      return;
    }

    const {
      tid,
      transaction,
    } = tx;

    const {
      args,
      issuerService,
    } = transaction;

    this.setState({
      waitingToCollect: true,
    });
    this.swapWithOther(args, issuerService, args.expiryTime, tid, false); 
  }

  componentWillReceiveProps(nextProps) {
    const {
      active,
      snackbarUpdate,
      wallet,
    } = nextProps;

    const {
      debug,
    } = wallet.config;

    this._initializeStyles(nextProps);

    if (active && !this.props.active) {

      if (this.state.issuerService != null) {
        this.updateBalances();
        return;
      }

      const handleInfoResponse = (resp) => {
        if (debug) {
          console.log("ExchangeTab. Issuer rates ok.");
          console.log(resp.issuer[0]);
        }

        this.setState({
          issuerService: resp.issuer[0],
          ready: true,
          errorRate: false,
        });

        return true;
      };

      const handleError = (err) => {
        if (debug) {
          console.log(err);
        }

        let msg = err.message || "Issuer problem, no response on getting rates";
        this.setState({
          errorRate: true,
        });
        snackbarUpdate(msg, true);
      };

      this.refreshRates(false)
        .then(() => this.updateBalances())
        .then(() => wallet.issuer("info", {}, null, "GET"))
        .then(handleInfoResponse)
        .catch(handleError);

      return;
    }
  }

  _initializeStyles(props) {
    this.styles = {
      area: {
        padding: '10px 20px',
        background: 'linear-gradient(white, #e2e9ff)',
        marginTop: '30px',
        borderRadius: '10px',
        minWidth: '290px',
        width: 'calc(50% - 60px)',
        boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
      },
      bitcoinButton: {
        background: styles.colors.mainBlack,
      },
      button: {
        minWidth: '250px',
        maxWidth: '400px',
      },
      buttonIcon: {
        color: styles.colors.mainTextColor,
      },
      buttonsSection: {
        margin: '30px 10px 15px 10px',
        textAlign: 'center',
      },
      checkbox: {
        width: 'initial',
        margin: 'auto',
      },
      checkboxContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        minWidth: '40%',
        maxWidth: '100%',
        margin: props.isFullScreen ? '30px 0 0 0' : '30px 20px 0 20px',
      },
      checkboxIcon: {
        fill: "rgba(0, 0, 0, 0.6)",
      },
      checkboxLabel: {
        width: 'initial',
        color: "rgba(0, 0, 0, 0.6)",
      },
      content: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        minWidth: '40%',
        maxWidth: '100%',
        margin: props.isFullScreen ? '0' : '0 20px',
      },
      currency: {
        display: 'inline-block',
        marginBottom: '5px',
      },
      errorContainer: {
        margin: '50px 10px 0 10px',
        textAlign: 'center',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '20px',
        color: styles.colors.mainTextColor,
      },
      exchangeInfo: {
        marginTop: '10px',
        color: props.isFullScreen ? styles.colors.secondaryBlue :
          styles.colors.mainTextColor,
        textAlign: 'right',
      },
      expirySelector: {
        display: 'flex',
        alignItems: 'center',
        textAlign: 'right',
        float: 'right',
        // marginRight: '30px',
      },
      label: {
        margin: '15px 0 20px 0',
        color: props.isFullScreen ? styles.colors.secondaryBlue :
          styles.colors.mainTextColor,
        fontFamily: 'Roboto, sans-serif',
        fontSize: '25px',
      },
      max: {
        margin: '15px 0',
        color: props.isFullScreen ? styles.colors.secondaryBlue :
          styles.colors.mainTextColor,
        textAlign: 'right',
      },
      maxButton: {
        color: styles.colors.mainTextColor,
        cursor: 'pointer',
        padding: "2px 10px",
        borderRadius: "10px",
        backgroundColor: styles.colors.secondaryBlue,
        verticalAlign: "top",
        marginRight: '5px',
        fontFamily: 'Roboto, sans-serif',
      },
      noFunds: {
        margin: '40px 10px',
        textAlign: 'center',
        color: styles.colors.mainTextColor,
      },
      section: {
        margin: props.isFullScreen ? '25px 10px' : '25px 0',
      },
      fee: {
        color: props.isFullScreen ? styles.colors.secondaryBlue :
          styles.colors.mainTextColor,
        verticalAlign: "top",
        marginRight: '5px',
        fontFamily: 'Roboto, sans-serif',
      },
      rate: {
        color: props.isFullScreen ? styles.colors.secondaryBlue :
          styles.colors.mainTextColor,
        fontFamily: 'Roboto, sans-serif',
        cursor: 'pointer',
        textDecoration: 'none',
        fontWeight: 'bold',
      },
      rateValue: {
        fontFamily: 'mono, monospace',
        cursor: 'pointer',
      },
      selectField: {
        height: '50px',
        minWidth: '250px',
        width: '100%',
      },
      tooltip: {
        verticalAlign: 'super',
        color: props.isFullScreen ? styles.colors.secondaryBlue :
          styles.colors.mainTextColor,
      },
    };
  }

  getDeferredTransaction() {
    const {
      wallet,
    } = this.props;

    const {
      COIN_SWAP,
      SESSION,
      storage,
    } = wallet.config;

    let coinSwap = storage.get(COIN_SWAP, {});
    if (Object.keys(coinSwap).length > 0) {
      const sessions = storage.get(SESSION);

      if (!sessions) {
        return null;
      }

      let tid, session;
      Object.keys(sessions).forEach((key) => {
        if (Object.keys(coinSwap).indexOf(key) > -1) {
          session = sessions[key];
          tid = key;
        }
      });

      if (!tid) {
        return null;
      }

      return {
        transaction: session,
        tid,
      };
    }
    return null;
  }


  refreshIssuerFee(source) {
    // source: modified the source textfield
    // target: modified the target textfield
    const {
      currencyBalances,
      emailRecovery,
      issuerService,
      sourceCurrency,
      type,
    } = this.state;

    const {
      wallet,
    } = this.props;

    source = parseFloat(source);

    if (source == 0) {
      return {
        disabled: true,
        errorSource: "",
        errorTarget: "",
        issuerFee: 0,
      };
    }

    let issuerFee = wallet.getVerificationFee(source, issuerService, emailRecovery);
    const sourceBalance = parseFloat(currencyBalances[sourceCurrency]);
    if (source + issuerFee > sourceBalance) {
      return {
        disabled: true,
        errorSource: "Not enough funds",
        errorTarget: "",
        issuerFee: this.fixedTo(issuerFee, 8),
      };
    }
    return {
      disabled: false,
      errorTarget: "",
      errorSource: "",
      issuerFee: this.fixedTo(issuerFee, 8),
    };
  }

  refreshRates(notify=true) {
    const {
      refreshIssuerRates,
      wallet,
    } = this.props;

    const {
      debug,
    } = wallet.config;

    const handleRateResponse = (response) => {
      const {
        currencies,
        sourceCurrencies,
      } = response;

      let state = {
        currencies: currencies.filter((curr) => {
          return Object.keys(this.currencies).indexOf(curr) != -1;
        }),
        sourceCurrencies: sourceCurrencies.filter((curr) => {
          return Object.keys(this.currencies).indexOf(curr) != -1;
        }),
      };

      let {
        expiry,
      } = response;

      if (typeof expiry == "object") {
        expiry = Object.values(expiry).map((d) => new Date(d).getTime());
        expiry = new Date(Math.min.apply(null, expiry)).toISOString();
      }
      state['initialCounter'] = expiry;

      this.setState(state);
      return expiry;
    };

    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }

      this.setState({
        disabled: true,
        error: true,
      });
    };

    return refreshIssuerRates(notify)
      .then(handleRateResponse)
      .catch(handleError);
  }

  resetForm(obj = {}, recover=false) {
    this.setState(Object.assign({
      source: 0,
      sourceInText: "",
      target: 0,
      targetInText: "",
      issuerFee: 0,
      disabled: true,
      errorTarget: "",
      errorSource: "",
      file: false,
    }, obj));

    if (recover) {
      this.revertSwap("reset");
    }
  }

  handleMaxClick() {
    const {
      currencyBalances,
      emailRecovery,
      issuerService,
      sourceCurrency,
      sourceKey,
    } = this.state;

    const{
      wallet,
    } = this.props;

    let value = parseFloat(currencyBalances[sourceCurrency]);
    value = value - wallet.getVerificationFee(value, issuerService, emailRecovery);
    let valueTxT = this.fixedTo(value * Math.pow(1000, sourceKey - 1), 8);

    this.handleSourceChange(value, sourceKey, valueTxT, true);
  }

  updateBalances() {
    const {
      wallet,
    } = this.props;

    const {
      currencies,
    } = this.state;

    if (!currencies) {
      return;
    }

    let promises = currencies.map((code) => {
      return wallet.Balance(code).then((balance) => {
        let {
          currencyBalances,
        } = this.state;

        currencyBalances[code] = parseFloat(balance);
        this.setState({
          currencyBalances,
        });

        if (balance == 0) {
          return null;
        }

        return {
          [code]: balance,
        };
      });
    });

    return Promise.all(promises).then((balances) => {
      let {
        sourceCurrency,
        targetCurrency,
      } = this.state;

      balances = balances.filter(b => b!= null);
      if (balances.length > 0) {
        balances = Object.assign({}, ...balances);
        if (!sourceCurrency || !balances[sourceCurrency]) {
          const sourceCurrencyCode = Object.keys(balances)[0];
          const match = currencies[0] == sourceCurrencyCode;
          this.setState({
            sourceCurrency: sourceCurrencyCode,
            targetCurrency: match ? currencies[1] : currencies[0],
          });
        }
      }
      return true;
    });
  }

  handleTimerClick() {
    const {
      snackbarUpdate,
      wallet,
    } = this.props;

    const {
      debug,
    } = wallet.config;

    const handleRateResponse = (expiry) => {
      const {
        lastModified,
        source,
      } = this.state;

      switch(lastModified) {

        case "source":
          const {
            source,
            sourceKey,
            sourceInText,
          } = this.state;
          this.handleSourceChange(source, sourceKey, sourceInText);
          break;

        case "target":
          const {
            target,
            targetKey,
            targetInText,
          } = this.state;
          this.handleTargetChange(target, targetKey, targetInText);
          break;
      }

      this.setState({
        disabled: source == 0,
        expired: false,
      });

      if (typeof expiry == "object") {
        expiry = Object.values(expiry).map((d) => new Date(d).getTime());
        return new Date(Math.min.apply(null, expiry)).toISOString();
      }
      return expiry;
    };

    const handleError = (err) => {
      if (debug) {
        console.log(debug);
      }

      const msg = "Can't refresh issuer rates";
      snackbarUpdate(err.message || msg, true);
    };

    return this.refreshRates()
      .then(handleRateResponse)
      .catch(handleError);
  }

  handleSourceCurrencyChange(event, key, payload) {
    let {
      currencies,
      targetCurrency,
    } = this.state;

    if (targetCurrency == payload || !targetCurrency) {
      targetCurrency = this.getListTargetCurrencies(payload)[0]
    }

    this.setState({
      source: 0,
      target: 0,
      issuerFee: 0,
      sourceInText: "",
      targetInText: "",
      disabled: true,
      sourceCurrency: payload,
      targetCurrency,
    });
  }

  handleTargetCurrencyChange(event, key, payload) {
    this.setState({
      targetCurrency: payload,
      source: 0,
      target: 0,
      issuerFee: 0,
      sourceInText: "",
      targetInText: "",
    });
  }

  handleSourceChange(source, currencyKey, sourceInText, maxSelected = false) {
    let {
      target,
      targetKey,
      targetInText,
      currencyBalances,
      type,
      expired,
      targetCurrency,
      sourceCurrency,
    } = this.state;

    const {
      exchangeRates,
    } = this.props;

    if (source == "" || sourceInText == "") {
      this.resetForm({
        sourceKey: currencyKey,
        maxSelected,
      });
      return;
    }

    source = parseFloat(source || "0");

    // If source higher than balance, nothing to do
    if (source > currencyBalances[sourceCurrency]) {
      this.setState({
        errorSource: "Not enough funds",
        maxSelected,
      });
      return;
    }

    if (type == "issuer") {
      const rate = exchangeRates[`${sourceCurrency}_${targetCurrency}`];
      source = parseFloat(source);
      target = this.fixedTo(source * rate, 8);
      targetInText = source * rate * Math.pow(1000, targetKey - 1);
      targetInText = this.fixedTo(targetInText, 8).toString();
    }

    this.setState({
      source,
      sourceInText,
      sourceKey: currencyKey,
      target,
      targetInText,
      errorTarget: "",
      errorSource: "",
      disabled: false,
      lastModified: "source",
      maxSelected,
    }, () => this.setState(this.refreshIssuerFee(source)));
  }

  fixedTo(num, precision) {
    if (String(num).indexOf("e-") !== -1) {
      return parseFloat(num).toFixed(precision);
    }
    return (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
  }

  handleTargetChange(target, currencyKey, targetInText) {
    let {
      source,
      sourceKey,
      sourceInText,
      currencyBalances,
      type,
      expired,
      targetCurrency,
      sourceCurrency,
    } = this.state;

    const {
      exchangeRates,
    } = this.props;

    if (target == "" || targetInText == "") {
      this.resetForm({
        targetKey: currencyKey,
        disabled: expired,
        maxSelected: false,
      });
      return;
    }

    target = parseFloat(target);
    source = parseFloat(source);

    if (type == "issuer") {
      const rate = exchangeRates[`${sourceCurrency}_${targetCurrency}`];
      source = this.fixedTo(target / rate, 8);
      sourceInText = target * Math.pow(1000, sourceKey - 1) / rate;
      sourceInText = this.fixedTo(sourceInText, 8).toString();
    }

    // If source higher than balance, nothing to do
    if (source > currencyBalances[sourceCurrency]) {
      this.setState({
        errorTarget: "You don't have enough funds",
        maxSelected: false,
      });
      return;
    }

    this.setState({
      target,
      targetInText,
      targetKey: currencyKey,
      source,
      sourceInText,
      errorTarget: "",
      errorSource: "",
      disabled: false,
      lastModified: "target",
      maxSelected: false,
    }, () => this.setState(this.refreshIssuerFee(source)));
  }

  handleTypeChange(ev, type) {
    if (type != "issuer") {
      let state = {
        type,
      };

      if (this.state.maxSelected) {
      }

      this.setState(state);
      return;
    }

    const {
      exchangeRates,
      snackbarUpdate,
      loading,
    } = this.props;

    loading(true);
    this.refreshRates(false).then(() => {
      const {
        source,
        targetCurrency,
        sourceCurrency,
      } = this.state;

      const rate = exchangeRates[`${sourceCurrency}_${targetCurrency}`];
      const targetInText = this.fixedTo(parseFloat(source) * rate, 8);
      loading(false);

      this.setState({
        disabled: false,
        target: parseFloat(source) * rate,
        targetInText,
        type,
      }, () => this.setState(this.refreshIssuerFee(source)));
    }).catch((err) => {
      loading(false);
      snackbarUpdate(err.message || "Error on loading exchange rates", true);
    });
  }

  handleConfirmClick() {
    let {
      currencies,
      currencyBalances,
      emailRecovery,
      expiryTime,
      issuerFee,
      issuerService,
      lastModified,
      maxSelected,
      source,
      sourceCurrency,
      targetCurrency,
      target,
      type,
    } = this.state;

    const {
      isFlipped,
      isFullScreen,
      loading,
      openDialog,
      refreshCoinBalance,
      showValuesInCurrency,
      snackbarUpdate,
      wallet,
      xr,
    } = this.props;

    const {
      debug,
    } = wallet.config;

    source = parseFloat(source);
    target = parseFloat(target);
    issuerFee = parseFloat(issuerFee);

    loading(true);
    const total = source + issuerFee;

    let args = {
      source: {
        sourceValue: source,
        sourceCurrency,
      },
      target: {
        targetValue: target,
        targetCurrency,
      },
      lastModified,
      emailRecovery,
      fee: issuerFee,
      maxSelected: maxSelected || total == currencyBalances[sourceCurrency],
    };

    switch (type) {

      case "issuer":

        let initialSourceBal; 
        const handleBalanceResponse = (response) => {
          initialSourceBal = response;
          return wallet.atomicSwap(args, issuerService);
        };

        const displayConfirmDialog = (response) => {
          const sourceChanged = this.fixedTo(response - initialSourceBal, 8);
          snackbarUpdate([
            `Change in balance ${sourceCurrency} ${sourceChanged}`,
            `New balance ${sourceCurrency}${response.toFixed(8)}`,
          ]);

          this.updateBalances();
          this.resetForm();
          loading(false);

          openDialog({
            showCancelButton: false,
            title: "Exchange Confirmed",
            body: <ExchangeInfo
              currSource={ this.currencies[sourceCurrency] }
              currTarget={ this.currencies[targetCurrency] }
              source={ this.fixedTo(total, 8) }
              target={ this.fixedTo(target, 8) }
              background="transparent"

              isFlipped={ isFlipped }
              isFullScreen={ isFullScreen }
              showValuesInCurrency={ showValuesInCurrency }
              wallet={ wallet }
              xr={ xr }
            />,
          });

          return refreshCoinBalance(targetCurrency);
        };

        const handleError = (err) => {
          if (debug) {
            console.log(err);
          }

          let msg = err.message || "Error on trying to swap with issuer";
          snackbarUpdate(msg, true);
          this.updateBalances();
          this.resetForm();
          loading(false);
        };

        refreshCoinBalance(sourceCurrency)
          .then(handleBalanceResponse)
          .then(({ swapInfo, coin }) => refreshCoinBalance(sourceCurrency))
          .then(displayConfirmDialog)
          .catch(handleError);

        break;

      case "person":
        this.swapWithOther(args, issuerService, this.getExpiredISOTime());
        break;
    }
  }

  swapWithOther(args, issuerService, isoDate, tid = null, file = true) {
    let {
      sourceCurrency,
      sourceValue,
    } = args.source;

    let {
      targetCurrency,
      targetValue,
    } = args.target;

    sourceValue = parseFloat(sourceValue);
    targetValue = parseFloat(targetValue);

    const {
      isFlipped,
      isFullScreen,
      loading,
      refreshCoinBalance,
      showValuesInCurrency,
      snackbarUpdate,
      openDialog,
      wallet,
      xr,
    } = this.props;

    const {
      debug,
    } = wallet.config;

    const {
      issuerFee,
    } = this.state;

    if (!file) {
      loading(true);
    }

    let swapInfo;
    args["expiryTime"] = isoDate;

    let initialSourceBal, initialTargetBal, download, href, swapResponse;

    let fee = issuerFee == 0 ? args.fee : issuerFee;
    let totalSource = parseFloat(sourceValue);
    totalSource = totalSource.toFixed(8);
    args.fee = fee; // ??


    const callSwap = (response) => {
      initialSourceBal = parseFloat(response[0]);
      initialTargetBal = parseFloat(response[1]);
      return wallet.exportSwapCode(args, issuerService, tid);
    };

    const handleResponse = (resp) => {
      swapResponse = resp;

      if (resp.deferInfo) {
        // Deferred response:
        //  1. If expired, revert the Swap
        //  2. If not expired, timeout the new Swap request. 

        if (file) {
          swapInfo = resp.swapInfo;
          const result = JSON.stringify({
            atomicSwapRequest: {
              swapInfo,
            }
          }, null, 2);
          const urlEncoded = encodeURIComponent(result);
          href = `data:application/json;charset=utf8,${urlEncoded}`;
          download = `swapCode_${sourceCurrency}${totalSource}_` +
            `${targetCurrency}${targetValue.toFixed(8)}.json`;
        }

        const now = new Date().getTime();
        let expiry = new Date(isoDate).getTime() - now;

        if (expiry < 0) {
          return revertExpiredSwap();
        }

        scheduleSwapRequest();
        return refreshCoinBalance(sourceCurrency);
      }

      const confirmValidSwap = (balances) => {
        if (resp.cancelled) {
          loading(false);
          let msg = "Swap with other cancelled due response error";
          this.setState({
            file: false,
            waitingToCollect: false,
          });
          snackbarUpdate(msg);
          return;
        }

        const finalSourceBal = parseFloat(balances[0]);
        const finalTargetBal = parseFloat(balances[1]);
        const sourceDiff = initialSourceBal - finalSourceBal;
        const targetDiff = initialTargetBal - finalTargetBal;

        openDialog({
          showCancelButton: false,
          title: "Coins Exchanged with counterparty",
          body: <ExchangeInfo
            currSource={ this.currencies[sourceCurrency] }
            currTarget={ this.currencies[targetCurrency] }
            source={ this.fixedTo(totalSource, 8) }
            target={ this.fixedTo(targetValue, 8) }
            background="transparent"

            isFlipped={ isFlipped }
            isFullScreen={ isFullScreen }
            showValuesInCurrency={ showValuesInCurrency }
            wallet={ wallet }
            xr={ xr }
          />,
        });

        loading(false);
        this.setState({
          file: false,
          waitingToCollect: false,
        });
        return true;
      }

      const refreshBalancePromises = [
        refreshCoinBalance(sourceCurrency),
        refreshCoinBalance(targetCurrency)
      ];

      return Promise.all(refreshBalancePromises)
        .then(confirmValidSwap);
    }

    const revertExpiredSwap = (sourceCurrency) => { 
      // Swap request expired - Revert the swap.
      const handleError = (err) => {
        if (debug) {
          console.log(err);
        }
        scheduleSwapRequest();
      }

      this.revertSwap()
        .catch(handleError);

      return refreshCoinBalance(sourceCurrency)
        .then(refreshTargetBalance);
    };

    const scheduleSwapRequest = () => {
      // Call timeout to repeat future swap request
      if (!swapResponse || !swapResponse.deferInfo) {
        return;
      }

      const {
        after,
        tid,
      } = swapResponse.deferInfo;

      const now = new Date().getTime();
      const afterTimeout = Math.max(0, new Date(after).getTime() - now);
      const expiryTimeout = new Date(isoDate).getTime() - now;
      const timeout = Math.min(afterTimeout, expiryTimeout);

      const params = [args, issuerService, isoDate, tid];
      setTimeout(function () {
        const args = arguments[0];
        const issuerService = arguments[1];
        const isoDate = arguments[2];
        const tid = arguments[3];
        this.swapWithOther(args, issuerService, isoDate, tid, false);
      }.bind(this, ...params), timeout);
    };

    const refreshTargetBalance = (response) => {
      let resetObj = {};
      if (file) {
        const sourceChanged = response - initialSourceBal;
        resetObj = {
          file: true,
          download,
          href,
          atomicSwapStatus: {
            initialSourceBalance: initialSourceBal,
            finalSourceBalance: response,
            difference: sourceChanged,
            sourceCurrency,
            targetCurrency,
            sourceValue,
            targetValue,
          },
        };
        this.updateBalances();
        snackbarUpdate("Please download your atomic swap file");
      }
      loading(false);
      this.resetForm(resetObj);
      return refreshCoinBalance(targetCurrency);
    };

    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }

      if (err.message == "Bad request [expired]") {
        return revertExpiredSwap();
      }

      loading(false);

      let msg = err.message || "Error on creating swap file";
      this.updateBalances();
      this.resetForm();
      snackbarUpdate(msg, true);
      this.updateBalances();

      return Promise.all([
        refreshCoinBalance(sourceCurrency),
        refreshCoinBalance(targetCurrency)
      ]);
    };

    const refreshAllBalancesPromises = [
      refreshCoinBalance(sourceCurrency),
      refreshCoinBalance(targetCurrency)
    ];

    Promise.all(refreshAllBalancesPromises)
      .then(callSwap)
      .then(handleResponse)
      .then(refreshTargetBalance)
      .catch(handleError);
  };

  revertSwap(reason="timeout") {
    const {
      loading,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    const {
      debug,
    } = wallet.config;

    const {
      COIN_SWAP,
      COIN_STORE,
      DEFAULT_ISSUER,
      SESSION,
      storage,
    } = wallet.config;

    const tx = this.getDeferredTransaction();
    if (!tx) {
      snackbarUpdate(`Swap ${reason} but no session found`, true);
      return null;
    }

    const {
      sourceCurrency,
    } = tx.transaction.args.source;

    const displayRevertInfo = () => {
      this.setState({
        waitingToCollect: false,
      });
      this.resetForm();
      loading(false);
      snackbarUpdate(`Swap with other cancelled due ${reason}`);
    };

    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }
      return Promise.reject(err);
    };

    loading(true);
    return wallet.revertSwapRequest(tx, reason)
      .then(() => this.updateBalances())
      .then(() => refreshCoinBalance(sourceCurrency))
      .then(displayRevertInfo)
      .catch(handleError);
  }

  handleCheckEmailRecovery(ev, emailRecovery) {
    const {
      source,
    } = this.state;

    this.setState({
      emailRecovery,
    }, () => this.setState(this.refreshIssuerFee(source)));
  }

  getExpiredISOTime() {
    const {
      expiryTime,
    } = this.state;
    let now = new Date().getTime();
    return new Date(now + expiryTime).toISOString();
  }

  handleClickDownload() {
    this.refs["downloadFile"].click();

    const {
      closeDialog,
      isFlipped,
      isFullScreen,
      openDialog,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const {
      initialSourceBalance,
      finalSourceBalance,
      difference,
      sourceCurrency,
      targetCurrency,
      sourceValue,
      targetValue,
    } = this.state.atomicSwapStatus;

    this.setState({
      waitingToCollect: true,
    });

    openDialog({
      showCancelButton: false,
      cancelLabel: "Revert",
      title: "Exchange request ready",
      body: <section>
        <WaitingCounterparty />

        <ExchangeInfo
          currSource={ this.currencies[sourceCurrency] }
          currTarget={ this.currencies[targetCurrency] }
          source={ this.fixedTo(sourceValue, 8) }
          target={ this.fixedTo(targetValue, 8) }
          background="transparent"
          isFlipped={ isFlipped }
          isFullScreen={ isFullScreen }
          showValuesInCurrency={ showValuesInCurrency }
          wallet={ wallet }
          xr={ xr }
        />

        <p style={{ textAlign: 'center' }}>
          { sourceCurrency } has been sent to the Issuer and you are awaiting
          the arrival of { targetCurrency } from the counterparty.
          <br/>
          If the { targetCurrency } does not arrive before the swap expires,
          your original Coins will be returned.
        </p>
      </section>,
    });
  }

  getListTargetCurrencies(sourceCurrency = null) {
    const {
      currencies,
      type,
    } = this.state;

    const {
      exchangeRates,
    } = this.props;

    if (sourceCurrency == null) {
      sourceCurrency = this.state.sourceCurrency;
    }

    return currencies.filter((el, key) => {
      let existKey = false;
      const rateKey = `${sourceCurrency}_${el}`;
      Object.keys(exchangeRates).forEach((key) => {
        existKey = existKey || key == rateKey;
      });
      return el != sourceCurrency && (existKey || type == "person");
    });
  }

  renderButtonsSection() {
    const {
      disabled,
      download,
      error,
      expired,
      file,
      href,
      type,
      waitingToCollect,
    } = this.state;

    const {
      exchangeRates,
    } = this.props;

    const timeout = expired && type == "issuer";
    const err = error && type == "issuer";
    const noRates = Object.keys(exchangeRates).length == 0;

    let buttonLabel = timeout ? "Fetch Rates" : "Exchange";
    if (err) {
      buttonLabel = "Error: can't retrieve exchange rates";
    }

    if (waitingToCollect) {
      return <WaitingCounterparty />;
    }

    return <div style={ this.styles.buttonsSection }>
      { file ? <div>
        <Button
          onClick={ this.handleClickDownload }
          icon={ <i
            className="fa fa-arrow-circle-down"
            style={ this.styles.buttonIcon }
          /> }
          label="Download File"
          style={ Object.assign({ margin: '0 10px', width: 'auto' },
            this.styles.button) }
        />
        <a
          download={ download }
          href={ href }
          ref="downloadFile"
          style={{
            textDecoration: 'none',
          }}
        >
          &nbsp;
        </a>
        <Button
          label="Reset"
          style={ Object.assign({ width: 'auto' }, this.styles.button) }
          icon={ timeout ? null : <i
            className="fa fa-undo"
            style={ this.styles.buttonIcon }
          /> }
          onClick={() => {
            this.resetForm({}, true);
          }}
        />
      </div> : <Button
        label={ buttonLabel }
        disabled={ (disabled || expired || error || noRates) && type == "issuer" }
        style={ this.styles.button }
        icon={ err ? null : <i
          className="fa fa-exchange"
          style={ this.styles.buttonIcon }
        /> }
        onClick={ this.handleConfirmClick }
      /> }
    </div>;
  }

  render() {
    const {
      currencies,
      currencyBalances,
      // disabled,
      emailRecovery,
      // error,
      errorTarget,
      errorSource,
      errorRate,
      expired,
      // expiryTime,
      issuerService,
      // initialCounter,
      sourceCurrencies,
      sourceCurrency,
      ready,
      sourceInText,
      type,
      targetCurrency,
      targetInText,
    } = this.state;

    let {
      source,
      issuerFee,
      target,
    } = this.state;

    const {
      active,
      exchangeRates,
      isFlipped,
      isFullScreen,
      showValuesInCurrency,
      wallet,
      xr
    } = this.props;

    if (errorRate) {
      return <div style={ this.styles.errorContainer }>
        <i className="fa fa-ban fa-4x"></i>
        <br />
        <br />
        Issuer problem, no response from the server
      </div>;
    }

    if (!ready) {
      return <RateLoader />;
    }

    source = parseFloat(source);
    target = parseFloat(target);
    issuerFee = parseFloat(issuerFee);

    const rate = exchangeRates[`${sourceCurrency}_${targetCurrency}`] || "Not available";
    const sourceBalance = parseFloat(currencyBalances[sourceCurrency]);
    const maxVerificationFee = wallet.getVerificationFee(sourceBalance, issuerService, emailRecovery);

    let sourceList = sourceCurrencies.filter((el, key) => {
      return currencyBalances[el] > 0;
    }).map((el, key) => {
      return <MenuItem
        key={ key + 1 }
        primaryText={ <CurrencyItem
          key={ key + 1 }
          code={ el }
          name={ this.currencies[el].name }
          available={ currencyBalances[el] || 0 }
        /> }
        value={ el }
      />;
    });

    const tx = this.getDeferredTransaction();
    if (sourceList.length == 0 && tx == null) {
      return <div style={ this.styles.noFunds }>
        <h3>
          No funds in your wallet
        </h3>
        <p>
          Add funds by <b>importing a Coin/Backup file</b> or <b>sending Bitcoin to an address</b>.
        </p>
      </div>;
    } else if (sourceList.length == 0) {
      return this.renderButtonsSection();
    }

    let recieveList = this.getListTargetCurrencies().map((el, key) => {
      return <MenuItem
        key={ key + 1 }
        primaryText={ <CurrencyItem
          key={ key + 1 }
          code={ el }
          name={ this.currencies[el].name }
          available={ currencyBalances[el] || 0 }
        /> }
        value={ el }
      />;
    });

    // calculate displaying rates
    let finalRate = this.fixedTo(source == 0 ? 0 : target/source, 8);
    let titleRate = "";
    if (type == "issuer") {
      finalRate = rate;
      titleRate = `Issuer exchange rate: ${rate}`;
    }

    const exchangeRateError = rate == "Not available" && type == "issuer";

    let expiryComponent = <div style={{
      textAlign: 'right',
      marginTop: '10px',
    }}>
      <b
        style={{
          color: styles.colors.mainTextColor,
          cursor: 'pointer',
          padding: "2px 10px",
          borderRadius: "10px",
          backgroundColor: styles.colors.secondaryBlue,
        }}
        onClick={ this.handleTimerClick }
      >
        REFRESH RATES <i className="fa fa-refresh" />
      </b>
    </div>;

    if (rate != "Not available" && type == "issuer") {
      const {
        initialCounter,
      } = this.state;

      expiryComponent = <TimeCounter
        active={ active }
        expired={ expired }
        initialCounter={ initialCounter }
        isFullScreen={ isFullScreen }
        onClickButton={ this.handleTimerClick }
        setDisabled={() => {
          this.setState({
            disabled: true,
          });
        }}
        setExpired={() => {
          this.setState({
            expired: true,
          });
        }}
        type={ type }
      />;
    } else if (type == "person" ){
      const {
        expiryTime,
      } = this.state;

      expiryComponent = <div style={ this.styles.expirySelector }>
        <div style={ this.styles.rate }>
          Expiry:
        </div>
        <SelectField
          value={ expiryTime }
          onChange={ (ev, k, expiryTime) => this.setState({ expiryTime }) }
          style={{
            width: '140px',
          }}
          labelStyle={{
            color: isFullScreen ? styles.colors.secondaryBlue :
              styles.colors.mainTextColor,
          }}
        >
          <MenuItem
            key="5min"
            primaryText="5 min"
            value={ 5 * 60000 }
          />
          <MenuItem
            key="30min"
            primaryText="30 min"
            value={ 30 * 60000 }
          />
          <MenuItem
            key="1hour"
            primaryText="1 hour"
            value={ 60 * 60000 }
          />
        </SelectField>
      </div>;
    }

    return <div style={ this.styles.section }>

      <ExchangeTypeSelector
        isFullScreen={ isFullScreen }
        onChangeType={ this.handleTypeChange }
        type={ type }
        wallet={ wallet }
      />

      <div style={ this.styles.content }>
        <div style={ isFullScreen ? this.styles.area : null }>
          <div style={ this.styles.label }>
            Source<HelpTooltip
              iconStyle={ Object.assign({}, this.styles.tooltip, {
                fontSize: '20px',
                verticalAlign: 'middle',
              }) }
              note={ <div>
                Bitcoin Express available exchange source currencies:<br />
                { sourceCurrencies.join(', ') }
              </div> }
            /> 
          </div>
          <SelectField
            style={ this.styles.selectField }
            value={ sourceCurrency }
            hintStyle={{
              color: this.currencies[sourceCurrency].color
            }}
            onChange={ this.handleSourceCurrencyChange }
          >
            { sourceList }
          </SelectField>

          <CoinSelector
            currency={ this.currencies[sourceCurrency].code }
            id="source"
            error={ errorSource }
            floatingLabelFocusStyle={{
              color: isFullScreen ? styles.colors.secondaryBlue :
                styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            label=""
            inputStyle={{
              color: isFullScreen ? styles.colors.mainBlack :
                styles.colors.mainTextColor,
            }}
            onAmountChange={ this.handleSourceChange }
            value={ sourceInText }
            xr={ this.props.xr }
          />

          <div style={ this.styles.max }>
            <b
              style={ this.styles.maxButton }
              onClick={ this.handleMaxClick }
            >
              Max
            </b>
            <BitcoinCurrency
              value={ sourceBalance - maxVerificationFee }
              color={ isFullScreen ? styles.colors.mainBlack :
                styles.colors.mainTextColor }
              currency={ sourceCurrency.toUpperCase() }
              displayStorage={ false }
              buttonStyle={ this.styles.bitcoinButton }
              isFlipped={ isFlipped }
              showValuesInCurrency={ showValuesInCurrency }
              small={ isFullScreen }
              tiny={ !isFullScreen }
              wallet={ wallet }
              style={ this.styles.currency }
              xr={ xr }
            /><br/>
            <HelpTooltip
              iconStyle={ this.styles.tooltip }
              note={ <div>
                This is the standard verification fee.<br />
                There is no extra fee for exchange.
              </div> }
            /> &nbsp;
            <b style={ this.styles.fee }>
              Fee
            </b> <BitcoinCurrency
              value={ parseFloat(this.fixedTo(issuerFee, 8)) }
              color={ isFullScreen ? styles.colors.mainBlack :
                styles.colors.mainTextColor }
              currency={ sourceCurrency.toUpperCase() }
              displayStorage={ false }
              buttonStyle={ this.styles.bitcoinButton }
              isFlipped={ isFlipped }
              showValuesInCurrency={ showValuesInCurrency }
              small={ isFullScreen }
              tiny={ !isFullScreen }
              wallet={ wallet }
              style={{ display: 'inline-block' }}
              xr={ xr }
            />
          </div>
        </div>

        <div style={ isFullScreen ? this.styles.area : null }>
          <div style={ this.styles.label }>
            Target
          </div>
          <SelectField
            style={ this.styles.selectField }
            value={ targetCurrency }
            hintStyle={{
              color: this.currencies[targetCurrency].color
            }}
            onChange={ this.handleTargetCurrencyChange }
          >
            { recieveList }
          </SelectField>

          { exchangeRateError ? null : <CoinSelector
            id="target"
            error={ errorTarget }
            currency={ this.currencies[targetCurrency].code }
            xr={ xr }
            label=""
            value={ targetInText }
            onAmountChange={ this.handleTargetChange }
            floatingLabelFocusStyle={{
              color: isFullScreen ? styles.colors.secondaryBlue :
                styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            inputStyle={{
              color: isFullScreen ? styles.colors.mainBlack :
                styles.colors.mainTextColor,
            }}
          /> }

          <div style={ this.styles.exchangeInfo }>
            <a
              title="Rates from GDAX.com"
              style={ this.styles.rate }
              href="http://gdax.com"
              target="_blank"
            >
              Rate
            </a> &nbsp;<span
              style={ this.styles.rateValue }
              title={ titleRate }
            >{ finalRate }</span>
          </div>

          { expiryComponent }

        </div>
      </div>

      { exchangeRateError ? null : <ExchangeInfo
        currSource={ this.currencies[sourceCurrency] }
        currTarget={ this.currencies[targetCurrency] }
        isFlipped={ isFlipped }
        isFullScreen={ isFullScreen }
        showValuesInCurrency={ showValuesInCurrency }
        source={ this.fixedTo(source + issuerFee, 8) }
        target={ this.fixedTo(target, 8) }
        wallet={ wallet }
        xr={ xr }
      /> }

      <div style={ this.styles.checkboxContainer }>
        <Checkbox
          checked={ emailRecovery }
          iconStyle={ this.styles.checkboxIcon }
          label="Include email recovery"
          labelStyle={ this.styles.checkboxLabel }
          onCheck={ this.handleCheckEmailRecovery }
          style={ this.styles.checkbox }
        />
      </div>

      { this.renderButtonsSection() }
    </div>;
  }
}

ExchangeTab.propTypes = {
  wallet: PropTypes.object,
  refreshCoinBalance: PropTypes.func,
  snackbarUpdate: PropTypes.func,
  balance: PropTypes.number,
};

export default ExchangeTab;
