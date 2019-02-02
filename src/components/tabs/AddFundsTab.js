import React from 'react';
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import AddFundsDialog from '../dialogs/AddFundsDialog';
import { AppContext } from "../../AppContext";


const componentStyles = (theme) => {
  return {
    buttonLeft: {
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
      [theme.breakpoints.up('sm')]: {
        textAlign: 'right',
      },
    },
    buttonRight: {
      [theme.breakpoints.down('xs')]: {
        textAlign: 'center',
      },
      [theme.breakpoints.up('sm')]: {
        textAlign: 'left',
      },
    },
    buttons: {
      marginBottom: '5px',
    },
    buttonsMin: {
      marginBottom: '45px',
    },
    button: {
      margin: '25px 0',
      textAlign: 'center',
    },
    buttonMin: {
      margin: '25px 0 45px',
      textAlign: 'center',
    },
    root: {
      color: "white",
      fontFamily: "Roboto, sans-serif",
    },
  }
};


class AddFundsTab extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      depositRef: null,
      hasError: false,
    };

    this.renderButtons = this.renderButtons.bind(this);
    this.updateDepositRef = this.updateDepositRef.bind(this);
  }


  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet && wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate(info.componentStack, "error");
  }


  componentWillMount() {
    this.updateDepositRef();
  }


  updateDepositRef() {
    this.context.wallet.getDepositRef().then((depositRef) => {
      this.setState({
        depositRef,
      });
    });
  }

  renderButtons() {
    let {
      classes,
      handleClickDeposit,
      handleRemoveDepositRef,
      issueCollect,
    } = this.props;

    const {
      isFullScreen,
    } = this.context;

    if (!this.state.depositRef) {
      return <div className={ isFullScreen ? classes.button : classes.buttonMin }>
        <Button
          key="get-address"
          onClick={ handleClickDeposit.bind(this, true, this.updateDepositRef) }
          variant="contained"
        >
          GET ADDRESS
        </Button>
      </div>;
    }

    return <Grid
      alignItems="center"
      className={ isFullScreen ? classes.buttons : classes.buttonsMin }
      container
      justify="center"
      spacing={8}
    >
      <Grid item xs={12} sm={6} className={ classes.buttonLeft }>
        <Button
          key="forget-address"
          onClick={ handleRemoveDepositRef.bind(this, true, this.updateDepositRef) }
          variant="contained"
        >
          FORGET ADDRESS
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} className={ classes.buttonRight }>
        <Button
          key="collect-coins"
          onClick={ issueCollect.bind(this, true, this.updateDepositRef) }
          variant="contained"
        >
          COLLECT COINS
        </Button>
      </Grid>
    </Grid>;
  }


  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      classes,
      isFlipped,
    } = this.props;

    const {
      depositRef,
    } = this.state;

    return <div className={ classes.root }> 
      <AddFundsDialog
        {...this.props }
        depositRef={ depositRef }
        isTab={ true }
        qrLabel="QR2"
        buttons={ this.renderButtons() }
      />
    </div>;
  }
};

AddFundsTab.contextType = AppContext;


export default withStyles(componentStyles)(AddFundsTab);

