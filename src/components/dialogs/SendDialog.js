import React from 'react';
import PropTypes from 'prop-types';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import CircularProgress from 'material-ui/CircularProgress';
import MenuItem from 'material-ui/MenuItem';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';

import Button from '../Button';
import FormArea from '../FormArea';
import Title from '../Title';
import BitcoinCurrency from '../BitcoinCurrency';
import CoinSelector from '../CoinSelector';
import SendConfirmDialog from './send/SendConfirmDialog';
import SendSuccessDialog from './send/SendSuccessDialog';
import SendList from './send/SendList';

import Tools from '../../helpers/Tools';
import styles from '../../helpers/Styles';

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

    this.styles = {
      note: {
        marginLeft: '230px',
        width: 'calc(100% - 230px)',
      },
      urgency: {
        display: 'grid',
        gridTemplateColumns: '150px calc(100% - 160px)',
        gridTemplateAreas: '"select fee"',
        gridGap: '10px',
      },
    };

    this.tools = new Tools();

    this.handleSendClick = this.handleSendClick.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleSpeedChange = this.handleSpeedChange.bind(this);

    this.reset = this.reset.bind(this);

    this._startTransfer = this._startTransfer.bind(this);
    this._successTransfer = this._successTransfer.bind(this);
    this._confirmTransfer = this._confirmTransfer.bind(this);
  }

  componentWillMount() {
    this._refreshFees(false, true);
  }

  _refreshFees(reload=false, initial=false) {
    const {
      snackbarUpdate,
    } = this.props;

    return this.props.wallet.getBitcoinFees(reload).then((resp) => {
      if (initial) {
        resp['sendStatus'] = "initial";
        resp['loadingMessage'] = '';
      }
      this.setState(resp);
      return true;
    }).catch((err) => {
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
    });
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
    } = this.props;

    if (issuerResponse.redeemInfo) {
      const {
        payment,
      } = this.state;

      const {
        refreshCoinBalance,
        wallet,
        xr,
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
    } else {
      this.setState({
        sendStatus: 'initial',
      });
      snackbarUpdate("Redeem response did not return expected result", true);
    }
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
      snackbarUpdate,
      wallet,
    } = this.props;

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


    const transferBTC = () => {
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
    };

    const handleError = (error) => {
      if (error.message == "Redeem deferred") {
        snackbarUpdate("Blockchain transfer has been scheduled and is expected to start soon");
        closeDialog();
        return refreshCoinBalance("XBT");
      }

      if (error.message) {
        snackbarUpdate(error.message, true);
        this.setState({
          sendStatus: 'initial',
        });
        return refreshCoinBalance("XBT");
      }

      snackbarUpdate("Failed to redeem coins", true);
      closeDialog();
      return refreshCoinBalance("XBT");
    };

    return this._refreshFees(true)
      .then(transferBTC)
      .catch(handleError);
  };

  handleSendClick() {
    const {
      wallet,
      xr,
    } = this.props;

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
        sendTabContent = <div style={{
          padding: "10px 20px",
          //marginTop: "-20px",
          marginTop: "20px",
          // background: "#ffffffa6",
          // borderRadius: "20px",
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            marginBottom: '5px',
          }}>
            <i
              className="fa fa-address-card fa-2x"
              style={{
                position: 'absolute',
                left: 0,
                top: 20,
                marginRight: '15px',
                color: styles.colors.darkBlue,
              }}
            />
            <TextField
              floatingLabelText="Bitcoin address"
              value={ address }
              floatingLabelFocusStyle={{
                color: styles.colors.secondaryBlue,
              }}
              floatingLabelStyle={{
                color: styles.colors.secondaryBlue,
                top: '24px'
              }}
              onChange={ (ev, address) => {
                this.setState({ address });
              } }
              style={ {
                marginLeft,
                width: `calc(100% - ${marginLeft})`,
                height: '57px',
              } }
              inputStyle={{
                color: styles.colors.darkBlue,
                marginTop: '5px',
              }}
            />
          </div>

          <CoinSelector
            currency="XBT"
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryBlue,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            initialCurrencyDisplay={ initialCurrencyDisplay }
            inputStyle={{
              color: styles.colors.darkBlue,
            }}
            label="Amount"
            max={ max }
            xr={ this.props.xr }
            onAmountChange={ this.handleAmountChange }
            style={{
              marginLeft,
              marginTop: '-10px',
            }}
            value={ amountInText }
          />

          <span className="hide-device"><div
            style={{
              display: 'grid',
              fontFamily: styles.fontFamily,
              fontSize: '12px',
              color: styles.colors.secondaryBlue,
              marginTop: '25px',
              marginLeft,
              marginBottom: '10px',
              gridTemplateColumns: '120px calc(100% - 130px)',
              gridTemplateAreas: "'radio fee'",
              gridGap: '10px',
            }}
          >
            <div style={{ gridArea: 'radio', marginLeft: '40px' }}>
              Urgency
            </div>
            <div style={{ gridArea: 'fee' }}>
              Bitcoin Miner fee
            </div>
          </div></span>

          <RadioButtonGroup
            valueSelected={ speed }	
            name="shipSpeed"
            style={{
              marginLeft,
            }}
            onChange={ this.handleSpeedChange }
            className="hide-device"
          >
            { urgencyItems.map((item, index) => {
                const {
                  label,
                  value,
                  fee,
                } = item;

                return <RadioButton
                  key={ index }
                  value={ value }
                  iconStyle={{
                    fill: styles.colors.darkBlue,
                  }}
                  label={ <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px calc(100% - 90px)',
                      gridTemplateAreas: "'radio fee'",
                      gridGap: '10px',
                    }}
                  >
                    <div style={{ gridArea: 'radio' }}>
                      { label}
                    </div>
                    <BitcoinCurrency
                      { ...this.props }
                      color={ styles.colors.darkBlue }
                      currency="XBT"
                      displayStorage={ false }
                      small={ true }
                      labelButtonStyle={{
                        color: styles.colors.mainTextColor,
                      }}
                      style={{
                        gridArea: 'fee',
                      }}
                      value={ parseFloat(fee) }
                    /> 
                  </div> }
                  labelStyle={{
                    color: styles.colors.darkBlue,
                    zIndex: 3,
                  }}
                />;
              }) }
          </RadioButtonGroup>

          <span className="show-device">
            <SelectField
              floatingLabelText="Urgency"
              floatingLabelStyle={{
                color: styles.colors.secondaryBlue,
              }}
              labelStyle={{
                color: styles.colors.darkBlue,
              }}
              onChange={ (ev, id, speed) => this.setState({ speed }) }
              style={{
                marginLeft,
                width: `calc(100% - ${marginLeft})`,
                color: styles.colors.darkBlue,
              }}
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
                    primaryText={ <span>
                      { label } <small>(fee XBT{ fee })</small>
                    </span> }
                    style={{
                      padding: '0px 10px',
                    }}
                  />;
              }) }
            </SelectField>
          </span>

          <TextField
            value={ note }
            onChange={ (ev, note) => {
              this.setState({ note });
            } }
            floatingLabelText="Note"
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryBlue,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            inputStyle={{
              color: styles.colors.darkBlue,
            }}
            style={{
              marginLeft,
              width: `calc(100% - ${marginLeft})`,
              marginTop: '0px',
            }}
          />
          <div
            style={{
              margin: '35px 0 10px 0',
            }}
          >
            <Button
              label="Reset"
              style={{
                margin: '0 5px 0 0',
                width: 'calc(50% - 5px)',
              }}
              icon={ <i
                className="fa fa-undo"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> }
              onClick={ this.reset }
            />
            <Button
              label="Continue"
              disabled={ disabled }
              style={{
                margin: '0 0 0 5px',
                width: 'calc(50% - 5px)',
              }}
              icon={ <i
                className="fa fa-angle-double-right"
                style={{
                  color: styles.colors.mainTextColor,
                }}
              /> }
              onClick={ this.handleSendClick }
            />
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
  wallet: PropTypes.object.isRequired,
  refreshCoinBalance: PropTypes.func,
  snackbarUpdate: PropTypes.func,
  balance: PropTypes.number,
};

export default SendDialog;
