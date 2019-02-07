import doRecoverCoins from './recoverCoins';
// Question: What happens when an error is triggered?


export function getRecoverFailedCoinsTransitions() {
  return [{
    name: 'coinRecoveryComplete',
    from: 'RecoverFailedCoins',
    to: 'PaymentFailed'
  }, {
    name: 'failed',
    from: 'RecoverFailedCoins',
    to: 'PaymentFailed'
  }];
}


export default function doRecoverFailedCoins(fsm) {
  return doRecoverCoins(fsm);
};

