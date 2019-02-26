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


export default function doAckReceived(fsm) {
  console.log("do"+fsm.state);
  
  switch (fsm.args.ack.status) {
    case "ok":
      return proceedValidAck(fsm);

    case "deferred":
      if (!fsm.args.ack.retry_after || fsm.args.ack.retry_after==0) {
        return Promise.resolve(fsm.paymentRecovery());
      }
      return proceedSoftError(fsm);

    case "rejected":
    case "failed":
      fsm.args.error = fsm.args.ack.error ? fsm.args.ack.error.message : "Payment failed";
  }

  const { wallet } = fsm.args;
  fsm.args.payment.ack = fsm.args.ack;
  return persistFSM(wallet, fsm.args)
    .then(wallet.storage.flush)
    .then(fsm.failed);                  
};


function proceedSoftError(fsm) {
  const { wallet } = fsm.args;
  const { retry_after } = fsm.args.ack;
  const MAX_WAIT = 10; // 10 seconds for now

  const handleSoftError = () => {
    if (retry_after < MAX_WAIT) {
      const message = `Retrieve payment after ${retry_after} seconds...`;
      fsm.args.notification("displayLoader", { message })

      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(fsm.paymentRecovery()), retry_after * 1000);
      });
    }

    const notificationParams = {
      secsToExpire: retry_after,
    };

    const promises = [
      fsm.args.notification("displaySoftError", notificationParams),
      new Promise((resolve, reject) => setTimeout(() => resolve(false), retry_after * 1000))
    ];

    return Promise.race(promises)
      .then((cancelled) => cancelled ? fsm.failed() : fsm.paymentRecovery());
  };

  fsm.args.payment.ack = fsm.args.ack;
  return persistFSM(wallet, fsm.args)
    .then(wallet.storage.flush)
    .then(handleSoftError)
    .catch(fsm.failed);
}


function proceedValidAck(fsm) {
  const {
    payment,
    wallet,
  } = fsm.args;

  const recordTransaction = (newBalance) => {
    const historyTransaction = {
      headerInfo: {
        fn: 'buy item',
        domain: fsm.args.ack.seller || extractHostname(document.referrer),
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
      paymentAck: fsm.args.ack,
    };
    fsm.args.item = item;

    return wallet.saveItem(item, fsm.args.currency);
  };

  const persistHistoryItemAndFSM = (newBalance) => {
    fsm.args.payment.ack = fsm.args.ack;
    const promises = [
      persistFSM(wallet, fsm.args),
      recordTransaction(newBalance),
      storeItem()
    ];
    return Promise.all(promises);
  };

  const handleError = (err) => {
    fsm.args.error = err.message || err;
    return fsm.failed();
  };

  return wallet.Balance(fsm.args.currency)
    .then(persistHistoryItemAndFSM)
    .then(() => wallet.config.storage.flush())
    .then(() => fsm.ackOk())
    .catch(handleError);
}

