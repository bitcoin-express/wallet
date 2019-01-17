import React from 'react';
import PropTypes from 'prop-types';

import BitcoinCurrency from '../../BitcoinCurrency';
import styles from '../../../helpers/Styles';
import { getImageComponent } from '../../../helpers/tools';


class ExchangeInfo extends React.Component {

  constructor(props) {
    super(props);

    this._initializeStyles = this._initializeStyles.bind(this);
    this._initializeStyles(props);
  }

  componentWillReceiveProps(nextProps) {
    this._initializeStyles(nextProps);
  }

  _initializeStyles(props) {
    const {
      background,
      isFullScreen,
    } = props;

    this.styles = {
      container: {
        margin: isFullScreen ? '25px 0 10px' : '35px 0px 20px',
        display: 'flex',
        flexWrap: 'wrap',
        backgroundColor: background,
        borderRadius: isFullScreen ? '10px' : '0',
        padding: '10px 5px',
        justifyContent: 'center',
        boxShadow: background == "transparent" ? "none" :
          'rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px',
      },
      flex: {
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
      },
      exchange: {
        textAlign: 'right',
        width: isFullScreen ? '235px' : '180px',
        marginTop: '5px',
      },
      receive: {
        textAlign: 'left',
        width: '185px',
        marginTop: '5px',
      },
      label: {
        fontSize: '18px',
        marginBottom: '5px',
        color: 'blue',
        fontFamily: 'Roboto, sans-serif',
      },
      arrow: {
        width: '60px',
        textAlign: 'center',
        fontWeight: 'bold',
        margin: isFullScreen ? '20px 0' : '0',
      },
      image: {
        marginRight: '10px',
      }
    };
  }

  render() {
    const {
      currSource,
      currTarget,
      source,
      target,
      isFlipped,
      isFullScreen,
      showValuesInCurrency,
      style,
      wallet,
      xr,
    } = this.props;

    let exFlex = Object.assign({}, this.styles.flex);
    if (isFullScreen) {
      exFlex["minWidth"] = '320px';
    }

    return <div style={ Object.assign(this.styles.container, style) }>
      <div style={ exFlex }>
        <div style={ this.styles.exchange }>
          <div style={ this.styles.label }>
            Exchanging
          </div>
          <BitcoinCurrency
            value={ parseFloat(source) }
            color={ styles.colors.mainBlack }
            currency={ currSource.code.toUpperCase() }
            buttonStyle={{
              background: styles.colors.mainBlack,
            }}
            isFlipped={ isFlipped }
            showValuesInCurrency={ showValuesInCurrency }
            small={ isFullScreen }
            tiny={ !isFullScreen }
            wallet={ wallet }
            style={{ display: 'inline-block' }}
            xr={ xr }
          />
        </div>
        <div style={ this.styles.image }>
          { getImageComponent(`${currSource.code.toLowerCase()}e_60.png`, 60, 60, 'currencies/') }
        </div>
      </div>
      <div style={ this.styles.arrow }>
        <i className="fa fa-arrow-right" />
      </div>
      <div style={ this.styles.flex }>
        <div style={ this.styles.image }>
          { getImageComponent(`${currTarget.code.toLowerCase()}e_60.png`, 60, 60, 'currencies/') }
        </div>
        <div style={ this.styles.receive }>
          <div style={ this.styles.label }>
            Receive
          </div>
          <BitcoinCurrency
            value={ parseFloat(target) }
            color={ styles.colors.mainBlack }
            currency={ currTarget.code.toUpperCase() }
            displayStorage={ false }
            removeInitialSpaces={ true }
            buttonStyle={{
              background: styles.colors.mainBlack,
            }}
            isFlipped={ isFlipped }
            showValuesInCurrency={ showValuesInCurrency }
            small={ isFullScreen }
            tiny={ !isFullScreen }
            wallet={ wallet }
            style={{ display: 'inline-block' }}
            xr={ xr }
          />
        </div>
      </div>
    </div>;
  }
}

ExchangeInfo.defaultProps = {
  background: '#d7dffc',
  style: {},
};

export default ExchangeInfo;
