import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Submenu from '../Submenu';
import BackupWallet from './export/BackupWallet';
import ExportCoin from './export/ExportCoin';
import CoinsToFile from './export/CoinsToFile';

const states = {
  BACKUP_WALLET: 0,
  COINS_TO_FILE: 1,
  EXPORT_COIN: 2,
};

class ExportTab extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      section: states.BACKUP_WALLET,
    };

    this.styles = {
      body: {
        //minWidth: '150px',
      },
    };

    this.handleChipChanged = this.handleChipChanged.bind(this);
  }

  handleChipChanged(index) {
    this.setState({ section: index });
  }

  render() {
    const {
      section,
    } = this.state;

    const {
      balance,
      isFullScreen,
    } = this.props;

    let balanceAside, content;
    if (balance) {
      balanceAside = <h1>XBT { balance }</h1>;
    }

    if (isFullScreen) {

      content = <div style={ this.styles.body }>
        <BackupWallet
          {...this.props}
        /> 
        <CoinsToFile
          {...this.props}
          type="2"
        />
      </div>;

    } else {
      switch (section) {
        case states.BACKUP_WALLET:
          content = <BackupWallet {...this.props} />;
          break;
        case states.COINS_TO_FILE:
          content = <CoinsToFile
            {...this.props}
            type="1"
          />;
          break;
        case states.EXPORT_COIN:
          content = <ExportCoin {...this.props} />;
          break;
      }

      content = <div style={ this.styles.body }>
        <Submenu
          initialSelectedIndex={ section }
          onTapChanged={ this.handleChipChanged }
          items={ [{
            label: "backup wallet",
            icon: "file-text",
          }, {
            label: "coins to file",
            icon: "btc",
          }] }
        />
        { content }
      </div>;
    }

    return content;
  }
}

ExportTab.propTypes = {
  balance: PropTypes.number,
  loading: PropTypes.func.isRequired,
  refreshCoinBalance: PropTypes.func.isRequired,
  snackbarUpdate: PropTypes.func.isRequired,
  wallet: PropTypes.object.isRequired,
};

export default ExportTab;
