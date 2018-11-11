import React from 'react';
import PropTypes from 'prop-types';

import {
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import BitcoinCurrency from '../../BitcoinCurrency';
import DateComponent from '../../DateComponent';

import styles from '../../../helpers/Styles';

class HistoryRow extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      isFlipped,
      isFullScreen,
      key,
      index,
      previousBalance,
      selected,
      showValuesInCurrency,
      transaction,
      onClickRow,
      wallet,
      xr,
    } = this.props;

    const row = selected ? styles.colors.secondaryBlue : 'transparent';
    const domain = selected ? styles.colors.mainColor : styles.colors.mainBlue;

    let balance = parseFloat(transaction.balance);
    const difference = (balance - previousBalance).toFixed(8);

    let progress = <i
      className="fa fa-pause-circle-o fa-2x fa-rotate-90"
      style={{
        color: styles.colors.secondaryTextColor,
      }}
    />;
    if (difference > 0) {
      progress = <i
        className="fa fa-arrow-circle-o-up fa-2x"
        title={ `+${difference}XBT` }
        style={{
          color: styles.colors.mainGreen,
        }}
      />;
    } else if (difference < 0) {
      progress = <i
        className="fa fa-arrow-circle-o-down fa-2x"
        title={ `${difference}XBT` }
        style={{
          color: styles.colors.mainRed,
        }}
      />;
    }

    return <TableRow
      selected={ selected }
      onClick={() => {
        onClickRow(index);
      }}
      style={{
        borderBottom: `1px solid ${styles.colors.secondaryBlue}`,
      }}
    >
      <TableRowColumn
        key={ `tx-date-${key}` }
        style={{
          width: '60px',
          background: row,
          padding: isFullScreen ? '5px 5px 5px 2vw' : '5px',
        }}
      >
        <DateComponent
          date={ transaction.date }
          dayLabelStyle={{
            color: domain,
          }}
        />
      </TableRowColumn>

      <TableRowColumn
        key={ `tx-progress-${key}` }
        className="hide-mini"
        style={{
          background: row,
          fontSize: '17px',
          padding: '5px 0 0 5px',
          textAlign: 'center',
          width: '40px',
        }}
      >
        { progress }
      </TableRowColumn>

      <TableRowColumn
        key={ `tx-action-${key}` }
        style={{
          fontSize: '13px',
          color: styles.colors.mainTextColor,
          background: row,
          padding: '5px 2vw',
        }}
      >
        <div>
          { String(transaction.action).toUpperCase() }
          <div
            style={{
              fontSize: '12px',
              color: domain,
            }}
          >
            { transaction.domain }
          </div>
          <div className="show-device">
            <BitcoinCurrency
              displayStorage={ false }
              removeInitialSpaces={ true }
              buttonStyle={{
                background: styles.colors.mainBlack,
              }}
              isFlipped={ isFlipped }
              showValuesInCurrency={ showValuesInCurrency }
              tiny={ true }
              value={ balance }
              wallet={ wallet }
              xr={ xr }
            />
          </div>
        </div>
      </TableRowColumn>

      <TableRowColumn
        key={ `tx-actual-${key}` }
        className="hide-device"
        style={{
          background: row,
        }}
      >
        <BitcoinCurrency
          displayStorage={ false }
          removeInitialSpaces={ true }
          buttonStyle={{
            background: styles.colors.mainBlack,
          }}
          isFlipped={ isFlipped }
          showValuesInCurrency={ showValuesInCurrency }
          small={ true }
          value={ balance }
          wallet={ wallet }
          xr={ xr }
        />
      </TableRowColumn>
    </TableRow>;
  }
}

export default HistoryRow;
