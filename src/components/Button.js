import React from 'react';
import PropTypes from 'prop-types';

import { Button as ButtonComponent } from '@material-ui/core/Button';

import styles from '../helpers/Styles';

class Button extends React.Component {

  constructor(props) {
    super(props);

    this.styles = [{
      container: {
        width: '100%',
        margin: '20px 0 10px 0',
      },
      labelStyle: {
        color: styles.colors.mainTextColor,
      },
      backgroundColor: styles.colors.secondaryBlue,
      disabledColor: styles.colors.mainGrey,
      hoverColor: styles.colors.thirdBlue,
    }];
  }

  render() {
    const {
      disabled,
      download,
      href,
      icon,
      label,
      labelPosition,
      onClick,
      style,
      type,
    } = this.props;

    let props = {};
    if (icon) {
      props.icon = icon;
    }
    if (labelPosition) {
      props.labelPosition = labelPosition;
    }

    if (href && download) {
      props.href = href;
      props.download = download;
    } else {
      props.onClick = onClick;
    }

    return <ButtonComponent
      { ...props }
      label={ label }
      primary={ true }
      disabled={ disabled }
      backgroundColor={ disabled ? this.styles[type].disabledColor :
        this.styles[type].backgroundColor }
      hoverColor={ this.styles[type].hoverColor }
      labelStyle={ this.styles[type].labelStyle }
      style={ Object.assign({ cursor: disabled ? 'not-allowed' : 'pointer' }, 
        this.styles[type].container, style) }
    />;
  }
}

Button.defaultProps = {
  disabled: false,
  download: null,
  href: null,
  icon: null,
  style: {},
  type: 0,
};

export default Button;
