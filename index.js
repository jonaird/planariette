const bitbus = require('run-bitbus');
const bitsocket = require('bitsocket-connect');
const fetch = require('node-fetch');

async function getBlockTime(height){
    const url = "https://api.whatsonchain.com/v1/bsv/main/block/height/"+height;
    const res = await fetch(url);
    const json = await res.json();
    return json.time*1000;
}
async function planarietteWithListenMode(token, query, process, onSyncFinish, listenMode, useBOB) {
    
    var type = 'c';
    var processFunc;
    var last6h = [];
    var now = new Date().getTime()
    var hours6ago = now - 21600000
    var hours5ago = now - 18000000
    var newQuery = JSON.parse(JSON.stringify(query))
    var usedFrom;


    if (newQuery['q']['project']) {
        newQuery['q']['project']['blk.t'] = 1,
            newQuery['q']['project']['tx.h'] = 1
        newQuery['q']['project']['timestamp'] = 1
    }

    if (newQuery.from) {
        usedFrom = true
        const tmHeight = await getBlockTime(newQuery.from)
        if(tmHeight<hours6ago)
            newQuery.q.find['blk.i'] = { $gt: newQuery.from }
        else
            newQuery.q.find['blk.t'] = { $gt: hours6ago/1000 }
    }


    function processWithType(tx) {
        
        if (type == 'c') {
            if (tx.blk.t * 1000 > hours6ago) {
                last6h.push(tx.tx.h)
            }
            if(!newQuery.from||tx.blk.i>newQuery.from)
                process(tx, type)
        } else if (type == 'u') {
            if (!last6h.includes(tx.tx.h)) {
                process(tx, type)
            }
        } else {
            process(tx, type)
        }
    }

    async function processWithTypeAsync(tx) {
        return new Promise(async resolve => {
            if (type == 'c') {
                if (tx.blk.t * 1000 > hours6ago) {
                    last6h.push(tx.tx.h)
                }
                if(!newQuery.from||tx.blk.i>newQuery.from)
                    await process(tx, type)
            } else if (type == 'u') {
                if (!last6h.includes(tx.tx.h)) {
                    await process(tx, type)
                }
            } else {
                await process(tx, type)
            }
            resolve()

        })
    }

    process.constructor.name == 'AsyncFunction' ? processFunc = processWithTypeAsync : processFunc = processWithType;

    await bitbus.run(token, newQuery, processFunc, useBOB ? 'https://bob.bitbus.network/block' : null)

    type = 'u';
    newQuery.q.find.timestamp = { $gt: hours5ago }
    if (usedFrom) {
        delete newQuery.q.find['blk.i']
        delete newQuery.q.find['blk.t']
    }

    await bitsocket.crawlRecent(token, newQuery, processFunc, useBOB ? 'https://bob.bitsocket.network/crawl' : null)

    type = 'r'

    if (onSyncFinish) {
        onSyncFinish()
    }
    if (listenMode == true) {
        delete newQuery.q.find.timestamp
        bitsocket.connect(newQuery, processFunc,null, useBOB ? 'https://bob.bitsocket.network/s/' : null)
    }

}




exports.start = function (token, query, process, onSyncFinish, useBOB) {
    console.log(process)
    planarietteWithListenMode(token, query, process, onSyncFinish, true, useBOB)

}

exports.getAll = async function (token, query, process, useBOB) {
    return new Promise(resolve => {
        planarietteWithListenMode(token, query, process, () => resolve(), false, useBOB)
    })


}

exports.stop = function () {
    bitsocket.close()
}

