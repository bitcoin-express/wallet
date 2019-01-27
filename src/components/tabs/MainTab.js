import React, {Component} from 'react';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../../AppContext";
import CoinsTable from './main/CoinsTable';
import FormArea from '../FormArea';
import ItemsTable from './main/ItemsTable';
import styles from '../../helpers/Styles';


const componentStyles = (theme) => {
  return {
    root: {
      color: styles.colors.mainTextColor,
      backgroundColor: styles.colors.secondaryColor,
      boxShadow: styles.styles.boxShadow,
    },
    rootMin: {
      color: styles.colors.mainTextColor,
      backgroundColor: 'transparent',
      boxShadow: 'none',
    },
  };
};


class MainTab extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
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

  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      isFullScreen,
      wallet,
    } = this.context;

    const {
      classes,
    } = this.props;

    const {
      CRYPTO,
      ITEM_STORE,
      storage,
    } = wallet.config;

    const crypto = wallet.getPersistentVariable(CRYPTO, "XBT");

    if (!storage) {
      return null;
    }

    let itemList = [];
    let store = storage.get(ITEM_STORE, {})
    if (Object.keys(store).indexOf(crypto) != -1) {
      itemList = store[crypto];
    }

    return <Grid container>
      <Grid item xs={12} sm={6} className={ classes.root }>
        <ItemsTable
          { ...this.props }
          itemList={ itemList }
        />
      </Grid>
      <Grid item xs={12} sm={6} className={ classes.root }>
        <CoinsTable
          { ...this.props }
        />
      </Grid>
    </Grid>;
  }
};

MainTab.contextType = AppContext;

export default withStyles(componentStyles)(MainTab);

