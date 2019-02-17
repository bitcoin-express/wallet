import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount, render } from 'enzyme';


import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import injectTapEventPlugin from 'react-tap-event-plugin';

import Wallet from '../../src/Wallet'
import getWallet from '../../test/__mocks__/wallet'


describe('Payments', () => {

  let component;
  jest.setTimeout(30000);

  beforeEach((done) => {
    injectTapEventPlugin();
    const muiTheme = getMuiTheme({
      palette: {
        primary1Color: "#000000",
      },
    });

    localStorage.setItem("__be_wallet_lstorage__", JSON.stringify(getWallet()));
    localStorage.setItem("loggedIn", true);

    const paymentRequest = {
      "PaymentRequest": {
        "payment_details_version": "1",
        "PaymentDetails": {
          "acceptable_issuers": ["(be.ap.rmp.net)"],
          "amount": 0.0000123,
          "created": new Date().toISOString(),
          "currency": "XBT",
          "description": "test payment 1",
          "payment_url": "http://google.com",
          "transaction_id": "XX11"
        }
      }
    };

    component = shallow(
      <MuiThemeProvider muiTheme={ muiTheme }>
        <Wallet
          acceptableIssuers="be.ap.rmp.net"
          close={ () => {} }
          defaultIssuer={ ["eu.carrotpay.com", "be.ap.rmp.net"] }
          initializeDraggableArea={ () => {} }
          isFullScreen={ true }
          onAlertHidden={ () => {} }
          onAlertShown={ () => {} }
          onContractClick={ () => {} }
          onExpandClick={ () => {} }
          paymentRequest={ paymentRequest }
          removePayment={ () => {} }
          test={ true }
        />
      </MuiThemeProvider>
    );

    setTimeout(() => {
      done();
    }, 10000);
  });

  it('payment test 1', () => {
    console.log(component.dive().state()); 
    expect(component.dive().state('status')).toBe(0);
  });
});

