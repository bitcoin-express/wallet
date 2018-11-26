import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import CircularProgress from 'material-ui/CircularProgress';

import BitcoinCurrency from '../BitcoinCurrency';
import HelpTooltip from '../HelpTooltip';

import styles from '../../helpers/Styles';

class HistoryDialog extends React.Component {

  constructor(props) {
    super(props);

    this.styles = {
      row: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '10px',
      },
      label: {
        minWidth: '140px',
      },
      left: {
        fontSize: '16px',
        fontWeight: 'bold',
        padding: '0 5px 0 0',
        color: styles.colors.mainBlue,
        textAlign: 'right',
      },
      right: {
        fontSize: '17px',
        color: styles.colors.mainBlue,
        textAlign: 'left',
        marginLeft: '10px',
      },
      bullet: {
        color: styles.colors.mainBlue,
      },
    };

    this.state = {
      loading: false,
      recovered: false,
    };

    this.handleRecovery = this.handleRecovery.bind(this);
  }

  handleRecovery() {
    const {
      refreshCoinBalance,
      snackbarUpdate,
      transaction,
      wallet,
    } = this.props;

    if (!transaction.info || !transaction.info.recovery) {
      return;
    }

    let {
      recovery,
    } = transaction.info;

    this.setState({
      loading: true,
    });

    const args = {
      empty: false,
      callback: () => {
        const {
          CRYPTO,
          HISTORY,
          storage,
        } = wallet.config;

        const crypto = wallet.getPersistentVariable(CRYPTO, "XBT");

        let txs = wallet.getHistoryList();

        if (!txs[crypto]) {
          return true;
        }

        txs[crypto].forEach((tx, index) => {
          if (!tx.id) {
            return;
          }
          if (tx.id === transaction.id) {
            delete txs[crypto][index].info.recovery;
            txs[crypto][index].info.isRecovered = true;
          }
        });
        return storage.set(HISTORY, txs);
      },
    };

    wallet.recoverCoins("", recovery, args).then((numCoins) => {
      this.setState({
        loading: false,
        recovered: true,
      });

      if (numCoins == 0) {
        snackbarUpdate('Coin(s) already recovered');
        return;
      }

      refreshCoinBalance();
      let value = 0;
      recovery.forEach((c) => {
        value += parseFloat(c.value);
      });
      snackbarUpdate(`Recovered XBT${value}`);
    });
  }

  render() {
    const {
      isFlipped,
      oldBalance,
      showValuesInCurrency,
      transaction,
      wallet,
      xr,
    } = this.props;

    if (!transaction) {
      return null;
    }

    let {
      actualValue,
      faceValue,
      fee,
    } = transaction.issuer;

    const {
      recovered,
    } = this.state;

    let {
      blockchainTxid,
      copyCoinString,
      recovery,
      isRecovered,
      file,
    } = transaction.info;

    const change = parseFloat(transaction.balance) - oldBalance;
    const isDeferred = transaction.action.endsWith("deferred");

    if (this.state.loading) {
      return <section style={{ textAlign: 'center', margin: '20px 0 15px 0' }}>
        <CircularProgress
          size={ 150 }
          thickness={ 5 }
        />
        <p>
          <small>recovering coin(s)...</small>
        </p>
      </section>;
    }

    return <section style={{ marginTop: '20px' }}>
      <Tabs>

        <TabList>
          <Tab>Info</Tab>
          { !isDeferred ? <Tab>Details</Tab> : null }
          <Tab>Balance</Tab>
          { transaction.comment ? <Tab>Note</Tab> : null }
        </TabList>

        <TabPanel>
          <p style={{ textAlign: 'center' }}>
            <b>Domain</b>: { transaction.domain }
          </p>

          { blockchainTxid && !isDeferred ? <div style={{
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
          </div> : null }

          { transaction.action.endsWith("deferred") ? <div
            style={{
              color: '#966600',
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Blockchain transfer has been scheduled and is expected to start soon.
          </div> : null }

          { copyCoinString ? <p
            style={{
              textAlign: 'center',
            }}
          >
            <i className="fa fa-clipboard" /> Copied in clipboard
          </p> : null }

          { file ? <p
            style={{
              textAlign: 'center',
            }}
          >
            <i className="fa fa-file" /> Extracted in file
          </p> : null }

          { recovery && !recovered ? <p
            style={{
              textAlign: 'center',
              color: styles.colors.mainBlue,
              cursor: 'pointer',
            }}
            onClick={ this.handleRecovery }
          >
            <i className="fa fa-undo" /> Recover coin
          </p> : null }

          { isRecovered || recovered ? <p
            style={{
              textAlign: 'center',
              color: styles.colors.mainGreen,
            }}
          >
            <i className="fa fa-recycle" /> Amount recovered and already in the wallet
          </p> : null }
        </TabPanel>

        { !isDeferred ? <TabPanel>

          <div style={ this.styles.row }>
            <div style={ this.styles.left }>
              <div style={ this.styles.label }>
                <HelpTooltip
                  note={
                    <span>
                      <b>Face value</b> is the value written in the
                      coins used for this transaction.
                    </span>
                  }
                  style={ this.styles.bullet }
                /> Face value:
              </div>
            </div>
            <div style={ this.styles.right }>
              <BitcoinCurrency
                color="rgba(0, 0, 0, 0.87)"
                displayStorage={ false }
                isFlipped={ isFlipped }
                labelStyle={{ color: styles.colors.darkBlue }}
                removeInitialSpaces={ true }
                showValuesInCurrency={ showValuesInCurrency }
                small={ true }
                style={{ display: 'inline-block' }}
                value={ parseFloat(faceValue) }
                wallet={ wallet }
                xr={ xr }
              />
            </div>
          </div>

          <div style={ this.styles.row }>
            <div style={ this.styles.left }>
              <div style={ this.styles.label }>
                <HelpTooltip
                  note={
                    <span>
                      <b>Actual value</b> is the value of the coins
                      as reported by the Issuer.
                    </span>
                  }
                  style={ this.styles.bullet }
                /> Actual value:
              </div>
            </div>
            <div style={ this.styles.right }>
              <BitcoinCurrency
                color="rgba(0, 0, 0, 0.87)"
                displayStorage={ false }
                isFlipped={ isFlipped }
                labelStyle={{ color: styles.colors.darkBlue }}
                removeInitialSpaces={ true }
                showValuesInCurrency={ showValuesInCurrency }
                small={ true }
                style={{ display: 'inline-block' }}
                value={ parseFloat(actualValue) }
                wallet={ wallet }
                xr={ xr }
              />
            </div>
          </div>

          <div style={ this.styles.row }>
            <div style={ this.styles.left }>
              <div style={ this.styles.label }>
                <HelpTooltip
                  note={
                    <span>
                      <b>Fee</b> is the amount deducted by the
                      Issuer for verifying the actual value.
                    </span>
                  }
                  style={ this.styles.bullet }
                /> Fee:
              </div>
            </div>
            <div style={ this.styles.right }>
              <BitcoinCurrency
                color="rgba(0, 0, 0, 0.87)"
                displayStorage={ false }
                isFlipped={ isFlipped }
                labelStyle={{
                  color: fee > 0 ? styles.colors.mainRed : styles.colors.mainGreen,
                }}
                removeInitialSpaces={ true }
                showValuesInCurrency={ showValuesInCurrency }
                small={ true }
                style={{ display: 'inline-block' }}
                value={ parseFloat(fee) }
                wallet={ wallet }
                xr={ xr }
              />
            </div>
          </div>

        </TabPanel> : null }

        <TabPanel>

          <div style={ this.styles.row }>
            <div style={ this.styles.left }>
              <div style={ this.styles.label }>
                Initial balance:
              </div>
            </div>
            <div style={ this.styles.right }>
              <BitcoinCurrency
                color="rgba(0, 0, 0, 0.87)"
                displayStorage={ false }
                isFlipped={ isFlipped }
                removeInitialSpaces={ true }
                showValuesInCurrency={ showValuesInCurrency }
                small={ true }
                style={{ display: 'inline-block' }}
                value={ parseFloat(oldBalance) }
                wallet={ wallet }
                xr={ xr }
              />
            </div>
          </div>

          <div style={ this.styles.row }>
            <div style={ this.styles.left }>
              <div style={ this.styles.label }>
                Change in balance:
              </div>
            </div>
            <div style={ this.styles.right }>
              <BitcoinCurrency
                color="rgba(0, 0, 0, 0.87)"
                displayStorage={ false }
                isFlipped={ isFlipped }
                labelStyle={{
                  color: change < 0 ? styles.colors.mainRed : 'inherit',
                }}
                removeInitialSpaces={ true }
                showValuesInCurrency={ showValuesInCurrency }
                small={ true }
                style={{ display: 'inline-block' }}
                value={ change }
                wallet={ wallet }
                xr={ xr }
              />
            </div>
          </div>

          <div style={ this.styles.row }>
            <div style={ this.styles.left }>
              <div style={ this.styles.label }>
                New balance:
              </div>
            </div>
            <div style={ this.styles.right }>
              <BitcoinCurrency
                color="rgba(0, 0, 0, 0.87)"
                displayStorage={ false }
                isFlipped={ isFlipped }
                removeInitialSpaces={ true }
                showValuesInCurrency={ showValuesInCurrency }
                small={ true }
                style={{ display: 'inline-block' }}
                value={ parseFloat(transaction.balance) }
                wallet={ wallet }
                xr={ xr }
              />
            </div>
          </div>

        </TabPanel>

        { transaction.comment ? <TabPanel>
          <p
            style={{
              textAlign: 'center',
              color: styles.colors.mainBlue,
              fontStyle: 'italic',
            }}
          >
            { transaction.comment }
          </p>
        </TabPanel> : null }

      </Tabs>
    </section>;
  }
}

HistoryDialog.propTypes = {};
HistoryDialog.defaultProps = {};

export default HistoryDialog;
