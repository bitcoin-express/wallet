import React from 'react';
import PropTypes from 'prop-types';

import BitcoinCurrency from '../../BitcoinCurrency';
import { getDomainFromURL } from '../../../helpers/tools';
import styles from '../../../helpers/Styles';
import DateCounter from './DateCounter';


export default class PaymentInfo extends React.Component {
  
  constructor(props) {
    super(props);

    this.styles = {
      alertLabel: {
        color: styles.colors.mainRed,
        fontSize: '13px',
        textAlign: 'center',
      },
      answer: {
        color: styles.colors.mainBlue,
        whiteSpace: 'nowrap',
      },
      answerCurrency: {
        color: styles.colors.mainBlue,
        whiteSpace: 'nowrap',
        width: '200px',
      },
      label: {
        color: styles.colors.mainTextColor,
        marginRight: '10px',
        fontWeight: 'bold',
        textAlign: 'left',
      },
      labelCurrency: {
        color: styles.colors.mainTextColor,
        marginRight: '5px',
        fontWeight: 'bold',
        width: '80px',
        textAlign: 'left',
      },
      row: {
        display: 'flex',
        marginTop: '15px',
        fontWeight: 'bold',
      },
      row2: {
        display: 'flex',
        marginTop: '5px',
      },
    };
  }

  render () {
    const {
      amount,
      currency,
      disabled,
      domain,
      errorMsg,
      fee,
      inactive,
      isFlipped,
      isFullScreen,
      memo,
      payment_url,
      seller,
      showValuesInCurrency,
      timeToExpire,
      total,
      wallet,
      xr,
    } = this.props;

    let styleContainer = null;
    if (isFullScreen) {
      styleContainer = {
        marginLeft: 'calc(50% - 120px)',
        marginBottom: '30px',
      };
    }

    const tooMuchTime = Math.floor(timeToExpire / (60 * 60)) > 0;

    return <div style={ styleContainer }>
      <div style={ this.styles.row }>
        <div style={ this.styles.label }>
          Payment to:
        </div>
        <div style={ this.styles.answer }>
          { domain || getDomainFromURL(payment_url, true) } <i
            className="fa fa-lock"
            style={{
              color: "#1c8e1c",
              position: "absolute",
              right: "15px",
            }}
          />
        </div>
      </div>

      { seller ? <div style={ this.styles.row2 }>
        <div style={ this.styles.labelCurrency }>
          Seller:
        </div>
        <div style={ this.styles.answer }>
          { seller } <i
            className="fa fa-unlock-alt"
            style={{
              color: "#b91313",
              position: "absolute",
              right: "15px",
            }}
          />
        </div>
      </div> : null }

      <div style={ this.styles.row2 }>
        <div style={ this.styles.labelCurrency }>
          For:
        </div>
        <div style={ this.styles.answer }>
          { memo }
        </div>
      </div>

      <div style={ this.styles.row2 }>
        <div style={ this.styles.labelCurrency }>
          Amount:
        </div>
        <div style={ this.styles.answerCurrency }>
          <BitcoinCurrency
            centered={ isFullScreen }
            currency={ currency }
            color="#3c3c3c"
            displayStorage={ false }
            isFlipped={ isFlipped }
            labelStyle={{
              color: styles.colors.mainBlue,
            }}
            small={ true }
            style={{ width: '180px' }}
            removeInitialSpaces={ !isFullScreen }
            showValuesInCurrency={ showValuesInCurrency }
            value={ parseFloat(amount) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
      </div>

      { disabled || inactive ? <div style={ this.styles.alertLabel }>
        { errorMsg }
      </div> : ( fee == 0 ? null : <div style={ this.styles.row2 }>
        <div style={ this.styles.labelCurrency }>
          Split fee:
        </div>
        <div style={ this.styles.answerCurrency }>
          <BitcoinCurrency
            centered={ isFullScreen }
            color="#3c3c3c"
            currency={ currency }
            displayStorage={ false }
            isFlipped={ isFlipped }
            labelStyle={{
              color: styles.colors.mainBlue,
            }}
            small={ true }
            removeInitialSpaces={ !isFullScreen }
            showValuesInCurrency={ showValuesInCurrency }
            style={{ width: '180px' }}
            value={ fee }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
      </div>) }

      { inactive ? null : <div style={ this.styles.row2 }>
        <div style={ this.styles.labelCurrency }>
          Billed as:
        </div>
        <div style={ this.styles.answerCurrency }>
          <BitcoinCurrency
            centered={ isFullScreen }
            color="#3c3c3c"
            currency={ currency }
            displayStorage={ false }
            isFlipped={ isFlipped }
            labelStyle={{
              color: styles.colors.mainBlue,
            }}
            small={ true }
            removeInitialSpaces={ !isFullScreen }
            showValuesInCurrency={ showValuesInCurrency }
            style={{ width: '180px' }}
            value={ total }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
      </div> }

      { inactive || tooMuchTime ? null : <div style={ this.styles.row2 }>
        <div style={ this.styles.labelCurrency }>
          Expires:
        </div>
        <div style={ this.styles.answer }>
          <DateCounter
            timeToExpire={ timeToExpire }
          /> <i
            className="fa fa-clock-o" 
            style={{
              position: "absolute",
              right: "15px",
            }}
          />
        </div>
      </div> }
    </div>;
  }
}

