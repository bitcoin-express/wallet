import React from 'react';
import PropTypes from 'prop-types';

import Snackbar from 'material-ui/Snackbar';

import styles from '../helpers/Styles';

class Notification extends React.Component {

  constructor(props) {
    super(props);

    this.handleNotificationUpdate = this.handleNotificationUpdate.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);
    this.showNotifications = this.showNotifications.bind(this);
    this._initializeStyles = this._initializeStyles.bind(this);

    this._initializeStyles(props);

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
    this._initializeStyles(nextProps);

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

  getNotificationMessage() {
    const {
      message,
      error,
    } = this.state.notification;

    if (!message) {
      return "";
    }

    if (error) {
      return <span style={{
        color: "#ff7e72",
      }}>
        { message }
      </span>;
    }

    return message;
    
  }

  _initializeStyles(props) {
    this.styles = {};
  }

  render() {
    const {
      onClose,
    } = this.props;

    const {
      open,
    } = this.state;

    return <Snackbar
      open={ open }
      message={ this.getNotificationMessage() }
      action="x"
      onMouseEnter={ () => {
        this.mouseOver = true;
      }}
      onMouseLeave={ () => {
        this.mouseOver = false;
      }}
      className="snackbar"
      onActionTouchTap={ this.handleActionClick }
      autoHideDuration={ 30000 }
      onRequestClose={ onClose }
    />;
  }
}

Notification.propTypes = {
  onClose: PropTypes.func,
};

export default Notification;
