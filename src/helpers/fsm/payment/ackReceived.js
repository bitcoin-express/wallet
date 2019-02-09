import { extractHostname, persistFSM } from '../tools';
// Question: When happens the paymentRecovery?


export function getAckReceivedTransitions() {
  return [{
    name: 'ackOk',
    from: 'AckReceived',
    to: 'SendAckAck'
  }, {
    name: 'failed',
    from: 'AckReceived',
    to: 'RecoverFailedCoins'
  }, {
    name: 'paymentRecovery',
    from: 'AckReceived',
    to: 'StartPayment'
  }];
}


var doAckReceived = function(fsm) {
  console.log("do"+fsm.state);

  if (fsm.ack.status == "ok") {
    return proceedValidAck(fsm)
  }
  
  switch (fsm.ack.status) {
    case "issuer-error":
      return Promise.resolve(fsm.paymentRecovery());

    case "payment-unknown":
      fsm.args.error = "Seller could not identify the sale item";
      break;

    case "after-expires":
      fsm.args.error = "The offer to sell has expired";
      break;

    case "insufficient-amount":
      fsm.args.error = "The payment failed because we didn't send enough funds";
      break;

    case "bad-coins":
      fsm.args.error = "One or more Coins were unexpectidly invalid";
      break;

    case "retry-expired":
      fsm.args.error = "Seller no longer permitting access to the product url";
      break;

    case "rejected":
      fsm.args.error = "Seller rejected this payment";
      break;

    case "failed":
      fsm.args.error = "The payment failed for an unspecified reason";
      break;

    default:
      fsm.args.error = "Received a bad PaymentAck";
      break;
  }
  return Promise.resolve(fsm.failed());                  
};


function proceedValidAck(fsm) {
  const { wallet } = fsm.args;

  const recordTransaction = (newBalance) => {
    const historyTransaction = {
      headerInfo: {
        fn: 'buy item',
        domain: fsm.ack.seller || extractHostname(document.referrer),
      },
      paymentInfo: {
        actualValue: fsm.args.amount,
        faceValue: fsm.args.amount,
        newValue: newBalance - fsm.args.balance,
        fee: 0,
      },
      coin: payment.coins,
      other: {
        target: fsm.args.amount,
        item: payment.transaction_id,
      },
      currency: fsm.args.currency,
    };

    return wallet.recordTransaction(historyTransaction);
  };

  const storeItem = () => {
    // Save in item store
    const domain = extractHostname(document.referrer);

    const item = {
      paymentDetails: {
        amount: fsm.args.amount,
        currency: fsm.args.currency,
        domain,
        description: fsm.args.description,
        payment_url: fsm.args.payment_url,
      },
      paymentAck: fsm.ack,
    };
    fsm.args.item = item;

    return wallet.saveItem(item, fsm.args.currency);
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.failed();
  };

  fsm.args.payment.ack = fsm.ack;
  return persistFSM(wallet, fsm.args)
    .then(wallet.storage.flush)
    .then(() => wallet.Balance(currency))
    .then(recordTransaction)
    .then(storeItem)
    .then(wallet.storage.flush)
    .then(fsm.ackOk)
    .catch(handleError);
}

