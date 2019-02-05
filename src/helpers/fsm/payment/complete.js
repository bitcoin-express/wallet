

export function getCompleteTransitions() {
  return [{
    name: 'close',
    from: 'Complete',
    to: 'FinalState'
  }];
}


export default function doComplete(fsm) {
  console.log("do"+fsm.state);

  const completePayment = () => {
    fsm.args.notification("displayItem", { item: fsm.args.item });
    return fsm.close();
  }

  return BitcoinExpress.Host.PopupMessage(`Paid ${fsm.args.currency}${fsm.args.amount}`, 5000)
    .then(completePayment)
    .catch(() => fsm.close());
};

