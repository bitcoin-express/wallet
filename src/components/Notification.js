import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import styles from '../helpers/Styles';


/*
 * Variant of notifications can be:
 *   "success", "info", "warning", "error"
 */

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
        message={ message || "" }
        variant={ variant || "info" }
      />
    </Snackbar>;
  }
}

Notification.propTypes = {
  onClose: PropTypes.func,
};

export default Notification;
