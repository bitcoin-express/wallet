import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Toggle from 'material-ui/Toggle';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';

import LocalStorage from '../../../helpers/persistence/LocalStorage';

export default class DeveloperTools extends React.Component {

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
    this.recoverRecoveryCoins = this.recoverRecoveryCoins.bind(this);
  }

  setPowerLoss(ev, isInputChecked) {
    this.props.wallet.config["powerLoss"] = isInputChecked;
  }

  setForceDefer(ev, isInputChecked) {
    this.props.wallet.config["forceDefer"] = isInputChecked;
  }

  setDebugMode(ev, isInputChecked) {
    this.props.wallet.config["debug"] = isInputChecked;
  }

  checkRecoveryCoins() {
    this.props.wallet.checkRecoveryCoins();
  }

  recoverRecoveryCoins() {
    const {
      wallet,
      snackbarUpdate,
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

  render() {
    const {
      settings,
      wallet,
    } = this.props;

    const protocols = new Array("https://", "http://");

    return (
      <section>
        <div style={{ padding: '20px 20px 20px 20px' }}>
          <Toggle
            label="Simulate Power loss"
            labelPosition="right"
            defaultToggled={ wallet.config.powerloss || false }
            onToggle={ this.setPowerLoss }
          />
          <Toggle
            label="Activate debug mode"
            labelPosition="right"
            defaultToggled={ wallet.config.debug || false }
            onToggle={ this.setDebugMode }
          />
          <Toggle
            label="Activate force defer"
            labelPosition="right"
            defaultToggled={  wallet.config.forceDefer || false }
            onToggle={ this.setForceDefer }
          />
        </div>
        <Divider />
        <div style={{ padding: '20px 20px 20px 20px' }}>
          <SelectField
            floatingLabelText="Issuer protocol"
            value={ settings[wallet.config.ISSUER_PROTOCOL] }
            style={{
              width: '100%',
            }}
            onChange={(ev, key, protocol) => {
              const {
                setSettingsKey,
                wallet,
              } = this.props;

              let {
                settings,
              } = this.state;

              setSettingsKey(wallet.config.ISSUER_PROTOCOL, protocol);
              settings[wallet.config.ISSUER_PROTOCOL] = protocol;
              this.setState({
                settings,
              });
            }}
          >
            { protocols.map((p) => <MenuItem
              key={p}
              value={p}
              primaryText={p}
            />) }
          </SelectField> 
        </div>
        <Divider />
        <div style={{ padding: '20px 20px 20px 20px' }}>
          <FlatButton
            label="Check Recovery Coins"
            icon={ <i className="fa fa-search"/> }
            onTouchTap={ this.checkRecoveryCoins }
          />
          <FlatButton
            label="Recovery Coins"
            icon={ <i className="fa fa-recycle"/> }
            onTouchTap={ this.recoverRecoveryCoins }
          />
        </div>
        <Divider />
        <div style={{ padding: '20px 20px 40px 20px' }}>
          <Checkbox
            label="Clean storage"
            onCheck={ (ev, ch) => this.setState({ disabled: !ch }) }
          />
          <p style={{ color: '#880000', fontsize: '80%' }}>
            <i className="fa fa-exclamation-triangle"></i>&nbsp;
            after cleaning the storage you will loose all your coins.
            we strongly recommend <b>first to backup your wallet</b>.
          </p>
          <FlatButton
            label="proceed and clear storage"
            icon={ <i className="fa fa-trash"/> }
            disabled={ this.state.disabled }
            onTouchTap={ this.clearStorage }
          />
        </div>
      </section>
    );
  }
}
