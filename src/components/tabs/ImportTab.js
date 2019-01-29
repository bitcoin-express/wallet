import React from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../../AppContext";
import ImportCoin from './import/ImportCoin';
import ImportFile from './import/ImportFile';
import styles from '../../helpers/Styles';
import Submenu from '../Submenu';

const states = {
  IMPORT_FILE: 0,
  IMPORT_COIN: 1,
};


const componentStyles = (theme) => {
  return {
    root: {
      padding: '15px',
    },
    paper: {
      background: '#8ea7fb',
      [theme.breakpoints.down('xs')]: {
        boxShadow: 'none',
        padding: '5px',
      },
      [theme.breakpoints.up('xs')]: {
        padding: '2vw',
      },
    },
  }
};


class ImportTab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      section: states.IMPORT_FILE,
      hasError: false,
    };
    this.handleChipChanged = this.handleChipChanged.bind(this);
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

  handleChipChanged(index) {
    this.setState({ section: index });
  }

  render() {
    const {
      hasError,
      section,
    } = this.state;

    if (hasError) {
      return null;
    }

    const {
      classes,
    } = this.props;
    
    const {
      isFullScreen,
    } = this.context;

    if (isFullScreen) {
      return <Grid container>
        <Grid item sm={6} xs={12} className={ classes.root }>
          <Paper elevation={1} className={ classes.paper }>
            <ImportFile {...this.props} /> 
          </Paper>
        </Grid>
        <Grid item sm={6} xs={12} className={ classes.root }>
          <Paper elevation={1} className={ classes.paper }>
            <ImportCoin {...this.props} type="2" />
          </Paper>
        </Grid>
      </Grid>;
    }

    let content = null;
    switch (section) {
      case states.IMPORT_FILE:
        content = <ImportFile {...this.props} />;
        break;
      case states.IMPORT_COIN:
        content = <ImportCoin {...this.props} type="1" />;
        break;
    }

    return <React.Fragment>
      <Submenu
        initialSelectedIndex={ section }
        onTapChanged={ this.handleChipChanged }
        items={ [{
          label: "import file",
          icon: "file-text",
        }, {
          label: "import coin",
          icon: "btc",
        }] }
      />
      { content } 
    </React.Fragment>;
  }
}

ImportTab.propTypes = {
  handleShowCoin: PropTypes.func.isRequired,
};

ImportTab.contextType = AppContext;

export default withStyles(componentStyles)(ImportTab);

