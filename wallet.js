/**
* Copyright (c) 2018-present, RMP Protection Ltd.
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import ReactDOM from 'react-dom';

import { withStyles } from '@material-ui/core/styles';
import {
  MuiThemeProvider,
  createMuiTheme
} from '@material-ui/core/styles';

import { AppProvider } from "./src/AppContext";
import App from './src/App';
import styles from './src/helpers/Styles';
import i18n from './src/helpers/i18n';
import { getParameterByName } from './src/helpers/tools';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: styles.colors.mainColor,
      light: styles.colors.secondaryBlue,
      dark: styles.colors.darkBlue,
      contrastText: styles.colors.mainTextColor,
    },
    secondary: {
      main: "#7b95dc", //styles.colors.thirdBlue,
      light: styles.colors.mainGrey,
      dark: "#687eb9", //styles.colors.darkBlue,
      contrastText: styles.colors.secondaryTextColor,
    },
    /*secondary: {
      main: styles.colors.secondaryColor,
      light: styles.colors.mainGrey,
      dark: styles.colors.mainBlack,
      contrastText: styles.colors.secondaryTextColor,
    },*/
  },
  typography: {
    useNextVariants: true,
  },
});


const states = {
  REVEAL_APP: 0,
  PROCESS_PAYMENT: 1,
};


const WalletContext = React.createContext();

const componentStyles = (theme) => {

  const {
    colors,
    minimizedWidth,
    minimizedHeight,
  } = styles;

  console.log("MUI theme: ", theme);

  return {
    rootMin: {
      width: `${minimizedWidth}px`,
      height: `${minimizedHeight}px`,
      position: 'absolute',
      boxShadow: '0 0 10px 10px rgba(0, 0, 0, 0.05), 0 0 10px 10px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      margin: '20px',
      backgroundColor: "#f1f3f7", // colors.mainColor,
      border: 'solid white 4px',
      borderRadius: '50px 22px',
      overflow: 'hidden',
    },
    root: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: "#f1f3f7", // colors.mainColor,
    },
  };

};


class WalletApp extends React.Component {

  constructor(props) {
    super(props);

    this.MINIMAL_WALLET_WIDTH = styles.minimizedWidth + 20*2;
    this.MINIMAL_WALLET_HEIGHT = styles.minimizedHeight + 20*2;
    this.WALLET_WIDTH = styles.minimizedWidth + 20*2;
    this.WALLET_HEIGHT = styles.minimizedHeight + 20*2;

    this.state = {
      isFullScreen: props.isFullScreen,
      paymentRequest: null,
      status: states.REVEAL_APP,
    };

    this.i18n = new i18n("en");

    this.close = this.close.bind(this);
    this.switchWalletSize = this.switchWalletSize.bind(this);
    this.setLanguage = this.setLanguage.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.handleShowAlert = this.handleShowAlert.bind(this);
    this.handleHideAlert = this.handleHideAlert.bind(this);
    this._revealWallet = this._revealWallet.bind(this);
  }

  _shutdown(message, reason, isClose) {
    if (isClose) {
      BitcoinExpress.Host.WalletClose(message, reason);
      return;
    }
    BitcoinExpress.Host.WalletRemove(message, reason);
  }

  setLanguage(lang) {
    this.lang.setLanguage(lang);
  }

  close(isClose=true) {
    const key = isClose ? "wclosed" : "wremoved";
    const reason = this.i18n.t("closed");
    this._shutdown(this.i18n.t(key), reason, isClose);
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

    if (paymentRequest) {
      this.setState({
        status: states.PROCESS_PAYMENT,
        paymentRequest,
      });
      return this._revealWallet();
    }

    console.log("No PaymentRequest present - just showing Wallet");
    this.setState({
      status: states.REVEAL_APP,
    });
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

    if (this.state.isFullScreen) {
      return;
    }

    $("#settings-drawer").css('display', 'none');
    $("#wallet").fadeOut(0);

    BitcoinExpress.Host.WalletGoModal(
      true,
      this.MINIMAL_WALLET_WIDTH,
      this.MINIMAL_WALLET_HEIGHT,
      "wallet"
    );
  }

  handleHideAlert () {

    if (this.state.isFullScreen) {
      return;
    }

    const moveToOrigin = () => {
      BitcoinExpress.Host.WalletGoModal(
        false,
        this.MINIMAL_WALLET_WIDTH,
        this.MINIMAL_WALLET_HEIGHT
      );

      $("#wallet").css({
        left: 0,
        top: 0,
        position: 'inherit',
      });

      $("#wallet").fadeIn('fast');
      $("#settings-drawer").css('display', 'block');
    };

    $("#wallet").fadeOut(0);
    setTimeout(moveToOrigin, 600);
  }

  renderContent() {
    const {
      isFullScreen,
      paymentRequest,
    } = this.state;

    return <App
      close={ this.close }
      isFullScreen={ isFullScreen }
      initializeDraggableArea={(id) => {
        BitcoinExpress.Host.WalletMakeDraggable(id);
      }}
      onAlertShown={ this.handleShowAlert }
      onAlertHidden={ this.handleHideAlert }
      onContractClick={ this.switchWalletSize(false) }
      onExpandClick={ this.switchWalletSize(true) }
      paymentRequest={ paymentRequest }
      removePayment={() => BitcoinExpress.Host.PopupMessage(this.i18n.t("pay_failed"), 1500)}
    />;
  }

  render() {
    const {
      isFullScreen,
    } = this.state;

    const {
      classes,
    } = this.props;

    return <MuiThemeProvider theme={ theme }>
      <AppProvider
        value={{
          i18n: this.i18n,
          isFullScreen: isFullScreen,
        }}
      >
        <div
          id="container"
          className={ isFullScreen ? classes.root : classes.rootMin }
        >
          { this.renderContent() }
        </div>
      </AppProvider>
    </MuiThemeProvider>;
  }
}


const BitcoinExpressWallet = withStyles(componentStyles)(WalletApp);
ReactDOM.render(
  <BitcoinExpressWallet
    isFullScreen={ getParameterByName('fullScreen') == 'true' }
    paymentRequest={ JSON.parse(getParameterByName('paymentRequest')) }
  />,
  document.getElementById('wallet')
);

