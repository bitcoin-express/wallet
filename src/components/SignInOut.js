import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import IconMenu from 'material-ui/IconMenu';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';

import styles from '../helpers/Styles';

class SignInOut extends React.Component {

  constructor(props) {
    super(props);
    this.styles = {
      icon: {
        color: styles.colors.mainTextColor,
        fontSize: '1.8em',
        cursor: 'pointer',
        marginTop: '10px',
        marginRight: '35px',
      }
    };
  }

  render() {
    return (<IconMenu
      iconButtonElement={
        <FlatButton
          hoverColor="transparent"
          label={<i
            className="fa fa-power-off"
            style={ this.styles.icon }
          />}
        />
      }
      targetOrigin={{horizontal: 'right', vertical: 'top'}}
      anchorOrigin={{horizontal: 'right', vertical: 'top'}}
    >
      <MenuItem
        primaryText="Close"
        onClick={ this.props.onCloseTouchTap }
      />
      <MenuItem
        primaryText="Remove"
        onClick={ this.props.onSignOutTouchTap }
      />
    </IconMenu>);
  }
}

export default SignInOut;
