import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';

import styles from '../helpers/Styles';

const componentStyles = (theme) => {
  const {
    colors,
  } = styles;

  const root = {
    display: 'grid',
    gridGap: '10px',
    position: 'relative',
    alignItems: 'flex-end',
  };

  return {
    root: Object.assign({}, root, {
      gridTemplateColumns: "95px 160px 30px",
      gridTemplateAreas: '"select amount button"',
    }),
    rootExpand: Object.assign({}, root, {
      gridTemplateColumns: "95px calc(100% - 135px) 50px 30px",
      gridTemplateAreas: '"select amount max button"',
    }),
    rootMax: Object.assign({}, root, {
      gridTemplateColumns: "95px calc(100% - 195px) 30px",
      gridTemplateAreas: '"select amount button"',
    }),
    rootCentered: {
      marginLeft: 'calc(50% - 142px)',
    },
    textFieldRoot: {
      fontSize: "22px",
      width: '100%',
    },
    amountRoot: {
      gridArea: 'amount',
    },
    buttonRoot: {
    },
    maxButtonRoot: {
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
    },
    selectRoot: {
      gridArea: 'select',
      width: '100%',
    },
    sizeSmall: {
      backgroundColor: styles.colors.mainBlack,
      color: styles.colors.mainTextColor,
      fontSize: '12px',
      fontWeight: 'normal',
      height: '25px',
      lineHeight: '20px',
      minHeight: '25px',
      width: '25px',
    },
  };
};


class CoinSelector extends React.Component {

  constructor(props) {
    super(props);

    this._updateValues = this._updateValues.bind(this);
    this._getOriginalValue = this._getOriginalValue.bind(this);

    // test correct way to build the currency amount
    this.regex = [
      new RegExp(/^[0-9]{0,1}(\.[0-9]{0,8})?$/), //BTC
      new RegExp(/^[0-9]{0,4}(\.[0-9]{0,5})?$/), //mBTC
      new RegExp(/^[0-9]{0,7}(\.[0-9]{0,2})?$/), //uBTC
    ];

    let displayValue = this._updateValues(props);
    displayValue = props.initialCurrencyDisplay || displayValue;
    this.state = {
      displayValue,
      btcOriginal: displayValue,
      previousDisplayValue: displayValue,
      maxError: false,
      showAsCurrency: false,
      value: props.initialValue ?
        this._getOriginalValue(parseFloat(props.initialValue), displayValue, 1) :
        "",
    };

    this._updateStyles = this._updateStyles.bind(this);
    this._updateStyles(props);

    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleCurrencyChange = this.handleCurrencyChange.bind(this);
    this.handleMaxClick = this.handleMaxClick.bind(this);

    this.getRootClass = this.getRootClass.bind(this);
    this.getTextField = this.getTextField.bind(this);
    this.getMaxButton = this.getMaxButton.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    let displayValue = nextProps.initialCurrencyDisplay || this._updateValues(nextProps);
    this._updateStyles(nextProps);

    if (displayValue != this.state.btcOriginal) {
      this.setState({
        displayValue,
        btcOriginal: displayValue,
        previousDisplayValue: displayValue,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let {
      currency,
      max,
    } = this.props;

    const {
      maxSelected,
      value,
    } = this.state;

    const maxValue = typeof max == "number" ? max.toFixed(8) : max;
    const fakeEvent = {
      target: {
        value: maxValue,
      }
    };

    if (max != prevProps.max && maxSelected) {
      this.handleAmountChange(fakeEvent, currency, true);
      return;
    }

    if (max != prevProps.max && parseFloat(value) > parseFloat(maxValue)) {
      this.handleAmountChange(fakeEvent);
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
      buttonText: {
      },
      inputStyle: Object.assign({
        fontSize: "22px",
      }, props.inputStyle),
      selectorIcon: {
        width: "28px",
        padding: "12px 3px",
      },
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
  
  handleAmountChange(event, currency=this.props.currency, maxSelected=false) {
    let amount = event.target.value;
    let { max } = this.props;
    max = typeof max == "number" ? max.toFixed(8) : max;

    if (amount == "") {
      this.setState({
        maxError: false,
        maxSelected,
        value: "",
      });

      this.props.onAmountChange(0, this.state.displayValue, "");
      return;
    }

    if (isNaN(parseFloat(amount)) || !this.regex[this.state.displayValue - 1].test(amount)) {
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
      this.props.onAmountChange(this._getOriginalValue(amount), this.state.displayValue, amount);
    }
  }

  /* If not provided newDisplay and prevDisplay, returns the original value */
  _getOriginalValue(amount, newDisplay = 1, prevDisplay = this.state.displayValue) {
    const factor = Math.pow(10, 3 * (newDisplay - prevDisplay));
    const finalValue = parseFloat(amount) * factor;
    const numDecimalsDisplayed = [8, 5, 2][newDisplay - 1];

    return finalValue.toFixed(numDecimalsDisplayed)
      .toString()
      .replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
  }

  handleCurrencyChange(event) {
    const {
      onAmountChange,
      value,
    } = this.props;

    const key = parseInt(event.target.value);
    const prevDisplay = this.state.displayValue;

    let newState = {
      previousDisplayValue: prevDisplay,
      displayValue: key,
    };

    // Component does not update value in props, we use the value from state.
    if (value == undefined) {
      let stateValue = this.state.value;
      if (stateValue !== "") {
        stateValue = this._getOriginalValue(stateValue, key, prevDisplay);
      }
      newState['value'] = stateValue;
      this.setState(newState);
      return;
    }

    // Currency display changed, but not amount entered
    if (value === "" || !value) {
      return;
    }

    const newValue = this._getOriginalValue(value, key, prevDisplay);
    newState['value'] = onAmountChange(this._getOriginalValue(value), key, newValue);
    this.setState(newState);
  }

  handleMaxClick(event) {
    let {
      currency,
      max,
    } = this.props;

    max = typeof max == "number" ? max.toFixed(8) : max;
    event.target.value = max;
    this.handleAmountChange(event, currency, true);
  }

  getRootClass() {
    const {
      centered,
      classes,
      expand,
      fullSize,
      max,
    } = this.props;

    let rootClass = classes.root;
    if (fullSize && expand && max != null) {
      rootClass = classes.rootMax;
    } else if (fullSize && expand) {
      rootClass = classes.rootExpand;
    }

    if (centered) {
      rootClass += " " + classes.rootCentered;
    }

    return rootClass;
  }

  getTextField(amount="") {
    const {
      classes,
      disabled,
      id,
      label,
    } = this.props;

    if (this.state.showAsCurrency) {

      const { xr } = this.props;
      const currency = this.props.currency.toUpperCase();
      const rates = xr.getRates(currency);
      const originalAmount = this._getOriginalValue(parseFloat(amount || 0));

      return <TextField
        className={ classes.textFieldRoot }
        disabled={ true }
        id={ id }
        label={ <span>
          &asymp; { rates[xr.currency].code } value
        </span> }
        value={ xr.get(originalAmount, 2, currency) }
      />
    }

    return <TextField
      className={ classes.textFieldRoot }
      disabled={ disabled }
      id={ id }
      label={ label }
      onChange={ this.handleAmountChange }
      value={ amount }
    />;
  }

  getMaxButton() {
    const {
      classes,
      currency,
      max,
    } = this.props;

    if (max != null) {
      return <div
        className={ classes.maxButtonRoot }
        title={ currency + " " + max }
        onClick={ this.handleMaxClick }
      >
        MAX
      </div>;
    }
    return null;
  }

  render() {
    const {
      classes,
      currency,
      value,
      xr,
    } = this.props;

    const {
      displayValue,
    } = this.state;


    const textFieldComponent = this.getTextField(value || this.state.value);
    const maxButton = this.getMaxButton();

    return <div className={ this.getRootClass() }>

      <FormControl className={ classes.selectRoot }>
        <Select
          native
          value={ displayValue }
          onChange={ this.handleCurrencyChange }
          inputProps={{
            name: 'display-sel',
            id: 'display-native-selector',
          }}
        >
          <option value={1}>
            { this.btcDisplay }
          </option>
          <option value={2}>
            { `m${this.btcDisplay}` }
          </option>
          <option value={3}>
            { `μ${this.btcDisplay}` }
          </option>
        </Select>
      </FormControl>

      <div className={ classes.amountRoot }>
        { textFieldComponent }
      </div>

      { maxButton }

      <Fab
        aria-label={ `To ${xr.currency}` }
        classes={{
          root: classes.buttonRoot,
          sizeSmall: classes.sizeSmall,
        }}
        onClick={ this.handleButtonClick }
        size="small"
      >
        { xr.getRates(currency.toUpperCase())[xr.currency].symbol }
      </Fab>

    </div>;
  }
}

/*
floatingLabelFocusStyle={ floatingLabelFocusStyle }
floatingLabelStyle={ floatingLabelStyle }
<div className={ classes.buttonRoot }>
  <div
    style={ this.styles.buttonLink }
  >
    <Button
      style={{ minWidth: '20px', height: '20px' }}
      disabled={ showAsCurrency }
    >
      <div style={ this.styles.buttonText }>
        { xr.getRates(currency.toUpperCase())[xr.currency].symbol }
      </div>
    </Button>
  </div>
</div>
*/

/*
<Select
  disabled={ disabled || showAsCurrency }
  floatingLabelText={ labelCurrency || "Show as" }
  floatingLabelStyle={ floatingLabelStyle }
  iconStyle={ this.styles.selectorIcon }
  labelStyle={ Object.assign({
    paddingRight: "0px"
  }, inputStyle) } 
  onChange={ this.handleCurrencyChange }
  style={ selectStyle }
  value={ displayValue }
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
</Select>
*/

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

export default withStyles(componentStyles)(CoinSelector);

