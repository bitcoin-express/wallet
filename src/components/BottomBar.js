import React from 'react';

import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../AppContext";
import BitcoinCurrency from './BitcoinCurrency'
import styles from '../helpers/Styles';


const componentStyles = (theme) => {
  const {
    colors,
  } = styles;

  return {
    appBarColor: {
      backgroundColor: styles.colors.mainGrey,
    },
    appBar: {
      top: 'auto',
      bottom: 0,
      height: `${styles.bottombarHeight}px`,
    },
    appBarMin: {
      borderRadius: '20px',
      bottom: '0',
      height: `${styles.bottombarHeight}px`,
      position: 'absolute',
      right: 'inherit',
      top: 'auto',
      width: '290px',
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
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: `${styles.bottombarHeight}px`,
      [theme.breakpoints.down('xs')]: {
        padding: '0 24px 0 24px',
      },
      [theme.breakpoints.up('xs')]: {
        padding: '0 24px',
      },
      [theme.breakpoints.up('md')]: {
        padding: '0 calc(5vw + 24px)',
      },
      [theme.breakpoints.up('lg')]: {
        padding: '0 calc(15vw + 24px)',
      },
      [theme.breakpoints.up('xl')]: {
        padding: '0 calc(20vw + 24px)',
      },
    },
    toolbarMin: {
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: `${styles.bottombarHeight}px`,
      paddingLeft: '0px',
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
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate("Error on rendering component", true);
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
    } = this.context;

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
    } = this.props;

    const {
      showValuesInCurrency,
      xr,
    } = this.context;

    const {
      total,
      totalAvailable,
    } = this.state;

    let text = "not available";
    if (totalAvailable && !isNaN(total)) {
      text = "≈ " + xr.getCurrencySymbol() + parseFloat(total).toFixed(2);
    }
    return <div className={ classes.total }>
      { text } &nbsp;<i
        className={ "fa fa-university " + classes.icon }
        onClick={ showValuesInCurrency }
        title="Display all in fiat"
      />
    </div>;
  }

  render() {
    const {
      classes,
      handleResizeClick,
    } = this.props;

    const {
      isFullScreen,
    } = this.context;

    if (this.state.hasError) {
      return null;
    }

    return <AppBar
      position="fixed"
      color="primary"
      classes={{
        root: isFullScreen ? classes.appBar : classes.appBarMin,
        colorPrimary: classes.appBarColor,
      }}
    >
      <Toolbar className={ isFullScreen ? classes.toolbar : classes.toolbarMin }>
        <IconButton
          aria-label={ isFullScreen ? 'Resize down' : 'Resize up' }
          color="inherit"
          style={{ backgroundColor: 'transparent' }}
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
        </IconButton>
        <div>
          { this.getTotal() }
        </div>
      </Toolbar>
    </AppBar>;
  }
}

BottomBar.contextType = AppContext;

export default withStyles(componentStyles)(BottomBar);

