import React, {Component} from 'react';
import PropTypes from 'prop-types';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';

import BitcoinCurrency from '../BitcoinCurrency';
import EncryptSelector from '../EncryptSelector';

import Time from '../../helpers/Time';
import styles from '../../helpers/Styles';

class CoinDialog extends Component {

  constructor(props) {
    super(props);

    this.styles = {
      red: {
        color: styles.colors.mainRed,
      },
      green: {
        color: styles.colors.mainGreen,
      },
      textarea: {
        display: 'inline-block',
        verticalAlign: 'middle',
        backgroundColor: 'transparent',
        border: 'none',
        color: styles.colors.mainBlack,
        margin: '0 0 0 10px',
        width: '300px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        height: '15px',
      },
      labelStyle: {
        textTransform: 'inherit',
        padding: '20px',
      },
      button: {
        border: '1px',
        borderColor: styles.colors.mainGrey,
        borderStyle: 'solid',
        marginLeft: '15px',
        height: 'inherit',
        lineHeight: 'inherit',
        margin: '5px 0',
        backgroundColor: styles.colors.mainTextColor,
      },
      button2: {
        border: '1px',
        borderColor: styles.colors.mainBlue,
        borderStyle: 'solid',
        marginLeft: '15px',
        height: 'inherit',
        lineHeight: 'inherit',
        margin: '5px 0',
        color: styles.colors.mainTextColor,
        backgroundColor: styles.colors.secondaryBlue,
      },
    };

    this.state = {
      deleted: false,
      encrypt: false,
      password: "",
      type: -1, // 0 - clipboard, 1 - file, select encryption, 2 - file created
      loading: false,
      loadingMessage: "",
      href: "",
      download: "",
    };

    this.time = new Time();

    this.handleDownloadFile = this.handleDownloadFile.bind(this);
    this.handleCopyString = this.handleCopyString.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleCreateFile = this.handleCreateFile.bind(this);
    this.handleExist = this.handleExist.bind(this);
  }

  handlePasswordChange(password, encrypt) {
    this.setState({ password, encrypt });
  }

  handleDownloadFile() {
    this.setState({
      type: 1,
    });
  }

  handleExist() {
    const {
      coin,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    this.setState({
      loading: true,
      loadingMessage: "check if coin exists...",
    });

    let oldBalance, newBalance;
    refreshCoinBalance().then((resp) => {
      oldBalance = resp;
      return wallet.existCoins(true, [coin.base64 || coin]);
    }).then((response) => {
      this.setState({
        loading: false,
        loadingMessage: "",
      });

      if (response.deferInfo) {
        snackbarUpdate(response.deferInfo.reason);
      } else if (!isNaN(response) && response > 0) {
        snackbarUpdate([
          'COIN DOES NOT EXIST',
          'The coin has been removed from your list'
        ], true);

        return refreshCoinBalance().then((resp) => {
          newBalance = resp;
          let value = oldBalance - newBalance;
          return wallet.recordTransaction({
            headerInfo: {
              fn: "export inexistent coin",
              domain: "localhost",
            },
            exportInfo: {
              faceValue: value,
              actualValue: 0,
              fee: 0,
              newValue: 0,
            },
            currency: "XBT",
          });
        }).then((resp) => {
          return newBalance;
        });
      } else {
        snackbarUpdate("Coin does exist");
        return true;
      }
    }).catch((err) => {
      snackbarUpdate(err.message, true);
    });
  }

  handleCreateFile() {
    const {
      wallet,
      snackbarUpdate, 
      refreshCoinBalance,
      coin,
    } = this.props;

    const {
      encrypt,
      password,
    } = this.state;

    const {
      value,
    } = coin;

    this.setState({
      loading: true,
      loadingMessage: "creating coin file...",
    });

    wallet.exportFile(value, {
      encrypt: encrypt,
      passphrase: encrypt ? password : "",
      comment: `export XBT${value}`,
    }).then((exportObj) => {
      const {
        callerArgs,
      } = exportObj;
      delete exportObj.callerArgs;
      const urlEncoded = encodeURIComponent(JSON.stringify(exportObj, null, 2));

      this.setState({
        loading: false,
        loadingMessage: "",
        deleted: true,
        type: 2,
        href: `data:application/json;charset=utf8,${urlEncoded}`,
        download: `${callerArgs.filename}.json`,
      });

      return refreshCoinBalance();
    }).then((balance) => {
      snackbarUpdate(`New balance XBT${parseFloat(balance).toFixed(8)}`);
    }).catch((err) => {
      this.setState({
        loading: false,
      });
      snackbarUpdate(err, true);
    });
  }

  handleCopyString() {
    const {
      coin,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    const {
      COIN_STORE,
      storage,
    } = wallet.config;

    let copyTextarea = document.querySelector('.js-copytextarea');
    const originalValue = copyTextarea.value;
    copyTextarea.value = coin.base64;
    copyTextarea.select();

    const message = "copying coin string into clipboard...";

    this.setState({
      loading: true,
      loadingMessage: message,
    });
    try {
      let successful = document.execCommand('copy');
      copyTextarea.value = originalValue;
      copyTextarea.blur();
      if (!successful) {
        this.setState({
          deleted: false,
          loading: false,
          loadingMessage: "",
        });
        throw new Error('Error when copying');
      } else {
        wallet.extractCoin(coin, message, {
          copyCoinString: true,
          targetValue: coin.value,
        }).then(() => {
          this.setState({
            deleted: true,
            type: 0,
            loading: false,
            loadingMessage: "",
          });

          return refreshCoinBalance();
        }).then((balance) => {
          snackbarUpdate(`New balance XBT${parseFloat(balance).toFixed(8)}`);
          return;
        }).catch((err) => {
          this.setState({
            deleted: false,
            type: -1,
            loading: false,
            loadingMessage: "",
          });

          snackbarUpdate(err.message || [
            'Problem when extracting coin string',
            'Maybe coin does not exists',
          ], true);
        });
      }
    } catch (err) {
      copyTextarea.value = originalValue;
      copyTextarea.blur();
      snackbarUpdate('Problem on copy String to clipboard', true);
    }
  }

  render() {
    const {
      coin,
      currency,
      fee,
      isFlipped,
      showButtons,
      showValuesInCurrency,
      verified,
      wallet,
      xr,
    } = this.props;

    const {
      deleted,
      loading,
      loadingMessage,
      href,
      type,
      encrypt,
      password,
      download,
    } = this.state;

    if (loading) {
      let style = {
        textAlign: 'center',
        margin: '15px',
      };
      return <section style={ style }>
        <CircularProgress
          size={ 150 }
          thickness={ 5 }
        />
        <p>
          <small>{ loadingMessage }</small>
        </p>
      </section>;
    } else if (deleted) {
      return <section style={{
        textAlign: 'center', 
      }}>
        <p style={{ fontSize: '110%' }}>
          <b>Coin removed from your list of coins and your balance.</b>
        </p>
        <hr/>
        <p>
          { type == 0 ? <span>
              Make sure to <b>use the string copied in your clipboard</b> or it will
              &nbsp;result in the permanent loss of your Coin.
            </span> : <span>
              Make sure to download the coin file by clicking on <b>Download coin file</b>
              &nbsp;button or it will result in the permanent loss of your Coin.
            </span> }
        </p>
        { type == 2 ? <div
          style={{
            margin: '20px 0 0 0',
          }}
        >
          <FlatButton
            id="download-coin-file"
            label="Download coin file"
            labelStyle={ this.styles.labelStyle }
            style={ this.styles.button2 }
            href={ href }
            download={ download }
          />
        </div> : null }
      </section>;
    } else if (type == 1) {
      // select encryption
      return <section>
        <p style={{
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: '30px',
        }}>
          Do you want to encrypt your Coin?
        </p>
        <EncryptSelector
          onPasswordChange={ this.handlePasswordChange }
          label="Encrypt the coin"
          style={{
            color: styles.colors.mainBlack,
          }}
          iconStyle={{
            fill: styles.colors.mainBlack,
          }}
          encrypted={ encrypt }
          password={ password }
        />
        <div
          style={{
            margin: '10px 0 0 0',
            textAlign: 'center',
          }}
        >
          <FlatButton
            label="Continue"
            disabled={ encrypt && !password }
            labelStyle={ this.styles.labelStyle }
            style={ this.styles.button2 }
            onClick={ this.handleCreateFile }
          />
        </div> 
      </section>;
    }

    let feeInfo = null;
    let coinValue = coin.value;

    if (verified !== null && verified === 0) {
      feeInfo = <div style={ this.styles.red }>
        <i className="fa fa-ban"/> Not verified (No fee applied)
      </div>;
    } else if (verified) {
      coinValue = verified || coin.value;
      feeInfo = <div style={ this.styles.green }>
        <p style={{ marginBottom: '5px' }}>
          <i
            className="fa fa-check"
            style={ this.styles.green }
          /> Verified (You now have sole possession of this Coin)
        </p>
        <span style={{
          marginLeft: '20px',
          fontSize: 'small',
        }}>
          Verification fee:
        </span> <BitcoinCurrency
          color="rgba(0, 0, 0, 0.6)"
          currency={ currency }
          displayStorage={ false }
          isFlipped={ isFlipped }
          style={{
            display: 'inline-block',
            verticalAlign: 'bottom',
          }}
          tiny={ true }
          showValuesInCurrency={ showValuesInCurrency }
          value={ parseFloat(fee) }
          wallet={ wallet }
          xr={ xr }
        />
      </div>;
    }

    return <section>
      <p style={{ fontSize: '110%' }}>
        Issuer <i>{ coin.d }</i> promises to pay the bearer on demand the sum of:
      </p>
      <BitcoinCurrency
        centered={ true }
        color={ styles.colors.mainBlue }
        currency={ currency }
        isFlipped={ isFlipped }
        small={ true }
        showValuesInCurrency={ showValuesInCurrency }
        style={{ marginBottom: '40px' }}
        value={ parseFloat(coinValue) }
        wallet={ wallet }
        xr={ xr }
      />
      <p>
        <b>Inactive date</b>: { this.time.formatDate(coin.e) }
      </p>
      { feeInfo }
      <p>
        <b>Coin string</b>:<textarea
          className="js-copytextarea"
          value={ coin.base64.substring(0, 30) + '...' }
          onChange={ () => {} }
          style={ this.styles.textarea }
        />
      </p>
      { showButtons ? <div
        style={{
          textAlign: 'center',
          margin: '40px 0 0 0',
        }}
      >
        <FlatButton
          label="Extract coin to file"
          labelStyle={ this.styles.labelStyle }
          style={ this.styles.button }
          onClick={ this.handleDownloadFile }
        />
        <FlatButton
          label="Extract coin to clipboard"
          labelStyle={ this.styles.labelStyle }
          style={ this.styles.button }
          onClick={ this.handleCopyString }
        />
        <FlatButton
          label="Check if coin exist"
          labelStyle={ this.styles.labelStyle }
          style={ this.styles.button }
          onClick={ this.handleExist }
        />
      </div> : null }
    </section>;
  }
};

CoinDialog.defaultProps = {
  currency: null,
  showButtons: true,
};

export default CoinDialog;
