import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';

import BitcoinCurrency from '../BitcoinCurrency';

class CloseDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFlipped: false,
      rotateBack: false,
    };
  }

  render() {
    const {
      isClose,
      // file download
      onCheckDownload,
      href,
      fileName,
      // BitcoinCurrency
      balances,
      currency,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const {
      isFlipped,
      rotateBack,
    } = this.state;

    const isGDrive = wallet.config.storage.config.name == "googleDrive";

    let defaultCheck = false;
    let content = <p>
      Wallet remains available for payments when needed.
    </p>;

    if (!isClose) {
      defaultCheck = !isGDrive;
      content = isGDrive ? <section>
        <p style={{ color: 'red' }}>
          For complete disconnection also log out of Google.
        </p>
        <p>
          Note: Wallet files will remain in network storage and will be used next time you connect.
        </p>
      </section> : <section>
        <p style={{ color: 'red' }}>
          Note: All coins and data will be completely removed from this browser.
        </p>
      </section>;
    }

    let coinComponents = [];
    Object.keys(balances).forEach((k) => {
      if (balances[k] == 0) {
        return;
      }
      coinComponents.push(<BitcoinCurrency
        key={ k }
        currency={ k }
        xr={ xr }
        value={ balances[k] }
        wallet={ wallet }
        small={ true }
        centered={ true }
        color="rgba(0, 0, 0, 0.6)"
        isFlipped={ isFlipped }
        rotateBack={ rotateBack }
        showValuesInCurrency={ () => {
          showValuesInCurrency();
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
        }}
      />);
    });

    return <section>
      <h3 style={{ margin: '20px 0' }}>
        Are you sure?
      </h3>
      { content }
      <div style={{ marginBottom: '20px' }}>
        { coinComponents }
      </div>
      <Checkbox
        onCheck={ onCheckDownload }
        defaultChecked={ defaultCheck }
        label={ `Download backup file before ${ isClose ? 'closing' : 'removal' }.` }
        labelStyle={{
          width: 'initial',
          color: "rgba(0, 0, 0, 0.6)",
        }}
        iconStyle={{
          fill: "rgba(0, 0, 0, 0.6)",
        }}
      />
      <span style={{ opacity: '0' }}>
        <a
          id="bckdownload"
          href={ `data:application/json;charset=utf8,${href}` }
          target="_blank"
          download={ fileName }
        >
          &nbsp;
        </a>
      </span>
    </section>;
  }
}

export default CloseDialog;
