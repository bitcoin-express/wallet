//Function to drive a Finite State Machine
//@fsm is the Finite State Machine to be driven
//NOTE: by convention the machine will automatically stop when the FinalState is reached
import PaymentFSM from './fsm/PaymentFSM';

export function runFSM(fsm, fn, maxSteps) {
  if(fsm.state === "FinalState" || maxSteps <= 0) {
    return;
  }
  return new Promise((resolve, reject) => {
    console.log(`Step${maxSteps}: do${fsm.state}`);
    resolve(fn["do"+fsm.state](fsm));
  })
  .then(() => {
    return runFSM(fsm, fn, maxSteps - 1);
  });
};

export default class FSM {
  constructor(type, details) {
    switch(type) {
      default:
        this.stateMachine = new PaymentFSM.stateMachine(details);
        this.fn = PaymentFSM.fn;
        this.steps = 1000;
        break;
    }
  }

  run() {
    return runFSM(this.stateMachine, this.fn, this.steps);
  }
}
