import React from 'react';
import PropTypes from 'prop-types';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Address from '../../Address';
import BitcoinCurrency from '../../BitcoinCurrency';

import styles from '../../../helpers/Styles';

class ReceiveSuccessDialog extends React.Component {
  constructor(props) {
    super(props);

    this.styles = {
      row: {
        display: 'flex',
        marginTop: '10px',
      },
      label: {
        textAlign: 'right',
        width: 'calc(50% - 20px)',
        fontSize: '20px',
        paddingRight: '14px',
      },
    };
  }

  render() {
    const {
      blockchainAddress,
      blockchainTxid,
      received,
      balance,
      fee,
      initialBalance,
      snackbarUpdate,
      wallet,
    } = this.props;

    return <section style={{ margin: '20px 0' }}>

      <Tabs>

        <TabList>
          <Tab>Info</Tab>
          <Tab>Details</Tab>
        </TabList>

        <TabPanel>
          <div
            style={{
              margin: '10px 0',
              textAlign: 'center',
            }}
          >
            <i
              className="fa fa-university"
              style={{
                color: styles.colors.mainGreen,
                fontSize: '40px',
                textAlign: 'center',
                marginBottom: '10px',
                marginRight: '15px',
              }}
            /> <BitcoinCurrency
              { ...this.props }
              color={ styles.colors.mainGreen }
              currency="BTC"
              labelButtonStyle={{
                color: styles.colors.mainTextColor,
              }}
              displayStorage={ false }
              style={{
                display: 'inline-block',
              }}
              removeInitialSpaces={ true }
              value={ parseFloat(received) }
            />
          </div>

          { blockchainAddress ? <Address
            blockchainAddress={ blockchainAddress }
            info={ false }
            snackbarUpdate={ snackbarUpdate }
            wallet={ wallet }
          /> : null }

          <div style={{
            textAlign: 'center',
            margin: '10px 0 0 0',
          }}>
            <a
              href={ `https://blockchain.info/tx/${blockchainTxid}` }
              target="_blank"
              style={{
                textDecoration: 'inherit',
                color: '#966600',
                fontWeight: 'bold',
              }}
              title="Blockchain.info"
            >
              Track progress
            </a>
          </div>
        </TabPanel>

        <TabPanel>
          <div style={ this.styles.row }>
            <div style={ this.styles.label }>
              Initial Balance
            </div>
            <BitcoinCurrency
              { ...this.props }
              color={ styles.colors.mainBlue }
              displayStorage={ false }
              removeInitialSpaces={ true }
              small={ true }
              value={ parseFloat(initialBalance) }
            />
          </div>
          { parseFloat(fee) > 0 ? <div style={ this.styles.row }>
            <div style={ this.styles.label }>
              Total Fee
            </div>
            <BitcoinCurrency
              { ...this.props }
              color={ styles.colors.mainBlue }
              displayStorage={ false }
              removeInitialSpaces={ true }
              small={ true }
              value={ parseFloat(fee) }
            />
          </div> : null }
          <div style={ this.styles.row }>
            <div style={ this.styles.label }>
              Amount received
            </div>
            <BitcoinCurrency
              { ...this.props }
              color={ styles.colors.mainGreen }
              displayStorage={ false }
              removeInitialSpaces={ true }
              small={ true }
              value={ parseFloat(fee) + parseFloat(received) }
            />
          </div>
          <div style={ this.styles.row }>
            <div style={ this.styles.label }>
              Final Balance
            </div>
            <BitcoinCurrency
              { ...this.props }
              color={ styles.colors.mainBlue }
              displayStorage={ false }
              removeInitialSpaces={ true }
              small={ true }
              value={ parseFloat(balance) }
            />
          </div>
        </TabPanel>
      </Tabs>
    </section>;
  }
}

export default ReceiveSuccessDialog;
