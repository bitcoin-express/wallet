import React from 'react';
import PropTypes from 'prop-types';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../../AppContext";
import BitcoinCurrency from '../BitcoinCurrency';
//import Button from '../Button';
import CoinSelector from '../CoinSelector';
import FormArea from '../FormArea';
import SendConfirmDialog from './send/SendConfirmDialog';
import SendSuccessDialog from './send/SendSuccessDialog';
import SendList from './send/SendList';
import styles from '../../helpers/Styles';
import Title from '../Title';


const componentStyles = theme => ({
  root: {
  },
  formControl: {
    marginBottom: theme.spacing.unit * 3,
    marginTop: theme.spacing.unit * 3,
  },
  formControlLabel: {
    width: '100%',
  },
  group: {
    margin: `${theme.spacing.unit}px 0`,
  },
  textField: {
    marginBottom: '10px',
  },
});


class SpeedSelector extends React.Component {
  constructor(props) {
    super(props);

    this.getItems = this.getItems.bind(this);
  }

  getItems() {
    return this.props.items.map((item, index) => {
      const {
        label,
        value,
        fee,
      } = item;

      const labelComponent = <Grid container spacing={16}>
        <Grid item xs={2}>
          { label }
        </Grid>
        <Grid item xs={10}>
          <BitcoinCurrency
            color="black"
            currency="XBT"
            displayStorage={ false }
            tiny={ true }
            value={ parseFloat(fee) }
          />
        </Grid>
      </Grid>;

      return <FormControlLabel
        className={ this.props.classes.formControlLabel }
        control={ <Radio /> }
        key={ index }
        value={ value }
        label={ labelComponent }
      />;
    });
  }

  render() {
    return <FormControl
      className={ this.props.classes.formControl }
      fullWidth
    >
      <FormLabel>Urgency</FormLabel>
      <RadioGroup
        aria-label="Speed"
        className={ this.props.classes.group }
        name="speed"
        onChange={ this.props.handleSpeedChange }
        value={ this.props.speed }	
      >
        { this.getItems() }
      </RadioGroup>
      <FormHelperText>Bitcoin Miner Fee</FormHelperText>
    </FormControl>;
  }
}

SpeedSelector = withStyles(componentStyles)(SpeedSelector);


class SendDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      address: "",
      amount: "",
      amountInText: "",
      initialCurrencyDisplay: null,
      speed: "fastestFee",
      note: "",
      fastestFee: 0,
      soonFee: 0,
      noHurryFee: 0,
      minFee: 0,
      loadingMessage: "Retrieving Bitcoin Fees",
      sendStatus: "loading", // initial/loading/confirm/success
    };

    this.handleSendClick = this.handleSendClick.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleSpeedChange = this.handleSpeedChange.bind(this);

    this.reset = this.reset.bind(this);

    this._startTransfer = this._startTransfer.bind(this);
    this._successTransfer = this._successTransfer.bind(this);
    this._confirmTransfer = this._confirmTransfer.bind(this);
  }

  componentDidMount() {
    this._refreshFees(false, true);
  }

  _refreshFees(reload=false, initial=false) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    const updateState = (resp) => {
      if (initial) {
        resp['sendStatus'] = "initial";
        resp['loadingMessage'] = '';
      }
      this.setState(resp);
      return true;
    };

    const handleError = (err) => {
      snackbarUpdate(err.msg || [
        "Can't connect to the issuer to get the fees",
        "Please try again later"
      ]);
      let state = {
        error: true,
      };
      if (initial) {
        state['sendStatus'] = "initial";
        state['loadingMessage'] = '';
      }
      this.setState(state);
    };

    return wallet.getBitcoinFees(reload)
      .then(updateState)
      .catch(handleError);
  }

  reset() {
    this.setState({
      address: "",
      amount: "",
      amountInText: "",
      speed: "fastestFee",
      note: "",
      sendStatus: 'initial',
    });
  }

  handleAmountChange(amount, currency, amountInText) {
    this.setState({
      amount,
      amountInText,
      initialCurrencyDisplay: currency
    });
  }

  handleSpeedChange(event, speed) {
    this.setState({ speed });
  }

  _successTransfer(issuerResponse) {

    const {
      snackbarUpdate,
      wallet,
      xr,
    } = this.context;

    if (issuerResponse.redeemInfo) {
      const {
        payment,
      } = this.state;

      const {
        refreshCoinBalance,
      } = this.props;

      let {
        blockchainTxid,
        blockchainFee,
        blockchainAddress,
        comment,
        totalFee,
      } = issuerResponse.redeemInfo;
      totalFee = parseFloat(totalFee);

      this.setState({
        loadingMessage: "Transfer success. Refreshing balance...",
      });

      return refreshCoinBalance("XBT").then((balance) => {
        const amount = parseFloat(payment.amount);
        const initialBalance = parseFloat(balance) + totalFee + amount;

        let sendSuccessProps = Object.assign({}, this.props);
        sendSuccessProps['balance'] = balance;
        sendSuccessProps['blockchainAddress'] = blockchainAddress;
        sendSuccessProps['blockchainTxid'] = blockchainTxid;
        sendSuccessProps['comment'] = comment;
        sendSuccessProps['fee'] = totalFee;
        sendSuccessProps['initialBalance'] = initialBalance;
        sendSuccessProps['payment'] = amount;

        this.setState({
          sendSuccessProps,
          sendStatus: 'success',
        });

        return issuerResponse;
      }).catch((err) => {
        snackbarUpdate("Problem on updating the balance", true);
        this.setState({
          sendStatus: 'initial',
        });
      });
    }

    if (issuerResponse.deferInfo) {
      const {
        reason,
        after,
      } = issuerResponse.deferInfo;

      this.setState({
        sendStatus: 'initial',
      });

      snackbarUpdate(`Deferred, may be ready after ${after}.`);
      return issuerResponse;
    }

    this.setState({
      sendStatus: 'initial',
    });
    snackbarUpdate("Redeem response did not return expected result", true);
    return issuerResponse;
  }

  _confirmTransfer(amount, blockchainFee = 0, executePayment) {
    const {
      payment,
      address,
      note,
    } = this.state;

    let sendConfirmProps = Object.assign({}, this.props);
    sendConfirmProps['amount'] = amount;
    sendConfirmProps['address'] = address;
    sendConfirmProps['note'] = note;
    sendConfirmProps['blockchainFee'] = blockchainFee;
    sendConfirmProps['total'] = amount + blockchainFee;
    sendConfirmProps['onClickSend'] = () => {
      this.setState({
        sendStatus: 'loading',
        loadingMessage: "Executing Bitcoin transfer...",
      });
      executePayment();
    };

    this.setState({
      sendConfirmProps,
      sendStatus: 'confirm',
    });
  }

  _startTransfer() {
    const {
      closeDialog,
      refreshCoinBalance,
    } = this.props;

    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    const {
      amount,
      address,
      note,
      speed,
    } = this.state;

    let uri = `bitcoin:${address}?amount=${amount}`;
    if (note) {
      uri += `&message=${note}`;
    }

    let payment = wallet._parseBitcoinURI(uri);

    if (!payment) {
      snackbarUpdate("Bitcoin payment URI is invalid", true);
      return;
    }

    this.setState({
      sendStatus: 'loading',
      loadingMessage: "Reloading Bitcoin fees...",
    });

    return this._refreshFees(true).then(() => {
      this.setState({
        payment,
        loadingMessage: "Preparing the Bitcoin transfer...",
      });

      const args = {
        confirmation: this._confirmTransfer,
        deferredSuccess: (resp) => {
          snackbarUpdate(`Send of XBT${parseFloat(amount).toFixed(8)} to now started.`);
          return resp;
        },
        success: this._successTransfer,
        refreshBalance: refreshCoinBalance,
      };
      return wallet.transferBitcoin(uri, speed, args);
    }).then(() => {
    }).catch((error) => {
      refreshCoinBalance("XBT").then(() => {
        if (error.message == "Redeem deferred") {
          snackbarUpdate("Blockchain transfer has been scheduled and is expected to start soon");
          closeDialog();
        } else if (error.message) {
          snackbarUpdate(error.message, true);
          this.setState({
            sendStatus: 'initial',
          });
        } else {
          snackbarUpdate("Failed to redeem coins", true);
          closeDialog();
        }
      });
    });
  };

  handleSendClick() {
    const {
      wallet,
      xr,
    } = this.context;

    xr.refreshExchangeRates().then(
      this._startTransfer, this._startTransfer
    );
  }

  render() {
    const {
      amount,
      amountInText,
      address,
      initialCurrencyDisplay,
      note,
      fastestFee,
      soonFee,
      noHurryFee,
      minFee,
      loadingMessage,
      sendStatus,
      sendConfirmProps,
      sendSuccessProps,
    } = this.state;

    let {
      speed,
    } = this.state;

    const {
      balance,
      classes,
    } = this.props;

    const marginLeft = '50px';
    const disabled = !speed || !amount || !address;

    let urgencyItems = [];
    let btcFee;
    if (parseFloat(balance) - parseFloat(fastestFee) >= 0) {
      btcFee = fastestFee;
      urgencyItems = [{
        label: 'Fastest',
        value: 'fastestFee',
        fee: fastestFee,
      }, {
        label: 'Soon',
        value: 'soonFee',
        fee: soonFee,
      }, {
        label: 'No hurry',
        value: 'noHurryFee',
        fee: noHurryFee,
      }, {
        label: 'Slow',
        value: 'minFee',
        fee: minFee,
      }];
    } else if (parseFloat(balance) - parseFloat(soonFee) >= 0) {
      btcFee = soonFee;
      speed = speed === 'fastestFee' ? 'soonFee' : speed;
      urgencyItems = [{
        label: 'Soon',
        value: 'soonFee',
        fee: soonFee,
      }, {
        label: 'No hurry',
        value: 'noHurryFee',
        fee: noHurryFee,
      }, {
        label: 'Slow',
        value: 'minFee',
        fee: minFee,
      }];
    } else if (parseFloat(balance) - parseFloat(noHurryFee) >= 0) {
      btcFee = noHurryFee;
      if (speed === 'fastestFee' || speed === 'soonFee') {
        speed = 'noHurryFee'
      }
      urgencyItems = [{
        label: 'No hurry',
        value: 'noHurryFee',
        fee: noHurryFee,
      }, {
        label: 'Slow',
        value: 'minFee',
        fee: minFee,
      }];
    } else if (parseFloat(balance) - parseFloat(minFee) >= 0) {
      btcFee = minFee;
      speed = 'minFee';
      urgencyItems = [{
        label: 'Slow',
        value: 'minFee',
        fee: minFee,
      }];
    }

    if (urgencyItems.length == 0) {
      return <section
        style={{
          textAlign: 'center',
          margin: '30px 15px',
        }}
      >
        <p>
          You can not send funds. Not enough balance.
        </p>
      </section>;
    }


    switch (speed) {
      case 'soonFee':
        btcFee = soonFee;
        break;
      case 'noHurryFee':
        btcFee = noHurryFee;
        break;
      case 'minFee':
        btcFee = minFee;
        break;
    }
    const max = parseFloat(balance) - parseFloat(btcFee);

    let sendTabContent = <section
      style={{
        textAlign: 'center',
        margin: '15px',
      }}
    >
      <CircularProgress
        size={ 150 }
        thickness={ 5 }
      />
      <p>
        <small>{ loadingMessage }</small>
      </p>
    </section>;

    switch (sendStatus) {

      case "initial":

        sendTabContent = <div className={ classes.root }>

          <TextField
            className={ classes.textField }
            fullWidth
            InputProps={{
              startAdornment: <i
                className="fa fa-at fa-lg"
                style={{
                  color: styles.colors.darkBlue,
                  marginRight: '5px',
                }}
              />,
            }}
            label="Bitcoin address"
            onChange={(ev) =>  this.setState({ address: ev.target.value })}
            value={ address }
          />

          <CoinSelector
            currency="XBT"
            initialCurrencyDisplay={ initialCurrencyDisplay }
            label="Amount"
            max={ max }
            onAmountChange={ this.handleAmountChange }
            value={ amountInText }
          />

          <SpeedSelector
            items={ urgencyItems }
            handleSpeedChange={ this.handleSpeedChange }
            speed={ speed }
          />

          <span className="show-device">
            <Select
              label="Urgency"
              onChange={ (ev) => this.setState({ speed: ev.target.value }) }
              value={ speed }
            >
              { urgencyItems.map((item, index) => {
                  const {
                    label,
                    value,
                    fee,
                  } = item;

                  return <MenuItem
                    key={ index }
                    value={ value }
                  >
                    <span>{ label } <small>(fee XBT{ fee })</small></span>
                  </MenuItem>;
              }) }
            </Select>
          </span>

          <TextField
            className={ classes.textField }
            fullWidth
            InputProps={{
              startAdornment: <i
                className="fa fa-pencil-square-o fa-lg"
                style={{
                  color: styles.colors.darkBlue,
                  marginRight: '5px',
                }}
              />,
            }}
            label="Note"
            onChange={ (ev, note) => this.setState({ note }) }
            value={ note }
          />

          <div
            style={{
              margin: '35px 0 10px 0',
            }}
          >
            <Button
              onClick={ this.reset }
            >
              <i
                className="fa fa-undo"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> Reset
            </Button>
            <Button
              disabled={ disabled }
              onClick={ this.handleSendClick }
            >
              <i
                className="fa fa-angle-double-right"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> Continue
            </Button>
          </div>
        </div>;
        break;

      case "confirm":

        sendTabContent = <SendConfirmDialog
          { ...sendConfirmProps }
        />;
        break;

      case "success":
        sendTabContent = <SendSuccessDialog
          { ...sendSuccessProps }
        />;
        break;
    }

    return sendTabContent;
    return <div style={{ marginTop: '20px' }}>
      <Tabs>

        <TabList>
          <Tab>Send</Tab>
          <Tab>History</Tab>
        </TabList>

        <TabPanel>
          { sendTabContent }
        </TabPanel>

        <TabPanel>
          <SendList
            { ...this.props }
          />
        </TabPanel>
      </Tabs>
    </div>;
  }
}

SendDialog.propTypes = {
  refreshCoinBalance: PropTypes.func,
  balance: PropTypes.number,
};

SendDialog.contextType = AppContext;

export default withStyles(componentStyles)(SendDialog);

