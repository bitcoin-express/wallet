import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Divider from '@material-ui/core/Divider';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';

import { AppContext } from "../../../AppContext";
import LocalStorage from '../../../helpers/persistence/LocalStorage';


class ToolsComponent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      disabled: true,
      settings: props.settings,
    };

    this.setPowerLoss = this.setPowerLoss.bind(this);
    this.setDebugMode = this.setDebugMode.bind(this);
    this.setForceDefer = this.setForceDefer.bind(this);
    this.checkRecoveryCoins = this.checkRecoveryCoins.bind(this);
    this.handleProtocolChanged = this.handleProtocolChanged.bind(this);
    this.recoverRecoveryCoins = this.recoverRecoveryCoins.bind(this);
  }

  setPowerLoss(ev, isInputChecked) {
    this.context.wallet.config["powerLoss"] = isInputChecked;
  }

  setForceDefer(ev, isInputChecked) {
    this.context.wallet.config["forceDefer"] = isInputChecked;
  }

  setDebugMode(ev, isInputChecked) {
    this.context.wallet.config["debug"] = isInputChecked;
  }

  checkRecoveryCoins() {
    this.context.wallet.checkRecoveryCoins();
  }

  recoverRecoveryCoins() {
    const {
      wallet,
      snackbarUpdate,
    } = this.context;

    const {
      refreshCoinBalance,
    } = this.props;

    const {
      CRYPTO,
    } = wallet.config;

    let c = wallet.getPersistentVariable(CRYPTO, "XBT");
    wallet.recoverRecoveryCoins("").then((recovered) => {
      if (recovered > 0) {
        snackbarUpdate(`Recovered ${c}recovered`);
        return refreshCoinBalance(c);
      } else {
        return snackbarUpdate(`Recovered ${c}0.00000000`);
      }
    }).catch((err) => {
      snackbarUpdate(err, true);
    });
  }

  clearStorage() {
    // Promise.resolve(window.$.jStorage.flush());
    new LocalStorage().clean();
    localStorage.removeItem('loggedIn');
    location.reload();
  }

  handleProtocolChanged(event) {
    const {
      setSettingsKey,
    } = this.props;

    const {
      wallet,
    } = this.context;

    let {
      settings,
    } = this.state;

    const protocol = event.target.value;

    setSettingsKey(wallet.config.ISSUER_PROTOCOL, protocol);
    settings[wallet.config.ISSUER_PROTOCOL] = protocol;
    this.setState({
      settings,
    });
  }

  render() {
    const {
      settings,
    } = this.props;

    const {
      wallet,
    } = this.context;

    const protocols = new Array("https://", "http://");

    return (
      <section>
        <div style={{ padding: '20px 20px 20px 20px' }}>
          <FormControlLabel
            control={ <Switch
              checked={ wallet.config.powerloss || false }
              onChange={ this.setPowerLoss }
            /> }
            label="Simulate Power loss"
            labelPlacement="end"
          />
          <FormControlLabel
            control={ <Switch
              checked={ wallet.config.debug || false }
              onChange={ this.setDebugMode }
            /> }
            label="Activate debug mode"
            labelPlacement="end"
          />
          <FormControlLabel
            control={ <Switch
              checked={  wallet.config.forceDefer || false }
              onChange={ this.setForceDefer }
            /> }
            label="Activate force defer"
            labelPlacement="end"
          />
        </div>
        <Divider />
        <div style={{ padding: '20px 20px 20px 20px' }}>
          <Select
            label="Issuer protocol"
            value={ settings[wallet.config.ISSUER_PROTOCOL] }
            onChange={ this.handleProtocolChanged }
          >
            { protocols.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>) }
          </Select> 
        </div>
        <Divider />
        <div style={{ padding: '20px 20px 20px 20px' }}>
          <Button onClick={ this.checkRecoveryCoins }>
            <i className="fa fa-search"/>
            Check Recovery Coins
          </Button>
          <Button onClick={ this.recoverRecoveryCoins }>
            <i className="fa fa-recycle"/>
            Recovery Coins
          </Button>
        </div>
        <Divider />
        <div style={{ padding: '20px 20px 40px 20px' }}>

          <FormControlLabel
            control={ <Checkbox
              onChange={ (event) => this.setState({ disabled: event.target.selected }) }
            /> }
            label="Clean storage"
          />

          <p style={{ color: '#880000', fontsize: '80%' }}>
            <i className="fa fa-exclamation-triangle"></i>&nbsp;
            after cleaning the storage you will loose all your coins.
            we strongly recommend <b>first to backup your wallet</b>.
          </p>

          <Button
            disabled={ this.state.disabled }
            onClick={ this.clearStorage }
          >
            <i className="fa fa-trash"/>
            proceed and clear storage
          </Button>
        </div>
      </section>
    );
  }
}

ToolsComponent.contextType = AppContext;

export default ToolsComponent;

