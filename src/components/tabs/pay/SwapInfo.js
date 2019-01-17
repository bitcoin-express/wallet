import React from 'react';
import PropTypes from 'prop-types';

import BitcoinCurrency from '../../BitcoinCurrency';
import { getDomainFromURL } from '../../../helpers/tools';
import styles from '../../../helpers/Styles';
import DateCounter from './DateCounter';


export default class SwapInfo extends React.Component {
  
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
      answerRate: {
        color: styles.colors.mainBlue,
        display: 'grid',
        width: 'calc(100% - 70px)',
        gridTemplateColumns: 'repeat(2, 1fr)',
        whiteSpace: 'nowrap',
        width: '190px',
      },
      label: {
        color: styles.colors.mainTextColor,
        marginRight: '10px',
        fontWeight: 'bold',
        textAlign: 'left',
      },
      labelCurrency: {
        color: styles.colors.mainTextColor,
        marginRight: '10px',
        fontWeight: 'bold',
        width: '70px',
        textAlign: 'left',
      },
      labelRates: {
        color: styles.colors.mainTextColor,
        marginRight: '10px',
        fontWeight: 'bold',
        width: '175px',
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
      row3: {
        display: 'flex',
        marginTop: '10px',
        marginBottom : '15px',
        lineHeight: '13px',
      },
      row4: {
        display: 'flex',
        marginTop: '5px',
        width: '280px',
      },
    };
  }

  render () {
    const {
      amount,
      currency,
      disabled,
      errorMsg,
      isFlipped,
      isFullScreen,
      memo,
      payment_url,
      secsToExpire,
      showValuesInCurrency,
      swapList,
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

    let totalConverted = 0;
    swapList.forEach((swap) => {
      const c = Object.keys(swap)[0];
      totalConverted += swap[c].exchange;
    });

    let labelExpire = "Rates valid for:";
    let styleExpire = this.styles.labelRates;
    let rateLabel = "";
    if (swapList.length == 1) {
      const firstSwap = swapList[0][Object.keys(swapList[0])[0]];
      labelExpire = "Rate:";
      styleExpire = this.styles.labelCurrency;
      rateLabel = (totalConverted / (firstSwap.from + firstSwap.fee)).toFixed(3);
    }

    const tooMuchTime = Math.floor(secsToExpire / (60 * 60)) > 0;

    return <div style={ styleContainer }>
      <div style={ this.styles.row }>
        <div style={ this.styles.label }>
          Payment to:
        </div>
        <div style={ this.styles.answer }>
          { getDomainFromURL(payment_url) }
        </div>
      </div>

      <div style={ this.styles.row2 }>
        <div style={ this.styles.label }>
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

      <small style={ this.styles.row3 }>
        Insufficient { currency }  - swap required.
      </small>



      { swapList.map((swap, idx) => {
        const c = Object.keys(swap)[0];
        const {
          from,
          fee,
        } = swap[c];
        const value = swap[c].exchange;
        return <div key={ c + value } style={ this.styles.row2 }>
          <div style={ this.styles.labelCurrency }>
            { idx == 0 ? "Swap:" : "" }
          </div>
          <div style={ this.styles.answerCurrency }>
            <BitcoinCurrency
              centered={ isFullScreen }
              color="#3c3c3c"
              currency={ c }
              displayStorage={ false }
              isFlipped={ isFlipped }
              labelStyle={{
                color: styles.colors.mainBlue,
              }}
              small={ true }
              removeInitialSpaces={ !isFullScreen }
              showValuesInCurrency={ showValuesInCurrency }
              style={{ width: '180px' }}
              value={ from + fee }
              wallet={ wallet }
              xr={ xr }
            />
          </div>
        </div>;
      }) }

      <div style={ this.styles.row2 }>
        <div style={ this.styles.labelCurrency }>
          For:
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
            value={ totalConverted }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
      </div>

      { tooMuchTime ? null : <div style={ this.styles.row4 }>
        <div style={ styleExpire }>
          { labelExpire }
        </div>
        <div style={ this.styles.answerRate }>
          <div style={{ textAlign: 'left' }}>
            { rateLabel }
          </div>
          <div style={{ textAlign: 'right' }}>
            <DateCounter
              disabled={ disabled }
              inSeconds={ true }
              timeToExpire={ parseInt(secsToExpire) + 5 }
            />
          </div>
        </div>
      </div> }

    </div>;
  }
}
