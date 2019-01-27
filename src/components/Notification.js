import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import { withStyles } from '@material-ui/core/styles';

import styles from '../helpers/Styles';


const iconStyle = {
  fontSize: 20,
  opacity: 0.9,
  marginRight: "20px",
};


const variantIcon = {
  success: <i className="fa fa-check-circle" style={ iconStyle } />,
  warning: <i className="fa fa-exclamation-triangle" style={ iconStyle } />,
  error: <i className="fa fa-exclamation-circle" style={ iconStyle } />,
  info: <i className="fa fa-info-circle" style={ iconStyle } />,
};


const componentStyles = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});


class Notification extends React.Component {

  constructor(props) {
    super(props);

    this.handleNotificationUpdate = this.handleNotificationUpdate.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);
    this.showNotifications = this.showNotifications.bind(this);

    this.state = {
      notification: {},
      prevIndex: -1,
      messages: [],
      open: false,
    };

    this.mouseOver = false;
    this.MESSAGE_DELAY = 5000; // 5 seconds delay
  }

  componentWillReceiveProps(nextProps) {
    const {
      messages,
      index,
    } = nextProps;

    if (Array.isArray(messages) && messages.length > 0 && index != this.state.prevIndex) {
      this.handleNotificationUpdate(messages, index);
    }
  }

  handleActionClick() {
    this.setState({
      open: false,
    });
    this.mouseOver = false;
  }

  /**
   * @param msgList: array of messages or string message to display
   */
  handleNotificationUpdate(msgList, index) {
    let {
      open,
      messages,
    } = this.state;

    // Extend array with new messages
    const totalMessages = messages.push.apply(messages, msgList);
    this.setState({
      messages,
      prevIndex: index,
    });

    if (!open) {
      // No notifications on queue, need to trigger again the timeouts
      this.showNotifications();
    }
  }

  showNotifications() {
    const {
      messages,
    } = this.state;

    if (this.mouseOver) {
      // Call again timeout
      setTimeout(this.showNotifications, this.MESSAGE_DELAY);
      return;
    }

    if (messages.length > 0) {
      const notification = messages.shift();
      this.setState({
        open: true,
        messages,
        notification,
      });

      setTimeout(this.showNotifications, this.MESSAGE_DELAY);
      return;
    }

    // No more messages in the queue
    this.setState({
      open: false,
      notification: {},
      messages: [],
    });
  }

  render() {
    const {
      classes,
      onClose,
    } = this.props;

    const {
      notification,
      open,
    } = this.state;

    const {
      message,
      variant,
    } = notification;

    const icon = variantIcon[variant || "info"];

    return <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      onMouseEnter={ () => {
        this.mouseOver = true;
      }}
      onMouseLeave={ () => {
        this.mouseOver = false;
      }}
      onClick={ this.handleActionClick }
      open={ open }
      autoHideDuration={ 30000 }
      onClose={ onClose }
    >
      <SnackbarContent
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={ onClose }
          >
            x
          </IconButton>,
        ]}
        message={
          <span id="client-snackbar" className={classes.message}>
            { icon }
            { message || "" }
          </span>
        }
        className={classNames(classes[variant || "info"])}
      />
    </Snackbar>;
  }
}

Notification.propTypes = {
  onClose: PropTypes.func,
};

export default withStyles(componentStyles)(Notification);

