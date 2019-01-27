import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import LinearProgress from '@material-ui/core/LinearProgress';
import Fade from '@material-ui/core/Fade';
import { withStyles } from '@material-ui/core/styles';

import Logo from './Logo';
import LogoText from './LogoText';


const componentStyles = (theme) => ({
  root: {
    textAlign: 'center',
    width: 'calc(100vw - 50px)',
    height: 'calc(100% - 26px)',
    minHeight: 'calc(100vh - 26px)',
    padding: '0 25px 26px 25px',
  },
  rootMin: {
    textAlign: 'center',
    color: 'darkslateblue',
    backgroundColor: '#a8baf8',
    height: '580px',
  },
  name: {
    color: 'white',
    fontFamily: "'Anton', impact",
    fontStyle: 'italic',
    fontWeight: '100',
    margin: '5px 0 5px 0',
  }
});


class WelcomeScreen extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      linearProgress: {
        width: "40%",
        marginLeft: "30%",
        marginTop: "40px",
        backgroundColor: "white",
      },
    };
  }

  render () {
    const {
      alert,
      classes,
      isFullScreen,
      onCloseClick,
    } = this.props;

    const logoStyle = {
      marginTop: isFullScreen ? '20vh' : '10vh',
    };

    return <div className={ isFullScreen ? classes.root: classes.rootMin }>
      <Logo
        style={ logoStyle }
        height="145"
        width="145"
      />
      <div>
        <h1 className={ classes.name }>
          <Fade in={true} timeout={500}>
            <LogoText />
          </Fade>
        </h1>
        <span style={{ color: 'white' }}>
          v{ window.version }
        </span>
      </div>
      <div>
        <LinearProgress
          color="secondary"
          style={ this.styles.linearProgress }
          variant="indeterminate"
        />
      </div>
    </div>;
  }
}

export default withStyles(componentStyles)(WelcomeScreen);

