import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from 'material-ui/Checkbox';

import BitcoinCurrency from '../BitcoinCurrency';
import StorageIcon from '../StorageIcon';

import styles from '../../helpers/Styles';

class MoveCoinsDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFlipped: false,
      rotateBack: false,
    };

    this.styles = {
      alert: {
        backgroundColor: 'white',
        color: styles.colors.alert,
        padding: '10px',
        borderRadius: '5px',
        borderStyle: 'solid',
        borderWidth: '1px',
      },
    };

    this._showValuesInCurrency = this._showValuesInCurrency.bind(this);
  }

  _showValuesInCurrency() {
    this.props.showValuesInCurrency();
    this.setState({
      isFlipped: true,
      rotateBack: false,
    });
    setTimeout(() => {
      this.setState({
        isFlipped: false,
        rotateBack: true,
      });
    }, 5000);
  }

  render() {
    const {
      balance,
      browser,
      coins,
      drive,
      futureStorageName,
      futureStorageAnimal,
      onCheckedMoveCoins,
      storageAnimal,
      storageName,
      wallet,
      xr,
    } = this.props;

    const {
      isFlipped,
      rotateBack,
    } = this.state;

    if (coins.total == 0) {
      return (
        <section style={{ textAlign: 'center' }}>
          <p style={{
            backgroundColor: 'white',
            color: 'red',
            padding: '10px',
            borderRadius: '5px',
          }}>{ drive ? <small><b>
            Warning: Deleting Google Drive files from the 'Bitcoin-express'
            directory may cause Wallet data and Coin loss.
          </b></small> : <small><b>
            Warning: Clearing { browser }'s local storage at any time will cause
            Wallet data and coins to be completely
            removed. Always make backups for safety!
          </b></small> }</p>
        </section>
      );
    } else {

      let coinsValues = Object.keys(coins).filter((k) => {
        return k != "total" && coins[k].length > 0;
      }).map((k) => {
        return <BitcoinCurrency
          centered={ true }
          color="rgba(0, 0, 0, 0.6)"
          currency={ k }
          isFlipped={ isFlipped }
          key={ k }
          labelButtonStyle={{
            color: styles.colors.mainTextColor,
          }}
          rotateBack={ rotateBack }
          showValuesInCurrency={ this._showValuesInCurrency }
          small={ true }
          style={{
            marginBottom: '15px',
          }}
          value={ wallet.getSumCoins(coins[k]) }
          wallet={ wallet }
          xr={ xr }
        />;
      });

      return (
        <section style={{ textAlign: 'center' }}>
          <p>
            { storageAnimal ? `'${storageAnimal}' in ` : '' } { storageName } is
            currently holding coins:
          </p>
          { coinsValues }
          <section style={{ textAlign: 'center' }}>
            <Checkbox
              onCheck={ onCheckedMoveCoins }
              defaultChecked={ true }
              labelStyle={{
                width: 'initial',
                color: "rgba(0, 0, 0, 0.6)",
              }}
              iconStyle={{
                fill: "rgba(0, 0, 0, 0.6)",
              }}
              style={{
                width: 'initial',
                margin: 'auto',
              }}
              label={ <span>
                Move coins from { storageAnimal ? `'${storageAnimal}'` : storageName } to
                &nbsp;{ futureStorageAnimal ? `'${futureStorageAnimal}'` : futureStorageName }?
                &nbsp;&nbsp;<StorageIcon
                  browser={ drive }
                  drive={ !drive }
                  tiny={ true}
                  wallet={ wallet }
                />
              </span> }
            />
          </section>
          <p style={ this.styles.alert }>
            { drive ? <small>
              Warning: Deleting Google Drive files from the 'Bitcoin-express'
              directory may cause Wallet data and Coin loss.
            </small> : <small>
              <b>Warning</b>: Clearing { browser }'s local storage at anytime
              will cause Wallet data and coins to be completely
              removed. Always make backups for safety!
            </small> }
          </p>
        </section>
      );
    }
  }
}

export default MoveCoinsDialog;
