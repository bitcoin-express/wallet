import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

class PassphraseDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      passphrase: null
    }

    this.handleConfirmButton = this.handleConfirmButton.bind(this);
  }

  handleConfirmButton() {
    const { handleConfirm } = this.props
    handleConfirm(this.state.passphrase)
  }

  render() {
    const { opened, handleClose } = this.props;
    const { passphrase } = this.state

    const actions = [
      <Button
        id="passphrase-cancel"
        label="Cancel"
        primary={ true }
        onTouchTap={ handleClose }
      />,
      <Button
        id="passphrase-ok"
        label="OK"
        disabled={ passphrase == null }
        primary={ true }
        keyboardFocused={ true }
        onTouchTap={ this.handleConfirmButton }
      />,
    ];

    return (
      <Dialog
        title="The coins in this file are protected by a passphrase"
        actions={ actions }
        modal={ false }
        open={ opened }
        onRequestClose={ handleClose }
      >
        <TextField
          hintText="Passphrase"
          ref="passphrase"
          onChange={ (ev, passphrase) => this.setState({ passphrase }) }
          floatingLabelText="Please enter Passphrase"
          type="password"
        />
      </Dialog>
    );
  }
}

PassphraseDialog.propTypes = {
  opened: PropTypes.bool,
  handleClose: PropTypes.func,
  handleConfirm: PropTypes.func.isRequired,
};

PassphraseDialog.defaultProps = {
  opened: false,
};

export default PassphraseDialog;
