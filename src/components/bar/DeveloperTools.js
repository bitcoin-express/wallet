import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Paper from '@material-ui/core/Paper';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../../AppContext";
import SettingsDisplay from './settings/SettingsDisplay';
import SettingsEmail from './settings/SettingsEmail';
import SettingsMain from './settings/SettingsMain';
import ToolsComponent from './settings/ToolsComponent';


const componentStyles = (theme) => {
  return {
    paper: {
      width: '340px',
    },
    paperMin: {
      marginTop: '24px',
      marginRight: '16px',
      height: 'calc(100% - 40px)',
      textAlign: 'left',
      width: '312px',
      borderRadius: '45px 13px',
      overflowX: 'hidden',
    },
  };
};


class DeveloperTools extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      display: 0, // 0 - display. 1 - email. 2 - settings
    };

    this.renderContent = this.renderContent.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
  }

  renderHeader() {
    const {
      onClickClose,
      type,
    } = this.props;

    let items = [
      <BottomNavigationAction
        label="Close"
        key="close"
        style={{ minWidth: '40px' }}
        icon={ <i className="fa fa-times" /> }
        onClick={ onClickClose }
      />
    ];

    if (type == 0) {
      const { display } = this.state;

      items = [
        <BottomNavigationAction
          key="settings"
          disabled={ display == 0 }
          icon={ <i className="fa fa-wrench" /> }
          onClick={ () => this.setState({ display: 0 }) }
        />,
        <BottomNavigationAction
          key="display"
          disabled={ display == 1 }
          icon={ <i
            className="fa fa-sliders"
          /> }
          onClick={ () => this.setState({ display: 1 }) }
        />,
        <BottomNavigationAction
          key="recovery"
          disabled={ display == 2 }
          icon={ <i className="fa fa-envelope" /> }
          onClick={ () => this.setState({ display: 2 }) }
        />,
        <BottomNavigationAction
          key="close"
          icon={ <i className="fa fa-times" /> }
          onClick={ onClickClose }
        />
      ];

      return <BottomNavigation value={ display }>
        { items }
      </BottomNavigation>;
    }

    return <BottomNavigation>
      { items }
    </BottomNavigation>;
  }

  renderSettings() {
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

  renderContent() {
    const {
      type,
    } = this.props;

    switch (type) {
      case 0:
        return this.renderSettings();
      case 1:
        return <ToolsComponent { ...this.props } />;
    }
  }

  render() {
    const {
      classes,
      open,
      content,
    } = this.props;

    const {
      isFullScreen,
    } = this.context;

    return <SwipeableDrawer
      anchor="right"
      classes={{
        paper: isFullScreen ? classes.paper : classes.paperMin
      }}
      variant={ isFullScreen ? 'temporary' : 'persistent' }
      open={ open }
      onOpen={() => {}}
      onClose={() => {}}
    >
      { this.renderHeader() }
      { this.renderContent() }
    </SwipeableDrawer>;
  }
}

DeveloperTools.contextType = AppContext;

export default withStyles(componentStyles)(DeveloperTools);

