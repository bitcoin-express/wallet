import { persistFSM, getRecoveryCoins, getSecondsToISODate } from '../tools';


export function getPaymentFailedTransitions() {
  return [{
    name: 'exit',
    from: 'PaymentFailed',
    to: 'Exit'
  }];
};


/**
 * PaymentFailed will record the loss in history. If PaymentAck exits also 
 * call Host.PaymentAckAck() then transition to 'exit'.
 */
export default function doPaymentFailed(fsm) {
  console.log("do" + fsm.state);
  const { wallet } = fsm.args;

  const recordTransaction = (balance) => {
    if (fsm.args.balance == balance) {
      return wallet.config.storage.flush();
    }

    const recovered = balance - fsm.args.balance;
    if (recovered == 0) {
      fsm.args.error += ". 0 coins recovered.";
      return true;
    }

    const transaction = {
      headerInfo: {
        fn: 'payment failure',
        domain: fsm.args.order_id,
      },
      paymentInfo: {
        actualValue: recovered,
        faceValue: recovered,
        newValue: recovered,
        comment: "recovery from payment failure",
        fee: 0,
      },
      coin: fsm.args.coins,
      other: {
        target: fsm.args.amount,
        item: fsm.args.payment.transaction_id,
      },
      currency: fsm.args.currency,
    };

    fsm.args.error += `. Recovered a total of ${fsm.args.currency}${recovered.toFixed(8)}.`;
    return wallet.recordTransaction(transaction);
  };

  
  return wallet.Balance(fsm.args.currency)
    .then(recordTransaction)
    .then(() => persistFSM(wallet, null))
    .then(() => wallet.config.storage.flush())
    .then(() => fsm.args.ack ? BitcoinExpress.Host.PaymentAckAck(fsm.args.ack) : true)
    .then(() => fsm.exit());
};

