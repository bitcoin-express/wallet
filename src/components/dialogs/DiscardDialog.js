import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import Checkbox from 'material-ui/Checkbox';

import BitcoinCurrency from '../BitcoinCurrency';

class DiscardDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFlipped: false,
      rotateBack: false,
    };
  }

  render() {
    const {
      balance,
      currency,
      showValuesInCurrency,
      wallet,
      xr,
    } = this.props;

    const {
      isFlipped,
      rotateBack,
    } = this.state;

    return (
      <section>
        <p style={{ textAlign: 'center' }}>
          You are about to discard
        </p>
        <div>
          <BitcoinCurrency
            currency={ currency }
            xr={ xr }
            value={ balance }
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
          />
        </div>
        <p style={{ textAlign: 'center' }}>
          from this browser. Are you really sure?
        </p>
      </section>
    );
  }
}

export default DiscardDialog;
