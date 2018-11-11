import React from 'react';
import PropTypes from 'prop-types';

import styles from '../helpers/Styles';

class Title extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selected: props.initialSelectedIndex,
    };

    this.styles = {
      label: {
        borderBottom: `1px solid ${styles.colors.mainTextColor}`,
        color: styles.colors.mainTextColor,
        fontFamily: styles.fontFamily, 
        margin: '5px 0 25px 0',
        paddingBottom: '10px',
        textAlign: 'left',
      },
    };

    if (props.labelRight) {
      this.styles.label.display = 'flex';
      this.styles.label.alignItems = 'center';
    }
  }

  render() {
    const {
      isFullScreen,
      label,
      labelRight,
      labelStyle,
    } = this.props;

    const containerStyle = Object.assign({}, this.styles.label, labelStyle);

    if (!isFullScreen) {
      return null;
    }

    if (labelRight) {
      const {
        labelRightWidth,
      } = this.props;

      return <h3 style={ containerStyle }>
        <div style={{
          width: `calc(100% - ${labelRightWidth}px)`,
        }}>
          { label }
        </div>
        <div style={{
          width: `${labelRightWidth}px`,
        }}>
          { labelRight }
        </div>
      </h3>;
    }

    return <h3 style={ containerStyle }>
      { label }
    </h3>;
  }
}

Title.propTypes = {
  isFullScreen: PropTypes.bool,
};

Title.defaultProps = {
  labelStyle: {},
};

export default Title;
