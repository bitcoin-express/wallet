import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import LinearProgress from 'material-ui/LinearProgress';

import Logo from './Logo';
import LogoText from './LogoText';

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
      isFullScreen,
      onCloseClick,
    } = this.props;

    const logoStyle = {
      marginTop: isFullScreen ? '20vh' : '10vh',
    };

    return (
      <div
        className="welcome-page"
      >
        <Logo
          style={ logoStyle }
          height="145"
          width="145"
        />
        <div>
          <h1 className="name">
            <LogoText />
          </h1>
          <span style={{ color: 'white' }}>
            v{ window.version }
          </span>
        </div>
        <div>
          <LinearProgress
            mode="indeterminate"
            style={ this.styles.linearProgress }
            color="#8081ff"
          />
        </div>
      </div>
    );
  }
}

export default WelcomeScreen;
