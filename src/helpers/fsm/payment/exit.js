

export function getExitTransitions() {
  return [{
    name: 'close',
    from: 'Exit',
    to: 'FinalState'
  }];
}


export default function  doExit(fsm) {
  console.log("do"+fsm.state);

  fsm.args.notification("displayError", {
    error: fsm.args.error,
    errorType: fsm.args.errorType,
  });

  return fsm.close();
};

