import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

import Box from '../../Box';


const componentStyles = (theme) => {
  return {
    info: {
      fontSize: 'small',
      color: '#a9331d',
    },
    select: {
      width: '90%',
    },
    selectInfo: {
      width: '10%',
    },
    textField: {
      marginBottom: theme.spacing.unit,
      width: '100%',
    },
  };
};


class SettingsMain extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      settings: props.settings,
      newPassword: null,
      password1: props.password,
      showPassword1: false,
      password2: props.password,
      showPassword2: false,

      showPasswordInfo: false,
      showIssuerNameInfo: false,
      showIssuerPolicyInfo: false,
    };

    this.handleIssuerChange = this.handleIssuerChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleRepeatPasswordChange = this.handleRepeatPasswordChange.bind(this);
    this.handlePolicyChange = this.handlePolicyChange.bind(this);
    this.negateStateValue = this.negateStateValue.bind(this);
  }

  negateStateValue(key) {
    return (event) => {
      this.setState({
        [key]: !this.state[key],
      });
    };
  }

  handlePasswordChange(event, password1) {
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

  handleRepeatPasswordChange(event, password2) {
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

  handleIssuerChange(event, issuer) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    setSettingsKey(wallet.config.DEFAULT_ISSUER, issuer);
  }

  handlePolicyChange(event) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    const issuePolicy = event.target.value;

    setSettingsKey(wallet.config.ISSUE_POLICY, issuePolicy);
    settings[wallet.config.ISSUE_POLICY] = issuePolicy;

    this.setState({
      settings,
    });
  }

  render() {
    const {
      classes,
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


    return <section>

      <Box title="Password Authentication">

        <p>
          <b><i className="fa fa-exclamation-triangle" /> Attention</b>. Once the password is set there is no way back. For security reasons Bitcoin-express does not provide a way to recover the password in case of loose. We strongly recommend to write it down in a paper and save it in case of future loose.
        </p>

        <FormControl className={ classes.textField }>
          <InputLabel htmlFor="adornment-password">
            { initialPwdSet || newPwdSet ? "Your password is correct." : "Password" }
          </InputLabel>

          <Input
            id="adornment-password"
            error={ initialPwdSet || newPwdSet }
            type={ this.state.showPassword1 ? 'text' : 'password' }
            defaultValue={ password1 }
            onChange={ this.handlePasswordChange }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={ this.negateStateValue('showPassword1') }
                >
                  
                  <i
                    className={ this.state.showPassword1 ? "fa fa-eye" : "fa fa-eye-slash" }
                  />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        <FormControl className={ classes.textField }>
          <InputLabel htmlFor="adornment-password-repeat">
            { password1 != password2 ? "Passwords does not match" : "Repeat Password" }
          </InputLabel>

          <Input
            id="adornment-password-repeat"
            error={ password1 != password2  }
            type={ this.state.showPassword1 ? 'text' : 'password' }
            defaultValue={ password2 }
            onChange={ this.handleRepeatPasswordChange }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="Toggle password visibility"
                  onClick={ this.negateStateValue('showPassword1') }
                >
                  
                  <i
                    className={ this.state.showPassword1 ? "fa fa-eye" : "fa fa-eye-slash" }
                  />
                </IconButton>

                <IconButton
                  aria-label="More info"
                  onClick={ this.negateStateValue('showPasswordInfo') }
                >
                  <i
                    className="fa fa-question-circle"
                  />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        { this.state.showPasswordInfo ? <p className={ classes.info }>
          Access to your wallet by password.
        </p> : null }

      </Box>

      <Box title="Issuer Settings">

        <FormControl className={ classes.textField }>
          <InputLabel htmlFor="adornment-issuer">
            Home Issuer
          </InputLabel>

          <Input
            id="adornment-issuer"
            type='text'
            defaultValue={ settings[wallet.config.DEFAULT_ISSUER] }
            onChange={ this.handleIssuerChange }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="More info"
                  onClick={ this.negateStateValue('showIssuerNameInfo') }
                >
                  <i
                    className="fa fa-question-circle"
                  />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        { this.state.showIssuerNameInfo ? <div className={ classes.info }>
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
        </div> : null }


        <FormControl className={ classes.select }>
          <InputLabel htmlFor="issue-policy">
            Issue Policy
          </InputLabel>

          <Select
            id="issue-policy"
            value={ settings[wallet.config.ISSUE_POLICY] }
            onChange={ this.handlePolicyChange }
          >
            { policies.map((p) => <MenuItem key={p} value={p}>{ p }</MenuItem>) }
          </Select> 
        </FormControl>

        <IconButton
          aria-label="More info"
          className={ classes.selectInfo }
          onClick={ this.negateStateValue('showIssuerPolicyInfo') }
        >
          <i
            className="fa fa-question-circle"
          />
        </IconButton>


        { this.state.showIssuerPolicyInfo ? <div className={ classes.info }>
          <p>
            <b>single</b>: The <i>change</i> from a coin split returns a single coin.
          </p>
          <p>
            <b>spread</b>: The <i>change</i> from a coin split returns 6 coins with a
            spread of values. This is good for minimising coin split fees but the
            number of coins grows quickly.
          </p>
        </div> : null }

      </Box>

    </section>;
  }
}


export default withStyles(componentStyles)(SettingsMain);

