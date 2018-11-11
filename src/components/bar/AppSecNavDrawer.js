import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Drawer from 'material-ui/Drawer';
import Paper from 'material-ui/Paper';
import {
  BottomNavigation,
  BottomNavigationItem
} from 'material-ui/BottomNavigation';

import SettingsMain from './settings/SettingsMain';
import SettingsDisplay from './settings/SettingsDisplay';
import SettingsEmail from './settings/SettingsEmail';
import DeveloperTools from './settings/DeveloperTools';

export default class AppSecNavDrawer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      display: 0, // 0 - display. 1 - email. 2 - settings
    };

    this.styles = {
      fullscreen: {},
      iframe: {
        marginTop: '24px',
        marginRight: '16px',
        height: 'calc(100% - 40px)',
        textAlign: 'left',
        width: '252px',
        //width: 'calc(100% - 47px)',
        borderRadius: '45px 13px',
        overflowX: 'hidden',
      },
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
      <BottomNavigationItem
        label="Close"
        key="close"
        style={{ minWidth: '40px' }}
        icon={ <i className="fa fa-times" /> }
        onClick={ onClickClose }
      />
    ];

    if (type == 0) {
      const { display } = this.state;
      const color = {
        color: "#8081ff",
        fontSize: "12px !important",
      };
      const color2 = {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: "12px !important",
      };

      items = [
        <BottomNavigationItem
          key="settings"
          style={{
            minWidth: '40px',
          }}
          disabled={ display == 0 }
          icon={ <i
            className="fa fa-wrench"
            style={ display == 0 ? color : color2 }
          /> }
          onClick={ () => this.setState({ display: 0 }) }
        />,
        <BottomNavigationItem
          key="display"
          style={{
            minWidth: '40px',
          }}
          disabled={ display == 1 }
          icon={ <i
            className="fa fa-sliders"
            style={ display == 1 ? color : color2 }
          /> }
          onClick={ () => this.setState({ display: 1 }) }
        />,
        <BottomNavigationItem
          key="recovery"
          disabled={ display == 2 }
          icon={ <i
            className="fa fa-envelope"
            style={ display == 2 ? color : color2 }
          /> }
          onClick={ () => this.setState({ display: 2 }) }
        />,
        <BottomNavigationItem
          key="close"
          style={{
            minWidth: '40px',
          }}
          icon={ <i
            className="fa fa-times"
            style={ color2 }
          /> }
          onClick={ onClickClose }
        />
      ];

      return (
        <BottomNavigation
          selectedIndex={ display }
        >
          { items }
        </BottomNavigation>    
      );
    }

    return (
      <BottomNavigation>
        { items }
      </BottomNavigation>    
    );
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
        // settings
        return this.renderSettings();
      case 1:
        return (
          <DeveloperTools
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

    let style = isFullScreen ? this.styles.fullscreen : this.styles.iframe;

    return (
      <Drawer
        width={ 340 }
        openSecondary={ true }
        open={ open }
        containerStyle={ style }
      >
        <Paper zDepth={1}>
          { this.renderHeader() }
        </Paper>
        { this.renderContent() }
      </Drawer>
    );
  }
}
