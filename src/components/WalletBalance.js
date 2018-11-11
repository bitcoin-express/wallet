import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import CircularProgress from 'material-ui/CircularProgress';

import BitcoinCurrency from './BitcoinCurrency';
import Exchange from './Exchange';

import styles from '../helpers/Styles';

class CryptoList extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      listFullScreen: {
        position: 'relative',
        overflow: 'hidden',
        fontSize: '15px',
        fontFamily: "mono",
        color: styles.colors.mainTextColor,
      },
      list: {
        position: 'absolute',
        overflow: 'hidden',
        fontSize: '15px',
        fontFamily: "mono",
        width: '300px',
        color: styles.colors.mainTextColor,
        right: '0',
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
      li: {
        flexGrow: '1',
        flexBasis: 'auto',
        margin: '.25em 0',
        padding: '0 1em',
        textAlign: 'center',
        borderLeft: `1px solid ${styles.colors.mainTextColor}`,
      },
      currency: {
        cursor: 'pointer',
      },
      currencySelected: {
        color: styles.colors.darkBlue,
        fontWeight: 'bold',
      },
    };

    this.handleUpdateCrypto = this.handleUpdateCrypto.bind(this);
  }

  handleUpdateCrypto(c) {
    const {
      loading,
      refreshCoinBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    return () => {
      loading(true);
      return wallet.config.storage.sessionStart("Change currency", "wallet").then(() => {
        return wallet.setPersistentVariable(wallet.config.CRYPTO, c);
      }).then(() => {
        return refreshCoinBalance();
      }).then(() => {
        loading(false);
        snackbarUpdate("Currency updated");
        return wallet.config.storage.sessionEnd();
      });
    };
  }

  render() {
    const {
      isFullScreen,
      wallet,
    } = this.props;

    const {
      CRYPTO,
      storage,
      walletCurrencies,
    } = wallet.config;

    if (!storage) {
      return null;
    }

    const cryptos = walletCurrencies;
    const selected = wallet.getPersistentVariable(CRYPTO) || "XBT";

    return <div style={ isFullScreen ? this.styles.list : this.styles.listFullScreen }>
      <ul style={ this.styles.ul }>
        { cryptos.map((c, index) => {
          let style = Object.assign({}, this.styles.li, this.styles.currency);
          if (c == selected) {
            style = Object.assign({}, this.styles.li, this.styles.currencySelected);
          }
          if (index == 0) {
            Object.assign(style, { borderLeft: 'none' });
          }
          return <li
            style={ style }
            key={ c }
            onClick={ this.handleUpdateCrypto(c) }
          >
            { c }
          </li>;
        }) }
      </ul>
    </div>
  }
}

export default class WalletBalance extends React.Component {

  constructor(props) {
    super(props);

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);

    this.renderDesktopView = this.renderDesktopView.bind(this);
    this.renderDeviceView = this.renderDeviceView.bind(this);
  }

  _initializeStyles(props) {
    let img1 = "url('css/img/Bitcoin-express-bg.png')";
    let img2 = "url('css/img/Bitcoin-express-bg2.png')";

    let crypto = props.wallet.getPersistentVariable(props.wallet.config.CRYPTO) || "xbt";
    crypto = crypto.toLowerCase();

    if (crypto != "xbt") {
      img1 = `url('css/img/Bitcoin-express-bg_${crypto}.png')`;
      img2 = `url('css/img/Bitcoin-express-bg2_${crypto}.png')`;
    }

    this.styles = {
      widescreen: {
        height: '140px',
        background: styles.colors.mainColor,
        boxShadow: `rgba(0, 0, 0, 0.12) 0px 1px 6px,
          rgba(0, 0, 0, 0.12) 0px 1px 4px`,
        backgroundPositionX: '-5%',
        backgroundPositionY: '70%',
        marginTop: '25px',
        padding: '5px 20px 5px 17%',
        color: styles.colors.mainTextColor,
        backgroundImage: img1,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '256px',
      },
      narrowscreen: {
        background: "transparent",
        boxShadow: `rgba(0, 0, 0, 0.12) 0px 1px 6px,
          rgba(0, 0, 0, 0.12) 0px 1px 4px`,
        margin: '0',
        width: 'calc(100% - 30px)',
        color: 'rgba(0, 0, 0, 0.87)',
        padding: '0 15px 15px 15px',
        backgroundImage: img2,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '150px',
        backgroundPositionX: '-75px',
        backgroundPositionY: '-30px',
      },
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
  }

  componentWillUpdate(nextProps, nextState) {
    this._initializeStyles(nextProps);
  }

  renderDeviceView() {
    const {
      balance,
      currency,
      isFlipped,
      loading,
      refreshCoinBalance,
      showValuesInCurrency,
      snackbarUpdate,
      onStorageIconClick,
      wallet,
      xr,
    } = this.props;

    return (
      <div
        className="narrowscreen"
        style={ this.styles.narrowscreen }
      >
        { isNaN(balance) ? 
          <CircularProgress size={ 60 } /> :
          <div style={{ textAlign: 'center' }}>
            <CryptoList
              isFullScreen={ false }
              loading={ loading }
              refreshCoinBalance={ refreshCoinBalance }
              snackbarUpdate={ snackbarUpdate }
              wallet={ wallet }
            />
            <BitcoinCurrency
              buttonStyle={{
                background: styles.colors.darkBlue,
              }}
              centered={ true }
              clickableStorage={ true }
              color={ styles.colors.mainTextColor }
              currency={ currency }
              isFlipped={ isFlipped }
              onStorageIconClick={ onStorageIconClick }
              showValuesInCurrency={ showValuesInCurrency }
              small={ true }
              value={ balance }
              wallet={ wallet }
              xr={ xr }
            />
            <Exchange
              type={ 1 }
              snackbarUpdate={ snackbarUpdate }
              wallet={ wallet }
              xr={ xr }
            />
          </div>
        }
      </div>
    );
  }

  beautyIsoDate(isoDate) {
    
    let date = new Date(isoDate);
    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let dt = date.getDate();

    if (dt < 10) {
      dt = '0' + dt;
    }

    if (month < 10) {
      month = '0' + month;
    }

    return year + '-' + month + '-' + dt;
  }

  renderDesktopView() {
    const {
      balance,
      isFlipped,
      loading,
      refreshCoinBalance,
      showValuesInCurrency,
      snackbarUpdate,
      onStorageIconClick,
      wallet,
      xr,
    } = this.props;

    let lastInvocation = wallet.getPersistentVariable("lastInvocation");

    return (
      <div
        className="widescreen"
        style={ this.styles.widescreen }
      >
        { isNaN(balance) ? 
          <div style={ this.styles.text }>
            <div style={{ margin: '20px 0 20px 35px' }}>
              <CircularProgress size={ 60 } />
            </div>
          </div> :
          <div>
            <CryptoList
              isFullScreen={ true }
              loading={ loading }
              snackbarUpdate={ snackbarUpdate }
              refreshCoinBalance={ refreshCoinBalance }
              wallet={ wallet }
            />
            <h3 style={ this.styles.text }>
              <br />
              Wallet balance
            </h3>
            <br />
            <BitcoinCurrency
              clickableStorage={ true }
              isFlipped={ isFlipped }
              onStorageIconClick={ onStorageIconClick }
              showValuesInCurrency={ showValuesInCurrency }
              value={ balance }
              wallet={ wallet }
              xr={ xr }
            />
          </div>
        }
      </div>
    );
  }

  render() {
    return <div>
      { this.renderDesktopView() }
      { this.renderDeviceView() }
    </div>;
  }
}

/*
 <p style={{
   textAlign: 'right',
   marginTop: '10px',
 }}>
   last invocation: { this.beautyIsoDate(lastInvocation) }
 </p>
 */
