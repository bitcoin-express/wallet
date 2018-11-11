import React from 'react';
import PropTypes from 'prop-types';

import FlatButton from 'material-ui/FlatButton';

import styles from '../../helpers/Styles';

class DialogButton extends React.Component {
  constructor(props) {
    super(props);

    this._initializeStyles = this._initializeStyles.bind(this); 
    this._initializeStyles(props);
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    this.style = Object.assign({
      color: styles.colors.mainTextColor,
      marginRight: '5px',
    }, props.styles);
  }

  render() {
    let props = Object.assign({}, this.props, {
      style: this.style,
    });

    return <FlatButton
      { ...props }
    />;
  }
}

DialogButton.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  style: PropTypes.object,
  onTouchTap: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string,
  hoverColor: PropTypes.string,
};

DialogButton.defaultProps = {
  backgroundColor: styles.colors.secondaryColor,
  hoverColor: styles.colors.secondaryColor,
};

export default DialogButton;
