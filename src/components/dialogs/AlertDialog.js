import React from 'react';
import PropTypes from 'prop-types';

import Dialog from 'material-ui/Dialog';

import DialogButton from './DialogButton';

import styles from '../../helpers/Styles';

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
      bodyStyle: {
        backgroundImage: "url('css/img/Bitcoin-express-bg2.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPositionX: '-25%',
        backgroundAttachment: 'local',
        backgroundColor: styles.colors.mainWhite,
        // color: styles.colors.mainTextColor,
        overflowY: 'auto',
      },
      bottomStyle: {
        background: styles.colors.mainColor,
        overflowX: 'auto',
        whiteSpace: 'nowrap',
      },
      buttonStyle: {
        color: styles.colors.mainTextColor,
      },
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
      titleStyle: {
        background: styles.colors.mainColor,
        color: styles.colors.mainTextColor,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
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
          label={ okLabel || "OK" }
          onTouchTap={ onClickOk || onCloseClick }
        />
      ];

      if (showCancelButton) {
        actions.push(<DialogButton
          { ...props }
          id="alert-cancel"
          label={ cancelLabel || "Cancel" }
          onTouchTap={ onCloseClick }
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
      open,
      onCloseClick,
      showTitle,
      style,
      title,
      titleStyle,
    } = this.props;

    let contentStyle = { };
    let bodyStyle = Object.assign({}, this.styles.bodyStyle, style);
    let bottomStyle = Object.assign({}, this.styles.bottomStyle, actionsContainerStyle);
    let headerStyle = Object.assign({}, this.styles.titleStyle, titleStyle);
    let containerStyle = {};

    if (!showTitle) {
      headerStyle.padding = "0";
    }

    return (
      <Dialog
        title={ showTitle ? title : "" }
        actions={ this._getActionButtons() }
        actionsContainerStyle={ bottomStyle }
        className="dialog"
        modal={ false }
        open={ open }
        onRequestClose={ onCloseClick }
        bodyStyle={ bodyStyle }
        contentStyle={ contentStyle } 
        style={ containerStyle }
        titleStyle={ headerStyle }
      >
        { body }
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

export default AlertDialog;
