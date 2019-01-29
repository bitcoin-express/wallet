import React from 'react';
import PropTypes from 'prop-types';

import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';


import Notification from './components/Notification'
import WalletBalance from './components/WalletBalance';
import WelcomeScreen from './components/WelcomeScreen';
import ExchangeRate from './helpers/ExchangeRate';
import Time from './helpers/Time';
import { getImageComponent } from './helpers/tools';
import AddFundsTab from './components/tabs/AddFundsTab';
import ImportTab from './components/tabs/ImportTab';
import ExportTab from './components/tabs/ExportTab';
import HistoryTab from './components/tabs/HistoryTab';
import MainTab from './components/tabs/MainTab';
import PayTab from './components/tabs/PayTab';
import ExchangeTab from './components/tabs/ExchangeTab';
import DialogButton from './components/dialogs/utils/DialogButton';
import { default as AlertDialog, getDialog } from './components/dialogs/utils/Dialogs';
import { AppContext } from "./AppContext";
import AuthenticateDialog from './components/dialogs/AuthenticateDialog';
import CloseDialog from './components/dialogs/CloseDialog';
import CoinDialog from './components/dialogs/CoinDialog';
import DiscardDialog from './components/dialogs/DiscardDialog';
import ErrorGoogleDriveDialog from './components/dialogs/ErrorGoogleDriveDialog';
import FileDialog from './components/dialogs/FileDialog';
import ImportFileDialog from './components/dialogs/ImportFileDialog';
import ItemPurchasedDialog from './components/dialogs/ItemPurchasedDialog';
import ItemPurchasedListDialog from './components/dialogs/ItemPurchasedListDialog';
import ReceiveSuccessDialog from './components/dialogs/send/ReceiveSuccessDialog';
import styles from './helpers/Styles';


const componentStyles = (theme) => {
  return {
    root: {
      borderRadius: "0",
      backgroundColor: '#8ea7fb',// '#e8e8e8',
    },
    label: {
      color: "white", // "#7b95dc",
    },
    tab: {
      height: `${styles.minimizedHeight - styles.bottombarHeight - styles.appbarHeight - styles.tabsHeight }px`,
      overflowY: 'auto',
      overflowX: 'hidden',
      marginBottom: `${styles.bottombarHeight}px`, // bottombar height
    },
    tabFullScreenStyle: {
      position: 'relative',
    },
    tabLabel: {
      width: '22%',
      textTransform: 'capitalize',
      fontWeight: 'bold',
    },
    tabLabelDisabled: {
      cursor: "not-allowed",
      color: "#ffffff66",
      width: '22%',
      textTransform: 'capitalize',
      fontWeight: 'bold',
    }
  };
};


const tabContainerComponentStyle = (theme) => {
  return {
    root: {
      backgroundColor: 'white', //'#99a9e2',
      height: '100vh',
      paddingBottom: 8 * 3,
      [theme.breakpoints.down('xs')]: {
        padding: '0 0 3px',
      },
      [theme.breakpoints.up('xs')]: {
        padding: '0 0 20px',
      },
      [theme.breakpoints.up('lg')]: {
        padding: '30px 5vw',
      },
      [theme.breakpoints.up('xl')]: {
        padding: '30px 20vw',
      },
    }
  };
};

function TabContainer(props) {
  return <Typography component="div" className={ props.classes.root }>
    {props.children}
  </Typography>;
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

TabContainer = withStyles(tabContainerComponentStyle)(TabContainer);


class MainContent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
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

  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      handleShowItemPurchased,
      handleShowItemPurchasedList,
      handleSyncContent,
    } = this.props;

    return <React.Fragment>
      <WalletBalance
        onStorageIconClick={ handleSyncContent }
      />
      <MainTab
        handleShowItemPurchased={ this.handleShowItemPurchased }
        handleShowItemPurchasedList={ this.handleShowItemPurchasedList }
      />
    </React.Fragment>;
  }
}

MainContent.contextType = AppContext;
MainContent = withStyles(componentStyles)(MainContent);


class AppContent extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      tabIndex: props.paymentRequest ? 5 : 0,
    };

    this.onModifyTabIndex = this.onModifyTabIndex.bind(this);
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

  onModifyTabIndex(event, value) {
    this.setState({
      tabIndex: value,
    });
  }

  componentWillUpdate(nextProps, nextState) {
    if (!this.props.paymentRequest && nextProps.paymentRequest) {
      this.setState({
        tabIndex: 5,
      });
    }
  }

  render() {
    const {
      hasError,
      tabIndex,
    } = this.state;

    if (hasError) {
      return null;
    }

    const {
      balance,
      classes,
      exchangeRates,
      expiryExchangeRates,
      notification,
      settings,
    } = this.props;

    const {
      isFlipped,
      isFullScreen,
      wallet,
    } = this.context;

    const {
      storage,
      COIN_SWAP,
      SESSION,
    } = wallet.config;

    const isGDrive = wallet.isGoogleDrive();
    const transactions = wallet.getHistoryList();

    const {
      total,
    } = wallet.getAllStoredCoins();

    let notWaitingForSwap = true;
    if (storage) {

      let coinSwap = storage.get(COIN_SWAP, null);
      let sessions = storage.get(SESSION, null);

      if (sessions && coinSwap) {
        Object.keys(sessions).forEach((key) => {
          if (Object.keys(coinSwap).indexOf(key) > -1) {
            notWaitingForSwap = false;
          }
        });
      }
    }

    let exchangeTab;
    if (total == 0 && notWaitingForSwap) {
      exchangeTab = <Tab
        icon={ isFullScreen ? null : <i className="fa fa-plus" /> }
        label={ isFullScreen ? "add funds" : null }
        title={ isFullScreen ? null : "Add funds" }
        classes={{
          wrapper: classes.label,
        }}
      />;
    } else {
      exchangeTab = <Tab
        icon={ isFullScreen ? null : <i className="fa fa-exchange" /> }
        label={ isFullScreen ? "exchange" : null }
        title={ isFullScreen ? null : "Exchange" }
        classes={{
          wrapper: classes.label,
        }}
      />;
    }

    let content = null;

    switch(tabIndex) {

      case 0:
        content = <TabContainer>
          <MainContent
            handleShowItemPurchased={ this.props.handleShowItemPurchased }
            handleShowItemPurchasedList={ this.props.handleShowItemPurchasedList }
            handleSyncContent={ this.props.handleSyncContent }
          />
        </TabContainer>;
        break;


      case 1:
        content = <TabContainer>
          <ImportTab
            handleShowCoin={ this.props.handleShowCoin }
            importFile={ this.props.importFile }
            refreshSettings={ this.props.refreshSettings }
          />
        </TabContainer>;
        break;


      case 2:
        content = <TabContainer><ExportTab /></TabContainer>;
        break;

      case 3:
        if (total == 0 && notWaitingForSwap) {
          content = <TabContainer>
            <ExchangeTab
              active={ tabIndex == 3 }
              exchangeRates={ exchangeRates }
              refreshIssuerRates={ this.props.refreshIssuerRates }
            />
          </TabContainer>;
          break;
        }

        content = <TabContainer>
          <AddFundsTab
            handleClickDeposit={ this.props.handleClickDeposit }
            handleRemoveDepositRef={ this.props.handleRemoveDepositRef }
            issueCollect={ this.props.issueCollect }
            updateTargetValue={ this.props.updateTargetValue }
          />
        </TabContainer>;
        break;

      case 4:
        content = <TabContainer>
          <HistoryTab
            openDialog={ this.openDialog }
            refreshCoinBalance={ this.refreshCoinBalance }
            transactions={ transactions }
          />
        </TabContainer>;
        break;

      case 5:
        content = <TabContainer>
          <PayTab
            active={ tabIndex == 5 }
            exchangeRates={ exchangeRates }
            expiryExchangeRates={ expiryExchangeRates }
            paymentDetails={ this.props.paymentRequest.PaymentDetails }
            refreshIssuerRates={ this.props.refreshIssuerRates }
            removePayment={ this.props.removePayment }
          />
        </TabContainer>;
        break;

    }

    return <React.Fragment>
      <Paper className={ classes.root }>
        <Tabs
          onChange={ this.onModifyTabIndex }
          value={ tabIndex || 0 }
          indicatorColor="secondary"
          textColor="secondary"
          variant={ isFullScreen ? 'fullWidth' : 'scrollable' }
          scrollButtons={ isFullScreen ? "off" : "on" }
          centered
        >
          <Tab
            icon={ <img
              src={ `css/img/tabs/home${tabIndex == 0 ? '_sel' : ''}.svg` }
              width="25"
            /> }
            classes={{
              wrapper: classes.label,
            }}
            title="Home"
          />

          <Tab
            icon={ !isFullScreen ? <img
              src={ `css/img/tabs/import${tabIndex == 1 ? '_sel' : ''}.svg` }
              width="25"
            /> : null }
            classes={{
              wrapper: classes.label,
            }}
            label={ isFullScreen ? "import" : null }
            title={ !isFullScreen ? "Import" : null }
          />

          <Tab
            disabled={ total == 0 }
            icon={ !isFullScreen ? <img
              src={ `css/img/tabs/export${tabIndex == 2 ? '_sel' : ''}.svg` }
              width="25"
            /> : null }
            classes={{
              wrapper: classes.label,
            }}
            label={ isFullScreen ? "export" : null }
            title={ isFullScreen ? (total == 0 ? "Export disabled until funds added" : "Export") : null }
          />

          { exchangeTab }

          <Tab
            disabled={ transactions.length == 0 }
            icon={ !isFullScreen ? <img
              src={ `css/img/tabs/history${tabIndex == 4 ? '_sel' : ''}.svg` }
              width="25"
            /> : null }
            classes={{
              wrapper: classes.label,
            }}
            label={ isFullScreen ? "history" : null  }
            title={ isFullScreen ? (transactions.length ? "Empty history list" : "History") : null }
          />

          { this.props.paymentRequest && <Tab
            icon={ !isFullScreen ? <i className="fa fa-shopping-cart" /> : null }
            label={ isFullScreen ? "payment" : null }
            title={ !isFullScreen ? "Payment" : null }
            classes={{
              wrapper: classes.label,
            }}
          /> }
        </Tabs>
      </Paper>

      { content }

    </React.Fragment>;
  }
}

AppContent.contextType = AppContext;

export default withStyles(componentStyles)(AppContent);

