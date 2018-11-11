import React from 'react';

import {
  Toolbar,
  ToolbarGroup,
} from 'material-ui/Toolbar';

import BitcoinCurrency from './BitcoinCurrency'

import styles from '../helpers/Styles';

export default class BottomBar extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      bottombar: {
        position: 'absolute',
        top: styles.minimizedHeight - 12,
        width: `${styles.minimizedWidth - 20}px`,
        backgroundColor: 'transparent',
        zIndex: 100,
        borderRadius: '50px 0',
      },
      icon: {
        color: styles.colors.mainTextColor,
        cursor: 'pointer',
      },
      toolbar: {
        position: 'fixed',
        width: '100%',
        bottom: '0',
        zIndex: 100,
        height: `${styles.bottombarHeight}px`,
        backgroundColor: styles.colors.mainGrey,
      },
      toolbarMin: {
        width: `${styles.minimizedWidth - 20}px`,
        height: `${styles.bottombarHeight}px`,
        borderRadius: '20px',
        backgroundColor: styles.colors.mainGrey,
        padding: '0px !important',
      },
      total: {
        color: styles.colors.mainTextColor,
        fontFamily: "monospace, mono",
        fontSize: '18px',
        marginLeft: '10px',
      },
    };

    this.state = {
      total: 0.0,
      totalAvailable: false,
    };

    this._updateTotal = this._updateTotal.bind(this);
  }

  componentWillMount() {
    this._updateTotal();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.balance != nextProps.balance) {
      this._updateTotal();
    }
  }

  _updateTotal() {
    const {
      wallet,
      xr,
    } = this.props;

    wallet.getTotalFiatBalance(xr).then((total) => {
      if (!total) {
        this.setState({
          total: 0.0,
          totalAvailable: false,
        });
      }

      this.setState({
        total,
        totalAvailable: true,
      });
    });
  }

  render() {
    let {
      handleResizeClick,
      isFullScreen,
      showValuesInCurrency,
      xr,
    } = this.props;

    const {
      total,
      totalAvailable,
    } = this.state;

    let totalText = "not available";
    if (totalAvailable && total) {
      totalText = "≈ " + xr.getCurrencySymbol() + total.toFixed(2);
    }

    return (
      <div style={ isFullScreen ? {} : this.styles.bottombar }>
        <Toolbar
          style={ isFullScreen ? this.styles.toolbar : this.styles.toolbarMin }
          className={ isFullScreen ? "appbar bottom" : "appbar minimized" }
        >
          <ToolbarGroup
            firstChild={ true }
            style={{
              marginLeft: '0',
            }}
          >
            <div
              className={ isFullScreen ? "fullscreen" : "" }
              onClick={ (event) => {
                event.preventDefault();
                handleResizeClick();
              }}
            >
              <img
                src={ `css/img/resize_${isFullScreen ? 'down' : 'up'}.svg` }
                title={ isFullScreen ? 'Resize down' : 'Resize up' }
                style={{
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  padding: '4px 0 0 6px',
                }}
              />
            </div>
          </ToolbarGroup>
          <ToolbarGroup style={ this.styles.total }>
            { totalText } &nbsp;<i
              className="fa fa-university"
              onClick={ showValuesInCurrency }
              style={ this.styles.icon }
              title="Display all in fiat"
            />
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }
}
