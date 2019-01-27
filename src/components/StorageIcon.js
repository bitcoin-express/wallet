import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../AppContext";


const componentStyles = (theme) => {
  // Icons
  const icon = {
    position: 'fixed',
    margin: '2px',
    fontSize: 'xx-large',
    opacity: '1.0',
  };
  const iconTiny = Object.assign({}, icon, { fontSize: '13px' });
  const iconSmall = Object.assign({}, icon, { fontSize: 'large' });

  const iconClickable = Object.assign({}, icon, { cursor: 'pointer' });
  const iconClickableTiny = Object.assign({}, iconClickable, { fontSize: '13px' });
  const iconClickableSmall = Object.assign({}, iconClickable, { fontSize: 'large' });

  const iconHidden = {
    position: 'fixed',
    margin: '2px',
    fontSize: 'xx-large',
    opacity: '0.0',
  };
  const iconHiddenTiny = Object.assign({}, iconHidden, { fontSize: '13px' });
  const iconHiddenSmall = Object.assign({}, iconHidden, { fontSize: 'large' });

  // Image
  const image = {
    position: 'absolute',
    width: '40px',
    height: '40px',
    opacity: '1.0',
  };
  const imageTiny = Object.assign({}, image, { width: '18px', height: '18px' });
  const imageSmall = Object.assign({}, image, { width: '23px', height: '23px' });

  const imageClickable = Object.assign({}, image, { cursor: 'pointer' });
  const imageClickableTiny = Object.assign({}, imageClickable, { width: '18px', height: '18px' });
  const imageClickableSmall = Object.assign({}, imageClickable, { width: '23px', height: '23px' });

  const imageHidden = {
    position: 'absolute',
    width: '40px',
    height: '40px',
    opacity: '0.0',
  };
  const imageHiddenTiny = Object.assign({}, imageHidden, { width: '18px', height: '18px' });
  const imageHiddenSmall = Object.assign({}, imageHidden, { width: '23px', height: '23px' });

  return {
    icon,
    iconTiny,
    iconSmall,
    iconClickable,
    iconClickableTiny,
    iconClickableSmall,
    iconHidden,
    iconHiddenTiny,
    iconHiddenSmall,
    image,
    imageTiny,
    imageSmall,
    imageClickable,
    imageClickableTiny,
    imageClickableSmall,
    imageHidden,
    imageHiddenTiny,
    imageHiddenSmall,
  };
};


class StorageIcon extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  componentDidCatch(error, info) {
    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    if (wallet.config.debug) {
      console.log(error);
      console.log(info);
    }

    this.setState({
      hasError: true,
    });

    snackbarUpdate("Error on rendering component", true);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    const {
      browser,
      classes,
      drive,
      fa,
      label,
      hide,
      onClick,
      small,
      style,
      tiny,
    } = this.props;

    const {
      wallet,
    } = this.context;

    const {
      storage,
    } = wallet.config;

    const browserName = wallet._browserIs().split(" ")[0];

    let props = {};
    if (onClick) {
      props['onClick'] = onClick;
    }

    let title = "Coins in Goggle Drive";
    let extraClassName = hide ? "Hidden" : "";
    extraClassName += small ? "Small" : "";
    extraClassName += tiny ? "Tiny" : "";
    let className;

    if (drive || (!browser && wallet.isGoogleDrive())) {
      className = `fa fa-google${ small ? '' : ' fa-2x' }`;
      if (fa) {
        return <i
          className={ classnames(classes["icon" + extraClassName], className) }
          title={ title }
          style={ style }
        />;
      }

      return <img
        src="css/img/storage/google.png"
        title={ title }
        className={ classes["image" + extraClassName] }
        style={ style }
      />;
    }

    title = label || `Coins in ${browserName}`;
    if (fa) {
      className = `fa fa-${browserName.toLowerCase()} fa-3x`;
      return <i
        className={ classnames(classes["icon" + extraClassName], className) }
        title={ title }
        style={ style }
      />;
    }

    const src = `css/img/storage/${browserName.toLowerCase()}.png`;
    return <img
      src={ src }
      title={ title }
      className={ classes["image" + extraClassName] }
      style={ style }
    />;
  }
}

StorageIcon.propTypes = {
  browser: PropTypes.bool,
  drive: PropTypes.bool,
  fa: PropTypes.bool,
  hide: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  small: PropTypes.bool,
  style: PropTypes.object,
  tiny: PropTypes.bool,
};

StorageIcon.defaultProps = {
  browser: false,
  drive: false,
  fa: false,
  hide: false,
  onClick: null,
  small: false,
  style: {},
  tiny: false,
};

StorageIcon.contextType = AppContext;


export default withStyles(componentStyles)(StorageIcon);

