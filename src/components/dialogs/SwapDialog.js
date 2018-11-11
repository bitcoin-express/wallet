import React from 'react';
import PropTypes from 'prop-types';

import CurrencyItem from '../tabs/exchange/CurrencyItem';
import ExchangeInfo from '../tabs/exchange/ExchangeInfo';
import BitcoinCurrency from '../BitcoinCurrency';
import CoinSelector from '../CoinSelector';

import Checkbox from 'material-ui/Checkbox';

import styles from '../../helpers/Styles';

class SwapDialog extends React.Component {

  constructor(props) {
    super(props);

    let initialState = {
      emailRecovery: true,
      issuerFee: 0,
      sourceAvailable: 0,
      targetAvailable: 0,
    };

    if (!props.isNotification) {
      let now = new Date().getTime();
      let ms = new Date(props.expiry).getTime() - now;
      initialState["countdown"] = Math.floor(ms / 1000);
    }

    this.state = initialState;

    this.updateIssuerFee = this.updateIssuerFee.bind(this);
    this.handleCheckEmailRecovery = this.handleCheckEmailRecovery.bind(this);

    this._initializeStyles = this._initializeStyles.bind(this); 
    this._initializeStyles(props);
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  componentDidMount() {
    this.updateIssuerFee();
    this.interval = setInterval(() => {
      let { countdown } = this.state;
      if (countdown == 0) {
        clearInterval(this.interval);
        return
      }
      this.setState({
        countdown: countdown - 1,
      });
    }, 1000);
  }

  componentWillMount() {
    const {
      sourceCurrency,
      targetCurrency,
      wallet,
    } = this.props;

    wallet.Balance(sourceCurrency).then((resp) => {
      this.setState({
        sourceAvailable: resp,
      });
    });
    wallet.Balance(targetCurrency).then((resp) => {
      this.setState({
        targetAvailable: resp,
      });
    });
  }

  handleCheckEmailRecovery(ev, emailRecovery) {
    this.props.recalculateFee(emailRecovery);
    this.setState({
      emailRecovery,
    }, this.updateIssuerFee);
  }

  updateIssuerFee() {
    const {
      issuerService,
      isNotification,
      source,
      wallet,
    } = this.props;

    if (isNotification) {
      this.setState({
        issuerFee: this.props.issuerFee,
      });
    }

    const {
      emailRecovery,
    } = this.state;

    let sc = parseFloat(source);
    let fee = wallet.getVerificationFee(sc, issuerService, emailRecovery);
    this.setState({
      issuerFee: fee,
    });
  }

  _initializeStyles(props) {
    this.styles = {
      content: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        margin: props.isFullScreen ? '0' : '0 20px',
      },
      label: {
        margin: '15px 0',
        color: 'blue',
        fontFamily: 'Roboto, sans-serif',
        fontSize: '22px',
      },
      fee: {
        color: "#565963",
        verticalAlign: "top",
        marginTop: '15px',
        fontFamily: 'Roboto, sans-serif',
      },
    };
  }

  render() {
    const {
      sourceCurrency,
      targetCurrency,
      source,
      target,
      isFlipped,
      isFullScreen,
      isNotification, // display a confirmed swap transaction
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const {
      emailRecovery,
      issuerFee,
      countdown,
      sourceAvailable,
      targetAvailable,
    } = this.state;

    const {
      AVAILABLE_CURRENCIES,
    } = wallet.config;

    const currencies = wallet.config[AVAILABLE_CURRENCIES];

    if (countdown <= 0 && !isNotification) {
      return <section style={{
        color: "red",
        textAlign: "center",
        margin: "20px 0",
      }}>
        Atomic swap file expired
      </section>;
    }

    const checkboxStyle = Object.assign(this.styles.content, {
      margin: '10px 0 0 0',
    });

    return <section>
      <div style={ this.styles.content }>
        <div>
          <div style={ this.styles.label }>
            Source
          </div>
          <CurrencyItem
            code={ sourceCurrency }
            name={ currencies[sourceCurrency].name }
            available={ sourceAvailable }
          />
          <CoinSelector
            currency={ sourceCurrency }
            disabled={ true }
            expand={ false }
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            label=""
            id="source"
            inputStyle={{
              color: styles.colors.darkBlue,
            }}
            onAmountChange={() => {}}
            style={{
              marginTop: '-10px',
            }}
            value={ source.toFixed(8) }
            xr={ xr }
          />
          <div style={{
            marginTop: '15px',
            textAlign: 'right',
          }}>
            <b style={ this.styles.fee }>
              Fee:
            </b> <BitcoinCurrency
              value={ parseFloat(issuerFee.toFixed(8)) }
              currency={ sourceCurrency.toUpperCase() }
              color="#565963"
              displayStorage={ false }
              buttonStyle={{
                background: styles.colors.mainBlack,
              }}
              isFlipped={ isFlipped }
              showValuesInCurrency={ showValuesInCurrency }
              small={ isFullScreen }
              tiny={ !isFullScreen }
              wallet={ wallet }
              style={{ display: 'inline-block' }}
              xr={ xr }
            />
          </div>
        </div>

        <div>
          <div style={ this.styles.label }>
            Target
          </div>
          <CurrencyItem
            code={ targetCurrency }
            name={ currencies[targetCurrency].name }
            available={ targetAvailable }
          />
          <CoinSelector
            currency={ targetCurrency }
            disabled={ true }
            expand={ false }
            floatingLabelFocusStyle={{
              color: styles.colors.secondaryTextColor,
            }}
            floatingLabelStyle={{
              color: styles.colors.secondaryBlue,
            }}
            label=""
            id="target"
            inputStyle={{
              color: styles.colors.darkBlue,
            }}
            onAmountChange={() => {}}
            style={{
              marginTop: '-10px',
            }}
            value={ target.toFixed(8) }
            xr={ xr }
          />
          <div style={{
            margin: '15px 10px 0 0',
            textAlign: 'right',
          }}>
            <b style={ this.styles.fee }>
              Rate
            </b>: { (target / source).toFixed(8) }
            { isNotification ? null : <span>
              <br />
              <b style={ this.styles.fee }>
                Time
              </b>: { countdown }s
            </span> }
          </div>
        </div>
      </div>

      <ExchangeInfo
        background="transparent"
        currSource={ currencies[sourceCurrency] }
        currTarget={ currencies[targetCurrency] }
        source={ (source + issuerFee).toFixed(8) }
        style={{
          margin: '10px 5% 20px',
        }}
        target={ target.toFixed(8) }
        isFlipped={ isFlipped }
        isFullScreen={ isFullScreen }
        showValuesInCurrency={ showValuesInCurrency }
        wallet={ wallet }
        xr={ xr }
      />

      { isNotification ? null : <div style={ checkboxStyle }>
        <Checkbox
          checked={ emailRecovery }
          iconStyle={{
            fill: "rgba(0, 0, 0, 0.6)",
          }}
          onCheck={ this.handleCheckEmailRecovery }
          label="Include email recovery"
          labelStyle={{
            width: 'initial',
            color: "rgba(0, 0, 0, 0.6)",
          }}
          style={{
            width: 'initial',
            margin: 'auto',
          }}
        />
      </div> }

    </section>;
  }
}

SwapDialog.propTypes = {
  sourceCurrency: PropTypes.string.isRequired,
  targetCurrency: PropTypes.string.isRequired,
  source: PropTypes.number.isRequired,
  isNotification: PropTypes.bool,
  issuerFee: PropTypes.number,
  issuerService: PropTypes.object,
  target: PropTypes.number.isRequired,
  isFlipped: PropTypes.bool.isRequired,
  isFullScreen: PropTypes.bool.isRequired,
  isNotification: PropTypes.bool.isRequired,
  showValuesInCurrency: PropTypes.func.isRequired,
  recalculateFee: PropTypes.func,
  wallet: PropTypes.object.isRequired,
  xr: PropTypes.object.isRequired,
};

SwapDialog.defaultProps = {
  isNotification: false,
};

export default SwapDialog;
