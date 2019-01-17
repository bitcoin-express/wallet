import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Avatar from '@material-ui/core/Avatar';
import isURL from 'validator/lib/isURL';

import BitcoinCurrency from '../BitcoinCurrency';
import styles from '../../helpers/Styles';
import { getDomainFromURL } from '../../helpers/tools';

class ItemPurchasedDialog extends Component {
  constructor (props) {
    super(props);

    this.styles ={
      container: {
        textAlign: 'center',
      },
      container2: {
        textAlign: 'center',
        margin: '30p 30px 0 30px',
        border: 'solid #8081ff 1px',
        borderRadius: '15px',
      },
    };
  }

  render() {
    const {
      isFlipped,
      paymentAck,
      paymentDetails,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const {
      payment_url,
    } = paymentDetails;

    const {
      memo,
      return_url,
    } = paymentAck;

    let icon = "fa fa-unlock-alt";
    let iconColor = "#b91313";
    if (return_url.startsWith("http://") || return_url.startsWith("https://")) {
      icon = "fa fa-lock";
      iconColor = "#1c8e1c";
    }

    return <section style={{ margin: '20px 0' }}>

      <div style={ this.styles.container }>
        <p>
          <b>Payment to</b>: {
            getDomainFromURL(payment_url)
          }
        </p>
      </div>

      { return_url ? <div style={ this.styles.container }>
        <p>
          <b><i
            className={ icon }
            style={{
              color: iconColor,
              fontSize: '10px',
            }}
          /> Seller</b>: {
            getDomainFromURL(return_url)
          }
        </p>
      </div> : null }

      <div
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Purchase price
      </div>

      <BitcoinCurrency
        centered={ true }
        color={ styles.colors.mainBlue }
        isFlipped={ isFlipped }
        showValuesInCurrency={ showValuesInCurrency }
        style={{
          marginBottom: '20px',
        }}
        tiny={ true }
        value={ paymentDetails.amount }
        displayStorage={ false }
        wallet={ wallet }
        xr={ xr }
      />

      { memo || isURL(return_url) ? <div style={ this.styles.container2 }>
        { isURL(return_url) ? <p>
          <a
            href={ return_url }
            target="_blank"
            style={{
              textDecoration: 'inherit',
              color: '#966600',
              fontWeight: 'bold',
            }}
          >
            Fetch purchase
          </a>
        </p> : null }
        { memo ? <p>
          <b>Memo</b>: { memo }
        </p> : null }
      </div> : null }

    </section>;
  }
}

ItemPurchasedDialog.propTypes = {};

export default ItemPurchasedDialog;
