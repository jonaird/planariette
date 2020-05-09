# bitsocket-connect
 A plug and play [Bitsocket](https://bitsocket.network/#/) connection for Nodejs and browser.

 ## Breaking changes
The latest version of bitsocket-connect no longer uses the callback method when crawling the event database. The api use to be
crawlRecent(token, query, processFunction, callback, endPoint). Instead crawlRecent is an async function
and so you can use .then() or async await.
 
## Install

`npm i --save bitsocket-connect`

in the browser include the following script tag in your document header (crawlRecent not supported in the browser) :

`<script type="text/javascript" src='https://x.bitfs.network/58e08db775da80c45f82ec4c28204aa228140c32c2d1aaa8b5911e5b8d57f9f5.out.0.3'></script>`

## Usage

bitsocket-connect includes 3 functions to interface with Bitsocket; connect, getLatest, and close. Use crawlRecent to crawl the last 24 hours of transactions.

### connect(query, process, (optional) lastEventId, (optional) endPoint)

**query**: A [TXO](https://medium.com/@_unwriter/txo-2-0-fee049bc6795) query used to filter new transactions.   
**process**: A function that is called individually on each incoming transaction from Bitsocket and is passed the transaction as a parameter. Can be synchronous or async but if it is async be sure to return a promise that resolves when done processing the transaction to ensure all transactions are processed in the correct order.   
**lastEventId**: Use the Last-Event-Id from close() to reopen a Bitsocket from where you left off.  
**endPoint**: Bitsocket endpoint. defaults to TXO

example:

in node:   
`const bitsocket = require('bitsocket-connect');`

node and browser:

```
const query = { "v": 3, "q": { "find": {} } };

bitsocket.connect(query, function(tx){
 console.log(tx)
 });
```


### close()
Closes the Bitsocket and returns the Last-Event-Id in case you would like to reopen the socket or null if there is none.

### async getLatest()
Gets the latest transaction matching your query that was received by the Bitcoin network **before** opening the Bitsocket. This can either be a confirmed or unconfirmed transaction.   

example:   
`bitsocket.getLatest().then(latest=>console.log(latest));`

### crawlRecent(token, query, process, (optional) endPoint)
Crawls the last 24 hours of the [Bitsocket event database](https://medium.com/@_unwriter/bitcoin-event-database-55a182ffe466). Uses the same api as [run-bitbus](https://github.com/jonaird/run-bitbus)

Have fun!


