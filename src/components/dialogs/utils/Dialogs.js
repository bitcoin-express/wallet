import React from 'react';
import PropTypes from 'prop-types';

import { default as CustomDialogTitle } from './DialogTitle';
import DialogButton from './DialogButton';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import { withStyles } from '@material-ui/core/styles';

import AboutDialog from '../AboutDialog';
import AddFundsDialog from '../AddFundsDialog';
import { AppContext, AppProvider } from '../../../AppContext';
import MoveCoinsDialog from '../MoveCoinsDialog';
import SendDialog from '../SendDialog';
import Settings from '../../bar/settings/Settings';
import styles from '../../../helpers/Styles';


export function getDialog(key, componentProps={}, props={}, wallet) {//buttons=[]) {
  if (!key) {
    return null;
  }

  const title = <CustomDialogTitle type={ key } />;
  switch (key) {

    case "AddFunds":
      return Object.assign(props, {
        body: <AddFundsDialog
          { ...componentProps }
        />,
        cancelLabel: "OK",
        showCancelButton: true,
        title,
      });

    case "AboutDialog":
      return Object.assign(props, {
        body: <AboutDialog />,
        showCancelButton: false,
        title,
      });

    case "MoveCoins":
      const futureStorageMethod = wallet.getOppositeStorageMethodName();
      const futureWalletName = wallet.getOppositeWalletName();
      const title = "Change storage location" + (futureWalletName ?
        " to '" + futureWalletName + "' in " + futureStorageMethod : " to " + futureStorageMethod);

      return Object.assign(props, {
        body: <MoveCoinsDialog
          { ...componentProps }
        />,
        showCancelButton: true,
        title: <div style={{ color: 'white' }}>
          { title }
        </div>,
      });

    case "Send":
      return Object.assign(props, {
        body: <SendDialog
          { ...componentProps }
        />,
        okLabel: "Close",
        showCancelButton: false,
        title,
      });

    case "Settings":
      return Object.assign(props, {
        okLabel: "Confirm Changes",
        showCancelButton: true,
        withBackground: false,
        body: <Settings
          { ...componentProps }
        />,
      });

    default:
      return null;
  }
};


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
      backgroundColor: '#f5f8ff',
      overflowY: 'auto',
    },
    rootActions: {
      background: "#a8baf8",
      margin: "0px",
      padding: "5px",
      overflowX: 'auto',
      whiteSpace: 'nowrap',
    },
    rootContent: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    rootTitle: {
      background: "#a8baf8",
      color: colors.mainTextColor,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      overflow: 'hidden',
    },
  };
};


class AlertDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = props.dialogState || {};
    this.getButtons = this.getButtons.bind(this);
    this.getDefaultButtons = this.getDefaultButtons.bind(this);
    this.getTitle = this.getTitle.bind(this);
  }

  getDefaultButtons() {
    const {
      buttonStyle,
      cancelLabel,
      hideOkButton,
      onCloseClick,
      onClickOk,
      okLabel,
      showCancelButton,
    } = this.props;

    let props = {};
    let actions = [];

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

    return actions;
  }

  getButtons() {
    if (!this.props.actions) {
      return this.getDefaultButtons();
    }
    return this.props.actions;
  }

  getTitle() {
    const {
      classes,
      title,
      titleStyle,
    } = this.props;

    if (!title) {
      return null;
    }

    return <DialogTitle
      id="dialog-title"
      classes={{
        root: classes.rootTitle,
      }}
      style={ titleStyle }
    >
      { title }
    </DialogTitle>;
  }

  render() {
    const {
      actionsContainerStyle,
      body,
      classes,
      fullScreen,
      open,
      onCloseClick,
      style,
    } = this.props;

    return <Dialog
      classes={{
        paper: classes.paper,
      }}
      fullScreen={ fullScreen }
      onBackdropClick={ () => {} }
      onClose={ onCloseClick }
      open={ open }
      style={ style }
      transitionDuration={ 0 }
    >
      { this.getTitle() }

      <DialogContent className={ classes.rootContent }>
        <AppProvider
          value={ Object.assign({}, this.state, this.context) }
        >
          { body }
        </AppProvider>
      </DialogContent>

      <DialogActions
        classes={{
          root: classes.rootActions,
        }}
        style={ actionsContainerStyle }
      >
        { this.getButtons() }
      </DialogActions>

    </Dialog>;
  }
};

AlertDialog.propTypes = {
  actionsContainerStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  hideOkButton: PropTypes.bool,
  onCloseClick: PropTypes.func.isRequired,
  onClickOk: PropTypes.func,
  opened: PropTypes.bool,
  style: PropTypes.object,
  titleStyle: PropTypes.object,
};

AlertDialog.defaultProps = {
  actionsContainerStyle: {},
  hideOkButton: false,
  opened: false,
  style: {},
  title: null,
  titleStyle: {},
};

AlertDialog.contextType = AppContext;


export default withMobileDialog()(withStyles(componentStyles)(AlertDialog));

