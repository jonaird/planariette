const bitbus = require('run-bitbus');
const bitsocket = require('bitsocket-connect');
const {SelfDrainingQueue, Queue, makeGenesisQuery, sleep } = require('./utils');



async function getUnconfirmed(query) {
    return new Promise(resolve => {
        var newQuery = Object.assign({}, query);
        newQuery.q.db = ["u"];
        if(!newQuery.v){
            newQuery.v=3;
        }
        makeGenesisQuery(newQuery).then(res=>{
            resolve(res.u);
        })

    })


}


exports.start = function (token, query, process, onSyncFinish) {
    var type = 'c';
    var processFunc;

    function processWithType(tx) {
                process(tx, type)
    }

     async function processWithTypeAsync(tx) {
        return new Promise(async resolve => {
                process(tx, type).then(() => {
                    resolve();
                })
           
        })
    }

    process.constructor.name == 'AsyncFunction'?processFunc=processWithTypeAsync:processFunc=processWithType;

    async function callback() {
        type = 'u';

        var tempQueue = new Queue();
        bitsocket.connect(query,tx=>tempQueue.enqueue(tx));
        
        var unconfirmed = await getUnconfirmed(query);
        var latest = await bitsocket.getLatest();

        var queue = new SelfDrainingQueue(processFunc);
        

        if(unconfirmed.length>0){
            let i = 0;
            while(i<unconfirmed.length&&latest.tx.h != unconfirmed[i].tx.h){
                queue.enqueue(unconfirmed[i]);
                i++
            }
            queue.enqueue(latest)
        }

        

       
        while(tempQueue.getLength()>0){
            queue.enqueue(tempQueue.dequeue());
        }
        
        var lastEventId = bitsocket.close();
        while(!queue.isDrained()){
            await sleep(150);
        }
        if(onSyncFinish){
            onSyncFinish();
        }
        
        type = 'r';

        bitsocket.connect(query,tx=>queue.enqueue(tx),lastEventId);
       
        
        
        


    }

    bitbus.run(token, query, processFunc, callback)
}