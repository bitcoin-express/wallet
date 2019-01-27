import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import Dropzone from 'react-dropzone';

import { AppContext } from "../../../AppContext";
import ExchangeInfo from '../exchange/ExchangeInfo';
import FormArea from '../../FormArea';
import HelpTooltip from '../../HelpTooltip';
import PassphraseDialog from '../../dialogs/PassphraseDialog';
import styles from '../../../helpers/Styles';
import SwapDialog from '../../dialogs/SwapDialog';
import Time from '../../../helpers/Time';
import Title from '../../Title';


const componentStyles = (theme) => {
  return {
    dropzone: {
      flexGrow: 1,
      padding: '10px',
      borderWidth: '1px',
      borderColor: 'rgb(102, 102, 102, 0.5)',
      borderStyle: 'dashed',
      borderRadius: '5px',
      cursor: 'pointer',
      color: styles.colors.mainTextColor,
      fontFamily: styles.fontFamily,
      fontSize: '12px',
      display: 'grid',
      gridTemplateAreas: "'icon text'",
      gridTemplateColumns: '50px calc(100% - 60px)',
      gridGap: '10px',
      alignItems: 'center',
    },
    dropzoneIcon: {
      gridArea: 'icon',
    },
    dropzoneInfo: {
      textAlign: 'center',
      wordWrap: 'break-word',
      gridArea: 'text',
    },
    label: {
      display: 'contents',
    },
  };
};


class ImportFile extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      forceBackupVerify: false,
      forceExportVerify: true,
      hasError: false,
      passphrase: null,
      passphraseDialogOpened: false,
    };

    this.styles = {
      dropzone: {
        flexGrow: 1,
        width: '50%',

        padding: '10px',
        borderWidth: '1px',
        borderColor: 'rgb(102, 102, 102, 0.5)',
        borderStyle: 'dashed',
        borderRadius: '5px',
        cursor: 'pointer',
        color: styles.colors.mainTextColor,
        fontFamily: styles.fontFamily,
        fontSize: '12px',

        display: 'grid',
        gridTemplateAreas: "'icon text'",
        gridTemplateColumns: '50px calc(100% - 60px)',
        gridGap: '10px',
        alignItems: 'center',
      },
      dropzoneIcon: {
        gridArea: 'icon',
      },
      dropzoneInfo: {
        textAlign: 'center',
        wordWrap: 'break-word',
        gridArea: 'text',
      },
    };

    this.time = new Time();

    this.handleOnDrop = this.handleOnDrop.bind(this);
    this.handleConfirmPassphrase = this.handleConfirmPassphrase.bind(this);
    this.handleClosePassphrase = this.handleClosePassphrase.bind(this);

    this.getPassphrase = this.getPassphrase.bind(this);
    this._agreeExchangeRequest = this._agreeExchangeRequest.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet && wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate(info.componentStack, "error");
  }

  getPassphrase() {
    this.setState({
      passphraseDialogOpened: true
    });

    return new Promise((resolve, reject) => {
      $("#passphrase-ok").click((ev) => {
        resolve(this.state.passphrase);
      });        

      $("#passphrase-cancel").click(function(ev) {
        reject(Error("Cancelled"));
      });
    });
  }

  handleConfirmPassphrase(passphrase) {
    this.setState({
      passphraseDialogOpened: false,
      passphrase
    });
  }

  handleClosePassphrase() {
    this.setState({
      passphraseDialogOpened: false
    });
  }

  handleOnDrop(accepted, rejected) {
    /**
     * accepted: files accepted by the Dropzone component
     * rejected: files rejected by the Dropzone component
     **/
    const {
      importFile,
      loading,
      openDialog,
      snackbarUpdate,
      wallet,
    } = this.props;

    const {
      forceBackupVerify,
      forceExportVerify,
    } = this.state;

    let args = {
      getPassPhrase: this.getPassphrase,
      forceVerify: {
        backup: forceBackupVerify,
        export: forceExportVerify,
        coin: forceExportVerify,
      },
      notify: true, // show dialog window
      verifyAlienCoins: false,
    };


    const handleResponse = (result) => {
      loading(false);
      if (typeof result != 'object' || !result.swapCode) {
        return;
      }

      const {
        isFlipped,
        isFullScreen,
        snackbarUpdate,
        showValuesInCurrency,
        xr,
        wallet,
      } = this.props;

      const {
        debug,
        COIN_RECOVERY,
        COIN_STORE,
        ISSUE_POLICY,
        SETTINGS,
        storage,
        VERIFY_EXPIRE,
      } = wallet.config;

      const {
        expiry,
        issuerService,
      } = result;

      let now = new Date().getTime();
      if (now > new Date(expiry).getTime()) {
        loading(false);
        snackbarUpdate("Atomic swap file already expired");
        return;
      }

      const expiryPeriod_ms = wallet.getExpiryPeriod(VERIFY_EXPIRE);
      const issuePolicy = wallet.getSettingsVariable(ISSUE_POLICY);
      const coinList = wallet.getStoredCoins(false, result.source.c);

      const sourceValue = parseFloat(result.source.v);
      let fee = wallet.getVerificationFee(sourceValue, issuerService, true);
      const totalSource = parseFloat((sourceValue + fee).toFixed(8));

      const coinSelection = wallet._coinSelection(totalSource, coinList, {
        singleCoin: true,
        issuerService,
        outCoinCount: wallet.getOutCoinCount(),
        expiryPeriod_ms,
      });

      let toRemove = coinSelection.toVerify;
      if (toRemove == null || toRemove.length == 0) {
        toRemove = coinSelection.selection;
      }

      if (toRemove == null || toRemove.length == 0) {
        loading(false);
        snackbarUpdate("Not enough funds for this swap request");
        return;
      }
      toRemove = toRemove.map(c => c.base64 || c);

      openDialog({
        showCancelButton: true,
        onClickOk: () => {
          this._agreeExchangeRequest(result, toRemove, fee);
        },
        okLabel: "Agree",
        title: "Exchange request",
        body: <SwapDialog
          sourceCurrency={ result.source.c }
          targetCurrency={ result.target.c }
          source={ parseFloat(result.source.v) }
          issuerService={ result.issuerService }
          expiry={ expiry }
          target={ parseFloat(result.target.v) }
          isFlipped={ isFlipped }
          isFullScreen={ isFullScreen }
          recalculateFee={(emailVf) => {
            fee = wallet.getVerificationFee(sourceValue, issuerService, emailVf);
          }}
          showValuesInCurrency={ showValuesInCurrency }
          xr={ xr }
          wallet={ wallet }
        />,
      });
    };

    const handleError = (err) => {
      loading(false);
      return Promise.reject(err);
    };

    loading(true);
    importFile(accepted, args)
      .then(handleResponse)
      .catch(handleError);
  }

  _agreeExchangeRequest(result, toRemove, fee) {
    const {
      closeDialog,
      isFlipped,
      isFullScreen,
      loading,
      openDialog,
      refreshCoinBalance,
      showValuesInCurrency,
      snackbarUpdate,
      xr,
      wallet,
    } = this.props;

    loading(true);
    closeDialog();

    const {
      currencies,
    } = wallet.config;

    let source = parseFloat(result.source.v);
    let target = parseFloat(result.target.v);

    wallet.importSwapCode(result, toRemove, fee).then((resp) => {
      loading(false);
      openDialog({
        showCancelButton: false,
        title: "Atomic swap Confirmed",
        body: <ExchangeInfo
          currSource={ currencies[result.source.c] }
          currTarget={ currencies[result.target.c] }
          source={ parseFloat(source + fee).toFixed(8) }
          target={ parseFloat(target).toFixed(8) }
          background="transparent"

          isFlipped={ isFlipped }
          isFullScreen={ isFullScreen }
          showValuesInCurrency={ showValuesInCurrency }
          wallet={ wallet }
          xr={ xr }
        />,
      });
      return Promise.all([
        refreshCoinBalance(result.source.c),
        refreshCoinBalance(result.target.c)
      ]);
    }).catch((err) => {
      let msg = err.message || "Can't import swap code file";
      loading(false);
      snackbarUpdate(msg, true);
    });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      classes,
    } = this.props;

    const {
      passphraseDialogOpened,
      forceBackupVerify,
      forceExportVerify,
    } = this.state;

    const {
      isFullScreen,
      wallet,
    } = this.context;

    const {
      DEFAULT_ISSUER,
    } = wallet.config;

    return <React.Fragment>

      <Title
        isFullScreen={ isFullScreen }
        label="Import File"
      />
      
      <Grid container>
        <Grid item md={6} sm={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={ forceBackupVerify }
                onChange={ (event) => this.setState({ forceBackupVerify: event.target.selected }) }
              />
            }
            label={ <span>
              Verify file backup coins <HelpTooltip
                iconStyle={{
                  verticalAlign: 'baseline',
                  color: styles.colors.mainTextColor,
                }}
                note="If this is your own backup file then it should be safe to import coins directly without verification. If you have any doubt, verification is advised (for a small fee)."
              />
            </span> }
          />

          <FormControlLabel
            classes={{
              label: classes.label,
            }}
            control={
              <Checkbox
                checked={ forceExportVerify }
                onChange={ (event) => this.setState({ forceExportVerify: event.target.selected }) }
              />
            }
            label={ <span>
              Verify file coins <b>(recommended)</b> <HelpTooltip
                iconStyle={{
                  verticalAlign: 'baseline',
                  color: styles.colors.mainTextColor,
                }}
                note="Unless you completely trust the originator of this file, you are advised always to verify the coins."
              />
            </span> }
          />
        </Grid>

        <Grid item md={6} sm={12}>
          <Dropzone
            className={ classes.dropzone }
            onDrop={ this.handleOnDrop }
            activeStyle={{
              color: styles.colors.mainRed,
            }}
          >
            <i className={ "fa fa-cloud-upload fa-4x " + classes.dropzoneIcon } />
            <div className={ classes.dropzoneInfo }>
              <p>Try dropping your backup file here or click to select the file to import.</p>
              <p>Only <i>JSON</i> files will be accepted</p>
            </div>
          </Dropzone>
        </Grid>
      </Grid>

      <PassphraseDialog
        opened={ passphraseDialogOpened }
        handleConfirm={ this.handleConfirmPassphrase }
        handleClose={ this.handleClosePassphrase }
      />
    </React.Fragment>;
  }
}

ImportFile.contextType = AppContext;

export default withStyles(componentStyles)(ImportFile);

