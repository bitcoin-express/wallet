import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

import styles from '../helpers/Styles';
import Tools from '../helpers/Tools';

export class CurrencyRadioGroup extends React.Component {
  constructor(props) {
    super(props);

    this.tools = new Tools();

    this.styles = {
      iconStyle: {
        fill: "#303a54", //styles.colors.mainTextColor,
      },
      labelRadio: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        color: styles.colors.mainTextColor,
        fontSize: '16px',
        width: 'inherit',
        zIndex: '3',
      },
      radioButton: {
        width: 'auto',
        margin: '10px 0',
      },
      radioGroup: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      },
      radioLabel: {
        display: 'flex',
        flexWrap: 'nowrap',
        marginRight: '10px',
      },
    };
  }

  render() {
    let {
      active,
      currency,
      onChange,
    } = this.props;

    if (currency == 'BTC') {
      currency = "XBT";
    }

    return <RadioButtonGroup
      name="currency-type"
      defaultSelected={ currency }
      onChange={ onChange }
      style={ this.styles.radioGroup }
    >
      <RadioButton
        value="XBT"
        disabled={ active.indexOf("XBT") == -1 }
        label={ this.tools.getImageComponent("btce.png", 25, 25, "currencies/") }
        labelStyle={ this.styles.labelRadio }
        iconStyle={ this.styles.iconStyle }
        style={ this.styles.radioButton }
      />
      <RadioButton
        disabled={ active.indexOf("BCH") == -1 }
        value="BCH"
        label={ this.tools.getImageComponent("bche.png", 25, 25, "currencies/") }
        labelStyle={ this.styles.labelRadio }
        iconStyle={ this.styles.iconStyle }
        style={ this.styles.radioButton }
      />
      <RadioButton
        value="ETH"
        disabled={ active.indexOf("ETH") == -1 }
        label={ this.tools.getImageComponent("ethe.png", 25, 25, "currencies/") }
        labelStyle={ this.styles.labelRadio }
        iconStyle={ this.styles.iconStyle }
        style={ this.styles.radioButton }
      />
    </RadioButtonGroup>;
  }
}

CurrencyRadioGroup.defaultProps = {
  active: ["XBT", "ETH", "BCH"],
};

export default CurrencyRadioGroup;
