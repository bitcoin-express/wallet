import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { AppContext } from "../../AppContext";
import BackupWallet from './export/BackupWallet';
import CoinsToFile from './export/CoinsToFile';
import ExportCoin from './export/ExportCoin';
import Submenu from '../Submenu';

const states = {
  BACKUP_WALLET: 0,
  COINS_TO_FILE: 1,
  EXPORT_COIN: 2,
};


class ExportTab extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      section: states.BACKUP_WALLET,
    };

    this.handleChipChanged = this.handleChipChanged.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet && wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate(info.componentStack, "error");
  }

  handleChipChanged(index) {
    this.setState({ section: index });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      section,
    } = this.state;

    const {
      balance,
      isFullScreen,
    } = this.context;

    let balanceAside, content;
    if (balance) {
      balanceAside = <h1>XBT { balance }</h1>;
    }

    if (isFullScreen) {

      content = <div style={ this.styles.body }>
        <BackupWallet /> 
        <CoinsToFile type="2" />
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

ExportTab.contextType = AppContext;

export default ExportTab;

