import { getSecondsFromISODate, getSecondsToISODate } from '../tools';


export function getSplitCoinsTransitions() {
  return [{
    name: 'coinsReady',
    from: 'SplitCoins',
    to: 'PaymentReady'
  },
  {
    name: 'paymentTimeout',
    from: 'SplitCoins',
    to: 'Exit'
  },
  {
    name: 'error',
    from: 'SplitCoins',
    to: 'Exit'
  }];
};


export default function doSplitCoins(fsm) {
  console.log("do"+fsm.state);

  const expires = getSecondsFromISODate(fsm.args.expires);
  const now = new Date().getTime() / 1000;
  if (expires < now) {
    fsm.args.error = "Payment request expired";
    return Promise.resolve(fsm.paymentTimeout());
  }

  if (fsm.args.policies && fsm.args.policies.change_furnished) {
    // TO_DO
  }

  const preparePaymentObject = (coins) => {
    let payment = {
      wallet_id: Math.random().toString(36).replace(/[^a-z]+/g, ''),
      coins: coins.map((c) => typeof c == "string" ? c : c.base64),
      client: "web",
    };

    if (fsm.args.useEmail) {
      payment["options"] = getPaymentOptions(fsm.args);
    }

    if (fsm.args.order_id) {
      payment["order_id"] = fsm.args.order_id;
    }

    if (fsm.args.transaction_id) {
      payment["transaction_id"] = fsm.args.transaction_id;
    }

    if (fsm.args.time_budget) {
      payment["time_budget"] = fsm.args.time_budget;
    }

    fsm.args.payment = payment;
    return fsm.coinsReady();
  };


  const handleError = (err) => {
    fsm.args.error = err.message || err;
    console.log(err);
    return fsm.error(); 
  };

  const { amount, currency, wallet, beginResponse } = fsm.args;
  const args = {
    beginResponse,
  };
  return wallet._getCoinsExactValue(amount, args, false, currency)
    .then(preparePaymentObject)
    .catch(handleError);
};


/**
 * Returns the 'options' object for the given payment.
 * :param args: [obj] FSM arguments
 * :return: [obj] The options object
 */
export function getPaymentOptions(args) {
  const { wallet, policies, currency } = args;
  const emailArray = wallet._fillEmailArray(0, true, currency);

  const email = emailArray[0];
  const passphrase = emailArray[1];
  const reference = emailArray[2];

  if (!withEmail || !email) {
    return null;
  }

  let emailObj = {
    email,
  };
  if (passphrase && reference) {
    emailObj["passphrase"] = passphrase;
    emailObj["reference"] = reference;
  }

  let options = {
    language_preference: "en-GB",
  };

  if (policies.receipt_via_email) {
    options.send_receipt_to = emailObj;
  }
  if (policies.refund_via_email) {
    options.send_refund_to = emailObj;
  }
  if (policies.issuer_refund_via_email) {
    options.send_issuer_refund_to = emailObj;
  }

  return options;
};

