import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import TextField from '@material-ui/core/TextField';

import { AppContext } from "../../../AppContext";
import FormArea from '../../FormArea';
import styles from '../../../helpers/Styles';
import Title from '../../Title';


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
    this.addInCoinStore = this.addInCoinStore.bind(this);
  }

  showResults(verify) {

    const {
      wallet,
      snackbarUpdate,
    } = this.context;

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
    this.context.refreshCoinBalance();
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
    } = this.props;

    const {
      loading,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.context;

    const {
      debug,
      ISSUE_POLICY,
      VERIFY_EXPIRE,
    } = wallet.config;
  
    if (coin.length == 0) {
      snackbarUpdate("Coin string is empty");
      return;
    }

    const newCoin = wallet.Coin(coin);
    const exists = wallet.getStoredCoins(false, newCoin.c)
      .some((storedCoin) => storedCoin == coin);

    if (exists) {
      snackbarUpdate("This coin is already in the store");
      return;
    }

    if (!newCoin) {
      snackbarUpdate("Invalid coin");
      return;
    }

    if (!verified) {
      this.addInCoinStore(newCoin.d, newCoin.c);
      return;
    }

    const showInfoAndRefreshBalance = (issuerResponse) => {
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
    };

    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }

      loading(false);

      let messages = [err.message || "Invalid coin"];
      if (err.name === "RangeError") {
        messages.push("Uncheck verify and try again");
      } else if (err.name === "EvalError") {
        messages.push("Try importing the coin without verification.");
      }
      snackbarUpdate(messages);

      return err;
    };


    loading(true);
    wallet.importVerifiedCoin(newCoin)
      .then(showInfoAndRefreshBalance)
      .catch(handleError);
  }

  addInCoinStore(domain, crypto) {
    // Import without verification == no fee
    const {
      coin,
      comment,
    } = this.state;

    const {
      handleShowCoin,
    } = this.props;

    const {
      loading,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.context;

    const handleResponse = (response) => {
      loading(false);
      handleShowCoin(wallet.Coin(response.coin[0]))({
        verified: 0,
        fee: 0,
        currency: crypto,
        crypto,
      });
      return refreshCoinBalance();
    };

    const handleError = (err) => {
      loading(false);
      snackbarUpdate(err.message || "Unable to import the coin");
    };

    loading(true);
    wallet.importCoin(coin, comment, domain, crypto)
      .then(handleResponse)
      .catch(handleError);
  }

  render() {
    const {
      results,
    } = this.state;

    const {
      type,
    } = this.props;

    const {
      isFullScreen,
      xr,
    } = this.context;

    return <section>
      <Title
        isFullScreen={ isFullScreen }
        label="Import Coin"
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={ this.state.verified }
            onChange={ (event) => this.setState({ verified: event.target.selected }) }
          />
        }
        label="Verify coin (to ensure you have sole possession of this coin)"
      />

      <TextField
        id="base64Coin"
        fullWidth
        helperText="around 230 characters"
        label="Paste Coin String here"
        margin="normal"
        multiline
        onChange={ (event) => this.setState({ coin: event.target.values }) }
        rowsMax="4"
        variant="filled"
      />

      <Button onClick={ this.handleClickButton }>
        Start import
      </Button>

    </section>;
  }
}

ImportCoin.contextType = AppContext;

export default ImportCoin;

