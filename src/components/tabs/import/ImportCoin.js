import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';

import Title from '../../Title';
import FormArea from '../../FormArea';
import Button from '../../Button';

import styles from '../../../helpers/Styles';

class ImportCoin extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      coin: "",
      verified: false,
      comment: "",
      results: {
        open: false,
        warning: false,
        actual: 0,
        face: 0,
        verified: 0,
        fee: 0,
      },
    };

    this.styles = {
      button: {
        width: '100%',
        margin: '35px 0 10px 0',
      },
    };

    this.handleClickButton = this.handleClickButton.bind(this);
    this.showResults = this.showResults.bind(this);
    this.cleanDialog = this.cleanDialog.bind(this);
    this._addInCoinStore = this._addInCoinStore.bind(this);
  }

  showResults(verify) {

    const {
      wallet,
      snackbarUpdate,
    } = this.props;

    this.setState({
      results: {
        open: true,
        warning: verify.faceValue !== verify.actualValue,
        actual: Number(verify.actualValue),
        face: Number(verify.faceValue),
        verified: Number(verify.verifiedValue),
        fee: Number(verify.totalFee),
      },
    });
  }

  cleanDialog() {
    this.props.refreshCoinBalance();
    this.setState({
      results: {
        open: false,
        warning: false,
        actual: 0,
        face: 0,
        verified: 0,
        fee: 0,
      },
    });
  }

  handleClickButton() {

    const {
      coin,
      verified,
    } = this.state;

    const {
      handleShowCoin,
      loading,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    const {
      ISSUE_POLICY,
      VERIFY_EXPIRE,
    } = wallet.config;
  
    if (coin.length == 0) {
      snackbarUpdate("Coin string is empty");
      return;
    }

    const newCoin = wallet.Coin(coin);
    const exists = wallet.getStoredCoins(false, newCoin.c).some((storedCoin) => {
      return storedCoin == coin;
    });
    if (exists) {
      snackbarUpdate("This coin is already in the store");
      return;
    }

    if (!newCoin) {
      snackbarUpdate("Invalid coin");
      return;
    }

    if (!verified) {
      this._addInCoinStore(newCoin.d, newCoin.c);
      return;
    }

    // Import with verification == fee
    loading(true);
    wallet.importVerifiedCoin(newCoin).then((issuerResponse) => {
      const {
        verifyInfo,
      } = issuerResponse;

      loading(false);
      if (verifyInfo) {
        handleShowCoin(newCoin)({
          verified: verifyInfo.verifiedValue,
          fee: verifyInfo.totalFee,
          currency: newCoin.c,
        });
      }
      return refreshCoinBalance();
    }).catch((err) => {
      loading(false);
      let messages = [err.message || "Invalid coin"];
      if (err.name === "RangeError") {
        messages.push("Uncheck verify and try again");
      } else if (err.name === "EvalError") {
        messages.push("Try importing the coin without verification.");
      }
      snackbarUpdate(messages);
      return err;
    });
  }

  _addInCoinStore(domain, crypto) {
    // Import without verification == no fee
    const {
      coin,
      comment,
    } = this.state;

    const {
      handleShowCoin,
      loading,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    loading(true);
    wallet.importCoin(coin, comment, domain, crypto).then((response) => {
      loading(false);
      handleShowCoin(wallet.Coin(response.coin[0]))({
        verified: 0,
        fee: 0,
        currency: crypto,
        crypto,
      });
      return refreshCoinBalance();
    }).catch((err) => {
      loading(false);
      snackbarUpdate(err.message || "Unable to import the coin");
    });
  }

  render() {
    const {
      results,
    } = this.state;

    const {
      isFullScreen,
      type,
      xr,
    } = this.props;

    return (
      <FormArea
        type={ type }
        isFullScreen={ isFullScreen }
      >
        <div style={{ padding: '10px 20px' }}>
          <Title
            isFullScreen={ isFullScreen }
            label="Import Coin"
          />

          <Checkbox
            label="Verify coin (to ensure you have sole possession of this coin)"
            labelStyle={{
              width: 'initial',
              color: styles.colors.mainTextColor,
              fontSize: '13px',
            }}
            iconStyle={{
              fill: styles.colors.mainTextColor,
            }}
            onCheck={ (ev, verified) => this.setState({ verified }) }
          />

          <TextField
            multiLine={ true }
            fullWidth={ true }
            id="base64Coin"
            className="textArea"
            rows={ 2 }
            floatingLabelText="Paste Coin String here"
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
              top: '40px',
            }}
            onChange={ (ev, coin) => this.setState({ coin }) }
            style={{
              marginTop: '-5px',
            }}
          /> 

          <Button
            label="Start import"
            onClick={ this.handleClickButton }
          />
        </div>
      </FormArea>
    );
  }
}

export default ImportCoin;
