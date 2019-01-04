import React from 'react';

import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';

import BitcoinCurrency from './BitcoinCurrency'
import styles from '../helpers/Styles';


const componentStyles = (theme) => {
  const {
    colors,
  } = styles;

  return {
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
    resizeIcon: {
      width: '24px',
      height: '24px',
      cursor: 'pointer',
      padding: '4px 0 0 6px',
    },
    toolbar: {
      position: 'fixed',
      width: '100%',
      bottom: '0',
      zIndex: 100,
      height: `${styles.bottombarHeight}px`,
      backgroundColor: styles.colors.mainGrey,
      [theme.breakpoints.down('md')]: {
        padding: '0 5px 0 0',
      },
      [theme.breakpoints.up('md')]: {
        padding: '0 calc(5vw + 24px) 0 0',
      },
      [theme.breakpoints.up('lg')]: {
        padding: '0 calc(15vw + 24px) 0 0',
      },
      [theme.breakpoints.up('xl')]: {
        padding: '0 calc(15vw + 24px) 0 0',
      },
    },
    toolbarMin: {
      width: `${styles.minimizedWidth - 20}px`,
      height: `${styles.bottombarHeight}px`,
      borderRadius: '20px',
      backgroundColor: styles.colors.mainGrey,
      padding: '0 10px 0 5px',
      //padding: '0px !important',
    },
    total: {
      color: styles.colors.mainTextColor,
      fontFamily: "monospace, mono",
      fontSize: '18px',
      marginLeft: '10px',
    },
  };
};


class BottomBar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      total: 0.0,
      totalAvailable: false,
    };

    this.updateTotal = this.updateTotal.bind(this);
    this.getTotal = this.getTotal.bind(this);
  }

  componentDidCatch(error, info) {
    const {
      debug,
      snackbarUpdate,
    } = this.props;

    if (debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate(info, true);
  }

  componentDidMount() {
    this.updateTotal();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.balance != nextProps.balance) {
      this.updateTotal();
    }
  }

  updateTotal() {
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

  getTotal() {
    const {
      classes,
      showValuesInCurrency,
      xr,
    } = this.props;

    const {
      total,
      totalAvailable,
    } = this.state;

    let text = "not available";
    if (totalAvailable && !isNaN(total)) {
      text = "≈ " + xr.getCurrencySymbol() + total.toFixed(2);
    }
    return <div className={ classes.total }>
      { text } &nbsp;<i
        className="fa fa-university"
        onClick={ showValuesInCurrency }
        classes={{
          root: classes.icon,
        }}
        title="Display all in fiat"
      />
    </div>;
  }

  render() {
    const {
      classes,
      handleResizeClick,
      isFullScreen,
    } = this.props;

    if (this.state.hasError) {
      return null;
    }

    return <div style={ isFullScreen ? "" : classes.bottombar }>
      <Toolbar className={ isFullScreen ? classes.toolbar : classes.toolbarMin }>
        <div
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
              className={ classes.resizeIcon }
            />
          </div>
        </div>
        { this.getTotal() }
      </Toolbar>
    </div>;
  }
}

export default withStyles(componentStyles)(BottomBar);

