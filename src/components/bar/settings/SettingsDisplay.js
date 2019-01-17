import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';

import Box from '../../Box';
import { AppContext } from "../../../AppContext";


const componentStyles = (theme) => {
  return {
    input: {
      marginBottom: theme.spacing.unit,
      width: '100%',
    },
  };
};


class SettingsDisplay extends React.Component {

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
    } = this.props;

    const {
      wallet,
    } = this.context;

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
    } = this.props;

    const {
      wallet,
    } = this.context;

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
    } = this.props;

    const {
      wallet,
    } = this.context;

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
    } = this.props;

    const {
      wallet,
    } = this.context;

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
    } = this.props;

    const {
      wallet,
    } = this.context;

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
      classes,
    } = this.props;

    const {
      wallet,
      xr,
    } = this.context;

    let {
      errorMsg,
      settings,
    } = this.state;

    const rateList = xr.getRates();
    const currencies = Object.keys(rateList).map((key) => {
      console.log(key);
      let curr = rateList[key];
      return <MenuItem
        key={ key }
        value={ curr.code }
      >
        { `${curr.symbol} - ${curr.word}` }
      </MenuItem>;
    });

    const policies = new Array("single", "repeated", "random", "spread", "order");
    const isGoogleDrive = wallet.config.storage.config.name == 'googleDrive';

    return <section>

      <Box title="Wallet Display">

        { isGoogleDrive ? <FormControl className={ classes.input }>
          <InputLabel htmlFor="drive-name">
            Your Google Drive Wallet name
          </InputLabel>

          <Input
            id="drive-name"
            onChange={ this.handleChangeDriveName }
            type="text"
            value={ settings[wallet.config.WALLET_DRIVE_NAME] }
          />
        </FormControl> : <FormControl className={ classes.input }>
          <InputLabel htmlFor="local-name">
            Your Local Wallet name
          </InputLabel>

          <Input
            id="local-name"
            onChange={ this.handleChangeLocalName }
            type="text"
            value={ settings[wallet.config.WALLET_LOCAL_NAME] }
          />
        </FormControl> }

        <FormControl className={ classes.input }>
          <InputLabel htmlFor="currency">
            Currency
          </InputLabel>

          <Select
            className={ classes.input }
            id="currency"
            value={ settings[wallet.config.CURRENCY] }
            onChange={ this.handleCurrencyChange }
          >
            { currencies }
          </Select>
        </FormControl>

        <FormControl className={ classes.input }>
          <InputLabel htmlFor="display-type">
            Bitcoin Display Type
          </InputLabel>

          <Select
            className={ classes.input }
            id="display-type"
            value={ settings[wallet.config.BTC_DISPLAY] }
            onChange={ this.handleBitcoinDisplayChange }
          >
            <MenuItem value="XBT">
              XBT
            </MenuItem>

            <MenuItem value="BTC">
              BTC
            </MenuItem>

            <MenuItem value={ "&#x243;" }>
              Ƀ
            </MenuItem>

            <MenuItem value="mXBT">
              mXBT
            </MenuItem>

            <MenuItem value="mBTC">
              mBTC
            </MenuItem>

            <MenuItem value={ "m&#x243;" }>
              mɃ
            </MenuItem>

            <MenuItem value={ "&mu;XBT" }>
              μXBT
            </MenuItem>

            <MenuItem value={ "&mu;BTC" }>
              μBTC
            </MenuItem>

            <MenuItem value={ "&mu;&#x243;" }>
              μɃ
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl className={ classes.input }>
          <InputLabel htmlFor="decimal-separator">
            Decimal separator
          </InputLabel>

          <Select
            className={ classes.input }
            id="decimal-separator"
            value={ settings[wallet.config.SEPARATOR] }
            onChange={ this.handleSeparatorChange }
          >
            <MenuItem value=".">
              . full stop
            </MenuItem>

            <MenuItem value=",">
              , comma
            </MenuItem>
          </Select>
        </FormControl>

      </Box>

    </section>;
  }
}

SettingsDisplay.contextType = AppContext;

export default withStyles(componentStyles)(SettingsDisplay);

