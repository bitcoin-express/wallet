import React from 'react';
import PropTypes from 'prop-types';

import SendTransaction from './SendTransaction';

import styles from '../../../helpers/Styles';

class SendList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {
      transactions,
      selectTransaction,
    } = this.props;

    transactions = transactions || [];
    let filteredTxs = transactions.filter((tx) => {
      return tx.action && (tx.action.startsWith("send ") || tx.action == "issue");
    });

    if (filteredTxs.length == 0) {
      return <section
        style={{
          textAlign: 'center',
          padding: '15px 10px',
          fontFamily: styles.fontFamily,
        }}
      >
        No Send/Receive BTC transactions yet recorded
      </section>;
    }

    return <section>
      { filteredTxs.map((tx, id) => {
        return <SendTransaction
          { ...this.props }
          id={ id }
          key={ id }
          tx={ tx }
          selectTransaction={ selectTransaction }
        />;
      }) }
    </section>;
  }
}

export default SendList;
