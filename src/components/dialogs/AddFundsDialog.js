import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import Address from '../Address';
import BitcoinCurrency from '../BitcoinCurrency';
import CoinSelector from '../CoinSelector';
import CurrencyRadioGroup from '../CurrencyRadioGroup';
import InfoBox from '../InfoBox';
import DepositReferenceTable from './addFunds/DepositReferenceTable';
import { AppContext } from "../../AppContext";
import styles from '../../helpers/Styles';


const componentStyles = (theme) => {
  return {
    checkboxRoot: {
      textAlign: 'center',
      width: '100%',
    },
  };
};



class AddFundsDialog extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ready: false,
      depositef: null,
      depositRefStore: null,
      qr: false,
      showHistory: false,
    };

    this.styles = {
      address: {
        gridArea: 'info',
        margin: '20px 0 20px 0',
      },
      amountArea: {
        padding: '20px',
        backgroundColor: '#ffffff99',
        marginTop: '20px',
        borderRadius: '20px',
        justifyContent: 'center',
        boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
      },
      blockchain: {
        textDecoration: 'inherit',
        color: '#966600',
        fontWeight: 'bold',
      },
      checkbox: {
        width: 'initial',
        margin: '20px auto auto auto',
        textAlign: 'center',
      },
      checkboxIcon: {
        fill: "rgba(0, 0, 0, 0.6)",
      },
      checkboxLabel: {
        width: 'initial',
        color: "rgba(0, 0, 0, 0.6)",
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
      text: {
        textAlign: 'center',
        fontSize: '16px',
        color: 'rgba(0, 0, 0, 0.6)',
      },
      wallet: {
        textDecoration: 'inherit',
        color: '#966600',
      },
    };

    if (props.isTab) {
      this.styles.gridQR.textAlign = 'center';
      this.styles.amountArea["backgroundImage"] = "url('css/img/Bitcoin-express-bg2.png')";
      this.styles.amountArea["backgroundRepeat"] = 'no-repeat';
      this.styles.amountArea["backgroundPositionX"] = '-15%';
      this.styles.amountArea["backgroundAttachment"] = 'local';
      this.styles.amountArea["color"] = 'rgba(0, 0, 0, 0.6)';
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
        depositRefStore: this.context.wallet.getDepositRefList(),
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

    this.context.wallet.getDepositRef()
      .then(updateQR);
  }

  removeFromDepositStore(transactionId) {
    const {
      closeDialog,
      isTab,
      loading,
      openDialog,
    } = this.props;

    const {
      snackbarUpdate,
      wallet,
    } = this.context;

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
      buttons,
      closeDialog,
      classes,
      issueCollect,
      isTab,
      openDialog,
      showValuesInCurrency,
      snackbarUpdate,
      updateTargetValue,
    } = this.props;

    const{
      wallet,
    } = this.context;

    const {
      depositRef,
      depositRefStore,
    } = this.state;

    let domain = "";
    if (!isDefaultIssuer) {
      domain = depositRef.headerInfo.domain;
    }

    /*
    { isDefaultIssuer ? null : <p style={ this.styles.note }>
      You have an active deposit reference from another issuer - '{ domain }'
    </p> }
     */

    const createAddressComponent = <div style={ this.styles.amountArea }>
      <div style={ this.styles.text }>
        Please indicate how much you intend to transfer to this Wallet.
        { isTab ? <br /> : <span /> } Or just get an address and decide later.
        <div style={{ padding: "10px 80px" }}>
          <CurrencyRadioGroup
            active={ ["XBT"] }
            currency="XBT"
            onChange={(ev, crypto) => {
              return;
            }}
          />
        </div>
      </div>
      <CoinSelector
        centered={ true }
        fullSize={ false }
        label="Amount to deposit"
        onAmountChange={(targetValue, currency) => {
          updateTargetValue(targetValue);
        }}
      />
      { buttons }
    </div>;

    if (!depositRefStore || depositRefStore.length == 0) {
      return createAddressComponent;
    }

    const {
      showHistory,
    } = this.state;

    const handleCheckShowHistory = (event) => {
      this.setState({
        showHistory: !showHistory,
      });
    };

    return <div style={{ marginTop: '10px' }}>

      { createAddressComponent }

      <FormControlLabel
        className={ classes.checkboxRoot }
        control={
          <Checkbox
            checked={ showHistory }
            onChange={ handleCheckShowHistory }
            value="showHistory"
          />
        }
        label="Show address history"
      />

      <DepositReferenceTable
        closeDialog={ closeDialog }
        removeFromDepositStore={ this.removeFromDepositStore.bind(this) }
        issueCollect={ issueCollect }
        list={ depositRefStore }
        open={ showHistory }
        openDialog={ openDialog }
      />
    </div>;
  }

  render() {
    const {
      isTab,
      qrLabel,
      buttons,
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


    return <div style={ this.styles.amountArea }>
      <div className="addFundsGrid">
        <div style={ this.styles.address }>
          <Address
            expiry={ expiry }
            blockchainAddress={ blockchainAddress }
            idQR="img-download"
          />
        </div>
        <div style={ this.styles.gridQR }>
          <div id={ qrLabel } style={ this.styles.qr } />
          <BitcoinCurrency
            color="rgba(0, 0, 0, 0.87)"
            currency="XBT"
            displayStorage={ false }
            showValuesInCurrency={ showValuesInCurrency }
            style={{ display: 'inline-block' }}
            tiny={ true }
            centered={ !isTab }
            value={ parseFloat(targetValue) }
          />
        </div>
      </div>

      <InfoBox>
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
      { buttons }
    </div>;
  }
}

AddFundsDialog.defaultProps = {
  isTab: false,
  qrLabel: "QR",
  centered: false,
  buttons: null,
};

AddFundsDialog.contextType = AppContext;

export default withStyles(componentStyles)(AddFundsDialog);

