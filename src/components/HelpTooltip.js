import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';


const componentStyles = theme => ({
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    margin: theme.spacing.unit * 2,
  },
});


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
      classes,
      note,
      iconStyle,
      style,
      tooltipStyle,
    } = this.props;

    const {
      anchorEl,
      open,
    } = this.state;

    return <div style={ style }>
      <i
        className="fa fa-question-circle fa-lg"
        onClick={ this.handleTouchTap }
        style={ Object.assign({
          cursor: 'pointer',
        }, iconStyle) }
      />
      <Popover
        anchorEl={ anchorEl }
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        open={ open }
        onClose={ this.handleRequestClose }
        style={ tooltipStyle }
        targetOrigin={{
          horizontal: 'left',
          vertical: 'top',
        }}
      >
        <Typography className={ classes.typography }>
          { note }
        </Typography>
      </Popover>
    </div>
  }
}

HelpTooltip.defaultProps = {
  iconStyle: {},
  style: {},
  tooltipStyle: {},
};


export default withStyles(componentStyles)(HelpTooltip);

