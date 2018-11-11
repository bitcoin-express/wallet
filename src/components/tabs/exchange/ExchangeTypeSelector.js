import React from 'react';
import PropTypes from 'prop-types';

import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

import HelpTooltip from '../../HelpTooltip';
import styles from '../../../helpers/Styles';

export default class ExchangeTypeSelector extends React.Component {

  constructor(props) {
    super(props);

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);
  }

  componentWillUpdate(nextProps, nextState) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {

    let section = {
      margin: '0',
      padding: '15px 25px',
      borderRadius: '10px',
      backgroundColor: styles.colors.thirdBlue,
      boxShadow: 'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
    };
    if (!props.isFullScreen) {
      section = {
        padding: '0 0 10px 10px',
        borderBottom: `${styles.colors.mainTextColor} 1px solid`,
      };
    }

    this.styles = {
      iconStyle: {
        fill: styles.colors.mainTextColor,
      },
      iconTooltip: {
        verticalAlign: 'baseline',
        color: styles.colors.mainTextColor,
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
        marginRight: props.isFullScreen ? '10px' : '0',
      },
      section,
    };
  }

  render() {
    const {
      type,
      onChangeType,
      wallet,
    } = this.props;

    const issuer = wallet.getSettingsVariable(wallet.config.DEFAULT_ISSUER);

    const issuerRadioLabel = <div style={ this.styles.radioLabel }>
      <div>
        Exchange with&nbsp;
        <span style={{ textDecoration: 'underline' }}>
          { issuer }
        </span>
      </div>
      <HelpTooltip
        iconStyle={ this.styles.iconTooltip }
        note={ `Exchange directly with this Issuer using 
          the rates published by them.` }
      />
    </div>;

    const personRadioLabel = <div style={ this.styles.radioLabel }>
      <div>
        Exchange with other
      </div>
      <HelpTooltip
        iconStyle={ this.styles.iconTooltip }
        note={ <div>
          When you wish to swap Coins with a third party, start the EXCHANGE process then download the swap file and send it to the other person.<br />
          The other person must drop the file on their Wallet and complete the swap by authorising their Coins to be swapped.
        </div> }
      />
    </div>;

    return <div style={ this.styles.section }>
      <RadioButtonGroup
        name="exchange-type"
        defaultSelected={ type }
        onChange={ onChangeType }
        style={ this.styles.radioGroup }
      >
        <RadioButton
          value="issuer"
          label={ issuerRadioLabel }
          labelStyle={ this.styles.labelRadio }
          iconStyle={ this.styles.iconStyle }
          style={ this.styles.radioButton }
        />
        <RadioButton
          value="person"
          label={ personRadioLabel }
          labelStyle={ this.styles.labelRadio }
          iconStyle={ this.styles.iconStyle }
          style={ this.styles.radioButton }
        />
      </RadioButtonGroup>
    </div>;
  }
}
