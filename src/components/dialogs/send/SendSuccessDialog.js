import React from 'react';
import PropTypes from 'prop-types';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Address from '../../Address';
import { AppContext } from "../../../AppContext";
import BitcoinCurrency from '../../BitcoinCurrency';
import styles from '../../../helpers/Styles';


class SendSuccessDialog extends React.Component {

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
      blockchainFee,
      comment,
      date,
      payment,
      balance,
      fee,
      initialBalance,
      displayFee,
    } = this.props;

    const {
      snackbarUpdate,
      wallet,
    } = this.context;

    return <section style={{ margin: '20px 0' }}>

      <Tabs>

        <TabList>
          <Tab>Info</Tab>
          <Tab>Details</Tab>
          { comment ? <Tab>Comment</Tab> : null }
        </TabList>

        <TabPanel>
          <div
            style={{
              margin: '10px 0',
              textAlign: 'center',
            }}
          >
            <i
              className="fa fa-paper-plane"
              style={{
                color: styles.colors.mainGreen,
                fontSize: '40px',
                textAlign: 'center',
                verticalAlign: 'top',
                marginRight: '15px',
              }}
            /> <BitcoinCurrency
              color={ styles.colors.mainGreen }
              displayStorage={ false }
              style={{
                display: 'inline-block',
              }}
              removeInitialSpaces={ true }
              value={ parseFloat(payment) }
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
              Amount deducted
            </div>
            <BitcoinCurrency
              { ...this.props }
              color={ styles.colors.mainRed }
              displayStorage={ false }
              removeInitialSpaces={ true }
              small={ true }
              value={ parseFloat(fee) + parseFloat(payment) }
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

        { comment ? <TabPanel>
          <p
            style={{
              textAlign: 'center',
              color: styles.colors.mainBlue,
              fontStyle: 'italic',
            }}
          >
            { comment }
          </p>
        </TabPanel> : null }
      </Tabs>
    </section>;
  }
}

SendSuccessDialog.contextType = AppContext;

export default SendSuccessDialog;
