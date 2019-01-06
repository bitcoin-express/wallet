import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import SettingsMain from './SettingsMain';
import SettingsDisplay from './SettingsDisplay';
import SettingsEmail from './SettingsEmail';

import styles from '../../../helpers/Styles';

export default class Settings extends React.Component {

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
        borderRadius: '45px 22px',
        overflowX: 'hidden',
      },
    };

    this.renderContent = this.renderContent.bind(this);
    this.renderHeader = this.renderHeader.bind(this);
  }

  renderHeader() {
    const {
      display,
    } = this.state;

    const normal = {
      color: styles.colors.mainTextColor,
      fontSize: "12px !important",
    };
    const active = {
      color: styles.colors.mainBlue,
      fontSize: "12px !important",
    };

    let items = [
      <BottomNavigationAction
        key="settings"
        style={{
          minWidth: '40px',
        }}
        disabled={ display == 0 }
        icon={ <i
          className="fa fa-wrench"
          style={ display == 0 ? normal : active }
        /> }
        onClick={ () => this.setState({ display: 0 }) }
      />,
      <BottomNavigationAction
        key="display"
        style={{
          minWidth: '40px',
        }}
        disabled={ display == 1 }
        icon={ <i
          className="fa fa-sliders"
          style={ display == 1 ? normal : active }
        /> }
        onClick={ () => this.setState({ display: 1 }) }
      />,
      <BottomNavigationAction
        key="recovery"
        disabled={ display == 2 }
        icon={ <i
          className="fa fa-envelope"
          style={ display == 2 ? normal : active }
        /> }
        onClick={ () => this.setState({ display: 2 }) }
      />
    ];

    return (
      <BottomNavigation
        selectedIndex={ display }
        style={{
          background: styles.colors.mainColor,
        }}
      >
        { items }
      </BottomNavigation>    
    );
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

    let style = isFullScreen ? this.styles.fullscreen : this.styles.iframe;

    return (
      <span>
        <Paper zDepth={1}>
          { this.renderHeader() }
        </Paper>
        { this.renderContent() }
      </span>
    );
  }
}
