import { persistFSM } from '../tools';
// Question, what happens when there is an error when comunicating with the Host?
// No transition to error state?


export function getSendAckAckTransitions() {
  return [{
    name: 'paymentComplete',
    from: 'SendAckAck',
    to: 'Complete'
  }];
}


export default function doSendAckAck(fsm) {
  console.log("do"+fsm.state);
  const { wallet } = fsm.args;

  const sendAckToBitcoinExpress = () => {
    delete fsm.args.ack.coins;
    return BitcoinExpress.Host.PaymentAckAck(fsm.args.ack);
  };

  return persistFSM(wallet, null)
    .then(() => wallet.storage.flush())
    .then(sendAckToBitcoinExpress)
    .then(() => fsm.paymentComplete())
    .catch(() => fsm.paymentComplete());
};

