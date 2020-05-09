# run-bitbus
 
run-bitbus is a convenience library for running [Bitbus](https://bitbus.network) in Nodejs. Run Bitbus with a single function call!

## Breaking changes
The latest version of run-bitbus no longer uses the callback method. The api use to be
run(token, query, processFunction, callback, endPoint). Instead run is an async function
and so you can use .then() or async await.

## Installation 

`npm i --save run-bitbus`

## Usage

run-bitbus comes with 2 functions to interact with Bitbus, run and getStatus.

### async run(token, query, processFunction, (optional) endPoint)

token: Your Bitbus api token which you can get [here](https://token.planaria.network).  
query: A [Bitbus query](https://docs.bitbus.network/#/?id=_2-query).  
processFunction: This function is called for each individual transaction received from bitbus (which come in the order that they appear in on the blockchain) and is passed the transaction as an object. It can be either syncronous or async but if it is async, make sure to return a promise that resolves when it's finished processing.   



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
