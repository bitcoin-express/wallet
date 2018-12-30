import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

export default class SettingsDisplay extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      errorMsg: "",
      settings: props.settings,
    };

    this.handleChangeLocalName = this.handleChangeLocalName.bind(this);
    this.handleChangeDriveName = this.handleChangeDriveName.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
    this.handleSeparatorChange = this.handleSeparatorChange.bind(this);
    this.handleBitcoinDisplayChange = this.handleBitcoinDisplayChange.bind(this);
  }

  handleChangeLocalName(ev, walletLocalName) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;
    
    setSettingsKey(wallet.config.WALLET_LOCAL_NAME, walletLocalName);
    settings[wallet.config.WALLET_LOCAL_NAME] = walletLocalName;
    this.setState({
      settings,
    });
  }

  handleChangeDriveName(ev, walletDriveName) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    setSettingsKey(wallet.config.WALLET_DRIVE_NAME, walletDriveName);
    settings[wallet.config.WALLET_DRIVE_NAME] = walletDriveName;
    this.setState({
      settings,
    });
  }

  handleCurrencyChange(ev, index, currency) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    setSettingsKey(wallet.config.CURRENCY, currency);
    settings[wallet.config.CURRENCY] = currency;
    this.setState({
      settings,
    });
  }

  handleSeparatorChange(ev, index, separator) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    setSettingsKey(wallet.config.SEPARATOR, separator);
    settings[wallet.config.SEPARATOR] = separator;
    this.setState({
      settings,
    });
  }

  handleBitcoinDisplayChange(ev, index, btc) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    setSettingsKey(wallet.config.BTC_DISPLAY, btc.replace("Ƀ", "&#x243;"));
    settings[wallet.config.BTC_DISPLAY] = btc.replace("Ƀ", "&#x243;");
    this.setState({
      settings,
    });
  }

  render() {
    const {
      isFlipped,
      wallet,
      xr,
    } = this.props;

    let {
      errorMsg,
      settings,
    } = this.state;

    const rateList = xr.getRates();
    const currencies = Object.keys(rateList).map((key) => {
      // attrs code, symbol, name
      let curr = rateList[key];
      return (
        <MenuItem
          key={ key }
          value={ curr.code }
          primaryText={ `${curr.symbol} - ${curr.word}` }
        />
      );
    });

    const policies = new Array("single", "repeated", "random", "spread", "order");

    return (
      <section style={{
        padding: '20px 5vw',
      }}>
        <h3 style={{
          marginTop: '0',
          color: '#8081ff',
        }}>
          Display
        </h3>
        { (wallet.config.storage.config.name == 'googleDrive') ? <TextField
          value={ settings[wallet.config.WALLET_DRIVE_NAME] }
          floatingLabelText="Your Google Drive Wallet name"
          style={{ width: '100%' }}
          onChange={ this.handleChangeDriveName }
        /> : <TextField
          value={ settings[wallet.config.WALLET_LOCAL_NAME] }
          floatingLabelText="Your Local Wallet name"
          style={{ width: '100%' }}
          onChange={ this.handleChangeLocalName }
        />  }
        <Select
          floatingLabelText="Currency"
          value={ settings[wallet.config.CURRENCY] }
          style={{ width: '100%' }}
          onChange={ this.handleCurrencyChange }
        >
          { currencies }
        </Select>
        <Select
          floatingLabelText="Bitcoin Display Type"
          value={ settings[wallet.config.BTC_DISPLAY] }
          style={{ width: '100%' }}
          onChange={ this.handleBitcoinDisplayChange }
        >
          <MenuItem
            value="XBT"
            primaryText="XBT"
          />
          <MenuItem
            value="BTC"
            primaryText="BTC"
          />
          <MenuItem
            value={ "&#x243;" }
            primaryText="Ƀ"
          />
          <MenuItem
            value="mXBT"
            primaryText="mXBT"
          />
          <MenuItem
            value="mBTC"
            primaryText="mBTC"
          />
          <MenuItem
            value={ "m&#x243;" }
            primaryText="mɃ"
          />
          <MenuItem
            value={ "&mu;XBT" }
            primaryText="μXBT"
          />
          <MenuItem
            value={ "&mu;BTC" }
            primaryText="μBTC"
          />
          <MenuItem
            value={ "&mu;&#x243;" }
            primaryText="μɃ"
          />
        </Select>
        <Select
          floatingLabelText="Decimal separator"
          value={ settings[wallet.config.SEPARATOR] }
          style={{ width: '100%' }}
          onChange={ this.handleSeparatorChange }
        >
          <MenuItem
            value="."
            primaryText=". full stop"
          />
          <MenuItem
            value=","
            primaryText=", comma"
          />
        </Select>
      </section>
    );
  }
}
