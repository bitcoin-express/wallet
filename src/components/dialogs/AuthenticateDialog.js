import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';

import styles from '../../helpers/Styles';

class AuthenticateDialog extends React.Component {
  constructor(props) {
    super(props);

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  handlePasswordChange(ev, pwd) {
    const {
      onPasswordChange,
    } = this.props;

    onPasswordChange(pwd);
  }

  render() {
    return <div style={{ marginTop: '20px' }}>
      <p style={{ textAlign: 'center' }}>
        Your wallet and coins are protected and encrypted by a password previously set.<br/>
        To unlock the wallet, type it and click on the "OK" button.
      </p>
      <TextField
        floatingLabelText="Your Authentication Password"
        floatingLabelFocusStyle={{
          color: "grey",
        }}
        floatingLabelStyle={{
          color: "grey",
        }}
        inputStyle={{
          color: "black",
        }}
        style={{
          width: '70%',
          margin: '0 15%',
        }}
        type="password"
        onChange={ this.handlePasswordChange }
      />
    </div>;
  }
}

AuthenticateDialog.defaultProps = {}

export default AuthenticateDialog;
