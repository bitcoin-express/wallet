import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

class AddCoinsIfAbsentDialog extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      open,
      onCloseClick,
      onConfirmClick
    } = this.props;

    const actions = [
      <Button
        id="alert-confirm"
        label="Add Coins"
        primary={ true }
        onTouchTap={ onConfirmClick }
      />,
      <Button
        id="alert-cancel"
        label="Do not add Coins"
        secondary={ true }
        onTouchTap={ onCloseClick }
      />
    ];

    return (
      <Dialog
        title="Seems you have some coins in your actual wallet"
        actions={ actions }
        modal={ false }
        open={ open }
        onRequestClose={ onCloseClick }
      >
        Do you want to add those coins if absent in your new wallet? 
      </Dialog>
    );
  }
}

AddCoinsIfAbsentDialog.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  onConfirmClick: PropTypes.func.isRequired,
};

AddCoinsIfAbsentDialog.defaultProps = {
  open: false,
};

export default AddCoinsIfAbsentDialog;
