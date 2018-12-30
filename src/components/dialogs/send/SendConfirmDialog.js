import React from 'react';
import PropTypes from 'prop-types';

//import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import BitcoinCurrency from '../../BitcoinCurrency';
import Button from '../../Button';
import EncryptSelector from '../../EncryptSelector';
import HelpTooltip from '../../HelpTooltip';
import InfoBox from '../../InfoBox';

import styles from '../../../helpers/Styles';

class SendConfirmDialog extends React.Component {
  constructor(props) {
    super(props);

    this.styles = {
      row: {
        display: 'flex',
        flexWrap: 'nowrap',
        marginBottom: '5px',
      },
      colLeft: {
        minWidth: 'calc(50% - 30px)',
        textAlign: 'right',
        paddingRight: '15px',
      },
      labelStyle: {
        textTransform: 'inherit',
        padding: '5px 20px',
      },
      button: {
        border: '1px',
        borderColor: styles.colors.mainGrey,
        borderStyle: 'solid',
        height: 'inherit',
        lineHeight: 'inherit',
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
      encrypt: false,
      password: "",
      type: -1, // 0 - file, select encryption, 1 - file created
      loading: false,
      loadingMessage: "",
      href: "",
      download: "",
    };

    this.handleCreateFile = this.handleCreateFile.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleFileReady = this.handleFileReady.bind(this);
  }

  handlePasswordChange(password, encrypt) {
    this.setState({ password, encrypt });
  }

  handleCreateFile() {
    this.props.hideAlertTitleButton();
    this.setState({
      type: 0,
    });
  }

  handleFileReady() {
    const {
      amount,
      refreshCoinBalance,
      snackbarUpdate, 
      wallet,
    } = this.props;

    const {
      encrypt,
      password,
    } = this.state;

    this.setState({
      loading: true,
      loadingMessage: "creating coin file...",
    });
    wallet.exportFile(parseFloat(amount), {
      encrypt: encrypt,
      passphrase: encrypt ? password : "",
      comment: `export XBT${amount}`,
    }).then((exportObj) => {
      const { callerArgs } = exportObj;
      delete exportObj.callerArgs;
      const urlEncoded = encodeURIComponent(JSON.stringify(exportObj, null, 2));

      this.setState({
        loading: false,
        loadingMessage: "",
        type: 1,
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

  render() {
    const {
      address,
      amount,
      blockchainFee,
      isFlipped,
      issuerFee,
      note,
      onClickSend,
      showValuesInCurrency,
      total,
      totalFee,
      wallet,
      xr,
    } = this.props;

    const {
      loading,
      loadingMessage,
      href,
      type,
      encrypt,
      password,
      download,
    } = this.state;

    if (loading) {
      return <section style={{ textAlign: 'center', margin: '15px' }}>
        <CircularProgress
          size={ 150 }
          thickness={ 5 }
        />
        <p>
          <small>{ loadingMessage }</small>
        </p>
      </section>;
    } else if (type == 0) {
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
          <ButtonComponent
            label="Continue"
            disabled={ encrypt && !password }
            labelStyle={ this.styles.labelStyle }
            style={ this.styles.button2 }
            onClick={ this.handleFileReady }
          />
        </div> 
      </section>;
    } else if (type == 1) {
      return <section style={{
        textAlign: 'center', 
      }}>
        <p style={{ fontSize: '110%' }}>
          <b>Amount removed from your balance.</b>
        </p>
        <hr/>
        <p>
          Make sure to download the coin file by clicking on <b>Download coin file</b>
          &nbsp;button or it will result in the permanent loss of your Coin.
        </p>
        <div
          style={{
            margin: '20px 0 0 0',
          }}
        >
          <ButtonComponent
            id="download-coin-file"
            label="Download coin file"
            labelStyle={ this.styles.labelStyle }
            style={ this.styles.button2 }
            href={ href }
            download={ download }
          />
        </div>
      </section>;
    }

    return <section style={{ margin: "20px 0" }}>
      <InfoBox
        hidden={ !blockchainFee || blockchainFee <= 0 }
      >
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>
            Sending Bitcoin is irreversible!
          </h3>
          <small>
            Blockchain transfers can be expensive, consider sending a coin file instead.
          </small>
          <div style={{
            textAlign: 'center',
            margin: '10px 0 20px 0',
          }}>
            <ButtonComponent
              id="download-coin-file"
              label="Create coin file"
              labelStyle={ this.styles.labelStyle }
              style={ this.styles.button }
              onClick={ this.handleCreateFile }
            />
          </div>
          Save approximately &nbsp;&nbsp;<BitcoinCurrency
            color="#00000099"
            style={{
              display: 'inline-block',
              overflow: 'inherit',
              height: '15px',
            }}
            displayStorage={ false }
            removeInitialSpaces={ true }
            isFlipped={ isFlipped }
            showValuesInCurrency={ showValuesInCurrency }
            tiny={ true }
            value={ parseFloat(blockchainFee) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
      </InfoBox>

      <div style={{ marginBottom: '20px' }} />

      <div style={ this.styles.row }>
        <div style={ this.styles.colLeft }>
          Sending:
        </div>
        <BitcoinCurrency
          color={ styles.colors.mainBlue }
          style={{
            display: 'inline-block',
            overflow: 'inherit',
          }}
          displayStorage={ false }
          removeInitialSpaces={ true }
          isFlipped={ isFlipped }
          showValuesInCurrency={ showValuesInCurrency }
          tiny={ true }
          value={ parseFloat(amount) }
          wallet={ wallet }
          xr={ xr }
        />
      </div>
      <div style={ this.styles.row }>
        <div style={ this.styles.colLeft }>
          Bitcoin Fee:
        </div>
        <BitcoinCurrency
          color={ styles.colors.mainBlue }
          style={{
            display: 'inline-block',
            overflow: 'inherit',
          }}
          displayStorage={ false }
          removeInitialSpaces={ true }
          isFlipped={ isFlipped }
          showValuesInCurrency={ showValuesInCurrency }
          tiny={ true }
          value={ parseFloat(blockchainFee) }
          wallet={ wallet }
          xr={ xr }
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '5px' }}>
          <b>Total amount to be deducted from Wallet</b>
        </p>
        <BitcoinCurrency
          centered={ true }
          color={ styles.colors.mainBlue }
          displayStorage={ false }
          removeInitialSpaces={ true }
          isFlipped={ isFlipped }
          small={ true }
          showValuesInCurrency={ showValuesInCurrency }
          value={ parseFloat(total) }
          wallet={ wallet }
          xr={ xr }
        />
      </div>

      { note ? <div
        style={{
          color: styles.colors.mainBlue,
          borderStyle: 'solid',
          borderWidth: '1px',
          borderRadius: '4px',
          fontSize: '12px',
          margin: '20px 2vw 0 2vw',
          padding: '10px',
          position: 'relative',
          textAlign: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          backgroundColor: styles.colors.mainWhite,
          padding: '0 10px',
          marginTop: '-18px',
          right: '2vw',
        }}>
          Comment
        </div>
        { note }
      </div> : null }

      { (blockchainFee === 0) ? 
        <div style={{
          textAlign: 'center',
          color: styles.colors.mainRed,
          marginTop: '30px',
          fontSize: 'small',
          margin: '20px 0',
        }}>
          <b>NOTE</b>: Zero fee payments may take several DAYS to confirm
        </div>
      : null }

      <div style={{
        textAlign: 'center',
        marginTop: '20px',
      }}>
        <ButtonComponent
          label="Send Bitcoin"
          style={{
            maxWidth: '250px',
          }}
          onClick={ onClickSend }
        />
      </div>
    </section>;
  }
}

export default SendConfirmDialog;
