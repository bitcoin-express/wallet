import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';

import { AppContext } from "../AppContext";
import styles from '../helpers/Styles';


class SignInOut extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      auth: true,
      anchorEl: null,
    };

    this.styles = {
      anchorMenu: {
        vertical: 'top',
        horizontal: 'right',
      },
      icon: {
        color: styles.colors.mainTextColor,
        fontSize: '1.8em',
        cursor: 'pointer',
      }
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleMenu = this.handleMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleChange(event) {
    this.setState({ auth: event.target.checked });
  }

  handleMenu(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  render() {
    const {
      auth,
      anchorEl
    } = this.state;

    const {
      handleClickClose,
      handleClickSignout,
      iconsStyle,
      showSettings,
    } = this.props;

    const {
      isFullScreen,
    } = this.context;

    if (!auth) {
      return null;
    }

    const open = Boolean(anchorEl);
    const style = Object.assign({}, this.styles.icon, iconsStyle);

    return <div style={ iconsStyle }>
      { isFullScreen ? <IconButton
        aria-owns={open ? 'menu-appbar' : undefined}
        aria-label="Settings"
        color="inherit"
        onClick={ showSettings }
        style={{ backgroundColor: 'transparent' }}
      >
        <i
          className="fa fa-cog"
          id="settings-header"
          aria-hidden="true"
        />
      </IconButton> : null }
      <IconButton
        aria-owns={open ? 'menu-appbar' : undefined}
        aria-haspopup="true"
        aria-label="Wallet options"
        color="inherit"
        onClick={ this.handleMenu }
        style={{ backgroundColor: 'transparent' }}
      >
        <i
          className="fa fa-power-off"
          aria-hidden="true"
        />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={ anchorEl }
        anchorOrigin={ this.styles.anchorMenu }
        transformOrigin={ this.styles.anchorMenu }
        open={ open }
        onClose={ this.handleClose }
      >
        <MenuItem onClick={ handleClickClose }>
          Close
        </MenuItem>
        <MenuItem onClick={ handleClickSignout }>
          Sign Out
        </MenuItem>
      </Menu>
    </div>;
  }
}

SignInOut.contextType = AppContext;

export default SignInOut;

