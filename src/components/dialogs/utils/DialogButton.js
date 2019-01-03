import React from 'react';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import styles from '../../../helpers/Styles';

const componentStyles = () => {
  const {
    colors,
  } = styles;

  return {
    root: {
      color: colors.mainBlue,
      marginRight: '5px',
    },
  };
};


class DialogButton extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      classes,
      label,
      onClick,
      style,
    } = this.props;

    let props = Object.assign({}, this.props, {
      style: this.style,
    });

    return <Button
      className={ classes.root }
      onClick={ onClick }
      style={ style }
    >
      { label }
    </Button>;
  }
}

DialogButton.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  style: PropTypes.object,
  onClick: PropTypes.func.isRequired,
};

DialogButton.defaultProps = {
  style: {},
};

export default withStyles(componentStyles)(DialogButton);
