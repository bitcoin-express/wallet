import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import { withStyles } from '@material-ui/core/styles';

import SettingsMain from './SettingsMain';
import SettingsDisplay from './SettingsDisplay';
import SettingsEmail from './SettingsEmail';
import styles from '../../../helpers/Styles';


const componentStyles = (theme) => {
  const {
    colors,
  } = styles;

  return {
    icon: {
      color: colors.mainTextColor,
      fontSize: "20px !important",
      margin: "0 !important",
    },
    iconActive: {
      color: "rgb(128, 131, 145)",
      fontSize: "20px",
    },
    rootMenu: {
      background: "rgb(176, 182, 201)",
    },
  };
};


class Settings extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      display: 0, // 0 - display. 1 - email. 2 - settings
    };

    this.renderContent = this.renderContent.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  renderHeader() {
    const {
      display,
    } = this.state;

    const {
      classes,
    } = this.props;

    return <BottomNavigation
      selectedIndex={ display }
      className={ classes.rootMenu }
    >
      <BottomNavigationAction
        label="settings"
        disabled={ display == 0 }
        icon={ <i
          className={ "fa fa-wrench " + (display == 0 ? classes.icon : classes.iconActive) }
        /> }
        onClick={ () => this.setState({ display: 0 }) }
      />

      <BottomNavigationAction
        label="display"
        disabled={ display == 1 }
        icon={ <i
          className={ "fa fa-sliders " + (display == 1 ? classes.icon : classes.iconActive) }
        /> }
        onClick={ () => this.setState({ display: 1 }) }
      />

      <BottomNavigationAction
        disabled={ display == 2 }
        label="notifications"
        icon={ <i
          className={ "fa fa-envelope " + (display == 2 ? classes.icon : classes.iconActive) }
        /> }
        onClick={ () => this.setState({ display: 2 }) }
      />
    </BottomNavigation>;
  }

  renderContent() {
    switch (this.state.display) {
      case 0:
        return (
          <SettingsMain
            { ...this.props }
          />
        );
      case 1:
        return (
          <SettingsDisplay
            { ...this.props }
          />
        );
      case 2:
        return (
          <SettingsEmail
            { ...this.props }
          />
        );
    }
  }

  render() {
    const {
      open,
      content,
      isFullScreen,
    } = this.props;

    return <React.Fragment>
      <Paper zDepth={1}>
        { this.renderHeader() }
      </Paper>
      { this.renderContent() }
    </React.Fragment>;
  }
}


export default withStyles(componentStyles)(Settings);

