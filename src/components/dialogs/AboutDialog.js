import React from 'react';
import PropTypes from 'prop-types';

class AboutDialog extends React.Component {
  constructor(props) {
    super(props);

    this.isNew = {
      '0.1.06': "About window included",
      '0.1.07': "Bug-fix remove expired addresses",
      '0.1.08': "Payment requests activated",
      '0.1.09': "Bug-fix access to parent window causing cross-origin request blocked",
    };
  }

  render() {
    return <section style={{ margin: '25px 0 10px' }}>
      <p style={{ textAlign: 'center' }}>
        <b>v{ window.version }</b>&nbsp;
        <a
          href="https://github.com/bitcoin-express/bitcoin-express-wallet/commit/master"
          target="_blank"
          title={ this.isNew[window.version] }
        >
          What's new?
        </a>
      </p>
      <p style={{ textAlign: 'center' }}>
        Bitcoin-express is designed by Carrot&#174;.<br />
        Want to help? <a href="https://github.com/bitcoin-express/bitcoin-express-wallet" target="_blank">get involved</a>
      </p>
      <p>
        All of the source code to Bitcoin-express wallet is available under licenses which are both <a href="http://www.gnu.org/philosophy/free-sw.html" target="_blank">free</a> and <a href="https://opensource.org/docs/definition.php" target="_blank">open source</a>. The specific source code used to create this copy can be found <a href="https://github.com/bitcoin-express/bitcoin-express-wallet" target="_blank">here</a>, and you can read instructions on how to download and build the code for yourself. 
      </p>
      <p style={{ textAlign: 'center' }}>
        <b>Lead developer: </b>
        Jose E. Martinez Saiz (<a
          href="https://github.com/jootse84"
          target="_blank"
        >github</a>)
        <br />
        <b>Contributers: </b>
        Ricky Rand,&nbsp;
        Paul Clark,&nbsp;
        Jon Barber,&nbsp;
        Clive Rand
        <br />
        <b>Acknowledgements: </b>
        <a
          href="http://www.carrotpay.com"
          target="_blank"
        >
          CarrotPay
        </a>,&nbsp;
        <a
          href="https://blockchain.info"
          target="_blank"
        >
          Blockchain.info
        </a>,&nbsp;
        <a
          href="https://developers.google.com/drive/"
          target="_blank"
        >
          Google Drive API
        </a>
      </p>
    </section>;
  }
}

export default AboutDialog;
