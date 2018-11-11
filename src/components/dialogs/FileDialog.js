import React, {Component} from 'react';
import PropTypes from 'prop-types';

import BitcoinCurrency from '../BitcoinCurrency';

import styles from '../../helpers/Styles';

class FileDialog extends Component {

  constructor(props) {
    super(props);

    this.styles = {
      section: {
        margin: '5px 0',
      },
      labelbtc: {
        display: 'inline-block',
        width: '130px',
        textAlign: 'left',
      },
      btc: {
        display: 'inline-block',
        height: '15px',
      },
    };
  }

  getNumber(num) {
    num = Number(num);
    const nums = ["zero", "one", "two",
      "three", "four", "five", "six",
      "seven", "eight", "nine"];

    if (num > nums.length) {
      return num;
    } else {
      return nums[num];
    }
  }

  render() {
    const {
      coinList,
      isFlipped,
      showValuesInCurrency,
      wallet,
      xr,

      actualValue,
      coinsInFile,
      comment,
      crypto,
      date,
      faceValue,
      fileValue,
      finalCoins,
      fee,
      name,
      removedCoins,
      type,
      verifiedValue,
    } = this.props;

    let totalValue = 0;
    coinList.forEach((coinStr, index) => {
      let coin = wallet.Coin(coinStr);
      totalValue += coin.value;
    });

    return <div style={{ textAlign: 'center' }}>
      <section
        style={{
          marginTop: '20px',
          border: '1px solid',
          borderRadius: '10px',
          padding: '20px 0 10px',
          background: 'rgba(168, 186, 248, 0.75)',
        }}
      >
        <div style={{
          marginBottom: '5px',
          fontWeight: 'bold',
        }}>
          <i
            className="fa fa-file-code-o"
            title="File name"
          />&nbsp;<i>{ name }</i>
        </div>
        <div style={{
          fontSize: 'small',
          fontWeight: 'bold',
          marginBottom: '5px',
        }}>
          { type } 
        </div>
        <div style={ this.styles.section }>
          <i
            className="fa fa-calendar"
            title="Date created"
          /> { date } 
        </div>
        <div style={{ margin: '5px 0 30px 0' }}>
          Total of { coinsInFile } Coin(s) found in file
          { removedCoins > 0 ? ` but ${this.getNumber(removedCoins)} Coin did not exist.` : "." }
        </div>
        <div style={ this.styles.section }>
          <span style={ this.styles.labelbtc }>
            File value: 
          </span><BitcoinCurrency
            color={ styles.colors.mainBlue }
            currency={ crypto }
            displayStorage={ false }
            isFlipped={ isFlipped }
            tiny={ true }
            showValuesInCurrency={ showValuesInCurrency }
            style={ this.styles.btc }
            value={ parseFloat(fileValue) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
        <div style={ this.styles.section }>
          <span style={ this.styles.labelbtc }>
            Face value: 
          </span><BitcoinCurrency
            color={ styles.colors.mainBlue }
            currency={ crypto }
            displayStorage={ false }
            isFlipped={ isFlipped }
            tiny={ true }
            showValuesInCurrency={ showValuesInCurrency }
            style={ this.styles.btc }
            value={ parseFloat(faceValue) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
        <div style={ this.styles.section }>
          <span style={ this.styles.labelbtc }>
            Actual value: 
          </span><BitcoinCurrency
            color={ styles.colors.mainBlue }
            currency={ crypto }
            displayStorage={ false }
            isFlipped={ isFlipped }
            tiny={ true }
            showValuesInCurrency={ showValuesInCurrency }
            style={ this.styles.btc }
            value={ parseFloat(actualValue) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
        <div style={ this.styles.section }>
          <span style={ this.styles.labelbtc }>
            Verification fee: 
          </span><BitcoinCurrency
            color={ styles.colors.mainBlue }
            currency={ crypto }
            displayStorage={ false }
            isFlipped={ isFlipped }
            tiny={ true }
            showValuesInCurrency={ showValuesInCurrency }
            style={ this.styles.btc }
            value={ parseFloat(fee) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
        <div style={{ margin: '5px 0 25px 0' }}>
          <span style={ this.styles.labelbtc }>
            Received value: 
          </span><BitcoinCurrency
            color={ styles.colors.mainBlue }
            currency={ crypto }
            displayStorage={ false }
            isFlipped={ isFlipped }
            tiny={ true }
            showValuesInCurrency={ showValuesInCurrency }
            style={ this.styles.btc }
            value={ parseFloat(totalValue) }
            wallet={ wallet }
            xr={ xr }
          />
        </div>
        { comment ? <div style={ this.styles.section }>
          Memo: { comment }
        </div> : null }
        <div style={ this.styles.section }>
          Total of { finalCoins } new Coin(s) have been added to the Wallet.
        </div>
      </section>
    </div>;
  }
};

FileDialog.defaultProps = {
};

export default FileDialog;
