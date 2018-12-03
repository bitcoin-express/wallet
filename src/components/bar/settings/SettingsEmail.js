import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import BitcoinCurrency from '../../BitcoinCurrency';
import CoinSelector from '../../CoinSelector';


function getExpiryEmailFee(info, settings, config) {
  const {
    MIN_TRANSACTION_VALUE,
  } = config;

  let fee = parseFloat(info.feeExpiryEmail) * 20;
  const settingsValue = settings[MIN_TRANSACTION_VALUE];
  const currencyCode = info.currencyCode || "XBT";

  if (settingsValue != 1 && typeof settingsValue == "object" && settingsValue[info.currencyCode]) {
    fee = settingsValue[info.currencyCode];
  }

  return fee;
}

class NetworkFee extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      currency,
      isFlipped,
      isFullScreen,
      feeExpiry,
      settings,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    return <div>
      <small
        style={{
          marginLeft: isFullScreen ? '40px' : '0',
        }}
      >
        ( Fee. <BitcoinCurrency
          centered={ false }
          currency={ currency }
          color="rgba(0, 0, 0, 0.87)"
          isFlipped={ isFlipped }
          tiny={ true }
          style={{
            display: 'inline-block',
            overflow: 'inherit',
          }}
          labelStyle={{
            marginTop: '7px',
          }}
          displayStorage={ false }
          showValuesInCurrency={ showValuesInCurrency }
          value={ parseFloat(feeExpiry) *
            Math.floor(settings[wallet.config.VERIFY_EXPIRE])
          }
          wallet={ wallet }
          xr={ xr }
        />&nbsp;)
      </small>
    </div>;
  }
}


class MinTransactionAmount extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      currency,
      isFlipped,
      isFullScreen,
      feeExpiryEmail,
      settings,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    return <div style={{
      fontSize: 'small',
      marginTop: isFullScreen ? '0' : '-10px',
      marginLeft: isFullScreen ? '40px' : '0',
    }}>
      ( Min. <BitcoinCurrency
        centered={ false }
        currency={ currency }
        color="rgba(0, 0, 0, 0.87)"
        isFlipped={ isFlipped }
        tiny={ true }
        style={{
          display: 'inline-block',
          overflow: 'inherit',
        }}
        labelStyle={{
          marginTop: '7px',
        }}
        displayStorage={ false }
        showValuesInCurrency={ showValuesInCurrency }
        value={ parseFloat(feeExpiryEmail) }
        wallet={ wallet }
        xr={ xr }
      />&nbsp;)
    </div>;
  }
}

class FeeExpiryEmail extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      currency,
      isFlipped,
      isFullScreen,
      feeExpiryEmail,
      settings,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const isRecovery = settings[wallet.config.EMAIL_RECOVERY];

    return <div>
      <small style={{ marginLeft: isFullScreen ? '40px' : '0' }}>
        ( Fee <BitcoinCurrency
          centered={ false }
          color="rgba(0, 0, 0, 0.87)"
          currency={ currency }
          isFlipped={ isFlipped }
          tiny={ true }
          style={{
            display: 'inline-block',
            overflow: 'inherit',
          }}
          labelStyle={{
            marginTop: '7px',
          }}
          displayStorage={ false }
          showValuesInCurrency={ showValuesInCurrency }
          value={ isRecovery ? parseFloat(feeExpiryEmail) : 0 }
          wallet={ wallet }
          xr={ xr }
        />&nbsp;)
      </small>
    </div>;
  }
}


export default class SettingsEmail extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      errorEmail: "",
      errorMinTx: null,
      minTransaction: 0,
      currencyInfo: [],
      feeExpiryEmail: 0,
      feeExpiry: 0,
      pwdType: 0,
      settings: props.settings,
    };

    this.styles = {
      info: {
        transition: 'height .5s',
        height: '0px',
        overflow: 'hidden',
        // margin: '15px 0',
        fontSize: 'small',
      },
      infoDouble: {
        transition: 'height .5s',
        height: '0px',
        overflow: 'hidden',
        borderColor: '#ced4cf',
        borderBottomStyle: 'double',
        // marginBottom: '15px',
        fontSize: 'small',
      },
      infoIcon: function (top='-6.5em') {
        return {
          cursor: 'pointer',
          color: 'black',
          position: 'relative',
          top,
          left: '100%',
        };
      }.bind(this)
    };

    this.handleChangeExpireTime = this.handleChangeExpireTime.bind(this); 
    this.handleChangePasswordEncrypt = this.handleChangePasswordEncrypt.bind(this);
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.handleSetEmailRecovery = this.handleSetEmailRecovery.bind(this);
    this.handleSetEmailEncrypt = this.handleSetEmailEncrypt.bind(this);
    this.handleSetEncryptType = this.handleSetEncryptType.bind(this);
    this.handleSetMinTransaction = this.handleSetMinTransaction.bind(this);
    this.handleMinTransactionChange = this.handleMinTransactionChange.bind(this);
    this.handleSetTransactionExpire = this.handleSetTransactionExpire.bind(this);
    this.handleChangeTransactionExpire = this.handleChangeTransactionExpire.bind(this);
    this.handleShowInfo = this.handleShowInfo.bind(this);

    this._setAutoTimes = this._setAutoTimes.bind(this);
    this._validatePassword = this._validatePassword.bind(this);
  }

  componentWillMount() {
    const {
      wallet,
    } = this.props;

    const {
      DEFAULT_ISSUER,
    } = wallet.config;

    const updateState = (resp) => {
      if (!resp.issuer || resp.issuer.length == 0) {
        return;
      }

      // TO_DO: Shall we show different issuers?
      this.setState({
        currencyInfo: resp.issuer[0].currencyInfo,
      });
    }

    const args = {
      domain: wallet.getSettingsVariable(DEFAULT_ISSUER),
    };

    wallet.issuer("info", {}, args, "GET")
      .then(updateState);
  }

  validateAmount(s) {
    let rgx = /^[0-9]*\.?[0-9]*$/;
    return s.match(rgx);
  }

  handleShowInfo(secondElementSibling=false) {
    return (event) => {
      let el = event.target.parentElement.nextElementSibling;
      if (secondElementSibling) {
        el = el.nextElementSibling;
      }
      let height = 0; 
      if (el.clientHeight == 0) {
        height = el.firstChild.clientHeight + 30;
      }
      el.style.height = `${height}px`;
    };
  }

  handleChangeExpireTime(ev, expire = 1) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    if (isNaN(expire) || !this.validateAmount(expire)) {
      return;
    }
    if ((expire.split(".")[0] || "").length > 2 || (expire.split(".")[1] || "").length > 1) {
      return;
    }
    setSettingsKey(wallet.config.VERIFY_EXPIRE, expire);
    setSettingsKey(wallet.config.ISSUE_EXPIRE, expire);
    setSettingsKey(wallet.config.REDEEM_EXPIRE, expire);
    settings[wallet.config.VERIFY_EXPIRE] = expire;
    settings[wallet.config.ISSUE_EXPIRE] = expire;
    settings[wallet.config.REDEEM_EXPIRE] = expire;
    this.setState({
      settings,
    });
  }

  handleSetEmailRecovery(ev, checked) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      currencyInfo,
      settings,
    } = this.state;

    const {
      EMAIL_RECOVERY,
      MIN_TRANSACTION,
      MIN_TRANSACTION_VALUE,
      TRANSACTION_EXPIRE_VALUE,
    } = wallet.config;

    if (checked && !settings[MIN_TRANSACTION]) {
      let minTxValue = {};
      currencyInfo.forEach((info) => {
        minTxValue[info.currencyCode] = 20 * parseFloat(info.feeExpiryEmail);
      });

      setSettingsKey(MIN_TRANSACTION, 1);
      setSettingsKey(MIN_TRANSACTION_VALUE, minTxValue);
      settings[MIN_TRANSACTION] = 1;
      settings[MIN_TRANSACTION_VALUE] = minTxValue;
    }

    setSettingsKey(EMAIL_RECOVERY, checked);
    settings[EMAIL_RECOVERY] = checked;

    this.setState({
      settings,
    });

    if (settings[TRANSACTION_EXPIRE_VALUE] == 0) {
      this._setAutoTimes();
    }
  }

  handleSetEmailEncrypt(event, checked) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    if (checked && !settings[wallet.config.ENCRYPT_TYPE]) {
      setSettingsKey(wallet.config.ENCRYPT_TYPE, 0);
      settings[wallet.config.ENCRYPT_TYPE] = 0;
    }
    setSettingsKey(wallet.config.EMAIL_ENCRYPT, checked);
    settings[wallet.config.EMAIL_ENCRYPT] = checked;
    this.setState({
      settings,
    });
  }

  handleSetTransactionExpire(event, checked) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    setSettingsKey(wallet.config.TRANSACTION_EXPIRE, checked);
    settings[wallet.config.TRANSACTION_EXPIRE] = checked;

    if (checked && settings[wallet.config.TRANSACTION_EXPIRE_VALUE] == null) {
      setSettingsKey(wallet.config.TRANSACTION_EXPIRE_VALUE, 0);
      settings[wallet.config.TRANSACTION_EXPIRE_VALUE] = 0;
      this.setState({
        settings,
      });
      this._setAutoTimes();
    } else if (settings[wallet.config.TRANSACTION_EXPIRE_VALUE] == 0) {
      this.setState({
        settings,
      });
      this._setAutoTimes();
    }
  }

  handleChangeTransactionExpire(event, type, payload) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    if (type == 0) {
      this._setAutoTimes();
    }
    setSettingsKey(wallet.config.TRANSACTION_EXPIRE_VALUE, type);
    settings[wallet.config.TRANSACTION_EXPIRE_VALUE] = type;
    this.setState({
      settings,
    });
  }

  handleSetEncryptType(event, type, payload) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    if (type == 0) {
      setSettingsKey(wallet.config.PASSWORD_ENCRYPT, "");
      settings[wallet.config.PASSWORD_ENCRYPT] = "";
    }
    setSettingsKey(wallet.config.ENCRYPT_TYPE, type);
    settings[wallet.config.ENCRYPT_TYPE] = type;
    this.setState({
      settings,
    });
  }

  handleSetMinTransaction(event, type, payload) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      currencyInfo,
      settings,
    } = this.state;

    const {
      MIN_TRANSACTION,
      MIN_TRANSACTION_VALUE,
    } = wallet.config;

    if (type == 1) {
      let minTxValue = {};
      currencyInfo.forEach((info) => {
        minTxValue[info.currencyCode] = 20 * info.feeExpiryEmail;
      });

      setSettingsKey(MIN_TRANSACTION_VALUE, minTxValue);
      settings[MIN_TRANSACTION_VALUE] = minTxValue;
    }
    setSettingsKey(MIN_TRANSACTION, type);
    settings[MIN_TRANSACTION] = type;

    this.setState({
      settings,
    });
  }

  handleMinTransactionChange(currency) {
    return (value) => {
      const {
        setSettingsKey,
        wallet,
      } = this.props;

      let {
        feeExpiryEmail,
        settings,
      } = this.state;

      const {
        MIN_TRANSACTION_VALUE,
      } = wallet.config;

      if (parseFloat(value) < feeExpiryEmail) {
        this.setState({
          errorMinTx: "lower than recovery fee",
        });
        return;
      }

      let minTxValue = wallet.getSettingsVariable(MIN_TRANSACTION_VALUE);
      if (typeof minTxValue != "object") {
        minTxValue = { [currency]: value };
      } else {
        minTxValue[currency] = value;
      }

      setSettingsKey(MIN_TRANSACTION_VALUE, minTxValue);
      settings[MIN_TRANSACTION_VALUE] = minTxValue;

      this.setState({
        settings,
        errorMinTx: null,
      });
    };
  }

  handleChangePasswordEncrypt(event, pwd) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    setSettingsKey(wallet.config.PASSWORD_ENCRYPT, pwd);
    settings[wallet.config.PASSWORD_ENCRYPT] = pwd;
    this.setState({
      settings,
    });
  }

  _checkIfEmailInString(text) {
    let re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
  }

  _setAutoTimes() {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    let expire = 0.5;
    if (settings[wallet.config.TRANSACTION_EXPIRE] && !settings[wallet.config.EMAIL_RECOVERY]) {
      expire = 35.9;
    } else if (!settings[wallet.config.EMAIL_RECOVERY]) {
      expire = 2.9;
    }
    setSettingsKey(wallet.config.VERIFY_EXPIRE, expire);
    setSettingsKey(wallet.config.ISSUE_EXPIRE, expire);
    setSettingsKey(wallet.config.REDEEM_EXPIRE, expire);
    settings[wallet.config.VERIFY_EXPIRE] = expire;
    settings[wallet.config.ISSUE_EXPIRE] = expire;
    settings[wallet.config.REDEEM_EXPIRE] = expire;
    this.setState({
      errorEmail: "", 
      settings,
    });

  }

  _validatePassword(pwd) {
    let letter = /[a-zA-Z]/;
    let number = /[0-9]/;

    if (pwd.length < 6) {
      return "must have 6 chars or more";
    }
    if (!letter.test(pwd)) {
      return "must contain min 1 letter";
    }
    if (!number.test(pwd)) {
      return "must contain min 1 number";
    }
    return null;
  }

  handleTextFieldChange(event, email) {
    const {
      setSettingsKey,
      wallet,
    } = this.props;

    let {
      settings,
    } = this.state;

    if (this._checkIfEmailInString(email)) {
      setSettingsKey(wallet.config.EMAIL, email);
      setSettingsKey(wallet.config.EMAIL_RECOVERY, true);
      settings[wallet.config.EMAIL] = email;
      settings[wallet.config.EMAIL_RECOVERY] = true;
      this.setState({
        errorEmail: "", 
        settings,
      });
      return;
    }

    setSettingsKey(wallet.config.EMAIL, "");
    setSettingsKey(wallet.config.EMAIL_RECOVERY, false);
    settings[wallet.config.EMAIL] = "";
    settings[wallet.config.EMAIL_RECOVERY] = false;

    if (!email) {
      this.setState({
        errorEmail: "", 
        settings,
      });
      return;
    }
    this.setState({
      errorEmail: "Not a valid email address.", 
      settings,
    });
  }

  render() {
    const {
      isFlipped,
      isFullScreen,
      setEmailRecovery,
      setEmailEncrypt,
      showValuesInCurrency,
      wallet,
      walletName,
      xr,
    } = this.props;

    let {
      errorEmail,
      feeExpiry,
      feeExpiryEmail,
      currencyInfo,
      settings,
    } = this.state;

    const showPwdField = settings[wallet.config.ENCRYPT_TYPE] == 1
      && settings[wallet.config.EMAIL_ENCRYPT];

    const isAutoMinTx = settings[wallet.config.MIN_TRANSACTION] == 1;

    const displayMinTxFee = (info) => {
      let fee = getExpiryEmailFee(info, settings, wallet.config) * 20;
      return <MinTransactionAmount 
        { ...this.props }
        key={ "minTransactionAmount" + info.currencyCode }
        currency={ info.currencyCode }
        feeExpiryEmail={ fee.toString() }
        settings={ settings }
      />
    };

    return (
      <section style={{ 
        padding: '20px 5vw',
      }}>
        <h3 style={{
          marginTop: '0',
          color: '#8081ff',
        }}>
          Transaction recovery <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo() }
            style={{
              cursor: 'pointer',
              color: '#8081ff',
              marginLeft: '10px',
            }}
          />
        </h3>
        <div style={ this.styles.info }>
          <div>
            <b>In brief</b>
            <ul>
              <li>AUTO settings should be sufficient for most people.</li>
              <li>Indicating if your device may be unreliable will help.</li>
              <li>Enable email recovery for the most reliable service.</li>
              <li>View fees instantly as you change the settings.</li>
            </ul>
            <b>In full</b>
            <p>
              This Wallet needs to communicate with servers on the Internet
              and for increased reliability it uses a communications protocol
              that is capable of recovery from network or power failures that
              may last for hours or even days.
            </p>
            <p>
              The settings in this section determine the parameters that your
              Wallet will use when communicating with these servers, and hence
              the fees that will be applied. For most people the AUTO settings
              will be sufficient, alternatively you may customise the settings
              according to your personal needs.
            </p>
            <p>
              The length of the transaction recovery period should be affected
              by the type of device this Wallet is running on. Devices with
              unreliable power or network connections should have longer recovery
              periods and those that enable email recover may safely have reduced
              recovery periods.<br/><br/>
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}>
          <div style={{
            fontWeight: 'bold',
            margin: '16px 12px 0 0',
            minWidth: 'fit-content',
          }}>
            Expired transaction email recovery
          </div>
          <div style={{
            width: 'calc(100% - 300px)',
            minWidth: '235px',
          }}>
            <TextField
              id="email"
              defaultValue={ settings['email'] }
              hintText="Enter email address"
              errorText={ errorEmail }
              onChange={ this.handleTextFieldChange }
              style={{
                marginBottom: '20px',
                width: '100%',
              }}
            />
          </div>
        </div>
        <Checkbox
          label="Enable recover email"
          labelStyle={ isFullScreen ? {} : { fontSize: 'small' } }
          checked={ settings[wallet.config.EMAIL_RECOVERY] }
          disabled={ !this._checkIfEmailInString(settings[wallet.config.EMAIL]) }
          onCheck={ this.handleSetEmailRecovery }
        />
        { currencyInfo.map((info) => {
            return <FeeExpiryEmail 
              { ...this.props }
              key={ "feeEmail" + info.currencyCode }
              currency={ info.currencyCode }
              feeExpiryEmail={ parseFloat(info.feeExpiryEmail) }
              settings={ settings }
            />
        }) }
        <div>
          <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo() }
            style={ this.styles.infoIcon('-6em') }
          />
        </div>
        <div style={ this.styles.info }>
          <div>
            <b>Why enable expired transaction recovery emails?</b>
            <p>
              Transaction recovery emails contain new coins that your Wallet
              has failed to confirm have been well received. This is most
              often the result of power or network failure. 
            </p>
            <p>
              A transaction recovery email will be sent to the specified email
              address upon the rare occasion that a transaction expires before
              it is properly ended. For this situation to occur, a transaction
              that normally takes less than 10 seconds must have been abandoned
              before it completed, and then the Wallet did not start again
              until after the transaction had expired.
            </p>
            <p>
              On these very rare occasions, you will lose any new coins that an
              Issuer has created for you if email recovery is NOT enabled. When
              you provide an email address, the Issuer is able to send you the new
              coins even when your computer losses power or network connectivity
              for prolonged periods.
            </p>
            <b>How long does the server retain the email address?</b>
            <p>
              The email address is only retained for as long as the transaction
              is open (normally less than 10 seconds). As soon as a transaction
              is ended by the Wallet or the transaction period expires, the email
              address is discarded by the server and is never used for any other
              purpose.
            </p>
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateAreas: '"text selector"',
          gridTemplateColumns: '200px calc(100% - 245px)',
          gridGap: '5px',
          height: '50px',
        }}>
          <div style={{
            fontSize: 'small',
            gridArea: 'text',
            paddingTop: '20px',
            marginLeft: isFullScreen ? '40px' : '0',
          }}>
            Min. transaction amount
          </div>
          <SelectField
            disabled={ !settings[wallet.config.EMAIL_RECOVERY] }
            value={ settings[wallet.config.MIN_TRANSACTION] || 0 }
            onChange={ this.handleSetMinTransaction }
            style={{
              display: 'inline-flex',
              gritArea: 'selector',
              width: '100px',
            }}
            underlineStyle={{
              display: 'inline-flex',
              width: '90px',
              marginLeft: '-100px',
            }}
          >
            <MenuItem
              value={ 0 }
              primaryText="User"
            />
            <MenuItem
              value={ 1 }
              primaryText="Auto"
            />
          </SelectField>
        </div>

        { isAutoMinTx ? currencyInfo.map(displayMinTxFee) : <div> { currencyInfo.map((info) => {
              const {
                EMAIL_RECOVERY,
              } = wallet.config;

              const fee = getExpiryEmailFee(info, settings, wallet.config);

              return <CoinSelector
                currency={ info.currencyCode }
                id={ "minTransactionSel" + info.currencyCode }
                key={ "minTransactionSel" + info.currencyCode }
                label=""
                labelCurrency=""
                fullSize={ false }
                xr={ xr }
                disabled={ !settings[EMAIL_RECOVERY] }
                style={{
                  margin: isFullScreen ? '-20px 0 0 40px' : '-20px 0 0 0',
                  width: 'calc(100% - 60px)',
                }}
                initialValue={ fee.toString() }
                error={ this.state.errorMinTx }
                onAmountChange={ this.handleMinTransactionChange(info.currencyCode) }
              />;
          }) }
        </div> }

        <div>
          <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo() }
            style={ this.styles.infoIcon(isAutoMinTx ? '-6.5em' : '-12em') }
          />
        </div>
        <div style={ this.styles.info }>
          <div>
            <p>
              When enabling recovery email, there is a fixed fee per
              transaction. When the transaction value is large relative to the
              fee, it make good sense to include it. However, when the
              transaction value is very small, the cost of including email
              recovery may not be justified. The Auto setting will only request
              email recovery if the value of the coins being processed is at
              least TWENTY TIMES the recovery email fee.
              <br/><br/>&nbsp;
            </p>
          </div>
        </div>
        <br/>

        <Checkbox
          label="Encrypt recovery email"
          labelStyle={ isFullScreen ? {} : { fontSize: 'small' } }
          checked={ settings[wallet.config.EMAIL_ENCRYPT] }
          disabled={ !settings[wallet.config.EMAIL_RECOVERY] }
          onCheck={ this.handleSetEmailEncrypt }
        />
        <div style={{
          display: 'grid',
          marginLeft: isFullScreen ? '40px' : '0',
          gridTemplateAreas: '"text selector"',
          gridTemplateColumns: '80px 130px',
          gridGap: '5px',
          height: '50px',
        }}>
          <div style={{
            gridArea: 'text',
            paddingTop: '20px',
          }}>
            Password
          </div>
          <SelectField
            value={ settings[wallet.config.ENCRYPT_TYPE] || 0 }
            onChange={ this.handleSetEncryptType }
            style={{
              display: 'inline-flex',
              gridArea: 'selector',
              width: '120px',
            }}
            underlineStyle={{
              display: 'inline-flex',
              width: '110px',
              marginLeft: '-120px',
            }}
            disabled={ !settings[wallet.config.EMAIL_ENCRYPT] || !settings[wallet.config.EMAIL_RECOVERY] }
          >
            <MenuItem
              value={ 0 }
              primaryText="Auto"
            />
            <MenuItem
              value={ 1 }
              primaryText="Manual"
            />
          </SelectField>
        </div>
        { showPwdField ? <TextField
          id="pwd"
          value={ settings[wallet.config.PASSWORD_ENCRYPT] || "" }
          floatingLabelText="Enter password"
          type="password"
          disabled={ !settings[wallet.config.EMAIL_RECOVERY] }
          onChange={ this.handleChangePasswordEncrypt }
          style={{
            margin: isFullScreen ? '-20px 0 0 40px' : '-20px 0 0 0',
          }}
        /> : null }

        <div style={{ marginBottom: '15px' }}>
          <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo() }
            style={ this.styles.infoIcon(showPwdField ? '-120px' : '-70px') }
          />
          <br/>
          <i
            className="fa fa-question-circle"
            onClick={ this.handleShowInfo(true) }
            style={ this.styles.infoIcon(showPwdField ? '-100px' : '-50px') }
          />
        </div>
        <div style={ this.styles.info }>
          <div>
            <b>Why encrypt recovery emails?</b>
            <p>
              If you use a secure email protocols (like authenticated SMPT),
              and you trust that your email supplier will never read the
              contents of your emails, there is no strong need to use encrypted
              recovery emails. However, if you have any doubts we suggest that
              you select this option as it will prevent ANY person or device
              from steeling your new coins.
            </p>
            <p>
              Encryption is not automatically set because there is always a
              change that the password could be lost or forgotten and your coins
              would then be impossible to recover even if you possess the coin
              recovery file.
            </p>
          </div>
        </div>
        <div style={ this.styles.infoDouble }>
          <div>
            <b>Should I set a manual password or make it automatic?</b>
            <p>
              When Password is set to Auto, the Wallet will invent and record
              a new random password each time the email recovery option is
              used. This is the most secure option available, but if the Wallet
              should lose the password (perhaps because you remove the Wallet
              from a browser without making a backup), it would be impossible to
              recover any coins from a recovery file.
            </p>
            <p>
              However, if you set a manual password and remember it yourself,
              you will always be able to recover coins from a recovery file
              even if Wallet data is inadvertently lost.
            </p>
            <p style={{ color: 'red' }}>
              Warning: If you set a manual password, be sure to make it hard to
              guess. An easy to guess password is the number one factor in cyber
              theft.
              <br/><br/>&nbsp;
            </p>
          </div>
        </div>

        <h3>Transaction expiry period</h3>
        <SelectField
          value={ settings[wallet.config.TRANSACTION_EXPIRE_VALUE] || 0 }
          onChange={ this.handleChangeTransactionExpire }
          style={{
            marginLeft: isFullScreen ? '40px' : '0',
            width: isFullScreen ? 'calc(100% - 60px)' : '100%',
          }}
        >
          <MenuItem
            value={ 0 }
            primaryText="Auto"
          />
          <MenuItem
            value={ 1 }
            primaryText="Manual"
          />
        </SelectField>
        { settings[wallet.config.TRANSACTION_EXPIRE_VALUE] == 1 ? <div
          style={{
            marginLeft: isFullScreen ? '40px' : '0',
          }}
        >
          Recovery period &nbsp;&nbsp;<TextField
            id="recovery-period"
            value={ settings[wallet.config.VERIFY_EXPIRE] }
            onChange={ this.handleChangeExpireTime }
            style={{
              marginTop: '-25px',
              width: '33px'
            }}
          />&nbsp;&nbsp; hrs
        </div> : <Checkbox
          label="My network connection and/or device may be unrealiable at times"
          labelStyle={ isFullScreen ? {} : { fontSize: 'small' } }
          checked={ settings[wallet.config.TRANSACTION_EXPIRE] || false }
          onCheck={ this.handleSetTransactionExpire }
        /> }
        { currencyInfo.map((info) => {
            console.log(info.currencyCode, info.feeExpiry, parseFloat(info.feeExpiry));
            return <NetworkFee 
              { ...this.props }
              key={ "networkFee" + info.currencyCode }
              currency={ info.currencyCode }
              feeExpiry={ parseFloat(info.feeExpiry) }
              settings={ settings }
            />
        }) }

      </section>
    );
  }
}
