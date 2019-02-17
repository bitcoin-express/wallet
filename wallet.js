/**
* Copyright (c) 2018-present, RMP Protection Ltd.
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactDOM from 'react-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Wallet from './src/Wallet';
import styles from './src/helpers/Styles';

import { getDefaultParams } from "./config.js";

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

// possible background color: rgba(168, 186, 248, 0.46)
const muiTheme = getMuiTheme({
  palette: {
    primary1Color: styles.colors.mainColor,
  },
});

const states = {
  REVEAL_APP: 0,
  PROCESS_PAYMENT: 1,
};


class App extends React.Component {

  constructor(props) {
    super(props);

    this.MINIMAL_WALLET_WIDTH = styles.minimizedWidth + 20*2;
    this.MINIMAL_WALLET_HEIGHT = styles.minimizedHeight + 20*2;
    this.WALLET_WIDTH = styles.minimizedWidth + 20*2;
    this.WALLET_HEIGHT = styles.minimizedHeight + 20*2;

    this.state = {
      isFullScreen: props.isFullScreen,
      status: states.REVEAL_APP,
      paymentRequest: null,
    }

    this.styles = {
      minimized: {
        width: `${styles.minimizedWidth}px`,
        height: `${styles.minimizedHeight}px`,
        boxShadow: '0 0 10px 10px rgba(0, 0, 0, 0.05), 0 0 10px 10px rgba(0, 0, 0, 0.05)',
        textAlign: 'center',
        margin: '20px',
        backgroundColor: styles.colors.mainColor,
        border: 'solid white 4px',
        borderRadius: '50px 22px',
        overflow: 'hidden',
      },
      normal: {
        position: 'absolute',
        width: '100%',
        height: '100%', // 'calc(100% - 56px)',
        backgroundColor: styles.colors.mainColor,
      },
    };

    this.close = this.close.bind(this);
    this.switchWalletSize = this.switchWalletSize.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.handleShowAlert = this.handleShowAlert.bind(this);
    this.handleHideAlert = this.handleHideAlert.bind(this);
    this._revealWallet = this._revealWallet.bind(this);
  }

  _shutdown(message, reason, isClose) {
    if (isClose) {
      BitcoinExpress.Host.WalletClose(message, reason);
    } else {
      BitcoinExpress.Host.WalletRemove(message, reason);
    }
  }

  close(isClose=true) {
    let msg = 'Wallet closed';
    let reason = 'Closed';
    if (!isClose) {
      msg = 'Wallet removed';
    }
    this._shutdown(msg, reason, isClose);
  }

  _revealWallet() {
    const {
      isFullScreen,
    } = this.props;

    BitcoinExpress.Host.Initialise();
    return BitcoinExpress.Host.WalletReveal(
      "wallet",
      this.MINIMAL_WALLET_WIDTH,
      this.MINIMAL_WALLET_HEIGHT,
    ).then(() => {
      return BitcoinExpress.Host.WalletFullScreen(isFullScreen);
    });
  }

  componentDidMount() {
    /**
    * The first step is to get the parameters. I think there will be 3 options;
    * 1. Called by the Bitcoin-express library with no PaymentRequest parameter.
    *    In this case just display the wallet.
    * 2. Called by the Bitcoin-express library with a PaymentRequest object.
    *    This is the main situation I will demonstrate in this file.
    * 3. Called by the Browser when a bitcoin-e: uri is activated
    *    In this case it will be the desktop app version that will handle
    *    it so not shown here.
    */
    const {
      paymentRequest,
    } = this.props;

    // there's no payment request then simply display the Wallet
    if (paymentRequest == null) {
      console.log("No PaymentRequest present - just showing Wallet");
      this.setState({
        status: states.REVEAL_APP,
      });
    } else {
      this.setState({
        status: states.PROCESS_PAYMENT,
        paymentRequest,
      });
    }
    return this._revealWallet();
  }

  switchWalletSize(isFullScreen) {
    return () => {
      this.setState({
        isFullScreen,
      });
      BitcoinExpress.Host.WalletFullScreen(isFullScreen);
    };
  }

  handleShowAlert () {
    if (!this.state.isFullScreen) {

      $(".settings-drawer").css('display', 'none');
      $("#wallet").fadeOut(0);

      BitcoinExpress.Host.WalletGoModal(
        true,
        this.MINIMAL_WALLET_WIDTH,
        this.MINIMAL_WALLET_HEIGHT,
        "wallet"
      );
    }
  }

  handleHideAlert () {
    if (!this.state.isFullScreen) {
      // move to 0, 0
      $("#wallet").fadeOut(0);
      setTimeout(() => {
        BitcoinExpress.Host.WalletGoModal(
          false,
          this.MINIMAL_WALLET_WIDTH,
          this.MINIMAL_WALLET_HEIGHT
        );
        $("#wallet").css({ left: 0, top: 0, position: 'inherit' });
        $("#wallet").fadeIn('fast');
        $(".settings-drawer").css('display', 'block');
      }, 600);
    }
  }

  renderContent() {
    const {
      isFullScreen,
      paymentRequest,
      status,
    } = this.state;

    return <Wallet
      acceptableIssuers={ this.props.acceptableIssuers }
      close={ this.close }
      defaultIssuer={ this.props.defaultIssuer }
      isFullScreen={ isFullScreen }
      initializeDraggableArea={(id) => {
        BitcoinExpress.Host.WalletMakeDraggable(id);
      }}
      onAlertShown={ this.handleShowAlert }
      onAlertHidden={ this.handleHideAlert }
      onContractClick={ this.switchWalletSize(false) }
      onExpandClick={ this.switchWalletSize(true) }
      paymentRequest={ paymentRequest }
      removePayment={() => BitcoinExpress.Host.PopupMessage("Payment failed", 1500)}
    />;
  }

  render() {
    const {
      isFullScreen,
    } = this.state;

    return (
      <MuiThemeProvider muiTheme={ muiTheme }>
        <div
          id="container"
          className={ isFullScreen ? "desktop" : "wallet" }
          style={ isFullScreen ? this.styles.normal : this.styles.minimized }
        >
          { this.renderContent() }
        </div>
      </MuiThemeProvider>
    );
  }
}


function getParameterByName (name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  let results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}


ReactDOM.render(
  <App
    acceptableIssuers={ getDefaultParams().acceptableIssuers }
    defaultIssuer={ getDefaultParams().defaultIssuer }
    isFullScreen={ getParameterByName('fullScreen') == 'true' }
    paymentRequest={ JSON.parse(getParameterByName('paymentRequest')) }
  />,
  document.getElementById('wallet')
);
