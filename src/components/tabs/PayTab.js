import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Avatar from '@material-ui/core/Avatar';

import isURL from 'validator/lib/isURL';

import BitcoinCurrency from '../BitcoinCurrency';
import HelpTooltip from '../HelpTooltip';
import RateLoader from './exchange/RateLoader';
import SwapInfo from './pay/SwapInfo';
import PaymentInfo from './pay/PaymentInfo';

import styles from '../../helpers/Styles';
import FSM from '../../helpers/FSM';


class PayTab extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      checked: false,
      item: null,
      // disabled: true,
      errorMsg: "",
      state: "LoaderInfo",
      args: {
        message: "Preparing currencies...",
      },
    };

    this.notificationFSM = this.notificationFSM.bind(this);

    this._initializeStyles = this._initializeStyles.bind(this); 
    this._initializeStyles(props);

    this.renderEmailCheckbox = this.renderEmailCheckbox.bind(this);
    this.runPaymentFSM = this.runPaymentFSM.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  handleOnClick() {
    console.log("nothing to do yet");
  }

  componentWillMount() {
    let {
      paymentDetails,
      wallet,
    } = this.props;

    const {
      amount,
      currency,
    } = paymentDetails;

    this.props.refreshIssuerRates(false);
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.exchangeRates != this.props.exchangeRates) {
      // rates are ready to use
      this.runPaymentFSM();
    }
  }

  _initializeStyles(props) {
    const buttonSection = props.isFullScreen ? {} : {
      position: props.active ? 'fixed' : 'inherit',
      bottom: '60px',
      width: 'calc(100% - 80px)',
    };

    this.styles = {
      button: {
        marginTop: '0',
        textAlign: 'center',
      },
      buttonSection, 
      checkbox: {
        marginTop: '5px',
        textAlign: 'left',
        fontSize: '13px',
      },
      container: {
        padding: props.isFullScreen ? '30px' : '5px 18px',
        backgroundImage: "url('css/img/Bitcoin-express-bg2.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPositionX: props.isFullScreen ? '-30%' : '-220px',
        backgroundSize: props.isFullScreen ? '50%' : '110%',
        fontFamily: styles.fontFamily,
        textAlign: props.isFullScreen ? 'center' : 'left',
        height: props.isFullScreen ? 'inherit' : `${styles.minimizedHeight}px`,
      },
    };
  }

  notificationFSM(state, args) {
    // Depending on the state of the FSM, modify state of 
    // the PayTab Component
    const {
      removePayment,
    } = this.props;

    return new Promise((resolve, reject) => {

      switch(state) {
        case "disableSwap":
          this.setState({
            disabled: true,
          });
          break;

        case "displaySwap":
          this.handleOnClick = function() {
            resolve(true);
          }.bind(this);
          this.setState({
            state: "SwapInfo",
            disabled: false,
            args,
          });
          break;

        case "displayPayment":
          this.handleOnClick = function() {
            resolve(this.state.checked);
          }.bind(this);
          this.setState({
            state: "PaymentInfo",
            disabled: false,
            args,
          });
          break;

        case "displayLoader":
          this.setState({
            state: "LoaderInfo",
            disabled: false,
            args,
          });
          resolve(true);
          break;

        case "displayItem":
          resolve(true);
          this.setState({
            state: "ItemInfo",
            disabled: false,
            args,
          });
          break;

        case "displayError":
          resolve(true);
          if (removePayment) {
            removePayment();
          }
          this.setState({
            state: "ErrorInfo",
            disabled: false,
            args,
          });
          break;

        case "displayRecovery":
          this.handleOnClick = function(resp) {
            resolve(resp);
          }.bind(this);
          this.setState({
            state: "Recover",
            disabled: false,
            args,
          });
          break;
      }
    });
  } 

  runPaymentFSM() {
    let {
      exchangeRates,
      expiryExchangeRates,
      loading,
      paymentDetails,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    const {
      storage,
    } = wallet.config;

    let machine = new FSM("paymentRequest", Object.assign({
      // Only for payment request
      //use by PaymentInterrupted
      coinsExist: false,
      //Simulates that Payment has failed
      failPayment: false,

      // These are needed by the state machine
      // if > 0 causes SplitCoin to be executed
      splitFee: 0,
      // when true simulates restart after power failure
      interrupted: false,

      // ALWAYS include when creating an FSM
      wallet: wallet,
      notification: this.notificationFSM,
      other: {
        rates: exchangeRates,
        expiryExchangeRates,
      },
    }, paymentDetails));

    const handleError = (err) => {
      console.log(err);
      if (this.state.paymentSessionStarted) {
        return storage.sessionEnd();
      }
    };

    machine.run()
      .then(() => refreshCoinBalance())
      .then(() => storage.sessionEnd())
      .catch(handleError);

    /*
    storage.sessionStart("Payment").then(() => {
      return machine.run();
    }).then(() => {
      return refreshCoinBalance();
    }).then(function() {
      console.log("PaymentRequest has run to completion");
      return storage.sessionEnd();
    }).catch(function(err) {
      console.log(err);
      return storage.sessionEnd();
    });
    */
  }

  renderEmailCheckbox() {
    const {
      wallet,
      paymentDetails,
    } = this.props;

    const {
      email,
    } = paymentDetails;

    const {
      checked,
    } = this.state;

    let emailActive = email && (email.receipt || email.refund);
    let userEmail = wallet.getSettingsVariable(wallet.config.EMAIL);

    if (!userEmail || !emailActive) {
      return null;
    }

    return <div style={ this.styles.checkbox }>
      <Checkbox
        onCheck={ (ev, checked) => this.setState({ checked }) }
        checked={ checked }
        label={ <span>Include <b>{ userEmail }</b></span> }
        disabled={ !emailActive }
        labelStyle={{
          width: 'initial',
          color: styles.colors.mainBlue,
          lineHeight: '25px',
        }}
        iconStyle={{
          fill: styles.colors.mainBlue,
          marginRight: '5px',
        }}
      />
      <HelpTooltip
        note={ <span>
          When enabled your email address will be added to the payment
          and sent to the seller. When included it gives the seller an
          automatic method to send you a receipt, deliver a product or
          provide a refund when applicable. Alternatively you may need
          to make separate arrangements with the seller to receive
          these things.
          <br /><br />
          <b>Note:</b> Sellers have no obligation to provide a receipt
          or to offer refunds. However, good sellers will typically offer
          these features. 
        </span> }
        style={{
          right: '0',
          display: 'block',
          width: '20px',
          position: 'absolute',
          margin: '-40px 0 0',
          zIndex: '20',
        }}
      />
    </div>;
  }

  render () {
    const {
      exchangeRates,
      isFlipped,
      isFullScreen,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const {
      storage,
    } = wallet.config;

    const {
      amount,
      currency,
      domain,
      memo,
      payment_url,
      seller,
    } = this.props.paymentDetails;

    const {
      disabled,
      errorMsg,
      item,
      state,
    } = this.state;


    if (Object.keys(exchangeRates).length === 0) {
      return <RateLoader />;
    }
    let total = 0;

    switch (state) {

      case "ErrorInfo":
        const {
          error,
          errorType,
        } = this.state.args;

        if (errorType == "insufficientFunds") {
          return <div style={{
            textAlign: 'center',
            marginTop: '25px',
            fontFamily: styles.fontFamily,
            color: styles.colors.mainTextColor,
          }}>
            <div style={{ color: '#9e0000' }}>
              { error || "Insufficient funds" }
            </div>
            <div style={{ marginLeft: '15px' }}>
              <PaymentInfo
                amount={ amount }
                currency={ currency }
                disabled={ true }
                domain={ domain }
                inactive={ true }
                fee={ 0 }
                isFlipped={ isFlipped }
                isFullScreen={ isFullScreen }
                memo={ memo }
                payment_url={ payment_url }
                seller={ seller }
                showValuesInCurrency={ showValuesInCurrency }
                total={ 0 }
                wallet={ wallet }
                xr={ xr }
              />
            </div>
          </div>;
        }

        return <div style={{
          textAlign: 'center',
          marginTop: '25px',
          color: '#9e0000',
          fontFamily: styles.fontFamily,
          color: styles.colors.mainTextColor,
        }}>
          { error || "Error on trying to proceed with the payment" }
        </div>;

      case "LoaderInfo":
        const {
          message,
        } = this.state.args;
        return <RateLoader message={ message } />;

      case "SwapInfo":
        const {
          swapList,
          secsToExpire,
        } = this.state.args;
        total = parseFloat(amount);

        return <div style={ this.styles.container }>
          <SwapInfo
            amount={ amount }
            currency={ currency }
            disabled={ disabled }
            errorMsg={ errorMsg }
            isFlipped={ isFlipped }
            isFullScreen={ isFullScreen }
            memo={ memo }
            payment_url={ payment_url }
            secsToExpire={ secsToExpire }
            showValuesInCurrency={ showValuesInCurrency }
            swapList={ swapList }
            total={ total }
            wallet={ wallet }
            xr={ xr }
          />

          <div style={ this.styles.buttonSection }>
            <div style={ this.styles.button }>
              <Button
                disabled={ disabled }
                label={ "Confirm swap" }
                labelStyle={{
                  color: styles.colors.mainTextColor,
                  fontWeight: 'bold',
                }}
                style={{
                  backgroundColor: styles.colors.mainBlue,
                  borderRadius: '5px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                primary={ true }
                onClick={ this.handleOnClick }
                variant="contained"
              />
            </div>
          </div>
        </div>;

      case "Recover":
        const {
          recoveryFee,
        } = this.state.args;

        return <div style={ this.styles.container }>
          <h3 style={{
            color: styles.colors.mainTextColor,
          }}>
            Payment failed due to bad response from seller
          </h3>

          <br />

          <div style={ this.styles.button }>
            <Button
              disabled={ disabled }
              label="Recover payment coin and exit"
              labelStyle={{
                color: styles.colors.mainTextColor,
                fontWeight: 'bold',
              }}
              style={{
                backgroundColor: styles.colors.mainBlue,
                borderRadius: '5px',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              primary={ true }
              onClick={ () => this.handleOnClick(true) }
              variant="contained"
            />
          </div>

          <div style={ Object.assign({}, this.styles.label, {
            fontSize: "12px",
            textAlign: "center",
          }) }>
            cost of &nbsp;&nbsp;<BitcoinCurrency
              centered={ false }
              color="#3c3c3c"
              currency={ currency }
              displayStorage={ false }
              isFlipped={ isFlipped }
              style={{
                display: 'inline-block',
                overflow: 'inherit',
              }}
              labelStyle={{
                marginTop: '7px',
                color: styles.colors.mainBlue,
              }}
              tiny={ true }
              removeInitialSpaces={ !isFullScreen }
              showValuesInCurrency={ showValuesInCurrency }
              value={ parseFloat(recoveryFee) }
              wallet={ wallet }
              xr={ xr }
            />
          </div>

          <br />

          <div style={ this.styles.button }>
            <Button
              disabled={ disabled }
              label="Retry payment now"
              labelStyle={{
                color: styles.colors.mainTextColor,
                fontWeight: 'bold',
              }}
              style={{
                backgroundColor: styles.colors.mainBlue,
                borderRadius: '5px',
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
              primary={ true }
              onClick={ () => this.handleOnClick(false) }
              variant="contained"
            />
          </div>

        </div>;

      case "PaymentInfo":
        const {
          splitFee,
          timeToExpire,
        } = this.state.args;
        console.log("timetoexpire - " + timeToExpire)
        total = parseFloat(amount) + parseFloat(splitFee);

        return <div style={ this.styles.container }>

          <PaymentInfo
            amount={ amount }
            currency={ currency }
            disabled={ disabled }
            domain={ domain }
            errorMsg={ errorMsg }
            fee={ splitFee }
            isFlipped={ isFlipped }
            isFullScreen={ isFullScreen }
            memo={ memo }
            payment_url={ payment_url }
            seller={ seller }
            showValuesInCurrency={ showValuesInCurrency }
            timeToExpire={ parseInt(timeToExpire) }
            total={ total }
            wallet={ wallet }
            xr={ xr }
          />

          <div style={ this.styles.buttonSection }>
            <div style={ this.styles.button }>
              <Button
                disabled={ disabled }
                label="Confirm payment"
                labelStyle={{
                  color: styles.colors.mainTextColor,
                  fontWeight: 'bold',
                }}
                style={{
                  backgroundColor: styles.colors.mainBlue,
                  borderRadius: '5px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                primary={ true }
                onClick={ () => {
                  return storage.sessionStart("Payment").then(() => {
                    this.setState({
                      paymentSessionStarted: true,
                    });
                    return this.handleOnClick();
                  });
                }}
                variant="contained"
              />
            </div>

            { this.renderEmailCheckbox() }
          </div>
        </div>;

      case "ItemInfo":
        const {
          paymentDetails,
          paymentAck,
        } = this.state.args.item;

        let returnComponent = <div style={ this.styles.answer }>
          <b><i>{ paymentAck.return_url }</i></b>
        </div>;
        if (isURL(paymentAck.return_url)) {
          returnComponent = <div style={ this.styles.answer }>
            <a
              href={ paymentAck.return_url }
              target="_blank"
            >
              link to item
            </a>
          </div>;
        }

        return <div style={ this.styles.container }>
          <h3 style={{
            color: styles.colors.mainTextColor,
          }}>
            { paymentAck.memo }
          </h3>
          <div style={ this.styles.label }>
            You paid:
          </div>
          <BitcoinCurrency
            centered={ isFullScreen }
            color="#3c3c3c"
            currency={ currency }
            displayStorage={ false }
            isFlipped={ isFlipped }
            labelStyle={{
              color: styles.colors.mainBlue,
            }}
            small={ true }
            removeInitialSpaces={ !isFullScreen }
            showValuesInCurrency={ showValuesInCurrency }
            value={ parseFloat(amount) }
            wallet={ wallet }
            xr={ xr }
          />
          <div style={ this.styles.label }>
            <br />
            And recieved:
          </div>
          { returnComponent }
        </div>;
    }
  }
}

export default PayTab;
