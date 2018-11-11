import React from 'react';
import PropTypes from 'prop-types';

import styles from '../helpers/Styles';

class FormArea extends React.Component {

  constructor(props) {
    super(props)

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);
  }

  componentWillUpdate(nextProps, nextState) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    this.styles = {
      content: {
        color: styles.colors.mainTextColor,
        backgroundColor: props.transparent ? 'transparent' :
          styles.colors.secondaryColor,
        boxShadow: props.transparent ? 'none' : styles.styles.boxShadow,
      }
    }
  }

  render() {
    const {
      children,
      isFullScreen,
      style,
      type,
    } = this.props;

    let contentStyle = this.styles.content;
    if (style) {
      contentStyle = Object.assign(contentStyle, style);
    }

    return (
      <div
        className={ `mainsection mainsection${type}${isFullScreen ? ' fs' : ''}` }
        style={ contentStyle }
      >
        { children }
      </div>
    );
  }
}

FormArea.propTypes = {
  children: PropTypes.element.isRequired,
  isFullScreen: PropTypes.bool,
  style: PropTypes.object,
  transparent: PropTypes.bool,
  type: PropTypes.string,
};

FormArea.defaultProps = {
  type: '1',
  transparent: false,
  //hide: false,
}

export default FormArea;
