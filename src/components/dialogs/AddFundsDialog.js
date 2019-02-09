import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import Address from '../Address';
import { AppContext } from "../../AppContext";
import BitcoinCurrency from '../BitcoinCurrency';
import CoinSelector from '../CoinSelector';
import CurrencyRadioGroup from '../CurrencyRadioGroup';
import DepositReferenceTable from './addFunds/DepositReferenceTable';
import InfoBox from '../InfoBox';
import QRCode from '../QRCode';
import styles from '../../helpers/Styles';


const componentStyles = (theme) => {
  const rootInitial = {
    backgroundColor: '#ffffff99',
    borderRadius: '20px',
    color: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      backgroundImage: 'none',
      boxShadow: 'none',
      margin: '20px 0 0',
    },
    [theme.breakpoints.up('sm')]: {
      backgroundImage: "url('css/img/Bitcoin-express-bg2.png')",
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: '-15%',
      backgroundAttachment: 'local',
      boxShadow: `rgba(0, 0, 0, 0.12) 0px 1px 6px,
        rgba(0, 0, 0, 0.12) 0px 1px 4px`,
      margin: '20px 2vw 0',
    },
    padding: '20px',
  };

  return {
    address: {
      wordBreak: 'break-word',
    },
    alertRoot: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      overflow: 'hidden',
      position: 'absolute',
      zIndex: '100',
      overflowY: 'hidden',
      height: '-webkit-fill-available',
      height: '-moz-available',
      height: 'fill-available',
      height: '100%',
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
    checkboxRoot: {
      textAlign: 'center',
      width: '100%',
    },
    initialText: {
      textAlign: 'center',
      fontSize: '16px',
      color: 'rgba(0, 0, 0, 0.6)',
    },
    note: {
      color: '#b96f13',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    root: {
      marginTop: '1em',
    },
    rootInitial,
    rootInitialTab: Object.assign({
      [theme.breakpoints.down('xs')]: {
      },
      [theme.breakpoints.up('sm')]: {
      },
    }, rootInitial),
    rootInitialTabMin: Object.assign({}, rootInitial, {
      borderRadius: '0',
      margin: '0',
    }),
    wallet: {
      textDecoration: 'inherit',
      color: '#966600',
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
      showAlert: true,
      showHistory: false,
    };

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

    this.context.wallet.getDepositRef()
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

    const createAddressComponent = <div className={ isTab ? classes.rootInitialTab : classes.rootInitial }>

      <div className={ classes.initialText }>
        Please indicate how much you intend to transfer to this Wallet.
        { isTab ? <br /> : <span /> } Or just get an address and decide later.

        <CurrencyRadioGroup
          active={ ["XBT"] }
          currency="XBT"
          onChange={(ev, crypto) => {
            return;
          }}
        />
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
      buttons,
      classes,
      isTab,
    } = this.props;

    const {
      showAlert,
      depositRef,
      ready,
    } = this.state;

    if (!ready) {
      return <div className={ classes.circularProgress }>
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


    return <React.Fragment>

      { showAlert ? <div className={ classes.alertRoot }>
        <InfoBox>
          <React.Fragment>
            Send only bitcoin (BTC) to <i className={ classes.address }>
              { blockchainAddress }
            </i><br/>
            Sending bitcoin cash (BCH) to this address will result in
            the permanent loss of your deposit.
          </React.Fragment>
        </InfoBox>

        <div style={{ textAlign: 'center', width: '100%' }}>
          <Button
            color="secondary"
            component="span"
            onClick={ () => this.setState({ showAlert: false }) }
            variant="contained"
          >
            Close
          </Button>
        </div>
      </div> : null }

      <Grid container spacing={16} className={ classes.root }>
        <Grid item xs={12} style={{ textAlign: 'center' }}>

          <QRCode depositRef={ depositRef } />

          <BitcoinCurrency
            color="rgba(0, 0, 0, 0.87)"
            currency="XBT"
            displayStorage={ false }
            showValuesInCurrency={ showValuesInCurrency }
            style={{ display: 'inline-block' }}
            small={ true }
            centered={ !isTab }
            value={ parseFloat(targetValue) }
          />

          <p style={{ textAlign: 'center' }}>
            <a
              href={ `https://blockchain.info/address/${blockchainAddress}` }
              target="_blank"
              className={ classes.blockchain }
              title="Blockchain.info"
            >
              Track progress
            </a> | <a
              href={ uri }
              className={ classes.wallet }
              title={ uri }
            >
              Start Bitcoin wallet
            </a>
          </p>
        </Grid>

        <Grid item xs={12}>
          <Address
            expiry={ expiry }
            blockchainAddress={ blockchainAddress }
          />
        </Grid>

        <Grid item xs={12}>
          { buttons }
        </Grid>
      </Grid>
    </React.Fragment>;
  }
}

AddFundsDialog.defaultProps = {
  isTab: false,
  centered: false,
  buttons: null,
};

AddFundsDialog.contextType = AppContext;


export default withStyles(componentStyles)(AddFundsDialog);

