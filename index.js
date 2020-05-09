const bitbus = require('run-bitbus');
const bitsocket = require('bitsocket-connect');


function planarietteWithListenMode (token, query, process, onSyncFinish, listenMode) {
    var type = 'c';
    var processFunc;
    var last25h = [];
    var now = new Date().getTime()
    var hours25ago = now - 90000000

    if (query.q.project) {
        query.q.project['blk'] = 1
        query.q.project['tx.h'] = 1
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
  
    bitbus.run(token, query, processFunc).then(()=>{
        type = 'u';

        bitsocket.crawlRecent(token, query,processFunc).then(()=>{
            type='r'
            if(onSyncFinish){
                onSyncFinish()
            }
            if(listenMode==true){
                bitsocket.connect(query, processFunc)
            }
        })
    })

}




exports.start = function (token, query, process, onSyncFinish) {
    planarietteWithListenMode(token,query,process,onSyncFinish, true)
    
}

exports.getAll = async function (token, query, process) {
    return new Promise(resolve=>{
        planarietteWithListenMode(token,query,process,()=>resolve(), false)
    })
    
    
}

exports.stop = function(){
    bitsocket.close()
}
