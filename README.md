<h1 align="center">
  <img width=20% src="https://bitcoin-e.org/css/img/Bitcoin-express.png">
  <br>
  bitcoin-express-wallet
  <br>
</h1>

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

Bitcoin web client wallet

* Licence: [MIT Licence](https://raw.githubusercontent.com/bitcoin-express/bitcoin-express-wallet/master/LICENSE.md)
* Author: [Jose E. Martinez](https://github.com/jootse84)
* Contributers: [Ricky Rand](https://github.com/rickycrand), Paul Clark, Jon Barber, Clive Rand
* Language: Javascript
* Homepage: https://bitcoin-e.org/


Getting started
===============

All of the source code to Bitcoin-express wallet is available here. You can read the following instructions on how to download and build the code for yourself.

Bitcoin-express is a javascript application build with [React](https://github.com/facebook/react) and [Material-UI](https://github.com/mui-org/material-ui).

Check out the code from Github:
```shellscript
    git clone git@github.com:bitcoin-express/bitcoin-express-wallet.git
    cd bitcoin-express-wallet
```

Install all the dependencies of the project:
```shellscript
    npm install
```

Run webpack (developer mode) - dev/ folder
```shellscript
    npm run build:dev -- --env.dir ./path/to/the/deployment/folder/
```

Deploy production Wallet - dist/ folder
```shellscript
    npm run build:dist
```

Deploy production Wallet - any folder
```shellscript
    npm run build:prod -- --env.dir ./path/to/the/deployment/folder/
```
