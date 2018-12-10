import React from 'react';

import CircularProgress from 'material-ui/CircularProgress';

import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Address from '../Address';
import BitcoinCurrency from '../BitcoinCurrency';
import CoinSelector from '../CoinSelector';
import DateComponent from '../DateComponent';
import InfoBox from '../InfoBox';

import styles from '../../helpers/Styles';

class AddFundsDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      depositRef: null,
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

  renderCreateAddress(isDefaultIssuer = true) {
    const {
      isTab,
      updateTargetValue,
      isFlipped,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const {
      depositRef,
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

    let list = wallet.getDepositRefList();
    console.log(list);

    if (list.length == 0) {
      return createAddressComponent;
    }

    const rowStyle = {
      padding: "5px",
      borderRadius: "6px",
      marginBottom: "10px",
    };

    list = list.map((ref, index) => {
      let totalAmount = 0.0;
      let totalCoins = 0;
      if (ref.coin) {
        totalCoins = ref.coin.length;
        ref.coin.forEach((c) => {
          totalAmount += parseFloat(wallet.Coin(c).v);
        });
      }

      return <TableRow key={ index } style={ rowStyle }>
        <TableRowColumn
          style={{
            padding: "0",
            width: "60px"
          }}
        >
          <DateComponent
            date={ ref.headerInfo.expiry }
            dayLabelStyle={{
              color: 'black',
            }}
            monthLabelStyle={{
              color: 'black',
              fontWeight: 'normal',
            }}
            timeLabelStyle={{
              color: 'black',
              fontWeight: 'normal',
            }}
          />
        </TableRowColumn>
        <TableRowColumn
          style={{
            verticalAlign: "middle",
            fontWeight: "bold",
            width: "100px",
          }}
        >
          { ref.headerInfo.domain }
        </TableRowColumn>
        <TableRowColumn
          style={{
            verticalAlign: "middle",
            width: "100px",
          }}
        >
          { totalCoins } coins collected
        </TableRowColumn>
        <TableRowColumn
          style={{
            verticalAlign: "middle",
          }}
        >
          <BitcoinCurrency
            displayStorage={ false }
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
      </TableRow>;
    });

    return <div style={{ marginTop: '10px' }}>
      <Tabs>
        <TabList>
          <Tab>Create an address</Tab>
          <Tab>Address list</Tab>
        </TabList>
        <TabPanel>
          { createAddressComponent }
        </TabPanel>
        <TabPanel>
          <Table
            selectable={ false }
            style={{
              backgroundColor: "transparent",
              marginTop: '0',
            }}
          >
            <TableBody
              displayRowCheckbox={ false }
            >
            { list }
            </TableBody>
          </Table>
        </TabPanel>
      </Tabs>
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
