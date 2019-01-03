import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

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
    },
  };
};

class AlertDialog extends React.Component {
  constructor(props) {
    super(props);

    this.initializeStyles = this.initializeStyles.bind(this);
    this.initializeStyles();

    this._getActionButtons = this._getActionButtons.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    this.initializeStyles();
  }

  initializeStyles() {
    this.styles = {
      fullSize: {
        width: '100%',
        maxWidth: 'none',
        height: '100%',
        maxHeight: 'none',
        position: 'absolute',
        top: '-65px',
      },
      fullSizeBottom: {
        position: 'absolute',
        bottom: '0',
      },
      fullSizeBody: {
        height: '100%',
        maxHeight: 'none',
        position: 'relative',
      },
      fullSizeStyle: {
        height: '100%',
        maxHeight: 'none',
        backgroundColor: 'white',
      },
    };
  }

  _getActionButtons() {
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
      actionsContainerStyle,
      body,
      classes,
      open,
      onCloseClick,
      showTitle,
      style,
      title,
      titleStyle,
    } = this.props;

    let containerStyle = {};

    return (
      <Dialog
        classes={{
          paper: classes.paper,
        }}
        onBackdropClick={ () => {} }
        onClose={ onCloseClick }
        open={ open }
        style={ style }
        transitionDuration={ 0 }
      >
        { showTitle ? <DialogTitle
          id="dialog-title"
          classes={{
            root: classes.rootTitle,
          }}
          style={ titleStyle }
        >
          { title }
        </DialogTitle> : null }
        <DialogContent>
          { body }
        </DialogContent>
        <DialogActions
          classes={{
            root: classes.rootActions,
          }}
          style={ actionsContainerStyle }
        >
          { this._getActionButtons() }
        </DialogActions>
      </Dialog>
    );
  }
}

AlertDialog.propTypes = {
  actionsContainerStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  hideOkButton: PropTypes.bool,
  onCloseClick: PropTypes.func.isRequired,
  onClickOk: PropTypes.func,
  opened: PropTypes.bool,
  showTitle: PropTypes.bool,
  style: PropTypes.object,
  titleStyle: PropTypes.object,
};

AlertDialog.defaultProps = {
  actionsContainerStyle: {},
  hideOkButton: false,
  opened: false,
  showTitle: true,
  style: {},
};

export default withStyles(componentStyles, { withTheme: true })(AlertDialog);
