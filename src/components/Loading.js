import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';

class Loading extends React.Component {

  constructor(props) {
    super(props);

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);
  }

  componentWillUpdate(nextProps, nextState) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    this.styles = {
      overly: {
        position: 'fixed',
        height: '100%',
        width: '100%',
        top: '0px',
        left: '0px',
        opacity: '1',
        backgroundColor: 'rgba(0, 0, 0, 0.54)',
        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
        willChange: 'opacity',
        textAlign: 'center',
        transform: 'translateZ(0px)',
        transition: `left 0ms cubic-bezier(0.23, 1, 0.32, 1) 0ms,
          opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 0ms`,
        zIndex: '1400',
      },
      spinner: {
        marginTop: '20vh',
      },
    };

    if (!props.isFullScreen) {
      this.styles.overly['margin'] = '20px';
      this.styles.overly['borderRadius'] = '50px 17px';
      this.styles.overly.height = 'calc(100% - 30px)';
      this.styles.overly.width = 'calc(100% - 30px)';
    }
  }

  render() {
    const {
      show,
    } = this.props;

    if (!show) {
      return null;
    }

    return (
      <div style={ this.styles.overly }>
        <CircularProgress
          size={ 150 }
          thickness={ 5 }
          style={ this.styles.spinner }
        />
      </div>
    );
  }
}

Loading.propTypes = {
  show: PropTypes.bool,
};

export default Loading;
