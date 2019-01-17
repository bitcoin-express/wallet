import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import styles from '../../helpers/Styles';
import { AppContext } from "../../AppContext";
import Logo from '../Logo';


const componentStyles = (theme) => {

  const {
    appbarHeight,
    colors,
    fontFamily,
    minimizedHeight,
    navDrawerWidth,
    tabsHeight,
  } = styles;

  return {
    backdrop: {
      opacity: '0 !important',
    },
    paper: {
      background: colors.mainColor,
      width: `${navDrawerWidth}px`,
    },
    paperMin: {
      background: colors.mainColor,
      borderRadius: '0px 0px 45px 18px',
      height: `${minimizedHeight - appbarHeight - tabsHeight}px`,
      position: 'absolute',
      top: '113px',
      width: '310px',
    },
    root: {},
    rootMin: {
      left: '24px',
    },
    iconHeader: {
      display: 'block',
      marginTop: '25px',
      textAlign: 'center',
    },
    versionText: {
      color: styles.colors.mainTextColor,
      fontFamily: styles.fontFamily,
      textAlign: 'center',
      fontSize: '0.85em',
      width: '100%',
    },
    item: {
      color: colors.mainTextColor,
      fontFamily: fontFamily,
      textAlign: 'left',
      height: 'inital',
    },
    itemGD: {
      color: colors.darkBlue,
      fontFamily: fontFamily,
      textAlign: 'left',
      height: 'inital',
    },
    itemIcon: {
      color: colors.mainTextColor,
      cursor: 'arrow',
      fontSize: '1.5em',
    }
  };
};


class NavigationDrawer extends React.Component {

  constructor(props) {
    super(props);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.props;

    if (wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate("Error on rendering navigation drawer", true);
  }

  handleOverlayClick(open, reason) {
    this.props.onOverlayClick();
  }

  render() {
    const {
      classes,
      items,
      open,
    } = this.props;

    const {
      isFullScreen,
    } = this.context;

    let menuItems = [];
    items.forEach((item) => {
      menuItems.push(
        <ListItem
          key={ item.key }
          onClick={ item.fn }
          button
        >
          <ListItemText
            primary={ item.text }
            classes={{
              primary: item.isGDrive ? classes.itemGD : classes.item,
            }}
          />
          <ListItemIcon
            classes={{
              root: classes.itemIcon,
            }}
          >
            { item.icon }
          </ListItemIcon>
        </ListItem>
      );

      if (item.divider) {
        menuItems.push(<Divider key={ `div-${item.key}` }/>);
      }
    });


    let fullScreenHeader = [];

    fullScreenHeader.push(<ListItem
      key="logo"
      classes={{
        root: classes.iconHeader,
      }}
    >
      <Logo
        width="40%"
        height="40%"
        style={{ opacity: '0.8' }}
      />
    </ListItem>);

    fullScreenHeader.push(<ListItem
      key="version"
    >
      <ListItemText
        primary={ `v${window.version}` }
        classes={{
          primary: classes.versionText,
        }}
      />
    </ListItem>);

    fullScreenHeader.push(<Divider key="div-first" />);

    return <Drawer
      classes={{
        root: isFullScreen ? classes.root : classes.rootMin,
        paper: isFullScreen ? classes.paper : classes.paperMin,
      }}
      id="settings-drawer"
      open={ open }
      ModalProps={ isFullScreen ? {} : {
        BackdropProps:{
          classes:{
            root: classes.backdrop,
          }
        }
      } }
      onClose={ this.handleOverlayClick }
    >
      <List>
        { isFullScreen ? fullScreenHeader : null }
        { menuItems }
      </List>
    </Drawer>;
  }
}

NavigationDrawer.contextType = AppContext;

export default withStyles(componentStyles, { withTheme: true })(NavigationDrawer);

