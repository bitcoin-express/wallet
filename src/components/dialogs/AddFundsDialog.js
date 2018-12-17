import React from 'react';

import CircularProgress from 'material-ui/CircularProgress';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import Address from '../Address';
import BitcoinCurrency from '../BitcoinCurrency';
import CoinSelector from '../CoinSelector';
import DateComponent from '../DateComponent';
import InfoBox from '../InfoBox';

import styles from '../../helpers/Styles';

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

      <TableRowColumn style={ this.styles.dateCol }>
        <DateComponent
          date={ reference.headerInfo.expiry }
          dayLabelStyle={ this.styles.dateComponent.day }
          monthLabelStyle={ this.styles.dateComponent.month }
          timeLabelStyle={ this.styles.dateComponent.time }
        />
      </TableRowColumn>

      <TableRowColumn style={ this.styles.domainCol }>
        { reference.headerInfo.domain }
      </TableRowColumn>

      <TableRowColumn style={ this.styles.coinsCol }>
        { totalCoins }
      </TableRowColumn>

      <TableRowColumn style={ this.styles.amountCol }>
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
      </TableRowColumn>

      <TableRowColumn style={ this.styles.iconsCol }>
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
      </TableRowColumn>

    </TableRow>;
  }

}

class AddFundsDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      depositef: null,
      depositRefStore: props.wallet.getDepositRefList(),
      qr: false,
    };

    this.styles = {
      address: {
        gridArea: 'info',
        margin: '20px 0 20px 0',
      },
      blockchain: {
        textDecoration: 'inherit',
        color: '#966600',
        fontWeight: 'bold',
      },
      circularProgress: {
        textAlign: 'center',
        margin: '10px',
      },
      note: {
        color: '#b96f13',
        textAlign: 'center',
        fontWeight: 'bold',
      },
      gridQR: {
        gridArea: 'qr',
        margin: '20px 0 20px 0',
      },
      qr: {},
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
      wallet: {
        textDecoration: 'inherit',
        color: '#966600',
      },
    };

    if (props.isTab) {
      this.styles.gridQR.textAlign = 'center';
      return;
    }

    this.styles.qr = {
      gridArea: 'qr',
      marginLeft: 'calc(50% - 50px)',
    };

    this._updateQR = this._updateQR.bind(this);
    this.renderCreateAddress = this.renderCreateAddress.bind(this);
    this.removeFromDepositStore = this.removeFromDepositStore.bind(this);
  }

  componentWillMount() {
    const updateStateWithDeposit = (depositRef) => {
      this.setState({
        depositRef,
        ready: true,
      });
    };

    this.props.wallet.getDepositRef()
      .then(updateStateWithDeposit);
  }

  componentWillReceiveProps(nextProps) {
    const {
      depositRef,
    } = nextProps;

    if (this.props.depositRef == depositRef) {
      return;
    }

    this.setState({
      depositRef,
    });
    this._updateQR();

    if (!depositRef) {
      this.setState({
        qr: false,
      });
    }
  }

  componentDidMount() {
    this._updateQR();
  }

  _updateQR() {

    const {
      qrLabel,
    } = this.props;

    const updateQR = (depositRef) => {
      if (!depositRef || !depositRef.issueInfo || !depositRef.isDefaultIssuer) {
        return;
      }

      const {
        blockchainAddress,
        targetValue,
      } = depositRef.issueInfo;

      const optionsQR = {
        text: `bitcoin:${blockchainAddress}${targetValue > 0 ?
          `?amount=${targetValue}`: ""}`,
        ecLevel: 'M',
        size: 100,
        background: '#000',
        fill: '#fff',
      };

      window.$(`#${qrLabel}`).empty();
      window.$(`#${qrLabel}`).qrcode(optionsQR);

      setTimeout(() => {
        if (this.state.qr) {
          return;
        }

        let canvas = $(`#${qrLabel} canvas`)[0];
        let ctx = canvas.getContext('2d');

        $('#img-download').attr({
          href: canvas.toDataURL(),
          download: 'qrCode',
          target: '_blank'
        });

        this.setState({
          qr: true,
        });
      }, 2000);
    };

    this.props.wallet.getDepositRef()
      .then(updateQR);
  }

  removeFromDepositStore(transactionId) {
    const {
      closeDialog,
      isTab,
      loading,
      openDialog,
      snackbarUpdate,
      wallet,
    } = this.props;

    //snackbarUpdate("Can not delete yet the deposit reference");
    const updateWalletStatus = (depositRefStore) => {
      if (!isTab) {
        setTimeout(() => {
          loading(false);
          snackbarUpdate("Deleted deposit reference.");
          openDialog();
        }, 1000);
        return;
      }
      loading(false);
      snackbarUpdate("Deleted deposit reference.");
      this.setState({
        depositRefStore,
      });
    };

    if (!isTab) {
      closeDialog();
    }
    loading(true);
    wallet.removeFromDepositStore(transactionId)
      .then(updateWalletStatus);
  }

  renderCreateAddress(isDefaultIssuer = true) {
    const {
      closeDialog,
      isFlipped,
      issueCollect,
      isTab,
      openDialog,
      showValuesInCurrency,
      snackbarUpdate,
      updateTargetValue,
      wallet,
      xr,
    } = this.props;

    const {
      depositRef,
      depositRefStore,
    } = this.state;

    let domain = "";
    if (!isDefaultIssuer) {
      domain = depositRef.headerInfo.domain;
    }

    const stTab = {
      textAlign: "center",
      fontWeight: "bold",
    };

    /*
    { isDefaultIssuer ? null : <p style={ this.styles.note }>
      You have an active deposit reference from another issuer - '{ domain }'
    </p> }
     */

    const createAddressComponent = <div>
      <p style={ isTab ? stTab : {} }>
        Please indicate how much you intend to transfer to this Wallet.
        { isTab ? <br /> : null }
        Or just get an address and decide later.
      </p>
      <CoinSelector
        centered={ true }
        fullSize={ false }
        label="Amount to deposit"
        xr={ xr }
        onAmountChange={(targetValue, currency) => {
          updateTargetValue(targetValue);
        }}
      />
    </div>;

    let list = depositRefStore;
    console.log(list);

    if (!list || list.length == 0) {
      return createAddressComponent;
    }

    list = list.map((ref, index) => {
      return <DepositReferenceRow
        closeDialog={ closeDialog }
        key={ index }
        reference={ ref }
        removeFromDepositStore={ this.removeFromDepositStore.bind(this) }
        isFlipped={ isFlipped }
        issueCollect={ issueCollect }
        openDialog={ openDialog }
        showValuesInCurrency={ showValuesInCurrency }
        snackbarUpdate={ snackbarUpdate }
        wallet={ wallet }
        xr={ xr }
      />;
    });

    return <div style={{ marginTop: '10px' }}>
      { createAddressComponent }
      <section style={{
        background: "#ffffff90",
        padding: "5px 10px",
        borderRadius: "10px",
        marginTop: "30px",
      }}>
        <Table
          selectable={ false }
          style={{
            backgroundColor: "transparent",
            marginTop: '0',
          }}
        >
          <TableHeader
            className="hide-device"
            displaySelectAll={ false }
            adjustForCheckbox={ false }
          >
            <TableRow>
              <TableHeaderColumn
                style={ this.styles.tableHeaderCol.date }
              >
                EXPIRY
              </TableHeaderColumn>
              <TableHeaderColumn
                style={ this.styles.tableHeaderCol.domain }
              >
                ISSUER
              </TableHeaderColumn>
              <TableHeaderColumn
                style={ this.styles.tableHeaderCol.coins }
              >
                COINS COLLECTED
              </TableHeaderColumn>
              <TableHeaderColumn
                style={ this.styles.tableHeaderCol.amount }
              >
                AMOUNT
              </TableHeaderColumn>
              <TableHeaderColumn
                style={ this.styles.tableHeaderCol.icons }
              />
            </TableRow>
          </TableHeader>
          <TableBody
            displayRowCheckbox={ false }
          >
          { list }
          </TableBody>
        </Table>
      </section>
    </div>;
  }

  render() {
    const {
      isTab,
      qrLabel,
      wallet,
      xr,
    } = this.props;

    const {
      depositRef,
      ready,
    } = this.state;

    if (!ready) {
      return <div style={ this.styles.circularProgress }>
        <CircularProgress
          size={ 150 }
          thickness={ 5 }
        />
      </div>;
    }

    if (!depositRef) {
      return this.renderCreateAddress();
    }

    const {
      isDefaultIssuer,
      issueInfo,
      headerInfo
    } = depositRef;

    if (!issueInfo || !headerInfo || !isDefaultIssuer) {
      return this.renderCreateAddress(isDefaultIssuer);
    }

    const {
      isFlipped,
      snackbarUpdate,
      showValuesInCurrency,
    } = this.props;

    const {
      blockchainAddress,
      targetValue,
    } = issueInfo;

    const uri = `bitcoin:${blockchainAddress}${targetValue > 0 ?
      `?amount=${targetValue}`: ""}`; 
    const expiry = headerInfo.expiry;
    const confirmations = issueInfo.confirmations;

    let infoBoxProps = {};
    if (isTab) {
      infoBoxProps = {
        backgroundColor: styles.colors.secondaryBlue,
        border: false,
        iconColor: styles.colors.mainTextColor,
      };
    }

    return <div>
      <div className="addFundsGrid">
        <div style={ this.styles.address }>
          <Address
            expiry={ expiry }
            blockchainAddress={ blockchainAddress }
            idQR="img-download"
            snackbarUpdate={ snackbarUpdate }
            wallet={ wallet }
          />
        </div>
        <div style={ this.styles.gridQR }>
          <div id={ qrLabel } style={ this.styles.qr } />
          <BitcoinCurrency
            color="rgba(0, 0, 0, 0.87)"
            currency="XBT"
            displayStorage={ false }
            isFlipped={ isFlipped }
            showValuesInCurrency={ showValuesInCurrency }
            style={{ display: 'inline-block' }}
            tiny={ true }
            centered={ !isTab }
            value={ parseFloat(targetValue) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
      </div>

      <InfoBox { ...infoBoxProps }>
        <div>
          Send only bitcoin (BTC) to <i>{ blockchainAddress }</i><br/>
          Sending bitcoin cash (BCH) to this address will result in
          the permanent loss of your deposit.
        </div>
      </InfoBox>

      <p style={{ textAlign: 'center' }}>
        <a
          href={ `https://blockchain.info/address/${blockchainAddress}` }
          target="_blank"
          style={ this.styles.blockchain }
          title="Blockchain.info"
        >
          Track progress
        </a> | <a
          href={ uri }
          style={ this.styles.wallet }
          title={ uri }
        >
          Start Bitcoin wallet
        </a>
      </p>
    </div>;
  }
}

AddFundsDialog.defaultProps = {
  isTab: false,
  qrLabel: "QR",
  centered: false,
};

export default AddFundsDialog;
