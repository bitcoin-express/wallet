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
      style,
      tooltipStyle,
      variant,
    } = this.props;

    const {
      anchorEl,
      open,
    } = this.state;

    return <React.Fragment>
      <i
        className={ "fa fa-question-circle " + variant }
        onClick={ this.handleTouchTap }
        style={ Object.assign({
          cursor: 'pointer',
          marginLeft: '10px',
        }, style) }
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
    </React.Fragment>
  }
}

HelpTooltip.defaultProps = {
  style: {},
  tooltipStyle: {},
  variant: "fa-lg",
};


export default withStyles(componentStyles)(HelpTooltip);

