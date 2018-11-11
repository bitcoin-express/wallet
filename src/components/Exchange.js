import React from 'react';
import PropTypes from 'prop-types';

import styles from '../helpers/Styles';

class Exchange extends React.Component {
  constructor(props) {
    super(props);

    this.styles = {
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

    this.state = {
      exchangeRate: "loading..."
    };

    this.refreshXR = this.refreshXR.bind(this);
  }

  componentWillMount() {
    const {
      type,
      wallet,
      xr,
    } = this.props;

    let crypto = "XBT";
    if (wallet) {
      crypto = wallet.getPersistentVariable(wallet.config.CRYPTO) || "XBT";
    }

    if (xr.getExchangeRate(crypto) == "not available") {
      xr.getExchangeRate(crypto, true).then((exchangeRate) => {
        this.setState({
          exchangeRate,
        })
      });
    }
  }

  refreshXR() {
    const {
      snackbarUpdate,
      xr,
    } = this.props;

    xr.refreshExchangeRates().then(() => {
      snackbarUpdate("Exchange rates updated");
    }).catch((err) => {
      snackbarUpdate([
        err.message,
        `Exchange rates are from ${xr.getLastUpdatedDate()}`
      ], true);
    });
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
      type,
      wallet,
      xr,
    } = this.props;

    const tooltip = `As of ${xr.updatedTime}. Source ${xr.exchangeRateSource}`;
    let crypto = "XBT";
    if (wallet) {
      crypto = wallet.getPersistentVariable(wallet.config.CRYPTO) || "XBT";
    }

    let xRate = xr.getExchangeRate(crypto);
    const { exchangeRate } = this.state;
    if (xRate == "not available" && exchangeRate) {
      xRate = exchangeRate;
    }

    if (type == 1) {
      return <div style={ this.styles.textContainer }>
        <div style={ this.styles.container }>
          <div
            style={ this.styles.text }
            title={ tooltip }
          >
            { xRate }
            &nbsp;
          </div>
          <a
            title="Update exchange rates"
            style={ this.styles.link2 }
            onClick={ this.refreshXR }
          >
            <span className="fa-stack">
              <i className="fa fa-circle fa-stack-2x" />
              <i className="fa fa-refresh fa-stack-1x fa-inverse" />
            </span>
          </a>
        </div>
      </div>;
    }

    return <div>
      <div
        style={ this.styles.rate }
        title={ tooltip }
      >
        { xRate }
      </div>
      <div style={ this.styles.refreshArea }>
        { this.getCryptoName(crypto) } PRICE 
        &nbsp;&nbsp;&nbsp;
        <a
          title="Update exchange rates"
          style={ this.styles.link }
          onClick={ this.refreshXR }
        >
          <i className="fa fa-refresh fa-lg" />
        </a>
      </div>
    </div>;
  }
}

Exchange.defaultProps = {
  type: 0,
};

export default Exchange;
