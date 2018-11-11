import React from 'react';
import PropTypes from 'prop-types';

class StorageIcon extends React.Component {
  constructor(props) {
    super(props);

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);
  }

  componentWillUpdate(nextProps, nextState) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    this.styles = {
      icon: Object.assign({
        position: 'fixed',
        margin: '2px',
        color: props.color,
        cursor: props.clickable ? 'pointer' : 'inherit',
        fontSize: props.tiny ? '13px' : (props.small ? 'large' : 'xx-large'),
        opacity: '1.0',
      }, props.style),
      img: Object.assign({
        cursor: props.clickable ? 'pointer' : 'inherit',
        position: 'absolute',
        width: props.tiny ? '18px' : (props.small ? '23px' : '40px'),
        height: props.tiny ? '18px' : (props.small ? '23px' : '40px'),
        opacity: '1.0',
      }, props.style),
      iconHide: Object.assign({
        position: 'fixed',
        margin: '2px',
        color: props.color,
        fontSize: props.tiny ? '13px' : (props.small ? 'large' : 'xx-large'),
        opacity: '0.0',
      }, props.style),
      imgHide: Object.assign({
        position: 'absolute',
        width: props.tiny ? '18px' : (props.small ? '23px' : '40px'),
        height: props.tiny ? '18px' : (props.small ? '23px' : '40px'),
        opacity: '0.0',
      }, props.style),
    };
  }

  render() {
    const {
      browser,
      clickable,
      drive,
      fa,
      label,
      hide,
      onClick,
      small,
      wallet,
    } = this.props;

    const {
      storage,
    } = wallet.config;

    const browserIs = wallet._browserIs().split(" ")[0];

    let props = {};
    if (clickable) {
      props['onClick'] = onClick;
    }

    if (drive || (!browser && wallet.isGoogleDrive())) {
      return fa ? <i
        { ...props }
        className={ `fa fa-google${ small ? '' : ' fa-2x' }` }
        title={ label || "Coins in Goggle Drive" }
        style={ hide ? this.styles.iconHide : this.styles.icon }
      /> : <img
        { ...props }
        src="css/img/storage/google.png"
        title={ label || "Coins in Goggle Drive" }
        style={ hide ? this.styles.imgHide : this.styles.img }
      />;
    } else {
      return fa ? <i
        { ...props }
        className={ `fa fa-${browserIs.toLowerCase()} fa-3x` }
        title={ label || `Coins in ${browserIs}` }
        style={ hide ? this.styles.iconHide : this.styles.icon }
      /> : <img
        { ...props }
        src={ `css/img/storage/${browserIs.toLowerCase()}.png` }
        title={ label || `Coins in ${browserIs}` }
        style={ hide ? this.styles.imgHide : this.styles.img }
      />;
    }
  }
}

StorageIcon.propTypes = {
  browser: PropTypes.bool,
  clickable: PropTypes.bool,
  drive: PropTypes.bool,
  fa: PropTypes.bool,
  hide: PropTypes.bool,
  label: PropTypes.string,
  onClick: PropTypes.func,
  small: PropTypes.bool,
  style: PropTypes.object,
  tiny: PropTypes.bool,
  wallet: PropTypes.object.isRequired,
};

StorageIcon.defaultProps = {
  browser: false, // force to show browser icon
  clickable: false, // must include onClick!
  drive: false, // force to show gdrive icon
  fa: false,
  hide: false,
  small: false,
  tiny: false,
};

export default StorageIcon;
