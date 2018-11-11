import React, {Component} from 'react';
import PropTypes from 'prop-types';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';

import BitcoinCurrency from '../BitcoinCurrency';
import EncryptSelector from '../EncryptSelector';

import Time from '../../helpers/Time';
import styles from '../../helpers/Styles';

class ExchangeDialog extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return <div>
      hoohoojola
    </div>;
  }
};

ExchangeDialog.defaultProps = {
  showButtons: true,
};

export default ExchangeDialog;
