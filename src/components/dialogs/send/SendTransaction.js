import React from 'react';
import PropTypes from 'prop-types';

import BitcoinCurrency from '../../BitcoinCurrency';
import DateComponent from '../../DateComponent';
import SendSuccessDialog from './SendSuccessDialog';
import ReceiveSuccessDialog from './ReceiveSuccessDialog';

import Tools from '../../../helpers/Tools';
import styles from '../../../helpers/Styles';

class SendTransaction extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hover: false,
    };

    this.tools = new Tools();
    this.showReceiveDialog = this.showReceiveDialog.bind(this);
    this.showSendDialog = this.showSendDialog.bind(this);
  }

  showSendDialog() {
    const {
      closeDialog,
      openDialog,
      tx,
    } = this.props;

    let {
      balance,
      blockchainRef,
      date,
      comment,
    } = tx;

    const {
      blockchainAddress,
      blockchainFee,
      blockchainTxid,
    } = tx.info;

    const {
      fee,
    } = tx.issuer;

    const amount = parseFloat(tx.info.bitcoinValue);
    const initialBalance = parseFloat(balance) + parseFloat(fee) + amount;

    openDialog({
      onClickOk: () => {
        closeDialog();
      },
      showCancelButton: false,
      title: <div>
        <div style={{
          position: 'absolute',
          right: '30px',
          display: 'flex',
        }}>
          { this.tools.getImageComponent("b-e.svg") } 
          { this.tools.getImageComponent("arrowRight.svg") } 
          { this.tools.getImageComponent("b.svg") } 
        </div>
        <div style={{
          textAlign: 'left',
          fontSize: '30px',
        }}>
          Bitcoin Send transaction
          <DateComponent
            date={ date }
            horizontal={ true }
          />
        </div>
      </div>,
      body: <SendSuccessDialog
        { ...this.props }
        balance={ balance }
        blockchainAddress={ blockchainAddress }
        blockchainTxid={ blockchainTxid }
        blockchainFee={ blockchainFee }
        comment={ comment }
        payment={ parseFloat(amount) }
        initialBalance={ initialBalance }
        fee={ fee }
      />,
    });
  }

  showReceiveDialog() {
    const {
      showReceiveFundsDialog,
      tx,
    } = this.props;

    showReceiveFundsDialog(tx);
  }

  render() {
    const {
      id,
      tx,
    } = this.props;

    const isSent = tx.action.startsWith("send ");

    let info, iconClass;
    if (isSent) {
      iconClass = "fa fa-paper-plane fa-stack-1x";
      info = <div style={{
        fontSize: '14px',
        fontFamily: styles.fontFamily,
        color: styles.colors.mainBlue,
        borderTop: `1px solid ${styles.colors.mainTextColor}`,
        paddingTop: '5px',
      }}>
        <BitcoinCurrency
          { ...this.props }
          color={ styles.colors.mainBlue }
          displayStorage={ false }
          removeInitialSpaces={ true }
          tiny={ true }
          small={ true }
          style={{
            display: 'inline-block',
          }}
          labelButtonStyle={{
            color: styles.colors.mainTextColor,
          }}
          value={ parseFloat(tx.action.split(' XBT')[1]) }
        />
      </div>;
    } else {
      iconClass = "fa fa-university fa-stack-1x";
      info = <div style={{
        fontSize: '14px',
        fontFamily: styles.fontFamily,
        color: styles.colors.mainBlue,
        borderTop: `1px solid ${styles.colors.mainTextColor}`,
        paddingTop: '5px',
      }}>
        <BitcoinCurrency
          { ...this.props }
          color={ styles.colors.mainBlue }
          displayStorage={ false }
          removeInitialSpaces={ true }
          tiny={ true }
          small={ true }
          style={{
            display: 'inline-block',
          }}
          labelButtonStyle={{
            color: styles.colors.mainTextColor,
          }}
          value={ parseFloat(tx.issuer.actualValue || 0) }
        />
      </div>;
    }

    return <div
      key={ id }
      onClick={ isSent ? this.showSendDialog : this.showReceiveDialog }
      onMouseOver={ () => this.setState({ hover: true }) }
      onMouseOut={ () => this.setState({ hover: false }) }
      style={{
        display: 'grid',
        gridGap: '5px',
        padding: '10px 0 10px 5px',
        gridTemplateAreas: '"icon info"',
        gridTemplateColumns: '40px calc(100% - 45px)',
        background: this.state.hover ? styles.colors.thirdBlue : 'transparent',
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{
        gridArea: 'icon',
        textAlign: 'center',
      }}>
        <span className="fa-stack">
          <i className="fa fa-circle fa-stack-2x"
          />
          <i
            className={ iconClass }
            style={{
              color: styles.colors.secondaryBlue,
            }}
          />
        </span>
      </div>
      <div style={{
        gridArea: 'info'
      }}>
        <DateComponent
          date={ tx.date }
          horizontal={ true }
        />
        { info }
      </div>
    </div>;
  }
}

export default SendTransaction;
