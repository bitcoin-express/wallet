import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Checkbox from 'material-ui/Checkbox';

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
    } = props;

    this.styles = {
      day: Object.assign({
        fontSize: '24px',
        width: '60px',
        textAlign: 'center',
        color: styles.colors.darkBlue,
      }, dayLabelStyle || {}),
      month: {
        fontSize: '12px',
        fontWeight: 'bold',
        width: '60px',
        textAlign: 'center',
        color: styles.colors.mainTextColor,
      },
      time: {
        fontSize: '11px',
        width: '60px',
        textAlign: 'center',
        color: styles.colors.secondaryTextColor,
        fontWeight: 'bold',
      },
      dayH: Object.assign({
        fontSize: '22px',
        marginLeft: '5px',
        color: styles.colors.darkBlue,
      }, dayLabelStyle || {}),
      monthH: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: styles.colors.mainTextColor,
      },
      timeH: {
        fontSize: '14px',
        marginLeft: '5px',
        color: styles.colors.secondaryTextColor,
        fontWeight: 'bold',
      },
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
