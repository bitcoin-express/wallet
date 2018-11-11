import React from 'react';
import PropTypes from 'prop-types';

import Tools from '../../../helpers/Tools';
import styles from '../../../helpers/Styles';

export default class DateCounter extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      counter: props.timeToExpire,
    };

    this.tools = new Tools();
  }

  componentDidMount() {
    this.interval = this.tools.countdown(this.state.counter, (counter) => {
      this.setState({
        counter,
      });
    }, () => {});
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const {
      counter,
    } = this.state;

    const {
      disabled,
      inSeconds,
    } = this.props;

    if (inSeconds) {
      return <span style={{
        color: disabled ? "red" : "rgb(47, 68, 126)"
      }}>
        { counter }s
      </span>;
    }

    const days = Math.floor(counter / (60 * 60 * 24));
    const _restDays = counter % (60 * 60 * 24);
    const hours = Math.floor(_restDays / (60 * 60));
    const _restHours = _restDays % (60 * 60);
    const minutes = Math.floor(_restHours / 60);
    const seconds = _restHours % 60;

    return <span style={{
      color: disabled ? "red" : "rgb(47, 68, 126)"
    }}>
      { days }d { hours }h { minutes }m { seconds }s
    </span>;
  }
}