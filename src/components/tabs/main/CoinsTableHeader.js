import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  TableHeaderColumn,
  TableRow,
} from '@material-ui/core/Table';

import Exchange from '../../Exchange';

import styles from '../../../helpers/Styles';

class CoinsTableHeader extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isFullScreen,
      snackbarUpdate,
      totalCoins,
      wallet,
      xr,
    } = this.props;

    return <TableRow
      selectable={ false }
      style={{
        borderBottom: 'none',
      }}
    >
      <TableHeaderColumn
        style={{
          width: 'calc(100% - 140px)',
          paddingLeft: isFullScreen ? '24px' : '10px',
          height: '80px',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            width: '40px',
            textAlign: 'center',
            color: styles.colors.mainTextColor,
          }}
        >
          { totalCoins }
        </div>
        <div
          style={{
            fontSize: '12px',
            width: '40px',
            textAlign: 'center',
            color: styles.colors.darkBlue,
          }}
        >
          { totalCoins == 1 ? "COIN" : "COINS" }
        </div>
      </TableHeaderColumn>
      <TableHeaderColumn
        style={{
          width : '140px',
          padding: '0',
          height: '80px',
        }}
      >
        <Exchange
          snackbarUpdate={ snackbarUpdate }
          wallet={ wallet }
          xr={ xr }
        />
      </TableHeaderColumn>
    </TableRow>;
  }
};

export default CoinsTableHeader;
