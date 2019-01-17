import React from 'react';
import PropTypes from 'prop-types';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '@material-ui/core/Table';

import DateComponent from '../DateComponent';
import Time from '../../helpers/Time';
import { getDomainFromURL } from '../../helpers/tools';
import styles from '../../helpers/Styles';

class ItemPurchasedListDialog extends React.Component {
  constructor (props) {
    super(props);

    this.time = new Time();
  }

  render() {
    let {
      isFlipped,
      handleShowItemPurchased,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    let items = wallet.config.storage.get(wallet.config.ITEM_STORE);

    if (items && items.length > 0) { 
      return <Table
        selectable={ false }
        style={{
          backgroundColor: 'transparent',
        }}
      >
         <TableBody
          displayRowCheckbox={ false }
          showRowHover={ false }
        >
          { items.map(({ paymentAck, paymentDetails, details }, index) => {
            return <TableRow
              key={ index }
              selectable={ false }
              style={{
                borderBottom: `1px solid ${styles.colors.secondaryBlue}`,
              }}
            >
              <TableRowColumn
                style={{
                  width: '80px',
                }}
              >
                <DateComponent
                  date={ details.time || paymentDetails.time }
                />
              </TableRowColumn>
              <TableRowColumn
                style={{
                  fontSize: '20px',
                  color: styles.colors.mainTextColor,
                }}
              >
                { paymentDetails.memo }
                <div
                  style={{
                    fontSize: '13px',
                    color: styles.colors.darkBlue,
                  }}
                >
                  { getDomainFromURL(paymentDetails.payment_url) }
                </div>
              </TableRowColumn>
              <TableRowColumn
                style={{
                  width: '30px',
                  color: styles.colors.mainTextColor,
                }}
              >
                <i
                  className="fa fa-info-circle fa-2x"
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={ () => {
                    handleShowItemPurchased(items[index], true)();
                  }}
                />
              </TableRowColumn>
            </TableRow>;
          }) }
        </TableBody>
      </Table>;
    }
    return <div/>;
  }
}

ItemPurchasedListDialog.propTypes = {};

export default ItemPurchasedListDialog;
