import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import BitcoinCurrency from '../../BitcoinCurrency';
import DateComponent from '../../DateComponent';

import styles from '../../../helpers/Styles';


const componentStyles = (theme) => {
  return {
    rootTitle: {
    },
  };
};


class DepositReferenceRow extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      row: {
        padding: "5px",
        borderRadius: "6px",
        marginBottom: "10px",
        color: styles.colors.darkBlue,
      },
      dateCol: {
        padding: "0",
        width: "60px",
        textAlign: 'center',
      },
      domainCol: {
        verticalAlign: "middle",
        fontWeight: "bold",
        width: "140px",
        color: "green",
        textAlign: 'center',
        padding: "0",
      },
      coinsCol: {
        verticalAlign: "middle",
        width: "140px",
        padding: "0",
        fontSize: '24px',
        textAlign: 'center',
        color: "black",
      },
      amountCol: {
        verticalAlign: "middle",
        width: "230px",
        padding: "0",
      },
      iconsCol: {
        verticalAlign: "middle",
        cursor: "pointer",
        width: "60px",
        textAlign: "left",
        padding: "0",
      },
      dateComponent: {
        day: {
          color: 'black',
        },
        month: {
          color: 'black',
          fontWeight: 'normal',
        },
        time: {
          color: 'black',
          fontWeight: 'normal',
        },
      },
      icons: {
        remove: {
          marginRight: "20px",
          fontSize: "23px",
          color: "#f7941a",
        },
        resend: {
          fontSize: "20px",
          color: "green",
        },
        locked: {
          fontSize: "20px",
          color: "grey",
          cursor: "pointer",
        },
      },
    };

    let totalAmount = 0.0;
    let totalCoins = 0;
    if (props.reference.coin) {
      totalCoins = props.reference.coin.length;
      props.reference.coin.forEach((c) => {
        totalAmount += parseFloat(props.wallet.Coin(c).v);
      });
    }

    this.state = {
      totalAmount,
      totalCoins,
    };

    this.removeDeposit = this.removeDeposit.bind(this);
    this.retrieveAddress = this.retrieveAddress.bind(this);
  }

  removeDeposit() {
    const {
      removeFromDepositStore,
      reference,
    } = this.props;

    removeFromDepositStore(reference.headerInfo.tid)
  }

  retrieveAddress() {
    const {
      closeDialog,
      issueCollect,
      openDialog,
      reference,
    } = this.props;

    closeDialog();
    issueCollect(null, null, reference)
      .then(() => openDialog());
  }

  render() {
    const {
      reference,
      isFlipped,
      showValuesInCurrency,
      snackbarUpdate,
      wallet,
      xr,
    } = this.props;

    const {
      totalAmount,
      totalCoins,
    } = this.state;

    return <TableRow style={ this.styles.row }>

      <TableCell style={ this.styles.dateCol }>
        <DateComponent
          date={ reference.headerInfo.expiry }
          dayLabelStyle={ this.styles.dateComponent.day }
          monthLabelStyle={ this.styles.dateComponent.month }
          timeLabelStyle={ this.styles.dateComponent.time }
        />
      </TableCell>

      <TableCell style={ this.styles.domainCol }>
        { reference.headerInfo.domain }
      </TableCell>

      <TableCell style={ this.styles.coinsCol }>
        { totalCoins }
      </TableCell>

      <TableCell style={ this.styles.amountCol }>
        <BitcoinCurrency
          displayStorage={ false }
          centered={ true }
          color="black"
          removeInitialSpaces={ true }
          buttonStyle={{
            background: "black",
          }}
          isFlipped={ isFlipped }
          showValuesInCurrency={ showValuesInCurrency }
          tiny={ true }
          value={ totalAmount }
          wallet={ wallet }
          xr={ xr }
        />
      </TableCell>

      <TableCell style={ this.styles.iconsCol }>
        <i
          className="fa fa-trash"
          style={ this.styles.icons.remove }
          onClick={ this.removeDeposit }
        ></i>
        { totalCoins == 0 ? <i
            className="fa fa-get-pocket"
            style={ this.styles.icons.resend }
            onClick={ this.retrieveAddress }
          ></i>: <i
            className="fa fa-lock"
            style={ this.styles.icons.locked }
          ></i> }
      </TableCell>

    </TableRow>;
  }

}

class DepositReferenceTable extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      section: {
        background: "#ffffff90",
        padding: "5px 10px",
        borderRadius: "10px",
        marginTop: "30px",
        boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
      },
      table: {
        backgroundColor: "transparent",
        marginTop: '0',
      },
      tableHeaderCol: {
        date: {
          width: "60px",
          fontSize: '10px',
          textAlign: 'center',
          color: styles.colors.darkBlue,
          padding: "0",
        },
        domain: {
          width: "140px",
          fontSize: '10px',
          textAlign: 'center',
          color: styles.colors.darkBlue,
          padding: "0",
        },
        coins: {
          width: "140px",
          fontSize: '10px',
          textAlign: 'center',
          color: styles.colors.darkBlue,
          padding: "0",
        },
        amount: {
          width: "230px",
          fontSize: '10px',
          textAlign: 'center',
          color: styles.colors.darkBlue,
          padding: "0",
        },
        icons: {
          width: "60px",
          padding: "0",
        },
      },
    };
  }

  render() {
    let {
      list,
      open,
    } = this.props;

    if (!open) {
      return null;
    }

    list = list.map((ref, index) => {
      return <DepositReferenceRow
        key={ index }
        reference={ ref }
        { ...this.props }
      />;
    });

    return <section style={ this.styles.section }>
      <Table
        selectable={ false }
        style={ this.styles.table }
      >
        <TableHead
          className="hide-device"
          displaySelectAll={ false }
          adjustForCheckbox={ false }
        >
          <TableRow>
            <TableCell
              style={ this.styles.tableHeaderCol.date }
            >
              EXPIRY
            </TableCell>
            <TableCell
              style={ this.styles.tableHeaderCol.domain }
            >
              ISSUER
            </TableCell>
            <TableCell
              style={ this.styles.tableHeaderCol.coins }
            >
              COINS COLLECTED
            </TableCell>
            <TableCell
              style={ this.styles.tableHeaderCol.amount }
            >
              AMOUNT
            </TableCell>
            <TableCell
              style={ this.styles.tableHeaderCol.icons }
            />
          </TableRow>
        </TableHead>
        <TableBody
          displayRowCheckbox={ false }
        >
        { list }
        </TableBody>
      </Table>
    </section>;
  }
}

export default withStyles(componentStyles)(DepositReferenceTable);

