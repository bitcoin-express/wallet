import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';

import Time from '../helpers/Time';

import styles from '../helpers/Styles';

class DateComponent extends React.Component {
  constructor(props) {
    super(props);

    this._initializeStyles = this._initializeStyles.bind(this); 
    this._initializeStyles(props);

    this.time = new Time();
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    const {
      dayLabelStyle,
      monthLabelStyle,
      timeLabelStyle,
    } = props;

    this.styles = {
      day: Object.assign({
        fontSize: '24px',
        width: '60px',
        textAlign: 'center',
        color: styles.colors.darkBlue,
      }, dayLabelStyle || {}),
      month: Object.assign({
        fontSize: '12px',
        fontWeight: 'bold',
        width: '60px',
        textAlign: 'center',
        color: styles.colors.mainTextColor,
      }, monthLabelStyle || {}),
      time: Object.assign({
        fontSize: '11px',
        width: '60px',
        textAlign: 'center',
        color: styles.colors.secondaryTextColor,
        fontWeight: 'bold',
      }, timeLabelStyle || {}),
      dayH: Object.assign({
        fontSize: '22px',
        marginLeft: '5px',
        color: styles.colors.darkBlue,
      }, dayLabelStyle || {}),
      monthH: Object.assign({
        fontSize: '16px',
        fontWeight: 'bold',
        color: styles.colors.mainTextColor,
      }, monthLabelStyle || {}),
      timeH: Object.assign({
        fontSize: '14px',
        marginLeft: '5px',
        color: styles.colors.secondaryTextColor,
        fontWeight: 'bold',
      }, timeLabelStyle || {}),
    };
  }

  render() {
    const {
      horizontal,
      date,
    } = this.props;

    const {
      time,
      year,
      day,
      month,
      monthAbbr,
    } = this.time.getTimeInfo(date);

    if (horizontal) {
      return <div>
        <span style={ this.styles.monthH }>
          { monthAbbr }
        </span>
        <span style={ this.styles.dayH }>
          { day }
        </span>
        <span style={ this.styles.timeH }>
          { time }
        </span>
      </div>;
    }

    return <div
      title={ this.time.formatDate(date, true) }
      style={{
        margin: '5px 0',
      }}
    >
      <div style={ this.styles.month }>
        { monthAbbr }
      </div>
      <div style={ this.styles.day }>
        { day }
      </div>
      <div style={ this.styles.time }>
        { time }
      </div>
    </div>;
  }
}

export default DateComponent;
