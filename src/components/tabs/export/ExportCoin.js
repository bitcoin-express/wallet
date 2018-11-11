import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import RaisedButton from 'material-ui/RaisedButton';
import CoinSelector from '../../CoinSelector';
import EncryptSelector from '../../EncryptSelector';
import FormArea from '../../FormArea';

class ExportCoin extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      amount: "",
      currency: 1,
      password: "",
      encrypted: false,
    };

    this.styles = {
      button: {
        width: '100%',
        margin: '25px 0 10px 0',
      },
      form: {
        padding: '5px 10px 5px 10px',
        borderWidth: '1px',
        borderColor: 'rgba(102, 102, 102, 0.24)',
        borderRadius: '4px',
        borderStyle: 'solid',
        margin: '5px 5px 20px', 
      }
    };

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
  }

  handleAmountChange(amount, currency) {
    this.setState({ amount, currency });
  }

  handlePasswordChange(password, encrypted) {
    this.setState({ password, encrypted });
  }

  render() {
    const {
      amount,
      currency
    } = this.state;

    return (
      <FormArea>
        <span>
          <p>Export your coin into a json file.</p>
          <CoinSelector
            xr={ this.props.xr }
            onAmountChange={ this.handleAmountChange }
          />
          <EncryptSelector
            onPasswordChange={ this.handlePasswordChange }
          />
          <RaisedButton
            label="Export Coin"
            disabled={ true }
            primary={ true }
            style={ this.styles.button }
          />
        </span>
      </FormArea>
    );
  }
}

ExportCoin.propTypes = {
  //wallet: PropTypes.object.isRequired,
};

export default ExportCoin;
