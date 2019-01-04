import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { CSSTransitionGroup } from 'react-transition-group';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dropzone from 'react-dropzone';

import StorageIcon from './StorageIcon';
import { getImageComponent } from '../helpers/Tools';
import styles from '../helpers/Styles';


const componentStyles = (theme) => {
  const {
    colors,
  } = styles;

  return {
    root: {
      textAlign: 'center',
      color: styles.colors.mainTextColor,
      height: '580px',
      width: 'calc(100vw - 50px)',
      height: 'calc(100% - 26px)',
      minHeight: 'calc(100vh - 26px)',
      padding: '0 25px 26px 25px',
    },
    rootMin: {
      margin: '10px',
      textAlign: 'center',
      color: styles.colors.mainTextColor,
      height: '580px',
    },
    button: {
      color: styles.colors.mainTextColor,
      maxWidth: '400px',
      justifyContent: 'space-between',
      width: '100%',
      margin: theme.spacing.unit,
    },
    header: {
      [theme.breakpoints.down('xs')]: {
        display: 'none',
      },
      color: styles.colors.mainBlue,
      fontFamily: styles.fontFamily,
    },
    logoText: {
      marginTop: '10vh',
      width: '20vh',
      height: '20vh',
      maxWidth: '150px',
      maxHeight: '150px',
    },
    logoTextMin: {
      marginTop: '20px',
      width: '20vh',
      height: '20vh',
    },
    logoIcon: {
      height: '80%',
      cursor: 'crosshair',
    },
    logoIconMin: {
      height: '70%',
      cursor: 'crosshair',
    },
    section: {
      marginTop: '5vh',
      display: 'grid',
    },
    text: {
      marginBottom: '35px',
      fontSize: 'inherit',
      color: styles.colors.mainBlue,
      fontFamily: styles.fontFamily,
    },
    textMinimized: {
      marginBottom: '15px',
      fontSize: '11px',
      color: styles.colors.mainBlue,
      fontFamily: styles.fontFamily,
    },
  };
};


class LogonScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };

    this.styles = {
      storageIcon: {
        marginTop: '5px',
        position: 'inherit',
      },
    };

    this.handleOnDropDropzone = this.handleOnDropDropzone.bind(this);
    this.renderButtonSection = this.renderButtonSection.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      debug,
      snackbarUpdate,
    } = this.props;

    if (debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate(info, true);
  }

  handleOnDropDropzone(accepted, rejected) {
    const {
      onAuthLocalStorage,
      onFinishLoadingFile,
      onLoadFile,
    } = this.props;

    onAuthLocalStorage()
      .then(() => onLoadFile(accepted, rejected, false))
      .then(onFinishLoadingFile);
  }

  renderButtonSection() {
    const {
      classes,
      isFullScreen,
      onAuthGDrive,
      onAuthLocalStorage,
      wallet,
    } = this.props;

    const importIcon = getImageComponent("import.svg", 25, 25, "./tabs/");

    return <section className={ classes.section }>

      <p className={ isFullScreen ? classes.text : classes.textMinimized }>
        Looks like this is the first time this Wallet has been used.
        <br/>
        Please select one of the following options:
      </p>

      <div>
        <Button
          className={ classes.button }
          color="secondary"
          onClick={ onAuthGDrive }
          title="Please allow pop-ups for bitcoin-e.org"
          variant="contained"
        >
          Connect to Google Drive
          <StorageIcon
            drive={ true }
            wallet={ wallet }
            small={ true }
            style={ this.styles.storageIcon }
          />
        </Button>
      </div>

      <div>
        <Button
          className={ classes.button }
          color="secondary"
          onClick={ () => onAuthLocalStorage(true) }
          variant="contained"
        >
          Start Local Wallet
          <StorageIcon
            browser={ true }
            wallet={ wallet }
            small={ true }
            style={ this.styles.storageIcon }
          />
        </Button>
      </div>

      <Dropzone
        accept="application/json"
        style={{}}
        onDrop={ this.handleOnDropDropzone }
      >
        <Button
          className={ classes.button }
          color="secondary"
          variant="contained"
        >
          Import coins from file
          { importIcon }
        </Button>
      </Dropzone>
    </section>;
  }

  render() {
    const {
      classes,
      isFullScreen,
    } = this.props;

    const {
      hasError,
    } = this.state;

    return <section
      className={ isFullScreen ? classes.root : classes.rootMinimized }
    >
      <CSSTransitionGroup
        transitionName="welcome"
        transitionAppear={ true }
        transitionAppearTimeout={ 2500 }
        transitionEnter={ false }
        transitionLeave={ false }
      >

        <div className={ classes.header }>
          <img
            src="css/img/Bitcoin-express.png"
            className={ isFullScreen ? classes.logoText : classes.logoTextMin }
          />
          <img
            alt="Bitcoin express"
            src="css/img/BitcoinExpress.svg"
            className={ isFullScreen ? classes.logoIcon : classes.logoIconMin }
          />
          <br />
          <small>
            v{ window.version }
          </small>

          { hasError ? <h1>Wallet under maintainance. Try again later.</h1> : null }
        </div>

        { hasError ? null : this.renderButtonSection() }
      </CSSTransitionGroup>
    </section>;
  }
}


export default withStyles(componentStyles)(LogonScreen);

