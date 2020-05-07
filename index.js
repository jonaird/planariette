const bitbus = require('run-bitbus');
const bitsocket = require('bitsocket-connect');

var socket;
exports.start = function (token, query, process, onSyncFinish) {
    var type = 'c';
    var processFunc;
    var last25h = [];
    var now = new Date().getTime()
    var hours25ago = now - 90000000

    if (query.q.project) {
        query.q.project.blk = 1
        query.q.project.tx = 1
    }


    function processWithType(tx) {
        if (type == 'c' && tx.blk.t * 1000 > hours25ago) {
            last25h.push(tx.tx.h)
            process(tx,type)
        } else if (type == 'u') {
            if (!last25h.includes(tx.tx.h)) {
                process(tx, type)
            }
        } else {
            process(tx, type)
        }
    }

    async function processWithTypeAsync(tx) {
        return new Promise(async resolve => {
            if (type == 'c' && tx.blk.t * 1000 > hours25ago) {
                last25h.push(tx.tx.h)
                await process(tx,type)
            } else if (type == 'u') {
                if (!last25h.includes(tx.tx.h)) {
                    await process(tx, type)
                }
            } else {
                await process(tx, type)
            }
            resolve()

        })
    }

    process.constructor.name == 'AsyncFunction' ? processFunc = processWithTypeAsync : processFunc = processWithType;
  
    bitbus.run(token, query, processFunc, ()=>{
        type = 'u';

        bitsocket.crawlRecent(token, query,processFunc, ()=>{
            type='r'
            if(onSyncFinish){
                onSyncFinish()
            }
            socket = bitsocket.connect(query, processFunc)
        })
    })
}

exports.stop = function(){
    if(socket){
        socket.close()
        socket=null
    }
}
