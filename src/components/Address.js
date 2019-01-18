import React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../AppContext";
import HelpTooltip from './HelpTooltip';
import Time from '../helpers/Time';


const componentStyles = (theme) => {
  return {
    address: {
      textAlign: 'center',
    },
    button: {
      border: '1px',
      borderColor: '#444444',
      borderStyle: 'solid',
      marginLeft: '15px',
      height: 'inherit',
      lineHeight: 'inherit',
      margin: '5px 2px',
      backgroundColor: '#ffffff',
    },
    buttons: {
      textAlign: 'center',
      margin: '5px 0 15px 0',
    },
    chip: {
      marginBottom: '5px',
    },
    chipLabel: {
      webkitTouchCallout: 'all', /* iOS Safari */
      WebkitUserSelect: 'all', /* Safari */
      KhtmlUserSelect: 'all', /* Konqueror HTML */
      MozUserSelect: 'all', /* Firefox */
      MsUserSelect: 'all', /* Internet Explorer/Edge */
      userSelect: 'all', /* Chrome and Opera */
    },
    labelStyle: {
      textTransform: 'inherit',
    },
    textarea: {
      backgroundColor: 'transparent',
      width: '300px',
      border: 'none',
      color: '#ffffff',
      height: '15px',
      marginTop: '5px',
    },
  };
};


class Address extends React.Component {

  constructor(props) {
    super(props);

    this.time = new Time();

    this.handleCopyURI = this.handleCopyURI.bind(this);
    this.handleCopyAddress = this.handleCopyAddress.bind(this);
    this.handleSaveImage = this.handleSaveImage.bind(this);

    this._copyAddress = this._copyAddress.bind(this);
  }

  handleCopyURI() {

    const copyAddress = (depositRef) => {
      if (depositRef && depositRef.issueInfo) {
        const {
          issueInfo,
        } = depositRef;
        const ending = issueInfo.targetValue > 0 ? `?amount=${issueInfo.targetValue}`: "";
        this._copyAddress("bitcoin:", ending, "URI");
      }
    };

    this.context.wallet.getDepositRef()
      .then(copyAddress);
  }

  handleCopyAddress() {
    this._copyAddress();
  }

  selectText(node) {
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
  } 

  _copyAddress(start = "", end = "", type = "Address") {
    const {
      snackbarUpdate,
    } = this.context;

    //let copyTextarea = document.querySelector('.js-copytextarea');
    let copyTextarea = document.querySelector("span[class^='MuiChip-label']");
    const originalValue = copyTextarea.innerText;
    copyTextarea.innerText = start + copyTextarea.innerText + end;
    this.selectText(copyTextarea);

    try {
      let successful = document.execCommand('copy');
      copyTextarea.innerText = originalValue;
      copyTextarea.blur();
      if (!successful) {
        throw new Error('not sucess in copying');
      } else {
        snackbarUpdate(`${type} copied to clipboard`);
      }
    } catch (err) {
      copyTextarea.innerText = originalValue;
      copyTextarea.blur();
      snackbarUpdate(`Problem on copy ${type} to clipboard`, true);
    }
  }

  handleSaveImage() {
    $(`#${this.props.idQR}`)[0].click();
  }

  render () {

    const {
      blockchainAddress,
      classes,
      expiry,
      idQR,
      info,
    } = this.props;

    const tooltipMessage = <React.Fragment>
      <p>
        Please use the address provided to send funds to this Wallet.
      </p>
      <p>
        Depending on the amount being transferred, you will have to wait
        between 1 and 6 confirmations before you will be able to Collect
        your Coins. Start your existing Bitcoin Wallet and send any amount
        you wish. You will pay the standard Bitcoin Miner fee as usual and
        you will be issued with Bitcoin-express coins of the exact value that
        is received.
      </p>
      <p>
        You may use the 'Track progress' link to find out the confirmation
        status.
      </p>
    </React.Fragment>;

    return <div className={ classes.address }>

      <Chip
        avatar={ <Avatar size={32}>@</Avatar> }
        label={ blockchainAddress }
        color="secondary"
        classes={{
          root: classes.chip,
          label: classes.chipLabel,
        }}
        deleteIcon={ info ? <HelpTooltip
          note={ tooltipMessage }
          style={{ marginRight: '5px' }}
        /> : null }
        onDelete={() => {}}
      />

      <div className={ classes.buttons }>
        <Button
          className={ classes.button }
          onClick={ this.handleCopyURI }
        >
          Copy URI
        </Button>

        <Button
          className={ classes.button }
          onClick={ this.handleCopyAddress }
        >
          Copy address
        </Button>

        { idQR ? <React.Fragment>
          <Button
            key="button"
            className={ classes.button }
            onClick={ this.handleSaveImage }
          >
            Save Image...
          </Button>
          <a id={ idQR } key="link"></a>
        </React.Fragment> : null }
      </div>
      { expiry ? <div className={ classes.address }>
        <b>Address available until</b>: { this.time.formatDate(expiry) }
      </div> : null }
    </div>;
  }
}

Address.defaultProps = {
  info: true,
};

Address.contextType = AppContext;


export default withStyles(componentStyles)(Address);

