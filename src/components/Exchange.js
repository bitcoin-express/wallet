import React from 'react';
import PropTypes from 'prop-types';

import styles from '../helpers/Styles';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../AppContext";


const componentStyles = (theme) => {
  return {
    container: {
      display: 'flex',
      marginTop: '5px',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rate: {
      fontSize: '24px',
      width: '120px',
      textAlign: 'center',
      color: styles.colors.mainTextColor,
    },
    refreshArea: {
      fontSize: '12px',
      width: '130px',
      textAlign: 'center',
      color: styles.colors.darkBlue,
    },
    text: {
      fontFamily: styles.currencyFontFamily,
      fontSize: '18px',
      color: styles.colors.mainTextColor,
      textAlign: 'right',
    },
    textContainer: {
      textAlign: 'center',
      width: '100%',
    },
    link: {
      cursor: 'pointer',
      marginRight: '5px',
    },
    link2: {
      cursor: 'pointer',
      color: styles.colors.darkBlue,
      fontSize: '12px',
      textAlign: 'left',
    },
  };
};


class Exchange extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      exchangeRate: "loading...",
      hasError: false,
    };
    this.refreshExchangeRates = this.refreshExchangeRates.bind(this);
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
      xr,
    } = this.context;

    const code = wallet.getPersistentVariable(wallet.config.CRYPTO, "XBT");
    if (xr.getExchangeRate(code) !== "not available") {
      return;
    }

    xr.getExchangeRate(crypto, true)
      .then((res) => this.setState({ exchangeRate: res }));
  }

  refreshExchangeRates() {
    const {
      snackbarUpdate,
      xr,
    } = this.context;

    const handleError = (err) => {
      snackbarUpdate([
        err.message,
        `Exchange rates are from ${xr.getLastUpdatedDate()}`
      ], true);
    };

    xr.refreshExchangeRates()
      .then(() => snackbarUpdate("Exchange rates updated"))
      .catch(handleError);
  }

  getCryptoName(crypto) {
    switch (crypto) {
      case "BTC":
      case "XBT":
        return "BITCOIN";
      case "BCH":
        return <small>BITCOIN CASH</small>;
      case "BTG":
        return <small>BITCOIN GOLD</small>;
      case "ETH":
        return "ETHEREUM";
      case "CRT":
        return "CARROT";
    }
  }

  render() {
    const {
      classes,
      type,
    } = this.props;

    const {
      wallet,
      xr,
    } = this.context;

    const {
      exchangeRate,
      hasError,
    } = this.state;

    if (hasError) {
      return null;
    }

    const tooltip = `As of ${xr.updatedTime}. Source ${xr.exchangeRateSource}`;
    const crypto = wallet.getPersistentVariable(wallet.config.CRYPTO, "XBT");

    let xRate = xr.getExchangeRate(crypto);
    if (xRate == "not available" && exchangeRate) {
      xRate = exchangeRate;
    }

    if (type == 1) {
      return <div className={ classes.textContainer }>
        <div className={ classes.container }>
          <div
            className={ classes.text }
            title={ tooltip }
          >
            { xRate }
            &nbsp;
          </div>
          <a
            title="Update exchange rates"
            className={ classes.link2 }
            onClick={ this.refreshExchangeRates }
          >
            <span className="fa-stack">
              <i className="fa fa-circle fa-stack-2x" />
              <i className="fa fa-refresh fa-stack-1x fa-inverse" />
            </span>
          </a>
        </div>
      </div>;
    }

    return <React.Fragment>
      <div className={ classes.rate } title={ tooltip }>
        { xRate }
      </div>
      <div className={ classes.refreshArea }>
        { this.getCryptoName(crypto) } PRICE 
        &nbsp;&nbsp;&nbsp;
        <a
          title="Update exchange rates"
          className={ classes.link }
          onClick={ this.refreshExchangeRates }
        >
          <i className="fa fa-refresh fa-lg" />
        </a>
      </div>
    </React.Fragment>;
  }
}

Exchange.defaultProps = {
  type: 0,
};

Exchange.contextType = AppContext;


export default withStyles(componentStyles)(Exchange);

