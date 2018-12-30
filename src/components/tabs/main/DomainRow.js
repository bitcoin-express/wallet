import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  TableRow,
  TableRowColumn,
} from '@material-ui/core/Table';

import styles from '../../../helpers/Styles';

class DomainRow extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      domain,
      isFullScreen,
    } = this.props;

    return <TableRow
      selectable={ false }
      style={{
        borderBottom: 'none',
      }}
    >
      <TableRowColumn
        style={{
          minWidth: '200px',
          paddingLeft: isFullScreen ? '15px' : '19px',
          paddingRight: '10px',
          paddingTop: '10px',
          textOverflow: 'inherit',
          color: styles.colors.mainTextColor,
          fontFamily: styles.colors.currencyFontFamily,
          fontSize: '20px !important',
        }}
      >
        { domain }
      </TableRowColumn>
      <TableRowColumn style={{
        width : '30px',
        padding: '0',
      }}>
      </TableRowColumn>
    </TableRow>;
  }
};

export default DomainRow;
