import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { CSSTransitionGroup } from 'react-transition-group';

import RaisedButton from 'material-ui/RaisedButton';
import Dropzone from 'react-dropzone';

import StorageIcon from './StorageIcon';

import Tools from '../helpers/Tools';
import styles from '../helpers/Styles';

class LogonScreen extends React.Component {

  constructor(props) {
    super(props);

    this.tools = new Tools();

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    this.styles = {
      container: props.isFullScreen ? null : { margin: '10px' },
      section: {
        marginTop: '5vh',
      },
      welcomeLabelButton: {
        color: styles.colors.mainTextColor,
      },
      welcomeButton: {
        maxWidth: '400px',
        width: '100%',
        textAlign: 'left',
      },
      divider: {
        marginBottom: '15px',
      },
      imgName: {
        marginTop: props.isFullScreen ? '10vh' : '20px',
        width: '20vh',
        height: '20vh',
      },
      imgLogo: {
        height: props.isFullScreen ? '80%': '70%',
        cursor: 'crosshair',
      },
      iconButton: {
        fontSize: '1.5em',
        position:'absolute',
        left:'0',
        top:'5px',
        color: styles.colors.mainTextColor,
      },
      storageIcon: {
        marginTop: '5px',
      },
      text: {
        color: styles.colors.mainBlue,
        fontFamily: styles.fontFamily,
        marginBottom: props.isFullScreen ? '35px' : '15px',
        fontSize: props.isFullScreen ? 'inherit' : '11px',
      },
      backgroundColor: styles.colors.thirdBlue,
    };
  }

  render() {
    const {
      alert,
      onCloseClick,
      isFullScreen,
      onAuthGDrive,
      onAuthLocalStorage,
      onFinishLoadingFile,
      onLoadFile,
      wallet,
    } = this.props;

    const importIcon = this.tools.getImageComponent("import_blue.svg", 25, 25, "./", {
      display: 'inherit',
      position: 'absolute',
      marginTop: '5px',
    });

    return <div
      className="welcome-page"
      style={ this.styles.container }
    >
      <CSSTransitionGroup
        transitionName="welcome"
        transitionAppear={ true }
        transitionAppearTimeout={ 2500 }
        transitionEnter={ false }
        transitionLeave={ false }
      >
        <img
          src="css/img/Bitcoin-express.png"
          className="wp-header"
          style={ this.styles.imgName }
        />
        <div className="wp-header">
          <img
            alt="Bitcoin express"
            style={ this.styles.imgLogo }
            src="css/img/BitcoinExpress.svg"
          />
          <br />
          <small>
            v{ window.version }
          </small>
        </div>
        <section style={ this.styles.section }>
          <div style={ this.styles.text }>
            Looks like this is the first time this Wallet has been used.<br/>
            Please select one of the following options:
          </div>
          <div style={ this.styles.divider }>
            <RaisedButton
              backgroundColor={ this.styles.backgroundColor }
              icon={ <div style={ this.styles.welcomeButton } >
                <StorageIcon
                  drive={ true }
                  wallet={ wallet }
                  small={ true }
                  style={ this.styles.storageIcon }
                />
              </div> }
              label="Connect to Google Drive"
              labelStyle={ this.styles.welcomeLabelButton }
              onClick={ onAuthGDrive }
              style={ this.styles.welcomeButton }
              title="Please allow pop-ups for bitcoin-e.org"
            />
          </div>
          <div style={ this.styles.divider }>
            <RaisedButton
              label="Start Local Wallet"
              labelStyle={ this.styles.welcomeLabelButton }
              icon={ <div style={ this.styles.welcomeButton } >
                <StorageIcon
                  browser={ true }
                  wallet={ wallet }
                  small={ true }
                  style={ this.styles.storageIcon }
                />
              </div> }
              style={ this.styles.welcomeButton }
              onClick={ () => onAuthLocalStorage(true) }
              backgroundColor={ this.styles.backgroundColor }
            />
          </div>
          <div>
            <Dropzone
              accept="application/json"
              style={{}}
              onDrop={(accepted, rejected) => {
                onAuthLocalStorage().then(() => {
                  return onLoadFile(accepted, rejected, false);
                }).then(onFinishLoadingFile);
              }}
            >
              <RaisedButton
                label="Import coins from file"
                labelStyle={ this.styles.welcomeLabelButton }
                icon={ importIcon }
                style={ this.styles.welcomeButton }
                backgroundColor={ this.styles.backgroundColor }
              />
            </Dropzone>
          </div>
        </section>
      </CSSTransitionGroup>
    </div>;
  }
}

/*
<i
  className="fa fa-upload"
  style={ this.styles.iconButton }
/> 
*/

export default LogonScreen;
