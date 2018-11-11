
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import TextField from 'material-ui/TextField';

import CoinSelector from '../../CoinSelector';
import EncryptSelector from '../../EncryptSelector';
import FormArea from '../../FormArea';
import Button from '../../Button';
import Title from '../../Title';

import styles from '../../../helpers/Styles';
import Tools from '../../../helpers/Tools';

class CoinsToFile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      amount: "",
      amountInText: "",
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

    const crypto = wallet.getPersistentVariable(wallet.config.CRYPTO) || "BTC";

    loading(true);
    this.setState({
      exported: true,
    });

    wallet.exportFile(amount, {
      encrypt: encrypted,
      passphrase: encrypted ? password : "",
      comment: comment,
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
    const {
      amount,
      amountInText,
      comment,
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

    let crypto = wallet.getPersistentVariable(wallet.config.CRYPTO) || "btc";
    crypto = crypto == "XBT" ? "btc" : crypto.toLowerCase();

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
            label="Coins to file"
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
                src={ `css/img/currencies/${crypto}e.png` }
                width={ 35 }
                height={ 35 }
              />
              { this.tools.getImageComponent('arrowRight.svg', 30, 30) }
              { this.tools.getImageComponent('export.svg', 30, 30) }
            </div> }
          />

          <CoinSelector
            currency={ crypto }
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