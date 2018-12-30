import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Popover from '@material-ui/core/Popover';

class HelpTooltip extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
    };

    this.handleTouchTap = this.handleTouchTap.bind(this); 
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  handleTouchTap(event) {
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose() {
    this.setState({
      open: false,
    });
  }

  render() {
    const {
      note,
      iconStyle,
      style,
      tooltipStyle,
    } = this.props;

    const {
      anchorEl,
      open,
    } = this.state;

    return <div style={ Object.assign({
      display: 'inline',
      color: 'black',
    }, style) }>
      &nbsp;&nbsp;<i
        className="fa fa-question-circle fa-lg"
        onClick={ this.handleTouchTap }
        style={ Object.assign({
          cursor: 'pointer',
        }, iconStyle) }
      /><Popover
        anchorEl={ anchorEl }
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        onRequestClose={ this.handleRequestClose }
        open={ open }
        style={ Object.assign({
          marginLeft: '-5px',
          marginTop: '10px',
          padding: '8px',
          backgroundColor: '#bfbfbf',
          fontSize: '12px',
        }, tooltipStyle) }
        targetOrigin={{
          horizontal: 'left',
          vertical: 'top',
        }}
      >
        { note }
      </Popover>&nbsp;
    </div>
  }
}

HelpTooltip.defaultProps = {
  iconStyle: {},
  style: {},
  tooltipStyle: {},
};

export default HelpTooltip;
