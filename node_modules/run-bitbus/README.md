# run-bitbus
 
run-bitbus is a convenience library for running [Bitbus](https://bitbus.network) in Nodejs. Run Bitbus with a single function call!

## Installation 

`npm i --save run-bitbus`

## Usage

run-bitbus comes with 2 functions to interact with Bitbus, run and getStatus.

### run(token, query, processFunction, (optional) callback, (optional) endPoint)

token: Your Bitbus api token which you can get [here](https://token.planaria.network).  
query: A [Bitbus query](https://docs.bitbus.network/#/?id=_2-query).  
processFunction: This function is called for each individual transaction received from bitbus (which come in the order that they appear in on the blockchain) and is passed the transaction as an object. It can be either syncronous or async but if it is async, make sure to return a promise that resolves when it's finished processing.   
callback: Called when Bitbus is finished crawling transactions.  
endPoint: Endpoint to be used. Defaults to TXO


example:

```
const bitbus = require('run-bitbus');
const token = 'YOUR TOKEN HERE';
const query = {
 //your query
  };

bitbus.run(token, query, function(tx){
 //process each individual transaction here
 console.log(tx);
  });
 ```
  
  
### async getStatus()

gets the latest [Bitbus status](https://docs.bitbus.network/#/?id=_3-status) asyncronously and returns it as an object

example:

```
bitbus.getStatus().then(status=>{
 console.log(status)
 });
```

Have fun!
