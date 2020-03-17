# Planariette
 Planariette is a lightweight planaria for Nodejs.
 
 ## Install
 
 `npm i --save planariette`
 
 ## Usage

Planariette is a single function call that lets you syncronize with the blockchain then process new transactions in realtime.

### start(token, query, process, (optional) onSyncFinish);

**token**: A Bitbus api token which you can get [here](https://token.planaria.network).  
**query**: A [Bitquery](https://bitquery.planaria.network/#/?id=bitquery). "r" and BOB are not supported. If you are using "project" you must include "tx.h".   
**process(tx, type)**: A processing function that processes each individual transaction in the order they appear on the blockchain. This function can be either synchronous or async but if async, be sure to return a promise that resolves when finished processing a transaction. Type is string either 'c','u', or 'r' for confirmed (mined), unconfirmed (mempool) or realtime transactions.   
**onSyncFinish()**: A function that is called when Planariette has finished synching with the blockchain and starts listening for realtime transactions. It is not recommended to do heavy lifting in onSyncFinish unless it is done synchronously.

example (gets weather data for New York, NY):
```
planariette = require('planariette');

const token = "YOUR BITBUS TOKEN"
const query = {
  v:3,
  from: 566470,
  q:{
    find:{
       "out.s2": "1LtyME6b5AnMopQrBPLk4FGN8UBuhxKqrn", 
       "out.s5":"1NSL3EoQqjEzrD2gJzYhezVow7e2ZBmDdz"
       }
    }
  }
  
planariette.start(token, query,tx=>console.log(tx),()=>console.log('Swiched to listen mode.'));
```


and that's it! Yes, it's that simple. Now have some fun.
