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

import Logo from '../Logo';

const marginLeftMinBar = 24;
const marginRightMinBar = 0;


const componentStyles = (theme) => {

  const {
    appbarHeight,
    colors,
    fontFamily,
    minimizedHeight,
    minimizedWidth,
    marginRightMinBar,
    navDrawerWidth,
    tabsHeight,
  } = styles;

  return {
    paper: {
      background: colors.mainColor,
      width: `${navDrawerWidth}px`,
    },
    paperMin: {
      borderRadius: '0px 0px 45px 18px',
      height: `${minimizedHeight - appbarHeight - tabsHeight}px`,
      position: 'absolute',
      top: '113px',
      width: `${minimizedWidth - marginRightMinBar}px`,
    },
    root: {},
    rootMin: {
      left: `${marginLeftMinBar}px`,
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

  handleOverlayClick(open, reason) {
    this.props.onOverlayClick();
  }

  render() {
    const {
      classes,
      items,
      isFullScreen,
      open,
    } = this.props;

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

    const widthMinBar = styles.minimizedWidth - marginRightMinBar + marginLeftMinBar;

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
      open={ open }
      width={ isFullScreen ? styles.navDrawerWidth : widthMinBar }
      onClose={ this.handleOverlayClick }
    >
      <List>
        { isFullScreen ? fullScreenHeader : null }
        { menuItems }
      </List>
    </Drawer>;
  }
}

/*
 overlayStyle={ isFullScreen ? null : {
  opacity: '0',
 }}
 className="settings-drawer"
*/
export default withStyles(componentStyles, { withTheme: true })(NavigationDrawer);

