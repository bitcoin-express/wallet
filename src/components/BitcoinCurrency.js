import React from 'react';
import PropTypes from 'prop-types';

import Fab from '@material-ui/core/Fab';
import { withStyles } from '@material-ui/core/styles';

import { AppContext } from "../AppContext";
import styles from '../helpers/Styles';
import StorageIcon from './StorageIcon'


const componentStyles = (theme) => {
  return {
    buttonTiny: {
      width: '20px',
      height: '20px',
      minHeight: '20px',
      fontSize: 'small',
    },
    buttonSmall: {
      width: '25px',
      height: '25px',
      minHeight: '25px',
    },
    button: {
      width: '25px',
      height: '25px',
      minHeight: '25px',
    },
  };
};


class BitcoinCurrency extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isFlipped: false,
      mounted: true,
    }

    this._initializeStyles = this._initializeStyles.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);

    this._initializeStyles(props);
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  _initializeStyles(props) {

    let width = props.displayStorage ? 430 : 430 - 30;
    let widthS = props.displayStorage ? 240 : 240 - 30;
    let widthT = props.displayStorage ? 195 : 195 - 25;
    let left = props.displayStorage ? 45 : 0;
    let leftS = props.displayStorage ? 30 : 0;
    let leftT = props.displayStorage ? 25 : 0;

    const spacesMargin = props.removeInitialSpaces ? props.tiny ? 15 : (props.small ? 25 : 40) : 0;
    const centeredMargin = props.tiny ? widthT/2 : (props.small ? widthS/2 : width/2);

    this.styles = {
      section: {
        width: props.tiny ? `${widthT}px` : (props.small ? `${widthS}px` :`${width}px`),
        height: props.tiny ? '20px' : (props.small ? '22px' : '50px'),
        overflow: 'visible',
        textAlign: 'left', 
        marginLeft: props.centered ? `calc(50% - ${centeredMargin - spacesMargin}px)` : '0',
      },
      flipContainer: {
        perspective: '420px',
      },
      flipped: {
        transition: '0.6s',
        transform: 'rotateY(180deg)',
        transformStyle: 'preserve-3d',
        position: 'relative',
        left: props.tiny ? `${leftT}px` : (props.small ? `${leftS}px` : `${left}px`),
      },
      rotated: {
        transition: '0.6s',
        transform: 'rotateY(0)',
        transformStyle: 'preserve-3d',
        position: 'relative',
        left: props.tiny ? `${leftT}px` : (props.small ? `${leftS}px` : `${left}px`),
      },
      front: {
        width: props.tiny ? `125px` : (props.small ? `${widthS - 80}px` :`${width - 100}px`),
        height: props.small || props.tiny ? '22px' : '35px',
        lineHeight: props.small || props.tiny ? '20px' : 'inherit',
        textAlign: 'left',
        fontFamily: "monospace, mono",
        color: props.color,
        whiteSpace: 'nowrap',
        fontSize: props.tiny ? "13px" : (props.small ? 'large' : 'xx-large'),
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: '0',
        left: '0',
        zIndex: '2',
        /* for firefox 31 */
        transform: 'rotateY(0deg)',
      },
      back: {
        width: props.tiny ? (props.displayStorage ? `${widthT - 30}px` : `${widthT - 50}px`) :
          (props.small ? `${widthS - 10}px` :`${width - 140}px`),
        textAlign: props.small && !props.displayStorage ? 'center' : 'left',
        height: props.small || props.tiny ? '22px' : '35px',
        lineHeight: props.small || props.tiny ? '20px' : 'inherit',
        fontFamily: "monospace, mono",
        color: props.color,
        whiteSpace: 'nowrap',
        fontSize: props.tiny ? "13px" : (props.small ? 'large' : 'xx-large'),
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: '0',
        left: '0',
        transform: 'rotateY(180deg)',
        marginLeft: props.tiny || props.small ? '0px' : '100px',
      },
    };

    if (props.style) {
      this.styles.section = Object.assign(this.styles.section, props.style);
    }
  }

  componentWillUpdate(nextProps, nextState) {
    this._initializeStyles(nextProps);
  }

  handleButtonClick() {
    const {
      showValuesInCurrency,
      reactive,
    } = this.props;

    if (reactive) {
      showValuesInCurrency();
    } else {
      this.setState({
        isFlipped: true,
      });
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.setState({
          isFlipped: false,
        });
      }, 5000);
    }
  }

  render() {
    const {
      centered,
      classes,
      clickableStorage,
      displayStorage,
      onStorageIconClick,
      removeInitialSpaces,
      small,
      storageStyle,
      tiny,
    } = this.props;

    const {
      wallet,
      xr,
    } = this.context;

    let {
      currency,
    } = this.props;

    let {
      isFlipped,
      value,
    } = this.props;

    if (!currency) {
      currency = wallet.getPersistentVariable(wallet.config.CRYPTO) || "BTC";
    }
    if (currency == "XBT") {
      currency = "BTC";
    }
    currency = currency.toUpperCase();
    isFlipped = this.state.isFlipped || isFlipped;

    const symbol = xr.getRates(currency)[xr.currency].symbol;
    const btcDisplay = xr.getBTCDisplay(currency);  
    const displayValue = xr.getStringAmount(value, true);

    const spaceDigits = 12 - displayValue.length;
    const btcDigits = 4 - btcDisplay.length;
    const spaceDecDisplay = <span>
      { xr._decodeHtml(Array(spaceDigits).fill("&nbsp").join('')) }
    </span>;

    let spaceBtcDisplay;
    if (!removeInitialSpaces) {
      spaceBtcDisplay = <span>
        { xr._decodeHtml(Array(btcDigits).fill("&nbsp").join('')) }
      </span>;
    }

    const buttonClass = tiny ? classes.buttonTiny : (small ? classes.buttonSmall : classes.button); 

    return <div style={ this.styles.section }>

      <div style={ this.styles.flipContainer }>

        { displayStorage ? <StorageIcon
          clickable={ clickableStorage }
          hide={ isFlipped }
          onClick={ onStorageIconClick }
          style={ storageStyle || {} }
          small={ small }
          tiny={ tiny }
          wallet={ wallet }
        /> : null }

        <div style={ isFlipped ? this.styles.flipped : this.styles.rotated }>
          <div style={ this.styles.back }>
            { Math.abs(xr.getFloat(value, 4, currency) * 100) < 0.01 && Math.abs(xr.getFloat(value, 4, currency)) > 0 ?
                "< 0.01" + xr.getCurrencyCentSymbol()
                : <span>&asymp; { xr.get(value, 2, currency) }</span>
            }
          </div>

          <div style={ this.styles.front }>
            { spaceBtcDisplay }
            <span style={{ fontFamily: 'Arial' }}>
              { btcDisplay }
            </span>
            { spaceDecDisplay }
            { displayValue }&nbsp;
            <Fab
              color="secondary"
              className={ buttonClass }
              disabled={ isFlipped }
              onClick={(event) => {
                event.preventDefault();
                this.handleButtonClick();
              }}
            >
              { symbol }
            </Fab>
          </div>
        </div>
      </div>
    </div>;
  }
}

BitcoinCurrency.propTypes = {
  color: PropTypes.string,
  centered: PropTypes.bool,
  clickableStorage: PropTypes.bool,
  currency: PropTypes.string,
  displayStorage: PropTypes.bool,
  onStorageIconClick: PropTypes.func,
  reactive: PropTypes.bool,
  removeInitialSpaces: PropTypes.bool,
  small: PropTypes.bool,
  style: PropTypes.object,
  storageStyle: PropTypes.object,
  tiny: PropTypes.bool,
  value: PropTypes.number.isRequired,
};

BitcoinCurrency.defaultProps = {
  centered: false,
  clickableStorage: false,
  color: styles.colors.mainTextColor,
  currency: null,
  displayStorage: true,
  reactive: false,
  removeInitialSpaces: false,
  small: false,
  tiny: false,
};

BitcoinCurrency.contextType = AppContext;


export default withStyles(componentStyles)(BitcoinCurrency);

