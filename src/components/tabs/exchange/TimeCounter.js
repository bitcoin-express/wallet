import React from 'react';
import PropTypes from 'prop-types';

import HelpTooltip from '../../HelpTooltip';

import styles from '../../../helpers/Styles';
import { countdown } from '../../../helpers/tools';

export default class TimeCounter extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      counter: props.initialCounter || 1,
    };

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);


    this.startCountdown = this.startCountdown.bind(this);
    this.handleClickButton = this.handleClickButton.bind(this);
  }

  componentDidMount() {
    this.startCountdown(this.getCountdownSeconds(this.state.counter));
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    this.styles = {
      container: {
        margin: '15px 0 20px 0',
        color: styles.colors.mainTextColor,
        textAlign: 'right',
      },
      refreshTimeButton: {
        color: styles.colors.mainTextColor,
        cursor: 'pointer',
        padding: "2px 10px",
        borderRadius: "10px",
        backgroundColor: styles.colors.secondaryBlue,
      },
      timeSection: {
        marginTop: '5px',
        fontFamily: 'Roboto, sans-serif',
      },
      tooltip: {
        verticalAlign: 'baseline',
        color: props.isFullScreen ? styles.colors.secondaryBlue :
          styles.colors.mainTextColor,
      },
    };
  }

  getCountdownSeconds(stringDate) {
    let t1 = new Date();
    let t2 = new Date(stringDate);
    let dif = t1.getTime() - t2.getTime();
    let t1ToT2 = dif / 1000;
    return Math.floor(Math.abs(t1ToT2));
  }

  startCountdown(seconds=70) {
    const {
      setDisabled,
      setExpired,
    } = this.props;

    this.setState({
      counter: seconds,
    });

    this.interval = countdown(seconds, (counter) => {
      if (counter <= 5) {
        setDisabled();
      }
      this.setState({
        counter,
      });
    }, setExpired);
  }

  handleClickButton() {
    const {
      onClickButton,
    } = this.props;

    onClickButton().then((expiry) => {
      clearInterval(this.interval);
      this.startCountdown(this.getCountdownSeconds(expiry));
    });
  }

  render() {
    const {
      counter,
    } = this.state;

    const {
      expired,
      isFullScreen,
      type,
    } = this.props;

    if (type !== "issuer") {
      return <div style={ this.styles.container } />
    }

    return <div style={ this.styles.container }>
      <div style={ this.styles.timeSection }>
        { expired ? <b
          style={ this.styles.refreshTimeButton }
          onClick={ this.handleClickButton }
        >
          TIME <i className="fa fa-refresh" />
        </b> : null } <span style={{ 
          color: counter < 6 ? "red" :
            (isFullScreen ? styles.colors.secondaryBlue :
              styles.colors.mainTextColor),
        }}>
          { counter }s
        </span>
        <HelpTooltip
          iconStyle={ this.styles.tooltip }
          note={ <div>
            Exchange rates may change rapidly.<br />
            Please refresh for latest rates.
          </div> }
        />
      </div>
    </div>;
  }
}

