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

  const retrieveCoins = (coins) => {
    let payment = {
      id: Math.random().toString(36).replace(/[^a-z]+/g, ''),
      transaction_id: fsm.args.transaction_id,
      coins: coins.map((c) => typeof c == "string" ? c : c.base64),
      order_id: fsm.args.order_id,
      client: "web",
      language_preference: "en_GB",
    };
    if (fsm.args.useEmail) {
      // User wants to use his email for recovery reasons
      payment["options"] = getPaymentOptions(fsm.args);
    }
    fsm.args.payment = payment;

    return fsm.coinsReady();
  };


  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.error(); 
  };

  const { amount, currency, wallet } = fsm.args;
  return wallet._getCoinsExactValue(amount, {}, false, currency)
    .then(retrieveCoins)
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
  const password = emailArray[1];
  const reference = emailArray[2];

  if (!withEmail || !email) {
    return null;
  }

  let emailObj = {
    email,
  };
  if (password && reference) {
    emailObj["password"] = password;
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
