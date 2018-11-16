import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';

import styles from '../helpers/Styles';

class CoinSelector extends React.Component {

  constructor(props) {
    super(props);

    this._updateValues = this._updateValues.bind(this);
    this._getOriginalBTCValue = this._getOriginalBTCValue.bind(this);

    // test correct way to build the currency amount
    this.regex = [
      new RegExp(/^[0-9]{0,1}(\.[0-9]{0,8})?$/), //BTC
      new RegExp(/^[0-9]{0,4}(\.[0-9]{0,5})?$/), //mBTC
      new RegExp(/^[0-9]{0,7}(\.[0-9]{0,2})?$/), //uBTC
    ];
    this.fixedPos = [8, 5, 2]; // fixed positions

    let btcValue = this._updateValues(props);
    btcValue = props.initialCurrencyDisplay || btcValue;
    this.state = {
      btcValue,
      btcOriginal: btcValue,
      btcPreviousValue: btcValue,
      maxError: false,
      showAsCurrency: false,
      value: props.initialValue ?
        this._getOriginalBTCValue(parseFloat(props.initialValue), btcValue, 1) :
        "",
    };

    this._updateStyles = this._updateStyles.bind(this);
    this._updateStyles(props);

    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
    this.handleMaxClick = this.handleMaxClick.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let btcValue = nextProps.initialCurrencyDisplay || this._updateValues(nextProps);
    this._updateStyles(nextProps);

    if (btcValue != this.state.btcOriginal) {
      this.setState({
        btcValue,
        btcOriginal: btcValue,
        btcPreviousValue: btcValue,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let {
      currency,
      max,
    } = this.props;

    max = typeof max == "number" ? max.toFixed(8) : max;

    if (this.props.max != prevProps.max && this.state.maxSelected) {
      this.handleAmountChange(null, max, currency, true);
    } else if (this.props.max != prevProps.max) {
      const {
        value,
      } = this.state;

      if (parseFloat(value) > parseFloat(max)) {
        this.handleAmountChange(null, max);
      }
    }
  }

  _updateStyles(props) {
    const isMax = props.max != null;
    let inputW = '160px';
    if (props.fullSize && props.expand && isMax) {
      inputW = 'calc(100% - 195px)';
    } else if (props.fullSize && props.expand) {
      inputW = 'calc(100% - 135px)';
    }

    this.styles = {
      container: {
        display: 'grid',
        gridTemplateColumns: `95px ${inputW} ${isMax?'50px ':''}30px`,
        gridTemplateAreas: '"select amount ' + (isMax?'max ':'') + 'button"',
        gridGap: '10px',
        position: 'relative',
        alignItems: 'flex-end',
        marginTop: '-20px',
      },
      select: {
        width: '100%',
        gridArea: 'select',
      },
      amount: {
        gridArea: 'amount',
      },
      button: {
        gridArea: 'button',
        marginBottom: '13px',
      },
      buttonLink: {
        border: '10px',
        boxSizing: 'border-box',
        display: 'inline-block',
        WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
        cursor: 'pointer',
        size: '50%',
        textDecoration: 'none',
        margin: '0px',
        padding: '0px',
        outline: 'none',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        position: 'relative',
        verticalAlign: 'bottom',
        zIndex: '1',
        backgroundColor: 'rgba(0, 0, 0, 0.87)',
        //'rgb(128, 129, 255)',
        transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        //height: (props.small ? '22px' : '20px'),
        width: (props.small ? '22px' : '20px'),
        overflow: 'hidden',
        borderRadius: '50%',
        textAlign: 'center',
      },
      buttonText: {
        color: styles.colors.mainTextColor,
        fontSize: '12px',
        fontWeight: 'normal',
        lineHeight: '20px',
      },
      inputStyle: Object.assign({
        fontSize: "22px",
      }, props.inputStyle),
      selectorIcon: {
        width: "28px",
        padding: "12px 3px",
      },
      maxButton: {
        gridArea: 'max',
        marginBottom: '13px',
        color: styles.colors.mainTextColor,
        cursor: 'pointer',
        padding: "2px 10px",
        borderRadius: "10px",
        backgroundColor: styles.colors.secondaryBlue,
        verticalAlign: "top",
        fontSize: '13px',
        fontFamily: 'Roboto, sans-serif',
      }
    };

    if (props.centered && !props.fullSize) {
      this.styles.container.marginLeft = 'calc(50% - 142px)';
    }

    if (props.style) {
      this.styles.container = Object.assign(this.styles.container, props.style);
    }
  }

  _updateValues(props) {
    const btc =  props.xr.getBTCDisplay(props.currency.toUpperCase());

    let btcDisplay = btc.split("").reverse().slice(0,3).reverse().join("");
    this.btcDisplay = btcDisplay.length < 3 ? btcDisplay.slice(-1) : btcDisplay;

    return btc.charAt(0) == "m" ? 2 : (btc.charAt(0) == "μ" ? 3 : 1);
  }

  validateAmount(s) {
    let rgx = /^[0-9]*\.?[0-9]*$/;
    return s.match(rgx);
  }

  handleButtonClick(event) {
    this.setState({
      showAsCurrency: true,
    });

    setTimeout(() => {
      this.setState({
        showAsCurrency: false,
      });
    }, 3000);
  }
  
  handleAmountChange(ev, amount, currency=this.props.currency, maxSelected=false) {
    let {
      max,
    } = this.props;
    max = typeof max == "number" ? max.toFixed(8) : max;

    if (amount == "") {
      this.setState({
        maxError: false,
        maxSelected,
        value: "",
      });
      this.props.onAmountChange(0, this.state.btcValue, "");
      return;
    }

    if (isNaN(parseFloat(amount)) || !this.regex[this.state.btcValue - 1].test(amount)) {
      return;
    }

    if (max != null && max < parseFloat(amount)) {
      this.setState({
        maxError: true,
        maxSelected,
      });
      return;
    }

    if (this.validateAmount(amount)) {
      this.setState({
        maxError: false,
        maxSelected,
        value: amount,
      });
      this.props.onAmountChange(this._getOriginalBTCValue(amount), this.state.btcValue, amount);
    }
  }

  /* If not provided newBTC and prevBTC, returns the value as BTC */
  _getOriginalBTCValue(amount, newBTC = 1, prevBTC = this.state.btcValue) {
    // save always as BTC
    let val = parseFloat(amount) * Math.pow(10, 3 * (newBTC - prevBTC));
    return val.toFixed(this.fixedPos[newBTC - 1]).toString().replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
  }

  handleCurrencyChange(event, key, currency) {
    const {
      value,
      onAmountChange,
    } = this.props;

    const prevBTC = this.state.btcValue;
    let newState = {
      btcPreviousValue: prevBTC,
      btcValue: key + 1,
    };

    if (value !== null && onAmountChange) {
      if (!value) {
        onAmountChange("", key + 1, "");
      } else {
        const newValue = this._getOriginalBTCValue(value, key + 1, prevBTC);
        onAmountChange(this._getOriginalBTCValue(value), key + 1, newValue);
      }
    } else {
      newState['value'] = this.state.value == "" ? "" : 
        this._getOriginalBTCValue(this.state.value, key + 1, prevBTC);
    }

    this.setState(newState);
  }

  handleMaxClick(event) {
    let {
      currency,
      max,
    } = this.props;

    max = typeof max == "number" ? max.toFixed(8) : max;
    this.handleAmountChange(event, max, currency, true);
  }

  render() {
    const {
      disabled,
      floatingLabelFocusStyle,
      floatingLabelStyle,
      id,
      inputStyle,
      label,
      labelCurrency,
      xr,
    } = this.props;

    let {
      currency,
      error,
      max,
    } = this.props;
    currency = currency.toUpperCase();
    max = typeof max == "number" ? max.toFixed(8) : max;

    const {
      btcValue,
      showAsCurrency,
      maxError,
    } = this.state;

    if (maxError) {
      error = "Amount higher than max";
    }


    let finalValue = this.props.value;
    if (finalValue == null) {
      finalValue = this.state.value;
    }

    const symbol = xr.getRates(currency)[xr.currency].symbol;

    let props = {};
    let amountStyle = this.styles.amount;
    let selectStyle = this.styles.select;
    let buttonStyle = this.styles.button;
    let maxStyle = this.styles.maxButton;

    if (error && (showAsCurrency || label != "")) {
      props.errorText = error;
      props.errorStyle = {
        color: 'red'
      };
      // amountStyle = Object.assign({ marginBottom: '35px' }, amountStyle);
      selectStyle = Object.assign({}, selectStyle, { marginBottom: '30px' });
      buttonStyle = Object.assign({}, buttonStyle, { marginBottom: '40px' });
      maxStyle = Object.assign({}, maxStyle, { marginBottom: '40px' });
    } else if (error) {
      props.errorText = error;
      props.errorStyle = {
        color: 'red'
      };
      // amountStyle = Object.assign({ marginBottom: '35px' }, amountStyle);
      selectStyle = Object.assign({}, selectStyle, { marginBottom: '15px' });
      buttonStyle = Object.assign({}, buttonStyle, { marginBottom: '30px' });
      maxStyle = Object.assign({}, maxStyle, { marginBottom: '30px' });
    }

    return <div style={ this.styles.container }>
      <SelectField
        disabled={ disabled || showAsCurrency }
        floatingLabelText={ labelCurrency || "Show as" }
        floatingLabelStyle={ floatingLabelStyle }
        iconStyle={ this.styles.selectorIcon }
        labelStyle={ Object.assign({
          paddingRight: "0px"
        }, inputStyle) } 
        onChange={ this.handleCurrencyChange }
        style={ selectStyle }
        value={ btcValue }
      >
        <MenuItem
          value={1}
          primaryText={ this.btcDisplay }
        />
        <MenuItem
          value={2}
          primaryText={ `m${this.btcDisplay}` }
        />
        <MenuItem
          value={3}
          primaryText={ `μ${this.btcDisplay}` }
        />
      </SelectField>
      <div style={ amountStyle }>
        { showAsCurrency ? <TextField
          { ...props }
          id={ id }
          value={ xr.get(this._getOriginalBTCValue(parseFloat(finalValue) || 0), 2, currency) }
          disabled={ true }
          floatingLabelText={ <span>
            &asymp; { xr.getRates(currency)[xr.currency].code } value
          </span> }
          floatingLabelFocusStyle={ floatingLabelFocusStyle }
          floatingLabelStyle={ floatingLabelStyle }
          inputStyle={ this.styles.inputStyle }
          style={{
            width: '100%',
          }} 
        /> : <TextField
          { ...props }
          disabled={ disabled }
          id={ id }
          inputStyle={ this.styles.inputStyle }
          style={{
            width: '100%',
          }} 
          floatingLabelText={ label }
          floatingLabelFocusStyle={ floatingLabelFocusStyle }
          floatingLabelStyle={ floatingLabelStyle }
          onChange={ this.handleAmountChange }
          value={ finalValue }
        /> }
      </div>
      { max != null ? <div
        style={ maxStyle }
        title={ currency + " " + max }
        onClick={ this.handleMaxClick }
      >
        MAX
      </div> : null }
      <div style={ buttonStyle }>
        <div
          style={ this.styles.buttonLink }
        >
          <FlatButton
            style={{ minWidth: '20px', height: '20px' }}
            disabled={ showAsCurrency }
            onClick={ this.handleButtonClick }
          >
            <div style={ this.styles.buttonText }>
              { symbol }
            </div>
          </FlatButton>
        </div>
      </div>
    </div>;
  }
}

CoinSelector.propTypes = {
  centered: PropTypes.bool,
  currency: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  expand: PropTypes.bool,
  floatingLabelFocusStyle: PropTypes.object,
  floatingLabelStyle: PropTypes.object,
  fullSize: PropTypes.bool,
  id: PropTypes.string,
  initialCurrencyDisplay: PropTypes.number,
  initialValue: PropTypes.string,
  inputStyle: PropTypes.object,
  max: PropTypes.number,
  onAmountChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  labelCurrency: PropTypes.string,
  xr: PropTypes.object,
};

CoinSelector.defaultProps = {
  centered: false,
  currency: "btc",
  disabled: false,
  expand: true,
  floatingLabelFocusStyle: {},
  floatingLabelStyle: {},
  fullSize: true,
  initialCurrencyDisplay: null,
  inputStyle: {},
  label: "Enter coin value to export",
  max: null,
}

export default CoinSelector;
