import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from  '@material-ui/core/FormControlLabel';

import styles from '../helpers/Styles';
import Tools from '../helpers/Tools';

// TO_DO: Get it from wallet initial settings
const availableCurrencies = ["XBT", "ETH", "BCH"];

const componentStyles = () => {
  return {
    root: {
      justifyContent: 'space-between',
    },
  };
};


class CurrencyRadioGroup extends React.Component {

  constructor(props) {
    super(props);

    this.tools = new Tools();
    this.onChange = this.onChange.bind(this);

    this.state = {
      currency: props.currency == 'BTC' ? 'XBT' : props.currency,
    };
  }

  onChange(event) {
    const {
      onChange,
    } =  this.props;

    this.setState({ currency: event.target.value });
    onChange(event.target.value);
  }

  render() {
    let {
      active,
      classes,
      onChange,
    } = this.props;

    return <RadioGroup
      name="currency-type"
      className={ classes.root }
      value={ this.state.currency }
      onChange={ this.onChange }
      row
    >
      {availableCurrencies.map((key) => {
        let img = key == "XBT" ? "btc" : key.toLowerCase();
        img += "e.png";

        // TO_DO: invalid color for radio...
        // color={ styles.colors.mainTextColor }
        // must be "primary", "secondary", "default"

        return <FormControlLabel
          control={<Radio />}
          disabled={ active.indexOf(key) == -1 }
          key={ key }
          value={ key }
          label={ this.tools.getImageComponent(img, 25, 25, "currencies/") }
        />;
      })}
    </RadioGroup>;
  }
}

CurrencyRadioGroup.defaultProps = {
  active: availableCurrencies,
};

export default withStyles(componentStyles)(CurrencyRadioGroup);

