import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
} from 'material-ui/Table';

import styles from '../../../helpers/Styles';

class HistoryTable extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const {
      isFullScreen,
      rows,
    } = this.props;

    return <Table
      selectable={ true }
      className="full-size-mini"
      style={{
        backgroundColor: styles.colors.secondaryColor,
        cursor: 'pointer',
        boxShadow: styles.styles.boxShadow, 
        marginTop: '20px 0',
      }}
    >
      <TableHeader
        className="hide-device"
        displaySelectAll={ false }
        adjustForCheckbox={ false }
        style={{
          height: '20px',
        }}
      >
        <TableRow
          style={{
            borderBottom: `1px solid ${styles.colors.secondaryBlue}`,
            height: '20px',
          }}
        >
          <TableHeaderColumn
            style={{
              width: '60px',
              height: '20px',
              padding: isFullScreen ? '5px 5px 5px 2vw' : '5px',
            }}
          />
          <TableHeaderColumn
            className="hide-mini"
            style={{
              width: '40px',
              height: '20px',
              padding: '5px 0 0 5px',
            }}
          />
          <TableHeaderColumn
            style={{
              color: styles.colors.secondaryTextColor,
              fontSize: '15px',
              height: '20px',
              padding: '0 2vw',
            }}
          >
            Action
          </TableHeaderColumn>
          <TableHeaderColumn
            style={{
              color: styles.colors.secondaryTextColor,
              height: '20px',
              fontSize: '15px',
            }}
          >
            Balance
          </TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody
        deselectOnClickaway={ false }
        displayRowCheckbox={ false }
      >
        { rows }
      </TableBody>
    </Table>;
  }
}

export default HistoryTable;
