import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';

import Logo from '../Logo';

import styles from '../../helpers/Styles';

const marginLeftMinBar = 24;
const marginRightMinBar = 0;

export default class AppNavDrawer extends React.Component {

  constructor(props) {
    super(props);
    this.styles = {
      logo: {
        marginTop: '25px',
        marginBottom: '-20px',
      },
      drawer: {
        background: styles.colors.mainColor,
      },
      drawerMin: {
        background: styles.colors.mainColor,
        left: `${marginLeftMinBar}px`,
        top: '113px',
        borderRadius: '0px 0px 45px 18px',
        height: `${styles.minimizedHeight - styles.appbarHeight - styles.tabsHeight}px`,
        width: `${styles.minimizedWidth - marginRightMinBar}px`,
        position: 'absolute',
      },
      versionText: {
        color: styles.colors.mainTextColor,
        fontFamily: styles.fontFamily,
      },
    };
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
  }

  handleOverlayClick(open, reason) {
    this.props.onOverlayClick();
  }

  render() {
    const {
      items,
      isFullScreen,
    } = this.props;

    let menuItems = [];
    items.forEach((item) => {
      menuItems.push(
        <MenuItem
          key={ item.key }
          onClick={ item.fn }
          rightIcon={ item.icon }
          style={ item.style }
        >
          { item.text }
        </MenuItem>
      );

      if (item.divider) {
        menuItems.push(<Divider key={ `div-${item.key}` }/>);
      }
    });

    const widthMinBar = styles.minimizedWidth - marginRightMinBar + marginLeftMinBar;

    return(
      <Drawer
        className="settings-drawer"
        docked={ false }
        open={ this.props.open }
        containerStyle={ isFullScreen ? this.styles.drawer : this.styles.drawerMin }
        overlayStyle={ isFullScreen ? null : {
          opacity: '0',
        }}
        width={ isFullScreen ? styles.navDrawerWidth : widthMinBar }
        onRequestChange={ this.handleOverlayClick }
      >
        { isFullScreen ? <MenuItem
            key="version"
            disabled={ true }
            style={{ cursor: 'arrow', textAlign: 'center' }}
          >
            <div style={ this.styles.logo }>
              <Logo
                width="40%"
                height="40%"
                style={{ opacity: '0.8' }}
              />
            </div>
            <small style={ this.styles.versionText }>
              v{ window.version }
            </small>
          </MenuItem> : null
        }
        <Divider key="div-first" />
        { menuItems }
      </Drawer>
    );
  }
}

