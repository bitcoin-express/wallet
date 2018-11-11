import React from 'react';

import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';

import Time from '../helpers/Time';

import HelpTooltip from './HelpTooltip';

class Address extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      labelStyle: {
        textTransform: 'inherit',
      },
      button: {
        border: '1px',
        borderColor: 'grey',
        borderStyle: 'solid',
        marginLeft: '15px',
        height: 'inherit',
        lineHeight: 'inherit',
        margin: '5px 0',
        backgroundColor: 'white',
      },
      textarea: {
        backgroundColor: 'transparent',
        width: '300px',
        border: 'none',
        color: 'white',
        height: '15px',
        marginTop: '5px',
      },
    };

    this.time = new Time();

    this.handleCopyURI = this.handleCopyURI.bind(this);
    this.handleCopyAddress = this.handleCopyAddress.bind(this);
    this.handleSaveImage = this.handleSaveImage.bind(this);

    this._copyAddress = this._copyAddress.bind(this);
  }

  handleCopyURI() {
    this.props.wallet.getDepositRef().then((depositRef) => {
      if (depositRef && depositRef.issueInfo) {
        const {
          issueInfo,
        } = depositRef;
        const ending = issueInfo.targetValue > 0 ? `?amount=${issueInfo.targetValue}`: "";
        this._copyAddress("bitcoin:", ending, "URI");
      }
    });
  }

  handleCopyAddress() {
    this._copyAddress();
  }

  _copyAddress(start = "", end = "", type = "Address") {
    const {
      snackbarUpdate,
    } = this.props;

    let copyTextarea = document.querySelector('.js-copytextarea');
    const originalValue = copyTextarea.value;
    copyTextarea.value = start + copyTextarea.value + end;
    copyTextarea.select();

    try {
      let successful = document.execCommand('copy');
      copyTextarea.value = originalValue;
      copyTextarea.blur();
      if (!successful) {
        throw new Error('not sucess in copying');
      } else {
        snackbarUpdate(`${type} copied to clipboard`);
      }
    } catch (err) {
      copyTextarea.value = originalValue;
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
      expiry,
      idQR,
      info,
    } = this.props;

    return <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-flex',
          width: info ? 'calc(100% - 50px)' : '100%',
          maxWidth: '360px',
        }}
      >
        <Chip
          backgroundColor="#5d5d5d"
          style={{
            margin: 4,
            textAlign: 'center',
            width: '100%',
            cursor: 'inherit',
            overflow: 'hidden',
          }}
          labelStyle={{
            userSelect: 'inherit',
            color: 'white',
          }}
        >
          <Avatar
            size={32}
            backgroundColor="#5d5d5d"
            style={{ minWidth: '32px' }}
          >
            @
          </Avatar>
          <textarea
            className="js-copytextarea"
            value={ blockchainAddress }
            onChange={ () => {} }
            style={ this.styles.textarea }
          />
        </Chip>
      </div>
      { info ? <div
        style={{
          width: '50px',
          display: 'inline-flex',
          textAlign: 'right',
        }}
      >
        <HelpTooltip
          tooltipStyle={{ marginLeft: '10vw', marginRight: '10vw' }}
          note={ <div>
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
          </div> }
        />
      </div> : null }
      <div
        style={{
          textAlign: 'center',
          margin: '5px 0 15px 0',
        }}
      >
        <FlatButton
          label="Copy URI"
          labelStyle={ this.styles.labelStyle }
          style={ this.styles.button }
          onClick={ this.handleCopyURI }
        />
        <FlatButton
          label="Copy address"
          labelStyle={ this.styles.labelStyle }
          style={ this.styles.button }
          onClick={ this.handleCopyAddress }
        />
        { idQR ? [
          <FlatButton
            key="button"
            label="Save Image..."
            labelStyle={ this.styles.labelStyle }
            style={ this.styles.button }
            onClick={ this.handleSaveImage }
          />,
          <a id={ idQR } key="link"></a>
        ] : null }
      </div>
      { expiry ? <div style={{ textAlign: 'center' }}>
        <b>Address available until</b>: { this.time.formatDate(expiry) }
      </div> : null }
    </div>;
  }
}

Address.defaultProps = {
  info: true,
};

export default Address;
