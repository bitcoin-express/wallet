import React from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

import NavigationDrawer from './bar/NavigationDrawer';
import AppSecNavDrawer from './bar/AppSecNavDrawer';
import LogoText from './LogoText';
import Settings from './bar/settings/Settings';
import SignInOut from './SignInOut';

import styles from '../helpers/Styles';


const componentStyles = (theme) => {
  const {
    appbarHeight,
    colors,
  } = styles;

  // 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  const icon = {
    margin: '6px 0px 0px -16px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    textDecoration: 'none',
    outline: 'none',
    fontSize: '0px',
    fontWeight: 'inherit',
    position: 'relative',
    zIndex: '1',
  };

  return {
    icon,
    iconMin: Object.assign({}, icon, {
      margin: '6px 0px 0px -35px',
    }),
    iconSignInOut: {
      position: 'absolute',
      right: `${appbarHeight}px`,
    },
    iconSignInOutMin: {
      position: 'absolute',
      right: '0',
    },
    root: {
      background: colors.mainColor,
      borderRadius: 'inherit',
      fontFamily: "'Anton', impact",
      fontWeight: 100,
      height: `${appbarHeight}px`,
      zIndex: '1',
      [theme.breakpoints.down('xs')]: {
        padding: '0 24px 0 24px',
      },
      [theme.breakpoints.up('xs')]: {
        padding: '0 24px',
      },
      [theme.breakpoints.up('md')]: {
        padding: '0 calc(5vw + 24px)',
      },
      [theme.breakpoints.up('lg')]: {
        padding: '0 calc(15vw + 24px)',
      },
      [theme.breakpoints.up('xl')]: {
        padding: '0 calc(20vw + 24px)',
      },
    },
    rootMin: {
      borderRadius: '50px 20px 0 0',
      background: colors.mainColor,
      fontFamily: "'Anton', impact",
      fontWeight: 100,
      height: `${appbarHeight}px`,
      zIndex: '1',
      margin: '25px 16px 0 25px',
      width: '310px',
      padding: '0',
    },
    title: {
      height: 'inital',
      lineHeight: '10px',
      marginLeft: '-15px',
    },
    titleMin: {
      height: 'inital',
      lineHeight: '10px',
      marginLeft: '-15px',
    },
  };
};


class Bar extends React.Component {

  constructor(props) {
    super(props);

    this.DRAGGABLE_AREA = "logo-title";

    this.state = {
      open: false,
      type: 0, // 0 Settings, 1 DeveloperTools
      backupSettings: null,
    };

    this.showSettings = this.showSettings.bind(this);
    this.hideSettings = this.hideSettings.bind(this);
    this.handleCloseSettings = this.handleCloseSettings.bind(this);
    this.renderBurger = this.renderBurger.bind(this);
    this.showSecondaryNavDrawer = this.showSecondaryNavDrawer.bind(this);
    this.getMenuItems = this.getMenuItems.bind(this);
  }

  componentDidMount() {
    this.props.initializeDraggableArea(this.DRAGGABLE_AREA);
  }

  renderBurger() {
    return <svg
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
    </svg>;
  }

  showSettings () {
    const {
      loading,
      debug,
      handleMenuIconClick,
      openDialog,
      refreshSettings,
      snackbarUpdate,
      wallet,
    } = this.props;

    const displaySettingsDialog = (settings) => {
      loading(false);
      handleMenuIconClick(null, false);
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
    };

    const handleError = (err) => {
      if (debug) {
        console.log(err);
      }
      snackbarUpdate("Problem on opening settings", true);
    };

    loading(true);
    wallet.config.storage.readWallet()
      .then(() => refreshSettings())
      .then(displaySettingsDialog)
      .catch(handleError);
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

  getMenuItems() {
    const {
      empty,
      handleAuthorizeGDrive,
      handleClickAbout,
      handleClickAddFunds,
      handleClickSend,
      handleResizeClick,
      handleSignoutGDrive,
      opened,
      loading,
      wallet,
    } = this.props;

    const {
      open,
      type,
    } = this.state;

    let items = [{
      text: "Settings",
      fn: this.showSettings,
      key: "settings",
      isGDrive: false,
      icon: <i
        className="fa fa-cog"
      />,
      divider: false,
    }];
   
    if (!empty) {
      items.push({
        text: "Add Funds",
        fn: handleClickAddFunds,
        key: "add-funds",
        isGDrive: false,
        icon: <i
          className="fa fa-plus-circle"
        />,
        divider: false,
      });

      items.push({
        text: "Send funds",
        fn: handleClickSend,
        key: "send",
        isGDrive: false,
        icon: <i
          className="fa fa-paper-plane"
        />,
        divider: true,
      });
    }

    const isGDrive = wallet.isGoogleDrive();
    items.push({
      text: isGDrive ? "Disconnect from Google Drive" : "Connect to Google Drive",
      fn: isGDrive ? handleSignoutGDrive : handleAuthorizeGDrive,
      key: "drive",
      isGDrive: isGDrive,
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
      isGDrive: false,
      icon: <i
        className="fa fa-cogs"
      />,
    });

    items.push({
      text: "About",
      fn: handleClickAbout,
      key: "about",
      isGDrive: false,
      icon: <i
        className="fa fa-info-circle"
      />,
      divider: true,
    });

    return items;
  }

  render() {
    const {
      empty,
      classes,
      handleClickClose,
      handleClickSignout,
      handleMenuIconClick,
      isFullScreen,
      opened,
      loading,
      wallet,
    } = this.props;

    const {
      open,
      type,
    } = this.state;

    let properties = Object.assign({}, this.props);
    delete properties.classes;

    let renderComponent = [];
    
    renderComponent.push(<NavigationDrawer
      { ...properties }
      items={ this.getMenuItems() }
      key="navigation-drawer"
      open={ opened }
      onOverlayClick={ handleMenuIconClick }
    />);

    renderComponent.push(<AppBar
      id="app-bar"
      key="app-bar"
      classes={{
        root: isFullScreen ? classes.root : classes.rootMin,
      }}
    >
      <Toolbar style={{ minHeight: '40px' }}>
        <IconButton
          aria-label="Open drawer"
          color="inherit"
          onClick={ handleMenuIconClick }
          classes={{
            root: isFullScreen ? classes.icon : classes.iconMin,
          }}
        >
          { this.renderBurger() }
        </IconButton>
        <div
          className={classNames(classes.title)}
          id={ this.DRAGGABLE_AREA }
        >
          <LogoText
            isFullScreen={ isFullScreen }
          />
        </div>
        <div className={ isFullScreen ? classes.iconSignInOut : classes.iconSignInOutMin }>
          <SignInOut
            withSettings={ isFullScreen }
            onCloseTouchTap={ handleClickClose }
            onSignOutTouchTap={ handleClickSignout }
          />
        </div>
      </Toolbar>
    </AppBar>);

    return renderComponent;
  }
}

Bar.propTypes = {
  handleClickClose: PropTypes.func.isRequired,
  handleClickSignout: PropTypes.func.isRequired,
  handleMenuIconClick: PropTypes.func.isRequired,
  initializeDraggableArea: PropTypes.func.isRequired,
};

export default withStyles(componentStyles, { withTheme: true })(Bar);
