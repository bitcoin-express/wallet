import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

export default class SettingsMain extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings,
      newPassword: null,
      password1: props.password,
      password2: props.password,
    };

    this.styles = {
      info: {
        transition: 'height .5s',
        height: '0px',
        overflow: 'hidden',
        // margin: '15px 0',
        fontSize: 'small',
      },
      infoIcon: function (top='-15px') {
        return {
          cursor: 'pointer',
          color: 'black',
          position: 'relative',
          top,
          left: '100%',
        };
      }.bind(this),
      pwd: {
        color: 'green',
      },
      pwd2: {
        color: 'red',
      }
    };

    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.handlePassword1Change = this.handlePassword1Change.bind(this);
    this.handlePassword2Change = this.handlePassword2Change.bind(this);
  }

  handleShowInfo(secondElementSibling=false) {
    return (event) => {
      let el = event.target.parentElement.nextElementSibling;
      if (secondElementSibling) {
        el = el.nextElementSibling;
      }
      let height = 0; 
      if (el.clientHeight == 0) {
        height = el.firstChild.clientHeight + 30;
      }
      el.style.height = `${height}px`;
    };
  }

  handlePassword1Change(event, password1) {
    const {
      setSettingsKey,
    } = this.props;

    const {
      password2,
    } = this.state;

    // Hack, set the new password as a new settings key when the user
    // confirms the changes, before saving the settings object it is
    // required to remove the newPassword key.
    this.setState({
      password1,
    });

    if (password1 == password2) {
      setSettingsKey("newPassword", password1);
    } else {
      setSettingsKey("newPassword", null);
    }
  }

  handlePassword2Change(event, password2) {
    const {
      setSettingsKey,
    } = this.props;

    const {
      password1,
    } = this.state;

    // Hack, set the new password as a new settings key when the user
    // confirms the changes, before saving the settings object it is
    // required to remove the newPassword key.
    this.setState({
      password2,
    });

    if (password1 == password2) {
      setSettingsKey("newPassword", password2);
    } else {
      setSettingsKey("newPassword", null);
    }
  }

  handleTextFieldChange(event, issuer) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    setSettingsKey(wallet.config.DEFAULT_ISSUER, issuer);
  }

  render() {
    const {
      password,
      settings,
      wallet,
    } = this.props;

    const {
      password1,
      password2,
    } = this.state;

    const policies = new Array("single", "spread"); // , "repeated"
    const initialPwdSet = password != "" && password1 == password2;
    const newPwdSet = password1 == password2 && password1 != "";

    return (
      <section style={{
        padding: '20px 5vw',
      }}>

        <h3 style={{
          marginTop: '0',
          color: '#8081ff',
        }}>
          Settings
        </h3>

        <div>
          <p>
            <b><i className="fa fa-exclamation-triangle" /> Attention</b>. Once the password is set there is no way back. For security reasons Bitcoin-express does not provide a way to recover the password in case of loose. We strongly recommend to write it down in a paper and save it in case of future loose.
          </p>
          <TextField
            floatingLabelText="Password"
            style={{ width: '100%' }}
            defaultValue={ password1 }
            type="password"
            onChange={ this.handlePassword1Change }
            errorText={ initialPwdSet || newPwdSet ? "Your password is correct." : "" }
            errorStyle={ this.styles.pwd }
          />
          <TextField
            floatingLabelText="Repeat Password"
            style={{ width: '100%' }}
            defaultValue={ password2 }
            type="password"
            onChange={ this.handlePassword2Change }
            errorText={ password1 != password2 ? "Passwords does not match" : "" }
            errorStyle={ this.styles.pwd2 }
          /> 
          <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo() }
            style={ this.styles.infoIcon('-35px') }
          />
        </div>
        <div style={ this.styles.info }>
          <div>
            <p>
              Access to your wallet by password.
            </p>
          </div>
        </div>

        <div>
          <TextField
            defaultValue={ settings[wallet.config.DEFAULT_ISSUER] }
            floatingLabelText="Home Issuer"
            style={{ width: '100%' }}
            onChange={ this.handleTextFieldChange }
          /> 
          <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo() }
            style={ this.styles.infoIcon('-35px') }
          />
        </div>
        <div style={ this.styles.info }>
          <div>
            <p>
              Set the domain name of your preferred Issuer.
            </p>
            <p>
              The Home Issuer becomes the custodian of your cryptocurrencies and has the ultimate responsibility to redeem Coins back to the blockchain – so be sure to choose an Issuer that is trustworthy.
            </p>
            <p>
              The Home Issuer will be used to convert blockchain assets into Bitcoin-express Coins, verify imported Coins, split Coins and exchange between cryptocurrencies.
            </p>
            <p>
              You will need to pay Coin processing fees to the Home Issuer so it is in your own best interest to select an Issuer that is dependable and has reasonable fees.
            </p>
          </div>
        </div>

        <div>
          <SelectField
            floatingLabelText="Issue Policy"
            value={ settings[wallet.config.ISSUE_POLICY] }
            style={{
              width: '90%',
              marginRight: '10%',
            }}
            onChange={(ev, key, issuePolicy) => {
              const {
                setSettingsKey,
                wallet,
              } = this.props;

              let {
                settings,
              } = this.state;

              setSettingsKey(wallet.config.ISSUE_POLICY, issuePolicy);
              settings[wallet.config.ISSUE_POLICY] = issuePolicy;
              this.setState({
                settings,
              });
            }}
          >
            { policies.map((p) => <MenuItem
              key={p}
              value={p}
              primaryText={p}
            />) }
          </SelectField> 
          <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo() }
            style={ this.styles.infoIcon('-35px') }
          />
        </div>
        <div style={ this.styles.info }>
          <div>
            <p>
              <b>single</b>: The <i>change</i> from a coin split returns a single coin.
            </p>
            <p>
              <b>spread</b>: The <i>change</i> from a coin split returns 6 coins with a
              spread of values. This is good for minimising coin split fees but the
              number of coins grows quickly.
            </p>
          </div>
        </div>
      </section>
    );
  }
}

/*
<p>
<b>repeat</b>: The <i>change</i> from a coin split returns multiple coins
of the same value. This will speed up payments when the same value is
repeatedly needed and will often reduce cost.
</p>
*/
