import React from 'react';
import PropTypes from 'prop-types';

import StorageIcon from '../../StorageIcon';
import Time from '../../../helpers/Time';
import { getImageComponent } from '../../../helpers/tools';
import styles from '../../../helpers/Styles';

class HistoryDialogTitle extends React.Component {

  constructor(props) {
    super(props);

    this.renderLogo = this.renderLogo.bind(this);
    this._getImgUrl = this._getImgUrl.bind(this);

    this.time = new Time();

    this.styles = {
      container: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      },
      logoContainer: {
        display: 'flex',
        width: '140px',
        justifyContent: 'space-between',
      },
      time: {
        fontSize: '15px',
        color: styles.colors.mainBlue,
      },
      title: {
        fontSize: '35px',
      },
    };
  }

  _getCurrencyImg(currency) {
    switch(currency) {
      case "XBT":
      case "BTC":
        return "btce.png";
      case "ETH":
        return "ethe.png";
      case "BCH":
        return "bche.png";
      case "BTG":
        return "btge.png";
      case "CRT":
        return "crte.png";
    }
  }

  _getImgUrl() {
    const {
      action,
      info,
      wallet,
    } = this.props;

    const crypto = wallet.getPersistentVariable(wallet.config.CRYPTO, "XBT")
    let sc = this._getCurrencyImg(crypto);
    let tc;

    switch (action) {

      case 'import backup':
        return {
          firstIcon: getImageComponent("import.svg"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
          reverse: true,
        };

      case 'backup':
        return {
          firstIcon: getImageComponent("export.svg"),
          unique: true,
        };

      case 'import file':
      case 'import export file':
      case 'import backup file':
      case 'import refund':
        return {
          firstIcon: getImageComponent("import.svg"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
        };

      case 'import coin':
      case 'import coin file':
        return {
          firstIcon: getImageComponent("import-coins-2.svg"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
        };

      case 'coin recovery':
        return {
          firstIcon: getImageComponent("b-e_recovery.svg"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
        };

      case 'exist':
      case 'verify':
        return {
          firstIcon: getImageComponent(sc, 40, 40, "currencies/"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
        };

      case 'split coin':
      case 'export split':
      case 'payment split':
        return {
          firstIcon: getImageComponent(sc, 40, 40, "currencies/"),
          //secondIcon: getImageComponent("b-e_split.png", 55, 40),
          secondIcon: getImageComponent(sc, 40, 40, "split/"),
        };

      //good
      case 'export file':
      case 'export backup file':
      case 'payment':
      case 'buy item':
        return {
          firstIcon: getImageComponent(sc, 40, 40, "currencies/"),
          //secondIcon: getImageComponent("export-coins.svg"),
          secondIcon: <i
            className="fa fa-shopping-cart"
            style={{
              color: "#333333",
              fontSize: "160%"
            }}
          />,
        };

      case 'export coin':
      case 'extract failed coin':
      case 'export coin file':
        return {
          firstIcon: getImageComponent(sc, 40, 40, "currencies/"),
          secondIcon: getImageComponent("export-coins.svg"),
        };

      case 'issue':
        return {
          firstIcon: getImageComponent("b.svg"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
        };

      case 'move receive':
      case 'move empty':
      case 'move send':
      case 'move storage location':
        if (info.receive) {
          // receive
          return {
            firstIcon: <StorageIcon
              drive={ !wallet.isGoogleDrive() }
              browser={ wallet.isGoogleDrive() }
              style={{
                position: 'inherit',
              }}
              wallet={ wallet }
            />,
            secondIcon: <StorageIcon
              drive={ wallet.isGoogleDrive() }
              browser={ !wallet.isGoogleDrive() }
              style={{
                position: 'inherit',
              }}
              wallet={ wallet }
            />,
          };
        }
        return {
          firstIcon: <StorageIcon
            drive={ wallet.isGoogleDrive() }
            browser={ !wallet.isGoogleDrive() }
            style={{
              position: 'inherit',
            }}
            wallet={ wallet }
          />,
          secondIcon: <StorageIcon
            drive={ !wallet.isGoogleDrive() }
            browser={ wallet.isGoogleDrive() }
            style={{
              position: 'inherit',
            }}
            wallet={ wallet }
          />,
        };

      case 'cancel move storage location':
        return {
          firstIcon: <StorageIcon
            drive={ !wallet.isGoogleDrive() }
            browser={ wallet.isGoogleDrive() }
            style={{
              position: 'inherit',
            }}
            wallet={ wallet }
          />,
          secondIcon: <StorageIcon
            drive={ wallet.isGoogleDrive() }
            browser={ !wallet.isGoogleDrive() }
            style={{
              position: 'inherit',
            }}
            wallet={ wallet }
          />,
        };

      case 'receive swap':
        tc = this._getCurrencyImg(info.sourceCurrency);
        return {
          firstIcon: getImageComponent(tc, 40, 40, "currencies/"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
        };

      case 'change from swap':
      case 'revert swap':
        return {
          firstIcon: getImageComponent("import-coins-2.svg"),
          secondIcon: getImageComponent(sc, 40, 40, "currencies/"),
        };

      case 'send swap':
        tc = this._getCurrencyImg(info.sourceCurrency);
        return {
          firstIcon: getImageComponent(sc, 40, 40, "currencies/"),
          secondIcon: getImageComponent(tc, 40, 40, "currencies/"),
        };

      case 'send swap':
        return {
          firstIcon: getImageComponent(sc, 40, 40, "currencies/"),
          secondIcon: getImageComponent("b.svg"),
        };

      default:
        if (action.startsWith("send ") || action.endsWith(" deferred")) {
          return {
            firstIcon: getImageComponent(sc, 40, 40, "currencies/"),
            secondIcon: getImageComponent("b.svg"),
          };
        }
        return {
          firstIcon: null,
          secondIcon: null,
        };
    }
  }

  renderLogo() {
    const {
      firstIcon,
      secondIcon,
      reverse,
      unique,
    } = this._getImgUrl();

    if (unique) {
      return firstIcon;
    }

    const arrowImg = reverse ? "arrowLeft.png" : "arrowRight.svg";
    return <div style={ this.styles.logoContainer }>
      <div>
        { firstIcon }
      </div>
      <div>
        { getImageComponent(arrowImg) }
      </div>
      <div>
        { secondIcon }
      </div>
    </div>;
  }

  render() {
    const {
      action,
      date,
    } = this.props;

    return <div style={ this.styles.container }>
      <div>
        <b style={ this.styles.title }>
          { action }
        </b>
        <br/>
        <small style={ this.styles.time }>
          <i className="fa fa-calendar" />&nbsp;
          { this.time.formatDate(date, true) }
        </small>
      </div>
      { this.renderLogo() }
    </div>;
  }
}

HistoryDialogTitle.propTypes = {
  action: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  info: PropTypes.object,
  wallet: PropTypes.object.isRequired,
};

export default HistoryDialogTitle;
