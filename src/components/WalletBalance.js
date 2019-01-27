import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import withWidth, { isWidthUp } from '@material-ui/core/withWidth';

import { AppContext } from "../AppContext";
import BitcoinCurrency from './BitcoinCurrency';
import Exchange from './Exchange';
import styles from '../helpers/Styles';


const componentStyles = (theme) => {
  const root = {
    height: '140px',
    background: styles.colors.mainColor,
    boxShadow: `rgba(0, 0, 0, 0.12) 0px 1px 6px,
      rgba(0, 0, 0, 0.12) 0px 1px 4px`,
    backgroundPositionX: '-5%',
    backgroundPositionY: '70%',
    marginTop: '25px',
    padding: '5px 20px 5px 17%',
    color: styles.colors.mainTextColor,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '256px',
  };

  const rootMin = {
    background: "transparent",
    boxShadow: `rgba(0, 0, 0, 0.12) 0px 1px 6px,
      rgba(0, 0, 0, 0.12) 0px 1px 4px`,
    margin: '0',
    width: 'calc(100% - 30px)',
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '0 15px 15px 15px',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '150px',
    backgroundPositionX: '-75px',
    backgroundPositionY: '-30px',
  };

  return {
    rootXBT: Object.assign({
      backgroundImage: "url('css/img/bg.png')",
    }, root),
    rootETH: Object.assign({
      backgroundImage: "url('css/img/bg_eth.png')",
    }, root),
    rootBCH: Object.assign({
      backgroundImage: "url('css/img/bg_bch.png')",
    }, root),

    rootMinXBT: Object.assign({
      backgroundImage: "url('css/img/bg2.png')",
    }, rootMin),
    rootMinETH: Object.assign({
      backgroundImage: "url('css/img/bg2_eth.png')",
    }, rootMin),
    rootMinBCH: Object.assign({
      backgroundImage: "url('css/img/bg2_bch.png')",
    }, rootMin),

    text: {
      marginBottom: '0',
      marginTop: '0',
      fontFamily: "mono",
      color: styles.colors.mainTextColor,
    },
    currencies: {
      fontSize: '15px',
      fontFamily: "mono",
      color: styles.colors.mainTextColor,
      textAlign: 'right',
    },
  };
};


const cryptoListComponent = (theme) => {

  const selected = {
    borderLeft: `1px solid ${styles.colors.mainTextColor}`,
    color: styles.colors.darkBlue,
    flexGrow: '1',
    flexBasis: 'auto',
    fontWeight: 'bold',
    margin: '.25em 0',
    padding: '0 1em',
    textAlign: 'center',
  };

  const unselected = {
    borderLeft: `1px solid ${styles.colors.mainTextColor}`,
    cursor: 'pointer',
    flexGrow: '1',
    flexBasis: 'auto',
    margin: '.25em 0',
    padding: '0 1em',
    textAlign: 'center',
  };

  return {
    root: {
      position: 'absolute',
      overflow: 'hidden',
      fontSize: '15px',
      fontFamily: "mono",
      width: '300px',
      color: styles.colors.mainTextColor,
      right: '0',
    },
    rootMin: {
      position: 'relative',
      overflow: 'hidden',
      fontSize: '15px',
      fontFamily: "mono",
      color: styles.colors.mainTextColor,
    },
    ul: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      margin: '10px 0 5px 0',
      listStyleType: 'none',
      padding: '0',
    },
    selected,
    selectedFirst: Object.assign({ borderLeft: 'none' }, selected),
    unselected,
    unselectedFirst: Object.assign({ borderLeft: 'none' }, unselected),
  };
};


class CryptoList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
    this.handleUpdateCrypto = this.handleUpdateCrypto.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate("Error on rendering component", true);
  }

  handleUpdateCrypto(c) {
    const {
      loading,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.context;

    const {
      CRYPTO,
      storage,
    } = wallet.config;

    const finalizeUpdate = () => {
      loading(false);
      snackbarUpdate("Currency updated");
      return storage.sessionEnd();
    }

    return () => {
      loading(true);
      return storage.sessionStart("Change currency", "wallet")
        .then(() =>  wallet.setPersistentVariable(CRYPTO, c))
        .then(refreshCoinBalance)
        .then(finalizeUpdate);
    };
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      isFullScreen,
      wallet,
    } = this.context;

    const {
      classes,
    } = this.props;

    const {
      CRYPTO,
      storage,
      walletCurrencies,
    } = wallet.config;

    if (!storage) {
      return null;
    }

    const selected = wallet.getPersistentVariable(CRYPTO, "XBT");
    const cryptoList = walletCurrencies.map((c, index) => {
      let className = c == selected ? "selected" : "unselected";
      if (index == 0) {
        className += "First";
      }

      return <li
        className={ classes[className] }
        key={ c }
        onClick={ this.handleUpdateCrypto(c) }
      >
        { c }
      </li>;
    });

    return <div className={ isFullScreen ? classes.root : classes.rootMin }>
      <ul className={ classes.ul }>
        { cryptoList }
      </ul>
    </div>
  }
}

CryptoList.contextType = AppContext;
CryptoList = withStyles(cryptoListComponent)(CryptoList);


class WalletBalance extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
    this.renderDesktopView = this.renderDesktopView.bind(this);
    this.renderDeviceView = this.renderDeviceView.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate("Error on rendering bottom bar", true);
  }

  componentDidMount() {
    const {
      wallet,
    } = this.context;
  }

  renderDeviceView() {
    const {
      classes,
      showValuesInCurrency,
      onStorageIconClick,
    } = this.props;

    const {
      isFullScreen,
      wallet,
    } = this.context;

    const currency = wallet.getPersistentVariable(wallet.config.CRYPTO, "XBT");
    const className = (isFullScreen ? "root" : "rootMin") + currency.toUpperCase();

    if (isNaN(this.context.balance)) {
      return <div className={ classes[className] }>
        <CircularProgress size={ 60 } />
      </div>;
    }

    return <div className={ classes[className] }>
      <div style={{ textAlign: 'center' }}>
        <CryptoList
          isFullScreen={ false }
        />
        <BitcoinCurrency
          buttonStyle={{
            background: styles.colors.darkBlue,
          }}
          centered={ true }
          color={ styles.colors.mainTextColor }
          currency={ currency }
          onStorageIconClick={ onStorageIconClick }
          small={ true }
          value={ this.context.balance }
        />
        <Exchange type={ 1 } />
      </div>
    </div>;
  }

  renderDesktopView() {
    const {
      classes,
      onStorageIconClick,
    } = this.props;

    const {
      isFullScreen,
      wallet,
    } = this.context;

    const currency = wallet.getPersistentVariable(wallet.config.CRYPTO, "XBT");
    const className = (isFullScreen ? "root" : "rootMin") + currency.toUpperCase();

    if (isNaN(this.context.balance)) {
      return <div className={ classes.text }>
        <div style={{ margin: '20px 0 20px 35px' }}>
          <CircularProgress size={ 60 } />
        </div>
      </div>;
    }

    return <div className={ classes[className] }>
      <CryptoList isFullScreen={ true } />
      <h3 className={ classes.text }>
        <br />
        Wallet balance
      </h3>
      <br />
      <BitcoinCurrency
        currency={ currency }
        onStorageIconClick={ onStorageIconClick }
        value={ this.context.balance }
      />
    </div>;
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    const isDesktop = isWidthUp('sm', this.props.width);
    return isDesktop ? this.renderDesktopView() : this.renderDeviceView();
  }
}

WalletBalance.contextType = AppContext;

export default withWidth()(withStyles(componentStyles)(WalletBalance));

