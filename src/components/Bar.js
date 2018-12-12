import React from 'react';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';

import AppNavDrawer from './bar/AppNavDrawer';
import AppSecNavDrawer from './bar/AppSecNavDrawer';
import LogoText from './LogoText';
import Settings from './bar/settings/Settings';
import SignInOut from './SignInOut';

import styles from '../helpers/Styles';


class Bar extends React.Component {

  constructor(props) {
    super(props);

    this.DRAGGABLE_AREA = "logo-title";

    this.state = {
      open: false,
      type: 0, // 0 Settings, 1 DeveloperTools
      backupSettings: null,
    };

    this.initializeStyles = this.initializeStyles.bind(this);
    this.initializeStyles(props);

    this.showSettings = this.showSettings.bind(this);
    this.hideSettings = this.hideSettings.bind(this);
    this.handleCloseSettings = this.handleCloseSettings.bind(this);
    this.renderBurger = this.renderBurger.bind(this);
    this.showSecondaryNavDrawer = this.showSecondaryNavDrawer.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.initializeStyles(nextProps);
  }

  componentDidMount() {
    this.props.initializeDraggableArea(this.DRAGGABLE_AREA);
  }

  initializeStyles(props) {
    this.styles = {
      appbar: {
        height: `${styles.appbarHeight}px`,
        fontFamily: "'Anton', impact",
        fontStyle: 'italic',
        fontWeight: 100,
        borderRadius: props.isFullScreen ? 'inherit' : '50px 20px 0 0',
      },
      icon: {
        margin: '6px 0px 0px -16px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
        textDecoration: 'none',
        outline: 'none',
        fontSize: '0px',
        fontWeight: 'inherit',
        position: 'relative',
        zIndex: '1',
      },
      iconRight: {
        marginRight: '0',
        marginTop: '0',
        marginLeft: `-${styles.appbarHeight}px`,
        width: '30px',
      },
      title: {
        lineHeight: `${styles.appbarHeight}px`,
        height: 'inital',
        marginTop: '6px',
        textAlign: 'left',
      },
      burger: {
        margin: "-3px 0 0 -15px",
        width: '60px',
        height: `${styles.appbarHeight}px`,
        padding: '0', 
      },
    };
  }

  renderBurger() {
    return (
      <IconButton style={ this.styles.burger }>
        <svg
          strokeWidth="0.501"
          strokeLinejoin="bevel"
          fillRule="evenodd"
          width="66px"
          height="34px"
          viewBox="0 0 22 22"
        >
          <g
            id="Document"
            fill="none"
            stroke={ styles.colors.mainTextColor }
            transform="scale(0.15 -0.15)"
          >
            <g id="Spread" transform="translate(0 -192)">
              <g id="Layer 1">
                <g
                  id="Group"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="12.382"
                  strokeMiterlimit="79.8403193612775"
                >
                  <path d="M 9.94,85.94 L 157.128,85.94" fill="none"/>
                  <path d="M 27.17,110.206 L 163.386,110.206" fill="none"/>
                  <path d="M 47.723,134.483 L 170.758,134.483" fill="none"/>
                  <path d="M 75.666,158.746 L 176.314,158.746" fill="none"/>
                  <path d="M 112.169,182.665 L 185.015,182.665" fill="none"/>
                </g>
              </g>
            </g>
          </g>
        </svg>
      </IconButton>
    );
  }

  showSettings () {
    const {
      loading,
      handleMenuIconClick,
      openDialog,
      refreshSettings,
      snackbarUpdate,
      wallet,
    } = this.props;

    loading(true);
    wallet.config.storage.readWallet().then(() => {
      return refreshSettings();
    }).then((settings) => {
      loading(false);
      handleMenuIconClick(null, false); //navDrawerOpen: false
      this.setState({
        backupSettings: Object.assign({}, {}, settings),
      });
      openDialog({
        onClickOk: this.hideSettings,
        onClickCancel: () => {
          let {
            backupSettings,
          } = this.state;

          const {
            SETTINGS,
          } = wallet.config;

          return wallet.setPersistentVariable(SETTINGS, backupSettings);
        },
        okLabel: "Confirm Changes",
        showCancelButton: true,
        showTitle: false,
        title: "Settings",
        style: {
          padding: '0',
          background: styles.colors.mainTextColor,
        },
        body: <Settings
          { ...this.props }
        />,
      });
    }).catch(() => {
      snackbarUpdate("Problem on opening settings", true);
    });
  }

  hideSettings() {
    const {
      closeDialog,
      executeInSession,
      setWalletPassword,
      wallet,
    } = this.props;

    let {
      backupSettings,
    } = this.state;

    const {
      SETTINGS,
    } = wallet.config;

    let newSettings = wallet.getPersistentVariable(SETTINGS);
    const { newPassword } = newSettings;

    this.setState({
      backupSettings: null,
    });
    closeDialog();

    return executeInSession("save settings", true, () => {
      let promise = Promise.resolve(true);
      if (newPassword != null) {
        delete newSettings.newPassword;
        promise = setWalletPassword(newPassword);
      }
      return promise.then(() => {
        if (this._isEquivalent(backupSettings, newSettings)) {
          return true;
        }
        return wallet.setPersistentVariable(SETTINGS, newSettings);
      });
    });
  }

  showSecondaryNavDrawer(type) {
    return () => {
      const {
        loading,
        handleMenuIconClick,
        refreshSettings,
        snackbarUpdate,
        wallet,
      } = this.props;

      loading(true);
      wallet.config.storage.readWallet().then(() => {
        return refreshSettings();
      }).then((settings) => {
        loading(false);
        handleMenuIconClick(null, false); //navDrawerOpen: false
        this.setState({
          open: true,
          type,
          backupSettings: Object.assign({}, {}, settings),
        });
      }).catch(() => {
        snackbarUpdate("Problem on opening settings", true);
      });
    };
  }

  _isEquivalent(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  }

  handleCloseSettings() {
    const {
      executeInSession,
      wallet,
    } = this.props;

    let {
      backupSettings,
    } = this.state;

    const {
      storage,
      PERSISTENT,
      SETTINGS,
    } = wallet.config;

    let newSettings = storage.getFrom(PERSISTENT, SETTINGS);

    if (!newSettings) {
      return this.setState({
        open: false,
        backupSettings: null,
      });
    }

    if (!this._isEquivalent(backupSettings, newSettings)) {
      return executeInSession("save settings", true, () => {
        return wallet.setPersistentVariable(SETTINGS, newSettings).then(() => {
          this.setState({
            open: false,
            backupSettings: null,
          });
          return true;
        });
      });
    }

    this.setState({
      open: false,
      backupSettings: null,
    });
  }

  render() {
    const {
      empty,
      handleAuthorizeGDrive,
      handleClickAbout,
      handleClickAddFunds,
      handleClickClose,
      handleClickSend,
      handleClickSignout,
      handleMenuIconClick,
      handleResizeClick,
      handleSignoutGDrive,
      isFullScreen,
      opened,
      loading,
      setSettingsKey,
      settings,
      wallet,
    } = this.props;

    const {
      open,
      type,
    } = this.state;

    const itemStyle = {
      color: styles.colors.mainTextColor,
      fontFamily: styles.fontFamily,
      textAlign: 'left',
    };
    const itemGDStyle = {
      color: styles.colors.darkBlue,
      fontFamily: styles.fontFamily,
      // fontSize: isFullScreen ? 'inherit' : '13.5px',
      // letterSpacing: '-0.8px',
      textAlign: 'left',
    };
    const iconStyle = {
      fontSize: '1.5em',
      color: styles.colors.mainTextColor,
    };

    const isGDrive = wallet.isGoogleDrive();

    const items = [{
      text: "Settings",
      fn: this.showSettings,
      key: "settings",
      style: itemStyle,
      icon: <i
        className="fa fa-cog"
        style={ iconStyle }
      />,
      divider: false,
    }];
   
    if (!empty) {
      items.push({
        text: "Add Funds",
        fn: handleClickAddFunds,
        key: "add-funds",
        style: itemStyle,
        icon: <i
          className="fa fa-plus-circle"
          style={ iconStyle }
        />,
        divider: false,
      });

      items.push({
        text: "Send funds",
        fn: handleClickSend,
        key: "send",
        style: itemStyle,
        icon: <i
          className="fa fa-paper-plane"
          style={ iconStyle }
        />,
        divider: false,
      });
    }

    items.push({
      text: isGDrive ? "Disconnect from Google Drive" : "Connect to Google Drive",
      fn: isGDrive ? handleSignoutGDrive : handleAuthorizeGDrive,
      key: "drive",
      style: isGDrive ? itemGDStyle : itemStyle,
      icon: <img
        src="css/img/storage/google.png"
        style={{
          width: '24px',
          height: '24px',
        }}
      />,
      divider: true,
    });

    items.push({
      text: "Developer Tools",
      fn: this.showSecondaryNavDrawer(1),
      key: "developer",
      style: itemStyle,
      icon: <i
        className="fa fa-cogs"
        style={ iconStyle }
      />,
    });

    items.push({
      text: "About",
      fn: handleClickAbout,
      key: "about",
      style: itemStyle,
      icon: <i
        className="fa fa-info-circle"
        style={ iconStyle }
      />,
      divider: true,
    });

    return (
      <div>
        <AppNavDrawer
          { ...this.props }
          items={ items }
          open={ opened }
          onOverlayClick={ handleMenuIconClick }
        />
        <AppSecNavDrawer
          { ...this.props }
          open={ open }
          type={ type }
          onClickClose={ this.handleCloseSettings }
        />
        <AppBar
          title={ <LogoText
            isFullScreen={ isFullScreen }
            id="logo-title"
          /> }
          id="app-bar"
          className="appbar top"
          style={ this.styles.appbar }
          titleStyle={ this.styles.title }
          iconStyleLeft={ this.styles.icon }
          iconStyleRight={ this.styles.iconRight }
          iconElementLeft={ this.renderBurger() }
          onLeftIconButtonTouchTap={ handleMenuIconClick }
          iconElementRight={ <SignInOut
            onCloseTouchTap={ handleClickClose }
            onSignOutTouchTap={ handleClickSignout }
          /> }
        />
      </div>
    );
  }
}

Bar.propTypes = {
  handleClickClose: PropTypes.func.isRequired,
  handleClickSignout: PropTypes.func.isRequired,
  handleMenuIconClick: PropTypes.func.isRequired,
  initializeDraggableArea: PropTypes.func.isRequired,
};

export default Bar;
