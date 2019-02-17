import React from 'react';
import PropTypes from 'prop-types';

import { Tabs, Tab } from 'material-ui/Tabs';
import Drawer from 'material-ui/Drawer';
import RaisedButton from 'material-ui/RaisedButton';

import TextField from 'material-ui/TextField';
import ActionHome from 'material-ui/svg-icons/action/home';

import WalletBF from './helpers/WalletBF';
import Persistence from './helpers/Persistence';
import LocalStorage from './helpers/persistence/LocalStorage';
import ExchangeRate from './helpers/ExchangeRate';
import Time from './helpers/Time';
import Tools from './helpers/Tools';
import Bar from './components/Bar';
import BitcoinCurrency from './components/BitcoinCurrency';
import BottomBar from './components/BottomBar';
import DateComponent from './components/DateComponent';
import Loading from './components/Loading';
import LogonScreen from './components/LogonScreen';
import LogoText from './components/LogoText';
import Notification from './components/Notification'
import WalletBalance from './components/WalletBalance';
import WelcomeScreen from './components/WelcomeScreen';
import AddFundsTab from './components/tabs/AddFundsTab';
import ImportTab from './components/tabs/ImportTab';
import ExportTab from './components/tabs/ExportTab';
import HistoryTab from './components/tabs/HistoryTab';
import MainTab from './components/tabs/MainTab';
import PayTab from './components/tabs/PayTab';
import ExchangeTab from './components/tabs/ExchangeTab';

import AboutDialog from './components/dialogs/AboutDialog';
import AddFundsDialog from './components/dialogs/AddFundsDialog';
import AuthenticateDialog from './components/dialogs/AuthenticateDialog';
import AlertDialog from './components/dialogs/AlertDialog';
import CloseDialog from './components/dialogs/CloseDialog';
import CoinDialog from './components/dialogs/CoinDialog';
import DiscardDialog from './components/dialogs/DiscardDialog';
import ErrorGoogleDriveDialog from './components/dialogs/ErrorGoogleDriveDialog';
import FileDialog from './components/dialogs/FileDialog';
import ImportFileDialog from './components/dialogs/ImportFileDialog';
import ItemPurchasedDialog from './components/dialogs/ItemPurchasedDialog';
import ItemPurchasedListDialog from './components/dialogs/ItemPurchasedListDialog';
import MoveCoinsDialog from './components/dialogs/MoveCoinsDialog';
import ReceiveSuccessDialog from './components/dialogs/send/ReceiveSuccessDialog';
import SendDialog from './components/dialogs/SendDialog';

// Import styles
import styles from './helpers/Styles';
import '../css/index.css';
import 'font-awesome/css/font-awesome.css';
import 'react-tabs/style/react-tabs.css';


const states = {
  INITIAL: 0,
  WELCOME: 1,
  APP: 2,
};


class Wallet extends React.Component {

  constructor(props) {
    super(props);

    this.time = new Time();
    this.tools = new Tools();
    this.xr = new ExchangeRate();

    this.handleGoogleDriveLocked = this.handleGoogleDriveLocked.bind(this);


    this.wallet = new WalletBF(props.defaultIssuer, props.acceptableIssuers);

    const defaultSettings = this.wallet.getDefaultSettings();
    const persistence = new Persistence(this.handleGoogleDriveLocked, defaultSettings);
    this.wallet.setStorageMethod(persistence);

    this.state = {
      alert: {
        actionsContainerStyle: null,
        body: null,
        cancelLabel: "CANCEL",
        message: "",
        onClickOk: null,
        onClickCancel: null,
        okLabel: "OK",
        open: false,
        showCancelButton: true,
        style: {},
        titleStyle: null,
      },
      exchangeRates: {},
      balance: 0,
      initialIndex: props.paymentRequest ? 5 : 0,
      isFlipped: false,
      loading: false,
      navDrawerOpen: false,
      notification: [],
      notificationIndex: 0,
      password: "",
      settings: defaultSettings,
      signoutAlert: false,
      status: states.INITIAL,
      tabIndex: props.paymentRequest ? 5 : 0,
      targetValue: "",
    };

    this.xr.setSeparator(defaultSettings.separator);
    this.xr.setCurrency(defaultSettings.currency);
    this.xr.setBTCDisplay(defaultSettings.btcdisplay);

    this.styles = {
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

    this.handleClickAbout = this.handleClickAbout.bind(this);
    this.handleNotificationUpdate = this.handleNotificationUpdate.bind(this);
    this.handleMenuIconClick = this.handleMenuIconClick.bind(this)
    this.handleAuthorizeGDrive = this.handleAuthorizeGDrive.bind(this);
    this.handleSignoutGDrive = this.handleSignoutGDrive.bind(this);
    this.handleOnDrop = this.handleOnDrop.bind(this);
    this.handleClickClose = this.handleClickClose.bind(this);
    this.handleShowCoin = this.handleShowCoin.bind(this);
    this.handleShowItemPurchased = this.handleShowItemPurchased.bind(this);
    this.handleShowItemPurchasedList = this.handleShowItemPurchasedList.bind(this);
    this.handleSyncContent = this.handleSyncContent.bind(this);
    this.confirmCloseWallet = this.confirmCloseWallet.bind(this);
    this.onModifyTabIndex = this.onModifyTabIndex.bind(this);

    this.refreshCoinBalance = this.refreshCoinBalance.bind(this);
    this.getCurrencyBalances = this.getCurrencyBalances.bind(this);

    this.refreshIssuerRates = this.refreshIssuerRates.bind(this);

    this.importFile = this.importFile.bind(this);
    this.getImportComponent = this.getImportComponent.bind(this);
    this.showImportFileNotifications = this.showImportFileNotifications.bind(this);

    this.renderApp = this.renderApp.bind(this);
    this._renderHeader = this._renderHeader.bind(this);
    this._renderTabs = this._renderTabs.bind(this);

    this.openDialog = this.openDialog.bind(this);
    this._closeDialog = this._closeDialog.bind(this);
    this.clearDialog = this.clearDialog.bind(this);

    this.loadAuthenticationDialog = this.loadAuthenticationDialog.bind(this);

    this.showMoveCoinsAlert =  this.showMoveCoinsAlert.bind(this);
    this._moveCoins = this._moveCoins.bind(this);
    this.checkCoinsExist = this.checkCoinsExist.bind(this);
    this.onNotFilesFound = this.onNotFilesFound.bind(this);

    this.logout = this.logout.bind(this);
    this.autoLogin = this.autoLogin.bind(this);

    this.startLocalStorageWallet = this.startLocalStorageWallet.bind(this);
    this.startGoogleDriveWallet = this.startGoogleDriveWallet.bind(this);
    this._authenticate = this._authenticate.bind(this);

    // all about settings
    this.refreshSettings = this.refreshSettings.bind(this);
    this.setSettingsKey = this.setSettingsKey.bind(this);
    this.updateSettingsState = this.updateSettingsState.bind(this);

    this.showAlertWalletName = this.showAlertWalletName.bind(this);

    this._recoverTransactionsInProgress = this._recoverTransactionsInProgress.bind(this);
    this._successRecoveryTx = this._successRecoveryTx.bind(this);
    this._failureRecoveryTx = this._failureRecoveryTx.bind(this);

    this._initializeWallet = this._initializeWallet.bind(this);
    this._authorizeGDrive = this._authorizeGDrive.bind(this);

    this.handleResizeClick = this.handleResizeClick.bind(this);

    this.showValuesInCurrency = this.showValuesInCurrency.bind(this);
    this.executeInSession = this.executeInSession.bind(this);

    // Add funds dialog
    this.handleRemoveDepositRef = this.handleRemoveDepositRef.bind(this);
    this.handleClickAddFunds = this.handleClickAddFunds.bind(this);
    this.handleClickSend = this.handleClickSend.bind(this);
    this.handleClickDeposit = this.handleClickDeposit.bind(this);

    this.issueCollect = this.issueCollect.bind(this);
    this.coinsInRecoveryStore = this.coinsInRecoveryStore.bind(this);

    this.showReceiveFundsDialog = this.showReceiveFundsDialog.bind(this);

    this.setWalletPassword = this.setWalletPassword.bind(this);

    this.loading = this.loading.bind(this);

    this.interceptError = this.interceptError.bind(this);
  }

  componentWillMount() {

    const login = () => {
      if (localStorage.getItem('loggedIn') == 'true') {
        // Attempt to login
        console.log("wallet logged in with localStorage");
        return this.autoLogin();
      }

      this.setState({
        status: states.WELCOME
      });
    };

    const handleError = (error) => {
      if (this.wallet.config.debug == true) {
        console.log(error);
      }

      if (localStorage.getItem('loggedIn') == 'true') {
        // TO_DO: Try again to login, this should not be
        // possible to happen.
        return this.autoLogin();
      }

      this.setState({
        status: states.WELCOME
      });
      this.handleNotificationUpdate(error.message, true);
    };

    return this.xr.refreshExchangeRates()
      .then(login)
      .catch(handleError);
  }

  componentDidUpdate(prevProps, prevState) {
    // home tab rather small
    let els = document.getElementsByClassName("tabsbar");
    if (els.length > 0 && els[0].children[1].children[0] && !this.props.paymentRequest) {

      // initialize (first time loaded wallet)
      if (prevState.status !== states.APP && els[0].children[1].children[0].style) {
        els[0].children[1].children[0].style.width = "12%";
      }

      const {
        isFullScreen,
      } = this.props;
      const {
        tabIndex,
      } = this.state;

      const left = ['0%', '20%', '40%', '60%', '80%', '100%'];
      const leftMin = ['0%', 'calc(20% - 5px)', 'calc(40% - 3px)', 'calc(60% - 2px)', '80%', '100%'];

      let el = document.getElementsByClassName("tabsbar")[0].children[1].children[0];
      if (tabIndex == 5 && el.style) {
        el.style.width = '0px';
      } else if (tabIndex == 0 && el.style) {
        el.style.width = isFullScreen ? "12%" : "20%";
      } else if (el.style) {
        el.style.width = isFullScreen ? "22%" : "20%";
      }

      if (prevProps.isFullScreen != isFullScreen) {
        // change wallet mode (expand / retract)
        // click to re-render
        this.forceTabClick(tabIndex);
      } else if (tabIndex != prevState.tabIndex && el.style) {
        el.style.left = isFullScreen ? left[tabIndex] : leftMin[tabIndex];
      }
    }
  }

  componentWillUpdate(nextProps, nextState) {
    // on change modal status
    if (!this.state.alert.open && nextState.alert.open) {
      this.props.onAlertShown();
    }
    if (this.state.alert.open && !nextState.alert.open) {
      this.props.onAlertHidden();
    }

    if (!this.props.paymentRequest && nextProps.paymentRequest) {
      this.setState({
        tabIndex: 5,
        initialIndex: 5,
      });
    }
  }


  /**
   * Intercepts and prints the error if wallet is in debug mode.
   *
   * @param err [object] error object type returned by the catch.
   * @param fn [function] must return a promise, called if defined
   *    with the err object as parameter.
   */
  interceptError(err, fn) {

    if (this.wallet.config.debug) {
      console.log(err);
    }

    if (fn && typeof fn == "function") {
      return fn(err);
    }

    return Promise.reject(err);
  }

  loading(loading=true) {
    this.setState({
      loading,
    });
  }


  /**
   * Prepares the wallet to be authenticated by the user. Afterwards,
   * it should encrypt/decrypt the settings and the wallet object in
   * order to continue with the process normally.
   *
   * @param initialize [boolean] if requires initialization of the wallet,
   *    used when just opened the wallet.
   * @param changeState [boolean] TO_DO.
   *
   * @return Promise to be resolved.
   */
  _authenticate(initialize = false, changeState = true) {

    const handleError = (err) => {

      if (err.message == "Timeout triggered setting the password") {
        // If timeout triggered, return to the welcome page.
        this.handleNotificationUpdate(err.message);
        this.setState({
          status: states.WELCOME,
        });
        return false;
      }

      // Password is incorrect, let's try again.
      this.handleNotificationUpdate(err.message, true);
      return this._authenticate(initialize);
    };

    const initializeWallet = () => {
      return initialize ? this._initializeWallet(changeState) : true;
    }

    return this.loadAuthenticationDialog()
      .then(initializeWallet)
      .catch(handleError);
  }


  /**
   * If authentication is required, opens the input password dialog.
   *
   * @return A promise that will be resolved after the user set the
   *   correct/incorrect password, if required.
   */
  loadAuthenticationDialog() {
    const {
      needsAuthentication,
      setPassword,
    } = this.wallet.config.storage;

    const showDialogIfAuthRequired = (walletHasAuth) => {

      if (!walletHasAuth) {
        this.setState({
          password: "",
        });
        return Promise.resolve(true);
      }

      return new Promise((resolve, reject) => {

        let timeout = setTimeout(() => {
          this._closeDialog();
          return reject(new Error("Timeout triggered setting the password"));
        }, 5 * 60000);

        const okClicked = () => {
          const {
            password,
          } = this.state;

          const success = (resp) => {
            clearTimeout(timeout);
            this._closeDialog();
            return resolve(true);
          }

          const failure = (success) => {
            return reject(new Error("Invalid password"));
          }

          setPassword(password)
            .then(success)
            .catch(failure);
        };

        const onPwdChanged = (password) => {
          this.setState({
            password,
          });
        }

        this.openDialog({
          onClickOk: okClicked,
          showCancelButton: false,
          title: "Needs password authentication",
          body: <AuthenticateDialog
            onPasswordChange={ onPwdChanged }
          />,
        });
      });
    }

    return needsAuthentication()
      .then(showDialogIfAuthRequired);
  }

  forceTabClick(tabIndex) {
    const el = document.getElementsByClassName("tabsbar");
    el[0].children[0].children[tabIndex].click();
    return;
  }

  setWalletPassword(password) {
    const {
      storage,
    } = this.wallet.config;

    if (!storage) {
      return;
    }

    this.setState({
      password,
    });
    return storage.setPasswordAndUpdate(password);
  }

  refreshSettings() {
    const {
      SETTINGS,
    } = this.wallet.config;

    let settings = this.wallet.getDefaultSettings();
    const walletSettings = this.wallet.getPersistentVariable(SETTINGS);

    if (settings) {
      settings = Object.assign({}, this.wallet.getDefaultSettings(), walletSettings);
      this.updateSettingsState(settings);
      return Promise.resolve(settings);
    }

    console.log("ALERT!! Does it arrive here??");

    const storeSettings = () => {
      settings = Object.assign({}, this.wallet.getDefaultSettings());
      return this.executeInSession("Initialize settings", false, () => {
        return this.wallet.setPersistentVariable(SETTINGS, this.wallet.getDefaultSettings());
      }).then(() => {
        this.updateSettingsState(settings);
        return settings;
      });
      };

    const handleError = (err) => {
      return this.interceptError(err, (err) => {
        const errMsg = err.message || "Problem on initializing settings";
        this.handleNotificationUpdate(errMsg, true);
        return Promise.reject(err);
      });
    }

    return storeSettings()
      .catch(handleError);
  }


  /**
   * Update the component state and the xr (ExchangeRate) object with the
   * settings object.
   *
   * @param settings [object] the settings object.
   *
   * @return A boolean indicating if there was an update of the state.
   */
  updateSettingsState(settings) {

    const {
      BTC_DISPLAY,
      CURRENCY,
      SEPARATOR,
    } = this.wallet.config;

    this.xr.setSeparator(settings[SEPARATOR]);
    this.xr.setCurrency(settings[CURRENCY]);
    this.xr.setBTCDisplay(settings[BTC_DISPLAY]);

    if (JSON.stringify(settings) == JSON.stringify(this.state.settings)) {
      // Nothing to do as there is no modification on settings
      return false;
    }

    this.setState({
      settings,
    });
    return true;
  }


  /**
   * Updates the settings key with the given value..
   *
   * @param key [string] the settings key.
   * @param value [string] value that will be used.
   *
   * @return A promise returning the settings object.
   */
  setSettingsKey(key, value) {

    if (!this.wallet.config.storage) {
      return Promise.reject(Error("setSettingsKey - No storage in wallet"));
    }

    let {
      settings,
    } = this.state;
    settings[key] = value;

    const updateComponentState = (result) => {
      this.updateSettingsState(settings);
      return settings;
    };

    return this.wallet.setSettings(settings)
      .then(updateComponentState)
      .catch(this.interceptError);
  }

  autoLogin() {
    if (this.props.test) {
      return this.startLocalStorageWallet();
    }

    console.log("contacting google api...");
    const successGDriveLogin = (isSignedIn) => {
      console.log("positive gapi response", isSignedIn);
      if (isSignedIn) {
        return this.startGoogleDriveWallet();
      }
      return this.startLocalStorageWallet();
    };

    const failedGDriveLogin = () => {
      console.log("error gapi response");
      return this.onNotFilesFound();
    };

    return this.wallet.config.storage.gdrive.handleClientLoad()
      .then(successGDriveLogin, failedGDriveLogin);
  }

  login() {
    localStorage.setItem('loggedIn', 'true');
  }

  logout() {
    localStorage.setItem('loggedIn', 'false');
  }

  /**
   * expireDate: if expired, date that was expired. If not expired seconds to be expired
   */
  handleGoogleDriveLocked(expired, name, storage, action, expireDate) {
    return new Promise((resolve, reject) => {
      const prevAlertStatus = this.state.alert;
      const intro = name ? <span>
        <span style={{ textTransform: 'capitalize' }}>'{ name }'</span> in <i>{ storage }</i>
      </span> : <i>{ storage }</i>;

      if (expired) {
        this.openDialog({
          okLabel: "RELEASE LOCK & CONTINUE",
          onClickOk: () => {
            if (prevAlertStatus.open) {
              this.setState({
                alert: prevAlertStatus,
              });
            } else {
              this.clearDialog();
            }
            resolve(true);
          },
          onClickCancel: () => {
            if (prevAlertStatus.open) {
              this.setState({
                alert: prevAlertStatus,
              });
            }
            reject(true);
          },
          showCancelButton: true,
          title: "Wallet data locked",
          body: <section>
            <p>{ intro } has locked this Wallet to perform <i>{ action }</i>.</p>
            <p>The lock was due to be released at about { this.time.formatDate(expireDate, true) }.</p>
            <p>If you believe this action should have completed by now, you may force the lock to be released.</p>
            <p style={{ color: 'red', fontWeight: 'bold' }}>
            WARNING: Forcing a lock release during an operation may cause coins to be lost.
            </p>
          </section>,
        });
      } else {
        this.openDialog({
          onClickOk: () => {
            if (prevAlertStatus.open) {
              this.setState({
                alert: prevAlertStatus,
              });
            } else {
              this.clearDialog();
            }
            resolve(true);
          },
          onClickCancel: () => {
            if (prevAlertStatus.open) {
              this.setState({
                alert: prevAlertStatus,
              });
            }
            reject(true);
          },
          okLabel: "CONTINUE",
          showCancelButton: true,
          title: "Wallet data locked",
          body: <section>
            <p>{ intro } has locked this Wallet to perform <i>{ action }</i>.</p>
            <p>The lock is due to be released in about { parseInt((expireDate - new Date().getTime()) / 1000) } seconds.</p>
          </section>,
        });
      }
    });
  }

  startLocalStorageWallet(changeState = true) {
    console.log("Starting localStorage wallet...");
    this.login();
    this.wallet.config.storage.setType('localStorage');
    return this._authenticate(true, changeState);
  }

  startGoogleDriveWallet() {
    this.login();
    this.wallet.config.storage.setType('googleDrive');
    return this._authenticate(true);
  }

  // Initialize settings for a new Wallet + Asks for Wallet name
  showAlertWalletName(force = false) {
    const {
      WALLET_DRIVE_NAME,
      WALLET_LOCAL_NAME,
    } = this.wallet.config;
    const isGDrive = this.wallet.isGoogleDrive();
    let newName = "";

    this.handleNotificationUpdate('Created New Settings for New Wallet');

    this.openDialog({
      onClickOk: () => {
        this._closeDialog();
        this.loading(true);
        this.executeInSession("set wallet name", false, () => {
          let key = isGDrive ? WALLET_DRIVE_NAME : WALLET_LOCAL_NAME;
          return this.setSettingsKey(key, newName);
        }).then(() => {
          this.loading(false);
        }).catch((err) => {
          console.log(err);
          this.loading(false);
          return Promise.reject(err);
        });
      },
      showCancelButton: false,
      title: "Set a new Wallet Name",
      body: <section>
        { isGDrive ? <TextField
            floatingLabelText="Your Google Drive Wallet name"
            onChange={ (ev, txt) => newName = txt }
          /> : <TextField
            floatingLabelText="Your Local Wallet name"
            onChange={ (ev, txt) => newName = txt }
          />
        }
      </section>,
    });
  }

  _initializeWallet(updateState = true) {
    const {
      SESSION,
      storage,
    } = this.wallet.config;

    // Place where stored the current transaction with the issuer.
    // Dictionary which ids are transactions ids
    let session = storage.get(SESSION);
    if (session != null) {
      console.log("SESSION", session);
    } else {
      console.log("No transactions to recover from session");
    }

    return this._recoverTransactionsInProgress().then(() => {
      return this.refreshCoinBalance();
    }).then((balance) => {
      console.log(`Total balance: ${balance}`);
      return this.refreshSettings();
    }).then((settings) => {
      if (updateState) {
        this.setState({
          status: states.APP,
        });
      }
      return true;
    }).catch((err) => {
      console.log(err);
      return this.refreshSettings();
    }).then((balance) => {
      return this.refreshCoinBalance();
    });
  }

  _successRecoveryTx(resp) {
    if (resp.verifyInfo) {
      debugger;
      this.checkCoinsExist(true, true).then(() => {
        this.handleNotificationUpdate([
          `Recovered XBT ${resp.verifyInfo.verifiedValue}`,
          "from an earlier incomplete transaction"
        ]);
        console.log(`Succeed in recovery: ${JSON.stringify(resp)}`);
      });
    }

    if (resp.headerInfo) {
      switch (resp.headerInfo.fn) {
        case "issue":
          this.loading(true);
          this.coinsInRecoveryStore(resp).then((newBalance) => {
            this.handleNotificationUpdate("Issue collect was successful");
            this.loading(false);
            this.setState({
              targetValue: "",
            });

            var histObj = this.wallet.getHistoryList()[0];
            this.showReceiveFundsDialog(histObj, "Receive funds complete");
            return this.refreshCoinBalance("XBT");
          }).catch((err) => {
            console.log(err);
            this.loading(false);
            this.handleNotificationUpdate(err.message || "Issue collect unsuccessful", true);
          });
          break;
        case "verify":
          debugger
          break;
        case "redeem":
          debugger
          break;
      }
    }
  }

  _failureRecoveryTx(resp) {
    const {
      debug,
      storage,
    } = this.wallet.config;

    if (resp.deferInfo) {
      console.log(`Attempted to recover transaction but found 
        '${resp.deferInfo.reason}'. Try again after ${resp.deferInfo.after}`);
      return;
    }

    if (resp.headerInfo) {
      switch (resp.headerInfo.fn) {
        case "issue":
          this.handleNotificationUpdate("While collecting new coins", true);
          console.log(`While collecting new coins found ${this.wallet.getResponseError(resp)}`);
          break;
        case "verify":
          this.handleNotificationUpdate("While verifying coins", true);
          console.log(`While verifying coins found ${this.wallet.getResponseError(resp)}`);
          break;
        case "redeem":
          this.handleNotificationUpdate("While redeeming coins", true);
          console.log(`While redeeming coins found ${this.wallet.getResponseError(resp)}`);
          break;
        default:
          this.handleNotificationUpdate(this.wallet.getResponseError(resp), true);
          break;
      }
      return;
    }

    if (debug) {
      console.log(resp)
    }

    let messages = ["Auto recovery attempt failed"];
    if (resp.message) {
      messages.push(resp.message);
    }
    this.handleNotificationUpdate(messages, true);
  }
  
  _recoverTransactionsInProgress() {
    const notification = (state, args) => {
      if (state == "displayItem") {
        return this.handleShowItemPurchased(args.item);
      }
      return Promise.resolve(true);
    };
    const params = [this._successRecoveryTx, this._failureRecoveryTx];
    return this.wallet.recovery(...params).then(() => {
      // Check if missing payment
      return this.wallet.paymentRecovery(notification);
    }).then((value) => {
      return this.refreshCoinBalance();
    }).catch((err) => {
      console.log(err);
      return Promise.reject(err);
    });
  }

  /**
   * @param inSession [boolean] If some coin has to be removed because does not exist
   *     if opens a Session in order to execute that removal.
   * @param notify [boolean] Use wallet alert notification.
   */
  checkCoinsExist(inSession = true, notify = true, crypto = null) {
    const {
      CRYPTO,
    } = this.wallet.config;

    if (crypto == null) {
      crypto = this.wallet.getPersistentVariable(CRYPTO, "XBT");
    }

    return this.wallet.existCoins(inSession, null, crypto).then((response) => {
      if (response.deferInfo) {
        !notify || this.handleNotificationUpdate(response.deferInfo.reason);
      } else if (!isNaN(response) && response > 0) {
        !notify || this.handleNotificationUpdate(`Removed ${response} coins`);
      }
      return true;
    }).then(() => {
      return this.refreshCoinBalance(crypto);
    }).catch((err) => {
      console.log(err);
      !notify || this.handleNotificationUpdate(err.message, true);
      return this.refreshCoinBalance(crypto);
    });
  }

  refreshIssuerRates(notify=true) {
    if (notify) {
      this.loading(true);
    }
    return this.wallet.getIssuerExchangeRates().then((response) => {
      const {
        exchangeRates,
        expiry,
      } = response;

      this.setState({
        exchangeRates,
        expiryExchangeRates: expiry,
      });

      if (notify) {
        this.loading(false);
        this.handleNotificationUpdate("Issuer exchange rates updated");
      }
      return response;
    }).catch((err) => {
      console.log(err);
      if (notify) {
        this.loading(false);
      }
      const msg = "Can't refresh issuer rates";
      this.handleNotificationUpdate(err.message || msg, true);
      return err;
    });
  }
  
  getCurrencyBalances() {
    const {
      AVAILABLE_CURRENCIES,
    } = this.wallet.config;

    let currencies = this.wallet.config[AVAILABLE_CURRENCIES];
    let promises = [];
    Object.keys(currencies).forEach((code) => {
      promises.push(this.refreshCoinBalance(code));
    });

    return Promise.all(promises).then((responses) => {
      let result = {};
      Object.keys(currencies).forEach((code, index) => {
        result[code] = responses[index];
      });
      return result;
    });
  }

  refreshCoinBalance(crypto = null) {
    const {
      CRYPTO,
      debug,
    } = this.wallet.config;
    const wCrypto = this.wallet.getPersistentVariable(CRYPTO, "XBT");

    return this.wallet.Balance(crypto).then((balance) => {
      if (crypto == null || crypto == wCrypto) {
        try {
          this.setState({
            balance,
          });
        } catch (err) {
          console.log("Error on refreshCoinBalance", err);
          return balance;
        }
      }
      return balance;
    }).catch((err) => {
      if (debug) {
        console.log(err);
      }
      return 0;
    });
  }

  /**
   * @param msgList: array of messages or string message to display
   */
  handleNotificationUpdate(msgList, error=false) {
    let notification;
    if (typeof msgList == "string") {
      notification = [{
        error,
        message: msgList,
      }];
    } else if (Array.isArray(msgList)) {
      notification = msgList.map((str) => {
        return {
          error,
          message: str,
        };
      });
    }

    this.setState({
      notification,
      notificationIndex: this.state.notificationIndex + 1,
    });
  }

  handleOnDrop(accepted, rejected, notify=true) {
    let args = {
      forceVerify: {
        backup: false,
        export: false,
        coin: false,
      },
      verifyAlienCoins: false,
      notify,
    };

    this.loading(true);
    return this.importFile(accepted, args).then(() => {
      this.loading(false);
    }).catch((err) => {
      console.log(err);
      this.loading(false);
    });
  }

  importFile(file, args) {

    if (!file || !args) {
      const msg = "Wallet.importFile wrong params";
      this.handleNotificationUpdate(msg, true);
      return Promise.reject(Error(msg));
    }

    if (!Array.isArray(file)) {
      const msg = "Accepted files from dropzone are not in an array";
      this.handleNotificationUpdate(msg, true);
      return Promise.reject(Error(msg));
    }

    if (file.length == 0) {
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        const msg = "File rejected";
        this.handleNotificationUpdate(msg, true);
        return Promise.reject(Error(msg));
      }
      const msg = "File APIs are not fully supported in this browser";
      this.handleNotificationUpdate(msg, true);
      return Promise.reject(Error(msg));
    }

    const {
      name,
    } = file[0];

    if (!name.endsWith(".json") && !name.endsWith(".txt")) {
      const msg = "File has not a JSON or TXT extension";
      this.handleNotificationUpdate(msg, true);
      return Promise.reject(Error(msg));
    }

    let balances, responses; 
    const readFile = (response) => {
      balances = response;
      return this.wallet.importFile(file, args);
    }
    
    const updateWalletStatus = (newBalances) => {
      let listComponents = [];
      let currencies = [];

      responses.forEach((response) => {
        let {
          coin,
          crypto,
        } = response;

        if (!crypto) {
          crypto = response.currency || "XBT";
        }

        if (coin.length == 0) {
          return;
        }

        let component = this.getImportComponent(response);
        if (component != null) {
          listComponents.push(component);
          currencies.push(crypto);
          this.showImportFileNotifications(response,
            newBalances[crypto], balances[crypto]);
        }
      });

      let msg = "All coins already included in the wallet";
      if (responses.length == 0) {
        msg = "No valid coins included in the file";
      }

      if (listComponents.length == 0 || !args.notify) {
        this.handleNotificationUpdate(msg);
        return true;
      }

      if (listComponents.length == 1) {
        this.openDialog({
          showCancelButton: false,
          onClickOk: this.clearDialog,
          showTitle: false,
          body: listComponents[0],
        });
        return true;
      }

      this.openDialog({
        showCancelButton: false,
        onClickOk: this.clearDialog,
        showTitle: false,
        body: <ImportFileDialog
          currencies={ currencies }
          listComponents={ listComponents }
        />,
      });
      return true;
    };

    const handleResponse = (response) => {
      if (typeof response == 'object' && response.swapCode) {
        return response;
      }
      responses = response;

      return this.getCurrencyBalances()
        .then(updateWalletStatus);
    };

    const handleError = (err) => {
      if (this.wallet.config.debug) {
        console.log(err);
      }
      const msg = err.message || "Invalid file or password";
      this.handleNotificationUpdate(msg, true);
      return Promise.reject(Error(msg));
    };

    return this.refreshSettings()
      .then(() => this.getCurrencyBalances())
      .then(readFile)
      .then(handleResponse)
      .catch(handleError);
  }

  getImportComponent(importResponse) {
    let {
      coin,
      importInfo,
      fileObject,
      finalCoins,
      fileInfo,
      verifyFailed,
      crypto,
      currency,
    } = importResponse;

    if (!crypto) {
      crypto = currency;
    }

    let {
      date,
      fileType,
    } = fileObject;

    date = this.time.formatDate(date, true);

    switch (fileType) {

      case "backup":
      case "export":
        const {
          name,
          type,
        } = fileInfo;

        if (importInfo.importInfo) {
          // Backup file
          importInfo = importInfo.importInfo;
        }

        const {
          coinsInFile,
          comment,
          removedCoins,
          value,
        } = fileObject;

        let args = Object.assign({
          crypto,
          coinsInFile,
          comment,
          date,
          fileValue: value[crypto],
          finalCoins,
          name,
          removedCoins,
          type,
        }, importInfo);

        if (comment) {
          args.comment = comment;
        }
        return this.handleShowCoin(coin, false, true)(args);

      case "coin":
      case "refund":
        return this.handleShowCoin(coin, true, true)({
          crypto,
          date,
          fee: parseFloat(importInfo.totalFee || "0"),
          verified: parseFloat(importInfo.verifiedValue || "0"),
        });
    }
  }

  showImportFileNotifications(importResponse, newBalance, oldBalance) {
    let {
      coin,
      crypto,
      verifyFailed,
    } = importResponse;

    if (!crypto) {
      crypto = importResponse.currency || "XBT";
    }

    newBalance = parseFloat(newBalance || 0);
    oldBalance = parseFloat(oldBalance || 0);

    const difference = newBalance - oldBalance;

    if (difference < 0) {
      this.handleNotificationUpdate([
        `Some outdated ${crypto} coins where erased in the process`,
        `Your balance decremented ${crypto}${Math.abs(difference).toFixed(8)}`
      ], true);
      return;
    }

    if (difference == 0 || coin.length == 0) {
      const msg = `${crypto} coins in file are already included in your wallet`;
      this.handleNotificationUpdate(msg);
      return;
    }

    let messages = [];
    if (verifyFailed) {
      messages.push(`${crypto} Coin(s) value was smaller than verification fee`);
      messages.push(`${crypto} Coin(s) added but not verified`);
    }

    messages.push(`Imported ${crypto}${difference.toFixed(8)}`);
    messages.push(`New balance is ${crypto}${newBalance.toFixed(8)}`);

    if (messages.length > 0) {
      this.handleNotificationUpdate(messages);
    }
  }

  /********
   * Menu *
   ********/

  handleMenuIconClick(ev, opened=null) {
    opened = opened || !this.state.navDrawerOpen; 
    this.setState({
      navDrawerOpen: opened,
    });
  }

  handleShowItemPurchased(item, backToList = false) {
    return (args = null) => {
      const {
        isFlipped,
      } = this.state;

      this.openDialog({
        showCancelButton: false,
        onClickOk: () => {
          if (backToList) {
            this.handleShowItemPurchasedList();
          } else {
            this.clearDialog();
          }
        },
        okLabel: backToList ? "BACK" : "OK",
        title: <div>
          <p style={{ fontSize: '120%', margin: '0' }}>
            { item.paymentDetails.memo }
          </p>
          <DateComponent
            date={ item.details.time }
            horizontal={ true }
          />
        </div>,
        body: <ItemPurchasedDialog
          { ...item }
          isFlipped={ isFlipped }
          showValuesInCurrency={ this.showValuesInCurrency }
          wallet={ this.wallet }
          xr={ this.xr }
        />,
      });
    };
  }

  handleShowItemPurchasedList() {
    const {
      isFlipped,
    } = this.state;

    this.openDialog({
      showCancelButton: false,
      onClickOk: this.clearDialog,
      title: "Purchase List",
      style: {
        backgroundColor: styles.colors.secondaryColor,
      },
      body: <ItemPurchasedListDialog
        handleShowItemPurchased={ this.handleShowItemPurchased }
        isFlipped={ isFlipped }
        showValuesInCurrency={ this.showValuesInCurrency }
        wallet={ this.wallet }
        xr={ this.xr }
      />,
    });
  }

  /*
   * @param isCoin [boolean] If false show File Info Dialog
   */
  handleShowCoin(coinList, isCoin=true, component=false) {
    const isValidCoin = (obj) => {
      return typeof obj === 'object' && "base64" in obj && "e" in obj;
    };

    if (!coinList) {
      return () => {};
    }

    if (isCoin) {
      let coin;
      if (Array.isArray(coinList) && coinList.length == 1) {
        // cast to obtain string or coin from list
        coinList = coinList[0];
      }
      if (isValidCoin(coinList)) {
        coin = coinList;
      } else if (typeof coinList == "string") {
        coin = this.wallet.Coin(coinList);
      }

      return (args = null) => {
        const body = <CoinDialog
          { ...args }
          closeDialog={ this.clearDialog }
          coin={ coin }
          currency={ args.crypto }
          isFlipped={ this.state.isFlipped }
          showButtons={ false }
          showValuesInCurrency={ this.showValuesInCurrency }
          wallet={ this.wallet }
          xr={ this.xr }
        />;

        if (component) {
          return body;
        }

        this.openDialog({
          showCancelButton: false,
          onClickOk: this.clearDialog,
          showTitle: false,
          body,
        });
      };
    }

    // Return File Info window
    return (args) => {
      const body = <FileDialog
        { ...args }
        coinList={ coinList }
        isFlipped={ this.state.isFlipped }
        showValuesInCurrency={ this.showValuesInCurrency }
        wallet={ this.wallet }
        xr={ this.xr }
      />;

      if (component) {
        return body;
      }

      this.openDialog({
        showCancelButton: false,
        onClickOk: this.clearDialog,
        title: "File import",
        body,
      });
    };

  }

  handleAuthorizeGDrive(login = false) {
    const {
      storage,
      debug,
    } = this.wallet.config;

    if (login == true) {
      this.setState({
        status: states.INITIAL,
      });
      return storage.gdrive.handleClientLoad().then((isSignedIn) => {
        if (isSignedIn) {
          this.setState({
            navDrawerOpen: false,
          });
          return this.startGoogleDriveWallet();
        }
        return this._authorizeLoginGDrive();
      }).catch(this.onNotFilesFound);
    }

    // Switch storage method
    let coinsToMove = {};
    return this.showMoveCoinsAlert().then((coins) => {
      coinsToMove = coins;
      return storage.gdrive.handleClientLoad();
    }).then((isSignedIn) => {
      if (isSignedIn) {
        return this.startGoogleDriveWallet().then(() => {
          return this._moveCoins(coinsToMove);
        });
      }
      return this._authorizeGDrive(coinsToMove);
    }).catch((stillAuthorize) => {
      if (debug) {
        console.log(stillAuthorize);
      }
      // error, shall we still try to authorize?
      if (stillAuthorize) {
        this._authorizeGDrive(coinsToMove);
      }
    });
  }

  _moveCoins(coinList) {
    const keys = Object.keys(coinList);
    if (keys.length > 0) {
      const {
        COIN_STORE,
        debug,
        storage,
      } = this.wallet.config;

      return storage.sessionStart("Move receive coins").then(() => {

        let promises = [];
        keys.forEach((k) => {
          let balance = 0;
          let prom = this.refreshCoinBalance(k).then((value) => {
            balance = value;
            return storage.addAllIfAbsent(COIN_STORE, coinList[k], false, k);
          }).then(() => {
            return this.refreshCoinBalance(k);
          }).then((newBalance) => {
            const changeInBal = newBalance - balance;
            if (changeInBal == 0) {
              return true;
            }
            return this.wallet.recordMoveInCoins(coinList[k], changeInBal, k);
          });
          promises.push(prom);
        });

        return Promise.all(promises);
      }).then(() => {
        return storage.sessionEnd();
      }).then(() => {
        return this.refreshSettings();
      }).then(() => {
        this.setState({
          status: states.APP,
        });
        return true;
      }).catch((err) => {
        if (debug) {
          console.log(err);
        }
        storage.sessionEnd();
        return Promise.reject(err);
      });
    }

    return this.refreshSettings().then(this.getCurrencyBalances).then(() => {
      this.setState({
        status: states.APP,
        navDrawerOpen: false,
      });
      return true;
    });
  }

  showMoveCoinsAlert() {
    // promise resolve with list of coins to move
    // after switch from storage method.
    // Resolve with empty list if no coins or
    // user decides not to move.

    let coins = this.wallet.getAllStoredCoins();
    if (!coins) {
      this.setState({
        status: states.INITIAL,
      });
      return Promise.reject("Problem on getting list of coins");
    }

    const {
      AVAILABLE_CURRENCIES,
      COIN_RECOVERY,
      COIN_STORE,
      debug,
      PERSISTENT,
      SETTINGS,
      storage,
      WALLET_DRIVE_NAME,
      WALLET_LOCAL_NAME,
    } = this.wallet.config;

    let {
      balance,
      settings,
    } = this.state;

    const drive = this.wallet.isGoogleDrive();
    const browser = this.wallet._browserIs(true);

    let storageName = browser.charAt(0).toUpperCase() + browser.slice(1);
    let futureStorageName = 'Google Drive';
    let storageAnimal = settings[WALLET_LOCAL_NAME];
    let futureStorageAnimal = "";
    if (drive) {
      let walletLocal = new LocalStorage().get(PERSISTENT, {});
      const wSettings = walletLocal[SETTINGS];
      walletLocal =  wSettings ? wSettings[WALLET_LOCAL_NAME] : "";
      storageName = 'Google Drive';
      futureStorageName = browser.charAt(0).toUpperCase() + browser.slice(1);
      storageAnimal = settings[WALLET_DRIVE_NAME];
      futureStorageAnimal = walletLocal ? ` to '${walletLocal}'` : "";
    }

    const title = "Change storage location" + (futureStorageAnimal ?
      futureStorageAnimal + " in " + futureStorageName : " to " + futureStorageName);

    var moveCoins = true;

    return new Promise((resolve, reject) => {

      const onClickOk = () => {
        this.setState({
          status: states.INITIAL,
        });
        this.clearDialog();

        if (!moveCoins || coins.total == 0) {
          this.setState({
            navDrawerOpen: false,
          });
          return resolve({});
          // return resolve([]);
        }

        delete coins.total;
        let coinList;

        return storage.sessionStart("Move extract coins").then(() => {
          let promises = [];

          Object.keys(coins).forEach((key) => {
            let listCoins = coins[key];
            let newBalance = 0;
            let actualCoins = this.wallet.getStoredCoins(true, key);

            if (actualCoins.length == 0) {
              return;
            }

            let promise = this.checkCoinsExist(false, key).then((value) => {
              newBalance = value;
              actualCoins = this.wallet.getStoredCoins(true, key);
              return this.wallet.extractCoins(actualCoins, "Move", "wallet", key);
            }).then(() => {
              let params = [listCoins, newBalance, false, key];
              return this.wallet.recordMoveOutCoins(...params);
            }).then(() => {
              return this.refreshCoinBalance(key);
            }).then(() => {
              let result = {};
              result[key] = actualCoins;
              return result;
            });
            promises.push(promise);
          });

          return Promise.all(promises);
        }).then((results) => {
          results = results.filter((obj) => {
            return obj[Object.keys(obj)[0]].length > 0;
          });
          coinList = Object.assign(...results);
          return storage.sessionEnd();
        }).then(() => {
          this.setState({
            navDrawerOpen: false,
          });
          return resolve(coinList);
        }).catch((errs) => {
          // TO_DO Try to recover the coins?
          if (debug) {
            console.log(errs);
          }
          const msg = "Problem when extracting coins from the coin store";
          let proms = Object.keys(coins);
          proms.map((key) => {
            const params = [COIN_STORE, coins[key], false, key];
            return storage.addAllIfAbsent(...params).then(() => {
              return this.refreshCoinBalance(key);
            })
          });

          return Promise.all(proms).then(() => {
            return storage.sessionEnd();
          }).then(() => {
            this.handleNotificationUpdate(msg, true);
            this.setState({
              navDrawerOpen: false,
            });
            return reject(errs);
          }).catch((err) => {
            console.log(err);
            storage.sessionEnd();
            return reject(err);
          });
        });
      };

      this.openDialog({
        coins: coins,
        showCancelButton: true,
        onClickOk,
        onClickCancel: () => {
          this.clearDialog();
          this.setState({
            navDrawerOpen: false,
          });
          reject(false); // no error
        },
        title: title,
        body: <MoveCoinsDialog
          balance={ balance }
          browser={ browser }
          coins={ coins }
          drive={ drive }
          futureStorageName={ futureStorageName }
          futureStorageAnimal={ futureStorageAnimal }
          onCheckedMoveCoins={ () => moveCoins = !moveCoins }
          showValuesInCurrency={ this.showValuesInCurrency }
          storageAnimal={ storageAnimal }
          storageName={ storageName }
          wallet={ this.wallet }
          xr={ this.xr }
        />,
      });
    });
  }

  onNotFilesFound(err) {
    console.log("no files found");
    if (err.name === 'ReferenceError') {
      // No internet connection or No files in Google Drive.
      this.openDialog({
        onClickOk: () => {
          this.clearDialog();
          this.startLocalStorageWallet();
        },
        onClickCancel: () => {
          this.clearDialog();
          this.setState({
            status: states.WELCOME,
          });
        },
        okLabel: "START LOCAL WALLET INSTEAD",
        cancelLabel: "OK",
        showCancelButton: true,
        title: "Connect into Google Drive interrupted",
        body: <ErrorGoogleDriveDialog
          fromLocalStorage={ false }
        />,
      });
    } else {
      this.openDialog({
        showCancelButton: true,
        title: "Trying to connect to Google Drive",
        onClickOk: () => {
          this.clearDialog();
          this.startLocalStorageWallet();
        },
        onClickCancel: () => {
          this.clearDialog();
          this.setState({
            status: states.WELCOME
          });
        },
        okLabel: "YES",
        cancelLabel: "LATER",
        body: <div style={{ textAlign: 'center' }}>
          <h4>Seems to be a problem connecting to Google Drive ...</h4>
          <p>Would you like to open your local Wallet instead?</p>
        </div>,
      });
    }
  }

  /**
   * @param coins [Array] list of coins to move from switching storage method
   */
  _authorizeGDrive(coins = {}) {
    const {
      COIN_RECOVERY,
      COIN_STORE,
      storage,
    } = this.wallet.config;

    this.setState({
      navDrawerOpen: false
    });

    let promise = Promise.resolve(true);
    const cKeys = Object.keys(coins);
    if (cKeys.length > 0) {
      let promises = [];
      cKeys.forEach((k) => {
        promises.push(storage.addAllIfAbsent(COIN_RECOVERY, coins[k], false, k));
      });
      promise = this.executeInSession('coins in recovery store', false, () => {
        return Promise.all(promises);
      });
    }

    return promise.then(() => {
      return storage.gdrive.handleAuthClick();
    }).then(() => {
      // just switch storage
      this.wallet.config.storage.setType('googleDrive');
      return this._authenticate();
    }).then(() => {
      return this._recoverTransactionsInProgress();
    }).then(() => {
      return this._moveCoins(coins);
    }).then((result) => {
      this.handleNotificationUpdate("Connected to Google Drive");
      this.forceTabClick(0);
      return result;
    }).catch((error) => {
      console.log(err);
      let msg = typeof error == "object" ? this.wallet.getResponseError(error) : error;
      this.handleNotificationUpdate(msg, true);

      if (cKeys.length > 0) {
        return storage.sessionStart("Cancel move coins").then(() => {
          let promises = []
          cKeys.forEach((k) => {
            promises.push(storage.addAllIfAbsent(COIN_STORE, coins[k], false, k).then(() => {
              return this.refreshCoinBalance(k);
            }).then((newBalance) => {
              return this.wallet.recordMoveOutCoins(coins[k], newBalance, true, k);
            }));
          });
          return Promise.all(promises);
        }).then(() => {
          this.setState({
            status: states.APP,
          });
          return storage.sessionEnd();
        }).then(() => {
          setTimeout(() => {
            this.openDialog({
              onClickOk: () => {
                this.clearDialog();
              },
              showCancelButton: false,
              title: "Can't connect into Google Drive",
              body: <ErrorGoogleDriveDialog
                fromLocalStorage={ true }
              />,
            });
          }, 500);
        }).catch((err) => {
          console.log(err);
          storage.sessionEnd();
          return Promise.reject(err);
        });
      }

      this.setState({
        status: states.APP,
      });

      return this.refreshCoinBalance().then(() => {
        setTimeout(() => {
          this.openDialog({
            onClickOk: () => {
              this.clearDialog();
            },
            showCancelButton: false,
            title: "Can't connect into Google Drive",
            body: <ErrorGoogleDriveDialog
              fromLocalStorage={ true }
            />,
          });
        }, 500);
      });
    });
  }

  _authorizeLoginGDrive() {
    const {
      storage,
    } = this.wallet.config;

    storage.gdrive.handleAuthClick().then(() => {
      this.setState({
        status: states.INITIAL,
      });
      return this.startGoogleDriveWallet();
    }).then(() => {
      this.handleNotificationUpdate("Connected to Google Drive");
      return true;
    }).catch((err) => {
      console.log(err);
      this.openDialog({
        onClickOk: () => {
          this.clearDialog();
          this.startLocalStorageWallet();
        },
        onClickCancel: () => {
          this.clearDialog();
          this.setState({
            status: states.WELCOME,
          });
        },
        okLabel: "START LOCAL WALLET INSTEAD",
        cancelLabel: "OK",
        showCancelButton: true,
        title: "Problem on Logging into Google",
        body: <ErrorGoogleDriveDialog />,
      });

      let msg = err.message || this.wallet.getResponseError(err);
      msg = msg || "Error on connection to Google Drive";

      this.handleNotificationUpdate(msg, true);
      this.setState({
        status: states.WELCOME,
      });
      return Promise.reject(err);
    });
  }

  handleSignoutGDrive(event) {
    const {
      COIN_STORE,
      COIN_RECOVERY,
      storage,
    } = this.wallet.config;

    let coins = [];

    this.clearDialog();
    return this.showMoveCoinsAlert().then((coinList) => {
      // signout from google drive
      coins = coinList;
      return storage.gdrive.handleSignoutClick(event);
    }).then(() => {
      storage.setType('localStorage');
      return this._authenticate();
    }).then(() => {
      return this._recoverTransactionsInProgress();
    }).then(() => {
      return this.getCurrencyBalances();
    }).then((balances) => {
      let cKeys = Object.keys(coins);
      let now = new Date().toISOString();
      const msg = "Disconnected from Google Drive";

      if (cKeys.length == 0) {
        return storage.sessionStart(msg).then(() => {
          return this.checkCoinsExist();
        }).then((balance) => {
          return this.wallet.setPersistentVariable("lastInvocation", now);
        }).then(() => {
          return this.refreshSettings();
        }).then(() => {
          return storage.sessionEnd();
        }).then(() => {
          this.setState({
            status: states.APP,
          }, () => this.forceTabClick(0));
          this.forceTabClick(0);
          this.handleNotificationUpdate(msg);
        });
      }

      return storage.sessionStart("Move receive coins").then(() => {
        return this.wallet.setPersistentVariable("lastInvocation", now);
      }).then(() => {
        let promises = [];
        cKeys.forEach((k) => {
          let cCoins = coins[k];
          promises.push(storage.addAllIfAbsent(COIN_STORE, cCoins, false, k).then(() => {
            return this.refreshCoinBalance(k);
          }).then((newBalance) => {
            const difference = newBalance - balances[k];
            return this.wallet.recordMoveInCoins(cCoins, difference, k);
          }));
        });

        return Promise.all(promises);
      }).then(() => {
        return storage.sessionEnd();
      }).then(() => {
        return this.refreshSettings();
      }).then(() => {
        this.setState({
          status: states.APP,
        }, () => this.forceTabClick(0));
        this.handleNotificationUpdate(msg);
      });

      //this.showAlertWalletName();
    }).catch((error) => {
      console.log(err);
      let cKeys = Object.keys(coins);

      if (cKeys.length == 0) {
        this.setState({
          status: states.APP,
        });
        return;
      }

      storage.sessionStart("Cancel move coins").then(() => {
        let promises = []
        cKeys.forEach((k) => {
          let cCoins = coins[k];
          promises.push(storage.addAllIfAbsent(COIN_STORE, cCoins, false, k).then(() => {
            return this.refreshCoinBalance(k);
          }).then((newBalance) => {
            return this.wallet.recordMoveOutCoins(cCoins, newBalance, true, k);
          }));
        });

        return Promise.all(promises);
      }).then(() => {
        return storage.sessionEnd();
      }).then(() => {
        this.setState({
          status: states.APP,
        });
      });
    });
  }

  // Display Alert Close / Remove Wallet
  handleClickClose(isClose = true) {
    const {
      balance,
    } = this.state;

    if (isClose) {
      // Close directly
      setTimeout(() => this.props.close(isClose), 500);
      return;
    }

    let boolBackup = false;
    if (!isClose) {
      // No need to backup if it is Google Drive
      boolBackup = !this.wallet.isGoogleDrive();
    }

    let balances;
    this.getCurrencyBalances().then((result) => {
      balances = result;
      return this.wallet.backupToFile({
        encrypt: false,
        comment: "Auto backup from logout",
        passphrase: "",
        balance,
      }, false);
    }).then(({ backup, fileInfo }) => {
      let href = encodeURIComponent(JSON.stringify(backup, null, 2));

      this.openDialog({
        title: `${ isClose ? "Close" : "Remove" } Bitcoin-express Wallet.`,
        showCancelButton: true,
        body: <CloseDialog
          fileName={ `${fileInfo.filename}${parseFloat(fileInfo.balance).toFixed(8)}.json` }
          href={ href }
          onCheckDownload={(ev, checked) => {
            boolBackup = checked;
          }}
          balances={ balances }
          isClose={ isClose }
          showValuesInCurrency={ this.showValuesInCurrency }
          wallet={ this.wallet }
          xr={ this.xr }
        />,
        onClickOk: () => this.confirmCloseWallet(boolBackup, isClose),
      });
      this.setState({
        navDrawerOpen: false,
      });
    });
  }

  confirmCloseWallet(backup, isClose) {
    if (isClose) {
      setTimeout(() => this.props.close(isClose), 500);
      return;
    }

    const {
      storage,
    } = this.wallet.config;

    if (backup) {
      $('#bckdownload').get(0).click();
    }

    if (this.wallet.isGoogleDrive()) {
      this.clearDialog();

      const switchLocalStorageAndClose = () => {
        // switch to local storage persistence and close again
        storage.setType('localStorage');
        this._authenticate().then(() => {
          return this.checkCoinsExist();
        }).then(() => {
          return this.refreshCoinBalance();
        }).then((balance) => {
          const txs = this.wallet.getHistoryList();
          const coins = this.wallet.getStoredCoins(true);
          if (txs.length > 0 || coins.length > 0) {
            this.handleNotificationUpdate("Disconnected from Google Drive");
            this.handleClickClose(isClose);
          } else {
            setTimeout( () => {
              localStorage.removeItem('loggedIn');
              localStorage.removeItem(storage.gdrive.localStorageKey);
              storage.gdrive.handleSignoutClick().then(
                () => this.props.close(isClose),
                () => this.props.close(isClose)
              );
            }, 500);
          }
        });
      };

      storage.gdrive.handleSignoutClick()
        .then(switchLocalStorageAndClose)
        .catch(switchLocalStorageAndClose);

      return;
    }

    if (backup) {
      setTimeout( () => {
        localStorage.removeItem('loggedIn');
        // window.$.jStorage.flush();
        new LocalStorage().clean();
        this.props.close(isClose);
      }, 500);
      return;
    }

    const {
      balance,
    } = this.state;

    this.clearDialog();
    setTimeout(() => {
      this.openDialog({
        title: '',
        showCancelButton: true,
        body: <DiscardDialog
          balance={ balance }
          showValuesInCurrency={ this.showValuesInCurrency }
          wallet={ this.wallet }
          xr={ this.xr }
        />,
        onClickOk: () => {
          localStorage.removeItem('loggedIn');
          // window.$.jStorage.flush();
          new LocalStorage().clean();
          this.props.close(isClose);
        },
        onClickCancel: () => {
          this.clearDialog();
          this.loading(true);
          setTimeout(() => {
            this.loading(false);
            this.handleClickClose(isClose);
          }, 1000);
        },
        open: true,
      });
    }, 1000);
  }

  onModifyTabIndex(index) {
    return () => {
      const {
        isFullScreen,
        paymentRequest,
      } = this.props;

      let el = document.getElementsByClassName("tabsbar")[0].children[1].children[0];
      if (paymentRequest && el.style) {
        if (index == 0) {
          el.style.width = isFullScreen ? "12%" : "16.6667%";
          el.style.marginLeft = "0%";
        } else {
          el.style.width = isFullScreen ? "17.6%" : "16.6667%";
          el.style.marginLeft = isFullScreen ? `${-10*(6-index) - (10-index)}px` : "0%";
        }
      } else if (el.style) {
        if (index == 0) {
          el.style.width = isFullScreen ? "12%" : "20%";
          el.style.marginLeft = "0%";
        } else {
          el.style.width = isFullScreen ? "22%" : "20%";
          el.style.marginLeft = isFullScreen ? `${-8+(index-1)*2}%` : "0%";
        }
      }
      this.setState({
        tabIndex: index,
      });
    };
  }

  /*
   * @params in alertObj 
   *
   * actionsContainerStyle [obj]
   * body [component]
   * cancelLabel [string]
   * onClickCancel [fn]
   * onClickOk [fn]
   * okLabel [string]
   * showCancelButton [bool]
   * style [obj]
   * title [string]
   * titleStyle [obj]
   *
   * Opens the dialog modal window.
   */
  openDialog(alertObj, open=true) {
    alertObj = Object.assign({}, alertObj, { open });
    this.setState({ alert: alertObj });
  }

  _closeDialog(event) {
    if (this.state.alert.onClickCancel) {
      this.state.alert.onClickCancel();
    }
    this.clearDialog();
  }

  clearDialog() {
    this.setState({
      alert: {
        actionsContainerStyle: null,
        open: false,
        title: "",
        body: null,
        onClickOk: null,
        onClickCancel: null,
        okLabel: "OK",
        cancelLabel: "CANCEL",
        showCancelButton: true,
        style: {},
        titleStyle: null,
      }
    });
  }

  /**
   * @param action [string]
   * @param loading [boolean]
   * @param callback [function] function that returns a promise
   * returns promise that resolves true if the callback is executed in a
   * correct session or rejects if any problem
   */
  executeInSession(action, loading, callback) {
    const {
      storage,
    } = this.wallet.config;

    if (!this.wallet.config.storage) {
      return Promise.reject(Error("No storage in wallet"));
    }

    if (loading) {
      this.loading(true);
    }
    return storage.sessionStart(action).then(() => {
      return callback();
    }).then(() => {
      return storage.sessionEnd();
    }).then(() => {
      if (loading) {
        this.loading(false);
      }
      return true;
    }).catch((err) => {
      console.log(err);
      if (loading) {
        this.loading(false);
      }
      return storage.sessionEnd().then(() => {
        throw new Error(err.message || "Problem on saving session");
      });
    });
  }

  showValuesInCurrency() {
    // flip currencyValues
    this.setState({
      isFlipped: true,
    });

    setTimeout(() => {
      this.setState({
        isFlipped: false,
      });
    }, 5000);
  }

  handleResizeClick(event) {
    const {
      isFullScreen,
      onExpandClick,
      onContractClick,
    } = this.props;

    this.setState({
      navDrawerOpen: false,
    });

    if (isFullScreen) {
      onContractClick();
    } else {
      onExpandClick();
    }
  }

  handleClickDeposit(event, fn) {
    let {
      targetValue,
    } = this.state;

    const isTab = typeof(event) == "boolean" && event;

    if (!parseFloat(targetValue)) {
      targetValue = "0";
    }

    this.loading(true);
    this.clearDialog();
    this.wallet.depositIntent({
      target: targetValue,
    }).then((response) => {
      this.loading(false);

      if (isTab) {
        fn();
        return true;
      }

      return this.handleClickAddFunds();
    }).catch((err) => {
      this.loading(false);
      console.log(err);
      this.handleNotificationUpdate("Failed to get Bitcoin address", true);
    });
  }

  handleRemoveDepositRef(event, fn) {
    const {
      closeDialog,
      loading,
      snackbarUpdate,
      wallet,
    } = this.props;

    const isTab = typeof(event) == "boolean" && event;

    this._closeDialog();
    this.loading(true);
    this.wallet.removeDepositRef().then(() => {
      this.loading(false);
      this.setState({
        targetValue: "",
      });
      this.handleNotificationUpdate("Deposit reference removed");

      if (isTab) {
        fn();
        return true;
      }
    }).catch((err) => {
      console.log(err);
      this.loading(false);
      let message = "Unexpected error when removing deposit reference";
      if (err && err.message) {
        message = err.message;
      }
      this.handleNotificationUpdate(message, true);
      this.setState({
        targetValue: "",
      });
    });
  }


  issueCollect(event, fn=null, reference=null) {
    const {
      loading,
      refreshCoinBalance,
      snackbarUpdate,
    } = this.props;

    const {
      debug,
      ISSUE_POLICY,
    } = this.wallet.config;

    const isTab = typeof(event) == "boolean" && event;
    let issueResponse;

    const startIssueCollect = (depositRef) => {
      let {
        targetValue,
      } = depositRef.issueInfo;

      targetValue = parseFloat(targetValue);

      const params = {
        beginResponse: depositRef,
        policy: this.wallet.getSettingsVariable(ISSUE_POLICY),
        target: targetValue,
        action: "issue",
      };

      this.handleNotificationUpdate("Issue collection started");
      return this.wallet.issueCollect(params);
    };

    const storeCoinsInRecoveryStore = (response) => {
      issueResponse = response;
      return this.coinsInRecoveryStore(response);
    }

    const updateWalletStatus = (newBalance) => {
      this.handleNotificationUpdate("Issue collect was successful");
      this.loading(false);
      this.setState({
        targetValue: "",
      });

      // show last tx, supposed to be the receive tx
      if (isTab) {
        this.forceTabClick(0);
      }

      var histObj = this.wallet.getHistoryList()[0];
      this.showReceiveFundsDialog(histObj, "Receive funds complete");
      return this.refreshCoinBalance("XBT");
    };

    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }

      this.loading(false);

      if (isTab && fn) {
        // Call callback if needed
        fn();
      } else if (!isTab) {
        // Reopen the window
        this.handleClickAddFunds();
      }

      if (err.deferInfo) {
        this.handleNotificationUpdate([
          err.deferInfo.reason,
          `Try again after ${this.time.formatDate(err.deferInfo.after, true)}`
        ]);
        return;
      }

      let msg = err.message || "Failed to issue new coins";
      if (msg === "Transaction unconfirmed") {
        msg = "Transaction unconfirmed, try again later";
      }
      this.handleNotificationUpdate(msg, true);
    };

    this.clearDialog();
    this.loading(true);

    let promise = Promise.resolve(reference);
    if (!reference || !reference.issueInfo) {
      promise = this.wallet.getDepositRef()
    }

    return promise
      .then(startIssueCollect)
      .then(storeCoinsInRecoveryStore)
      .then(updateWalletStatus)
      .then(() => issueResponse)
      .catch(handleError);
  }

  coinsInRecoveryStore(response) {
    const {
      debug,
      storage,
      COIN_RECOVERY,
      CRYPTO,
    } = this.wallet.config;

    if (debug) {
      console.log("Wallet.coinsInRecoveryStore ", response.coin);
    }

    // const crypto = this.wallet.getPersistentVariable(CRYPTO, "XBT");
    const crypto = "XBT";
    return storage.addAllIfAbsent(COIN_RECOVERY, response.coin, false, crypto)
      .then(() => this.refreshCoinBalance(crypto));
  }

  showReceiveFundsDialog(tx, title="Bitcoin Receive transaction") {
    const {
      isFlipped,
    } = this.state;

    let {
      action,
      balance,
      date,
    } = tx;

    let {
      blockchainAddress,
      blockchainTxid,
      blockchainFee,
      lostValue,
      totalCoins,
    } = tx.info;

    let {
      actualValue,
      faceValue,
      fee,
      issuePolicy,
      newValue,
      reference
    } = tx.issuer;

    balance = parseFloat(balance);
    fee = parseFloat(fee);

    const received = parseFloat(newValue);
    const initialBalance = balance - received - fee;

    this.openDialog({
      onClickOk: () => {
        this._closeDialog();
      },
      onClickCancel: null,
      showCancelButton: false,
      title: <div>
        <div style={{
          position: 'absolute',
          right: '30px',
          display: 'flex',
        }}>
          { this.tools.getImageComponent("b.svg") } 
          { this.tools.getImageComponent("arrowRight.svg") } 
          { this.tools.getImageComponent("b-e.svg") } 
        </div>
        <div style={{
          textAlign: 'left',
          fontSize: '30px',
        }}>
          { title }
          <DateComponent
            date={ date }
            horizontal={ true }
          />
        </div>
      </div>,
      body: <ReceiveSuccessDialog
        { ...this.props }
        balance={ balance }
        blockchainTxid={ blockchainTxid }
        blockchainAddress={ blockchainAddress }
        blockchainFee={ blockchainFee }
        initialBalance={ initialBalance }
        fee={ fee }
        received={ received }
        isFlipped={ isFlipped }
        snackbarUpdate={ this.handleNotificationUpdate }
        showValuesInCurrency={ this.showValuesInCurrency }
        wallet={ this.wallet }
        xr={ this.xr }
      />,
    });
  }

  handleClickAbout() {
    this.setState({
      navDrawerOpen: false,
    });

    this.openDialog({
      title: <div>
        About <br/>
        <LogoText />
      </div>,
      showCancelButton: false,
      body: <AboutDialog />,
    });
  }

  handleClickAddFunds() {
    const {
      isFlipped,
    } = this.state;

    let actions = [
      <RaisedButton
        label="Close"
        primary={ true }
        onClick={ this.clearDialog }
      />
    ];
    let targetValue = 0;

    this.wallet.getDepositRef().then((depositRef) => {
      if (depositRef) {
        actions.push(<RaisedButton
          style={{ marginLeft: '5px' }}
          label="FORGET ADDRESS"
          onClick={ this.handleRemoveDepositRef }
        />);
        actions.push(<RaisedButton
          style={{ marginLeft: '5px' }}
          label="COLLECT COINS"
          onClick={ this.issueCollect }
        />);
      } else {
        actions.push(<RaisedButton
          style={{ marginLeft: '5px' }}
          label="GET ADDRESS"
          onClick={ this.handleClickDeposit }
        />);
      }

      this.setState({
        navDrawerOpen: false,
      });

      this.openDialog({
        title: <div>
          <div style={{
            position: 'absolute',
            right: '30px',
            display: 'flex',
          }}>
            { this.tools.getImageComponent("b.svg") } 
            { this.tools.getImageComponent("arrowRight.svg") } 
            { this.tools.getImageComponent("b-e.svg") } 
          </div>
          <div style={{
            textAlign: 'left',
            fontSize: '35px',
          }}>
            Add funds
          </div>
        </div>,
        showCancelButton: true,
        cancelLabel: "OK",
        body: <AddFundsDialog
          closeDialog={ this.clearDialog }
          isFlipped={ isFlipped }
          issueCollect={ this.issueCollect }
          loading={ this.loading }
          snackbarUpdate={ this.handleNotificationUpdate }
          showValuesInCurrency={ this.showValuesInCurrency }
          openDialog={ this.handleClickAddFunds }
          updateTargetValue={(value) => {
            this.setState({
              targetValue: value,
            });
          }}
          wallet={ this.wallet }
          xr={ this.xr }
        />,
        actions,
      });
    });
  }

  handleClickSend() {
    const {
      isFlipped,
    } = this.state;

    const {
      isFullScreen,
    } = this.props;

    this.loading(true);

    this.setState({
      navDrawerOpen: false,
    });

    this.refreshCoinBalance("XBT").then((balance) => {
      this.loading(false);
      this.openDialog({
        title: <div>
          <div style={{
            position: 'absolute',
            right: '30px',
            display: 'flex',
          }}>
            { this.tools.getImageComponent("b-e.svg") } 
            { this.tools.getImageComponent("arrowRight.svg") } 
            { this.tools.getImageComponent("b.svg") } 
          </div>
          <div style={{
            textAlign: 'left',
            fontSize: '35px',
          }}>
            Send
          </div>
        </div>,
        showCancelButton: false,
        style: {
          backgroundImage: "",
          backgroundRepeat: 'no-repeat',
          backgroundColor: "white",
        },
        okLabel: "Close",
        onClickOk: () => {
          this.clearDialog();
        },
        body: <SendDialog
          balance={ balance }
          closeDialog={ this._closeDialog }
          isFlipped={ isFlipped }
          openDialog={ this.openDialog }
          refreshCoinBalance={ this.refreshCoinBalance }
          snackbarUpdate={ this.handleNotificationUpdate }
          showValuesInCurrency={ this.showValuesInCurrency }
          transactions={ this.wallet.getHistoryList() }
          wallet={ this.wallet }
          xr={ this.xr }
        />,
      });
    });
  }

  handleSyncContent() {
    const {
      balance,
    } = this.state;

    const {
      COIN_STORE,
      storage,
    } = this.wallet.config;

    let newBalance = 0;
    storage.readWallet().then(() => {
      return this.refreshCoinBalance();
    }).then((value) => {
      newBalance = value;
      return this.refreshSettings();
    }).then(() => {
      const difference = newBalance - balance;
      let messages = ['Sync with contents'];
      if (difference > 0) {
        messages.push(`Balance increased XBT ${difference.toFixed(8)} after sync`);
      } else if (difference < 0) {
        const dec = Math.abs(difference).toFixed(8);
        messages.push(`Balance decreased XBT -${dec} after sync`);
      }
      this.handleNotificationUpdate(messages, false);
    }).catch((err) => {
      console.log(err);
      this.handleNotificationUpdate(err.message || 'Not possible to sync', true);
    });
  }

  _renderHeader() {
    let {
      navDrawerOpen,
      isFlipped,
      settings,
    } = this.state;

    const {
      initializeDraggableArea,
      isFullScreen,
    } = this.props;

    const {
      total,
    } = this.wallet.getAllStoredCoins();

    return <Bar
      closeDialog={ this._closeDialog }
      empty={ total == 0 }
      executeInSession={ this.executeInSession }
      handleAuthorizeGDrive={ this.handleAuthorizeGDrive }
      handleClickAbout={ this.handleClickAbout }
      handleClickAddFunds={ this.handleClickAddFunds }
      handleClickClose={ this.handleClickClose.bind(this, true) }
      handleClickSend={ this.handleClickSend }
      handleClickSignout={ this.handleClickClose.bind(this, false) }
      handleMenuIconClick={ this.handleMenuIconClick }
      handleResizeClick={ this.handleResizeClick }
      handleSignoutGDrive={ this.handleSignoutGDrive }
      loading={ this.loading }
      initializeDraggableArea={ initializeDraggableArea }
      isFlipped={ isFlipped }
      isFullScreen={ isFullScreen }
      openDialog={ this.openDialog }
      opened={ navDrawerOpen }
      password={ this.state.password }
      refreshCoinBalance={ this.refreshCoinBalance }
      refreshSettings={ this.refreshSettings }
      setWalletPassword={ this.setWalletPassword }
      setSettingsKey={ this.setSettingsKey }
      settings={ settings }
      showValuesInCurrency={ this.showValuesInCurrency }
      snackbarUpdate={ this.handleNotificationUpdate }
      wallet={ this.wallet }
      xr={ this.xr }
    />;
  }

  _renderTabs() {
    let {
      alert,
      balance,
      exchangeRates,
      expiryExchangeRates,
      initialIndex,
      isFlipped,
      notification,
      settings,
      tabIndex,
    } = this.state;

    const {
      isFullScreen,
    } = this.props;

    const isGDrive = this.wallet.isGoogleDrive();
    const transactions = this.wallet.getHistoryList();

    const {
      total,
    } = this.wallet.getAllStoredCoins();

    let notWaitingForSwap = true;
    if (this.wallet.config.storage) {
      const {
        storage,
        COIN_SWAP,
        SESSION,
      } = this.wallet.config;

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
        icon={ isFullScreen ? null : <i
          className="fa fa-plus"
        /> }
        label={ isFullScreen ? "add funds" : null }
        onActive={ this.onModifyTabIndex(3) }
        style={ this.styles.tabLabel }
        title={ isFullScreen ? null : "Add funds" }
        className="tabLabel"
      >
        <div
          className="tab"
          style={ isFullScreen ? this.styles.tabFullScreenStyle : this.styles.tab }
        >
          <AddFundsTab
            handleClickDeposit={ this.handleClickDeposit }
            handleRemoveDepositRef={ this.handleRemoveDepositRef }
            isFlipped={ isFlipped }
            isFullScreen={ isFullScreen }
            issueCollect={ this.issueCollect }
            loading={ this.loading }
            snackbarUpdate={ this.handleNotificationUpdate }
            showValuesInCurrency={ this.showValuesInCurrency }
            updateTargetValue={(value) => {
              this.setState({
                targetValue: value,
              });
            }}
            wallet={ this.wallet }
            xr={ this.xr }
          />
        </div>
      </Tab>;

    } else {

      exchangeTab = <Tab
        icon={ isFullScreen ? null : <i
          className="fa fa-exchange"
        /> }
        label={ isFullScreen ? "exchange" : null }
        onActive={ this.onModifyTabIndex(3) }
        style={ this.styles.tabLabel }
        title={ isFullScreen ? null : "Exchange" }
        className="tabLabel"
      >
        <div
          className="tab"
          style={ isFullScreen ? this.styles.tabFullScreenStyle : this.styles.tab }
        >
          <ExchangeTab
            active={ tabIndex == 3 }
            closeDialog={ this._closeDialog }
            exchangeRates={ exchangeRates }
            isFlipped={ isFlipped }
            isFullScreen={ isFullScreen }
            loading={ this.loading }
            openDialog={ this.openDialog }
            refreshCoinBalance={ this.refreshCoinBalance }
            refreshIssuerRates={ this.refreshIssuerRates }
            showValuesInCurrency={ this.showValuesInCurrency }
            snackbarUpdate={ this.handleNotificationUpdate }
            wallet={ this.wallet }
            xr={ this.xr }
          />
        </div>
      </Tab>;
    }

    return (
      <Tabs
        className="tabsbar"
        style={{
          position: "static",
        }}
        initialSelectedIndex={ initialIndex }
        tabItemContainerStyle={{
          borderBottom: '1px solid white',
        }}
      >
        <Tab
          icon={ <img
            src={ `css/img/tabs/home${tabIndex == 0 ? '_sel' : ''}.svg` }
            width="25"
          /> }
          onActive={ this.onModifyTabIndex(0) }
          style={{
            width: isFullScreen ? '12%' : '20%',
          }}
          title="Home"
        >
          <div
            className="tab"
            style={ isFullScreen ? this.styles.tabFullScreenStyle : this.styles.tab }
          >
            <WalletBalance
              balance={ balance }
              drive={ isGDrive }
              isFlipped={ isFlipped }
              isFullScreen={ isFullScreen }
              loading={ this.loading }
              onStorageIconClick={ this.handleSyncContent }
              refreshCoinBalance={ this.refreshCoinBalance }
              showValuesInCurrency={ this.showValuesInCurrency }
              snackbarUpdate={ this.handleNotificationUpdate }
              wallet={ this.wallet }
              xr={ this.xr }
            />
            <MainTab
              { ...this.props }
              closeDialog={ this._closeDialog }
              handleShowItemPurchased={ this.handleShowItemPurchased }
              handleShowItemPurchasedList={ this.handleShowItemPurchasedList }
              isFlipped={ isFlipped }
              isFullScreen={ isFullScreen }
              loading={ this.loading }
              openDialog={ this.openDialog }
              refreshCoinBalance={ this.refreshCoinBalance }
              showValuesInCurrency={ this.showValuesInCurrency }
              snackbarUpdate={ this.handleNotificationUpdate }
              wallet={ this.wallet }
              xr={ this.xr }
            />
          </div>
        </Tab>
        <Tab
          icon={ isFullScreen ? null : <img
            src={ `css/img/tabs/import${tabIndex == 1 ? '_sel' : ''}.svg` }
            width="25"
          /> }
          label={ isFullScreen ? "import" : null }
          onActive={ this.onModifyTabIndex(1) }
          style={ this.styles.tabLabel }
          title={ isFullScreen ? null : "Import" }
          className="tabLabel"
        >
          <div
            className="tab"
            style={ isFullScreen ? this.styles.tabFullScreenStyle : this.styles.tab }
          >
            <ImportTab
              handleShowCoin={ this.handleShowCoin }
              closeDialog={ this._closeDialog }
              isFullScreen={ isFullScreen }
              loading={ this.loading }
              refreshCoinBalance={ this.refreshCoinBalance }
              importFile={ this.importFile }
              openDialog={ this.openDialog }
              refreshSettings={ this.refreshSettings }
              snackbarUpdate={ this.handleNotificationUpdate }
              showValuesInCurrency={ this.showValuesInCurrency }
              isFlipped={ isFlipped }
              wallet={ this.wallet }
              xr={ this.xr }
            />
          </div>
        </Tab>
        <Tab
          className="tabLabel"
          disabled={ total == 0 }
          icon={ isFullScreen ? null : <img
            src={ `css/img/tabs/export${tabIndex == 2 ? '_sel' : ''}.svg` }
            width="25"
          /> }
          label={ isFullScreen ? "export" : null }
          onActive={ this.onModifyTabIndex(2) }
          style={ total == 0 ? this.styles.tabLabelDisabled : this.styles.tabLabel }
          title={ isFullScreen ? (total == 0 ? "Export disabled until funds added" : null) : "Export" }
        >
          <div
            className="tab"
            style={ isFullScreen ? this.styles.tabFullScreenStyle : this.styles.tab }
          >
            <ExportTab
              balance={ balance }
              closeDialog={ this._closeDialog }
              isFullScreen={ isFullScreen }
              loading={ this.loading }
              openDialog={ this.openDialog }
              refreshCoinBalance={ this.refreshCoinBalance }
              snackbarUpdate={ this.handleNotificationUpdate }
              wallet={ this.wallet }
              xr={ this.xr }
            />
          </div>
        </Tab>
        { exchangeTab }
        <Tab
          className="tabLabel"
          disabled={ transactions.length == 0 }
          icon={ isFullScreen ? null : <img
            src={ `css/img/tabs/history${tabIndex == 4 ? '_sel' : ''}.svg` }
            width="25"
          /> }
          label={ isFullScreen ? "history" : null }
          onActive={ this.onModifyTabIndex(4) }
          style={ transactions.length == 0 ? this.styles.tabLabelDisabled : this.styles.tabLabel }
          title={ isFullScreen ? (transactions.length == 0 ? "Empty history list" : null) : "History" }
        >
          <div
            className="tab wide"
            style={ isFullScreen ? this.styles.tabFullScreenStyle : this.styles.tab }
          >
            <HistoryTab
              isFlipped={ isFlipped }
              isFullScreen={ isFullScreen }
              openDialog={ this.openDialog }
              refreshCoinBalance={ this.refreshCoinBalance }
              showValuesInCurrency={ this.showValuesInCurrency }
              snackbarUpdate={ this.handleNotificationUpdate }
              transactions={ transactions }
              wallet={ this.wallet }
              xr={ this.xr } 
            />
          </div>
        </Tab>
        { this.props.paymentRequest ? <Tab
          className="tabLabel"
          icon={ isFullScreen ? null : <i
            className="fa fa-shopping-cart"
          /> }
          label={ isFullScreen ? "payment" : null }
          onActive={ this.onModifyTabIndex(5) }
          style={ this.styles.tabLabel }
          title={ isFullScreen ? null : "Payment" }
        >
          <PayTab
            active={ tabIndex == 5 }
            balance={ balance }
            exchangeRates={ exchangeRates }
            expiryExchangeRates={ expiryExchangeRates }
            isFlipped={ isFlipped }
            isFullScreen={ isFullScreen }
            loading={ this.loading }
            paymentDetails={ this.props.paymentRequest }
            refreshCoinBalance={ this.refreshCoinBalance }
            refreshIssuerRates={ this.refreshIssuerRates }
            removePayment={ this.props.removePayment }
            showValuesInCurrency={ this.showValuesInCurrency }
            snackbarUpdate={ this.handleNotificationUpdate }
            wallet={ this.wallet }
            xr={ this.xr }
          />
        </Tab> : null }
      </Tabs>
    )
  }

  renderApp() {
    let {
      balance,
    } = this.state;

    const {
      isFullScreen,
    } = this.props;

    return <div>
      { this._renderHeader() }
      { this._renderTabs() }
      <BottomBar
        { ...this.props }
        balance={ balance }
        handleResizeClick={ this.handleResizeClick }
        xr={ this.xr }
        wallet={ this.wallet }
        isFullScreen={ isFullScreen }
        showValuesInCurrency={ this.showValuesInCurrency }
      />
    </div>;
  }

  render() {
    const {
      alert,
      notification,
      notificationIndex,
      loading,
      status,
    } = this.state;

    const {
      isFullScreen,
    } = this.props;

    let content;

    switch (status) {

      case states.APP:
        console.log("showing application screen...");
        content =  this.renderApp();
        break;

      case states.WELCOME:
        console.log("showing logon screen...");
        content = (
          <LogonScreen
            { ...this.props }
            onAuthGDrive={ () => this.handleAuthorizeGDrive(true) }
            onAuthLocalStorage={ (changeStatus = false) => {
              return this.startLocalStorageWallet(changeStatus);
            }}
            onFinishLoadingFile={ () => {
              this.setState({
                status: states.APP,
              });
            }}
            onLoadFile={ this.handleOnDrop }
            snackbarUpdate={ this.handleNotificationUpdate }
            wallet={ this.wallet }
          />
        );
        break;

      default:
        console.log("showing welcome screen...");
        content = <WelcomeScreen
          isFullScreen={ isFullScreen }
        />;
    }

    return (
      <section>

        { content }

        <Notification
          messages={ notification }
          index={ notificationIndex }
        />

        <AlertDialog
          { ...alert }
          isFullScreen={ isFullScreen }
          onCloseClick={ this._closeDialog }
        />

        <Loading
          show={ loading }
          isFullScreen={ isFullScreen }
        />

      </section>
    );
  }
}

export default Wallet;
