import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';

import { AppContext } from "../../AppContext";
import DialogButton from './utils/DialogButton';
import styles from '../../helpers/Styles';


const componentStyles = (theme) => {
  const {
    colors,
  } = styles;

  return {
    paper: {
      backgroundImage: "url('css/img/Bitcoin-express-bg2.png')",
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: '-25%',
      backgroundAttachment: 'local',
      backgroundColor: colors.mainWhite,
      overflowY: 'auto',
    },
    paperClean: {
      backgroundColor: colors.mainWhite,
      overflowY: 'auto',
    },
    rootActions: {
      //background: colors.mainColor,
      overflowX: 'auto',
      whiteSpace: 'nowrap',
    },
    rootTitle: {
      background: "#a8baf8b0",
      color: colors.mainTextColor,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    }
  };
};


class AlertDialog extends React.Component {
  constructor(props) {
    super(props);

    this.getActionButtons = this.getActionButtons.bind(this);
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

  getActionButtons() {
    const {
      buttonStyle,
      cancelLabel,
      hideOkButton,
      onCloseClick,
      onClickOk,
      okLabel,
      showCancelButton,
    } = this.props;

    let {
      actions,
    } = this.props;

    if (!actions) {
      let props = {};
      if (buttonStyle) {
        props['style'] = buttonStyle;
      }

      actions = hideOkButton ? [] : [
        <DialogButton
          { ...props }
          id="alert-ok"
          key="alert-ok"
          label={ okLabel || "OK" }
          onClick={ onClickOk || onCloseClick }
        />
      ];

      if (showCancelButton) {
        actions.push(<DialogButton
          { ...props }
          id="alert-cancel"
          key="alert-cancel"
          label={ cancelLabel || "Cancel" }
          onClick={ onCloseClick }
        />);
        actions = actions.reverse();
      }
    }
    return actions;
  }

  render() {
    const {
      body,
      bodyStyle,
      bottomStyle,
      classes,
      fullScreen,
      open,
      onCloseClick,
      showTitle,
      style,
      title,
      titleStyle,
      withBackground,
    } = this.props;

    let titleComponent = null;
    if (title) {
      titleComponent = <DialogTitle
        id="dialog-title"
        classes={{
          root: classes.rootTitle,
        }}
        style={ titleStyle }
      >
        { title }
      </DialogTitle>;
    }

    return <Dialog
      classes={{
        paper: withBackground ? classes.paper : classes.paperClean,
      }}
      fullScreen={ fullScreen }
      onBackdropClick={ () => {} }
      onClose={ onCloseClick }
      open={ open }
      style={ style }
      transitionDuration={ 0 }
    >
      { titleComponent }

      <DialogContent
        style={ bodyStyle }
      >
        { body }
      </DialogContent>

      <DialogActions
        classes={{
          root: classes.rootActions,
        }}
        style={ bottomStyle }
      >
        { this.getActionButtons() }
      </DialogActions>
    </Dialog>;
  }
}

AlertDialog.propTypes = {
  bodyStyle: PropTypes.object,
  bottomStyle: PropTypes.object,
  fullScreen: PropTypes.bool.isRequired,
  hideOkButton: PropTypes.bool,
  onCloseClick: PropTypes.func.isRequired,
  onClickOk: PropTypes.func,
  opened: PropTypes.bool,
  style: PropTypes.object,
  titleStyle: PropTypes.object,
  withBackground: PropTypes.bool,
};

AlertDialog.defaultProps = {
  bottomStyle: {},
  bodyStyle: {},
  hideOkButton: false,
  opened: false,
  style: {},
  title: null,
  titleStyle: {},
  withBackground: true,
};

AlertDialog.contextType = AppContext;


export default withMobileDialog()(withStyles(componentStyles, { withTheme: true })(AlertDialog));

