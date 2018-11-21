
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import TextField from 'material-ui/TextField';

import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

import CoinSelector from '../../CoinSelector';
import EncryptSelector from '../../EncryptSelector';
import FormArea from '../../FormArea';
import Button from '../../Button';
import Title from '../../Title';

import styles from '../../../helpers/Styles';
import Tools from '../../../helpers/Tools';

class CurrencyRadioGroup extends React.Component {
  constructor(props) {
    super(props);

    this.tools = new Tools();

    this.styles = {
      iconStyle: {
        fill: styles.colors.mainTextColor,
      },
      labelRadio: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        color: styles.colors.mainTextColor,
        fontSize: '16px',
        width: 'inherit',
        zIndex: '3',
      },
      radioButton: {
        width: 'auto',
        margin: '10px 0',
      },
      radioGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      },
      radioLabel: {
        display: 'flex',
        flexWrap: 'nowrap',
        marginRight: '10px',
      },
    };
  }

  render() {
    let {
      currency,
      onChange,
    } = this.props;

    if (currency == 'BTC') {
      currency = "XBT";
    }

    return <RadioButtonGroup
      name="currency-type"
      defaultSelected={ currency }
      onChange={ onChange }
      style={ this.styles.radioGroup }
    >
      <RadioButton
        value="XBT"
        label={ this.tools.getImageComponent("btce.png", 25, 25, "currencies/") }
        labelStyle={ this.styles.labelRadio }
        iconStyle={ this.styles.iconStyle }
        style={ this.styles.radioButton }
      />
      <RadioButton
        value="BCH"
        label={ this.tools.getImageComponent("bche.png", 25, 25, "currencies/") }
        labelStyle={ this.styles.labelRadio }
        iconStyle={ this.styles.iconStyle }
        style={ this.styles.radioButton }
      />
      <RadioButton
        value="ETH"
        label={ this.tools.getImageComponent("ethe.png", 25, 25, "currencies/") }
        labelStyle={ this.styles.labelRadio }
        iconStyle={ this.styles.iconStyle }
        style={ this.styles.radioButton }
      />
    </RadioButtonGroup>;
  }
}

class CoinsToFile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      amount: "",
      amountInText: "",
      crypto: props.wallet.getPersistentVariable(props.wallet.config.CRYPTO),
      currency: 1,
      password: "",
      encrypted: false,
      comment: "",
      exported: false,
      ready: false,
    };

    this.styles = {
      button2: {
        width: '48%',
        margin: '0 2% 10px 0',
      },
      button3: {
        width: '48%',
        margin: '0 0 10px 0',
      },
      textfield: {
        width: '100%',
        marginTop: '-15px',
      },
    };

    this.tools = new Tools();

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.clearForm = this.clearForm.bind(this);
  }

  clearForm(event) {
    this.setState({
      amount: "",
      amountInText: "",
      currency: 1,
      password: "",
      encrypted: false,
      comment: "",
      exported: false,
      ready: false,
    }); 
  }

  handleAmountChange(amount, currency, amountInText) {
    this.setState({
      amount,
      amountInText,
    });
  }

  handlePasswordChange(password, encrypted) {
    this.setState({ password, encrypted });
  }

  handleTouchTap() {
    const {
      amount,
      currency,
      crypto,
      comment,
      encrypted,
      password,
    } = this.state;

    const {
      balance,
      loading,
      snackbarUpdate, 
      refreshCoinBalance,
      wallet,
    } = this.props;

    loading(true);
    this.setState({
      exported: true,
    });

    wallet.exportFile(amount, {
      encrypt: encrypted,
      passphrase: encrypted ? password : "",
      comment: comment,
      currency: crypto,
      // expiryPeriod_ms: (1000 * 60 * 60 * 3) - 1000,
    }).then((exportObj) => {
      const { callerArgs } = exportObj;
      delete exportObj.callerArgs;
      const urlEncoded = encodeURIComponent(JSON.stringify(exportObj, null, 2));
      loading(false);

      this.setState({
        ready: true,
        href: `data:application/json;charset=utf8,${urlEncoded}`,
        download: `${callerArgs.filename}.json`,
      });
      return refreshCoinBalance();
    }).then((newBalance) => {
      snackbarUpdate([
        `File ready. New balance ${crypto}${parseFloat(newBalance).toFixed(8)}`,
        "Please download the file to avoid loosing your Coins"
      ]);
    }).catch((err) => {
      let messages = [err.message || "Error on exporting coins to file"];
      refreshCoinBalance().then((newBalance) => {
        const difference = newBalance - balance;
        loading(false);
        this.setState({
          exported: false,
        });
        if (difference < 0) {
          messages.push("Some invalid coins were removed in your wallet")
          messages.push(`Your wallet balance decreased ${crypto} ${Math.abs(difference).toFixed(8)}`);
        }
        snackbarUpdate(messages, true);
      }).catch(() => {
        loading(false);
        this.setState({
          exported: false,
        });
        snackbarUpdate(messages, true);
      });
    });
  }

  render() {
    let {
      amount,
      amountInText,
      comment,
      crypto,
      currency,
      encrypted,
      exported,
      password,
      ready,
    } = this.state;

    const {
      isFullScreen,
      wallet,
    } = this.props;

    crypto = crypto || "XBT";
    let cvalue = crypto == "XBT" ? "btc" : crypto.toLowerCase();

    const disabled = exported || this.state.amount.length == 0 ||
      parseFloat(this.state.amount) <= 0 || (encrypted && !password);

    return (
      <FormArea
        isFullScreen={ isFullScreen }
        type={ this.props.type }
      >
        <div style={{ padding: '10px 20px' }}>
          <Title
            isFullScreen={ isFullScreen }
            label={ crypto + " to file" }
            labelRightWidth={ 100 }
            labelRight={ <div
              style={{
                display: 'flex',
                width: '100px',
                marginTop: '-10px',
                justifyContent: 'space-between'
              }}
            >
              <img
                src={ `css/img/currencies/${cvalue}e.png` }
                width={ 35 }
                height={ 35 }
              />
              { this.tools.getImageComponent('arrowRight.svg', 30, 30) }
              { this.tools.getImageComponent('export.svg', 30, 30) }
            </div> }
          />

          <CurrencyRadioGroup
            currency={ crypto }
            onChange={(ev, crypto) => {
              this.setState({
                crypto,
              });
            }}
          />

          <CoinSelector
            currency={ cvalue }
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            inputStyle={{
              color: styles.colors.mainTextColor,
            }}
            label="Value"
            onAmountChange={ this.handleAmountChange }
            value={ amountInText }
            xr={ this.props.xr }
          />

          <EncryptSelector
            onPasswordChange={ this.handlePasswordChange }
            encrypted={ encrypted }
            password={ password }
          />

          <TextField
            value={ comment }
            onChange={ (ev, comment) => this.setState({ comment }) }
            floatingLabelText="Comment"
            style={ this.styles.textfield }
            inputStyle={{
              color: styles.colors.mainTextColor,
            }}
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
          />

          <div style={{ marginTop: '20px' }}>
            <Button
              label="Reset"
              style={ this.styles.button2 }
              icon={ <i
                className="fa fa-undo"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> }
              onClick={ this.clearForm }
            />
            { ready ? <Button
              download={ this.state.download }
              href={ this.state.href }
              icon={ <i
                className="fa fa-arrow-circle-down"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> }
              label="Download File"
              style={ Object.assign({}, this.styles.button3, {margin: 'none'}) }
            /> : <Button
              disabled={ disabled }
              icon={ <i
                className="fa fa-file-code-o"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> }
              label="Export"
              onClick={ this.handleTouchTap }
              primary={ true }
              style={ this.styles.button3 }
            /> }
          </div>
        </div>
      </FormArea>
    );
  }
}

CoinsToFile.propTypes = {
  //wallet: PropTypes.object.isRequired,
};

export default CoinsToFile;
