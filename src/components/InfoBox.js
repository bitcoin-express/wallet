import React from 'react';
import PropTypes from 'prop-types';

import styles from '../helpers/Styles';

class InfoBox extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      container: {
        borderRadius: '10px',
        backgroundColor: props.backgroundColor,
        overflow: 'hidden',
        margin: '10px 2vw',
        padding: '20px 10px',
        position: 'relative',
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
      },
      icon: {
        color: props.iconColor,
        marginTop: '-10px',
        opacity: '0.2',
        position: 'absolute',
        textAlign: 'right',
        zIndex: '0',
      },
      text: {
        textAlign: 'center',
        zIndex: '1',
      },
    };

    if (props.border) {
      this.styles.container.borderStyle = 'solid';
      this.styles.container.borderWidth = '2px';
    }
  }

  render() {
    const {
      hidden,
      children,
    } = this.props;

    if (hidden) {
      return null;
    }

    return <div style={ this.styles.container }>
      <div style={ this.styles.icon }>
        <i className="fa fa-exclamation-triangle fa-4x" />
      </div>
      <div style={ this.styles.text }>
        { children }
      </div>
    </div>;
  }
}

InfoBox.defaultProps = {
  hidden: false,
  backgroundColor: 'rgba(253, 207, 79, 0.8)',
  border: false,
  iconColor: styles.colors.mainRed,
};

export default InfoBox;
