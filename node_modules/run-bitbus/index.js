const fetch = require('node-fetch');
const es = require('event-stream');
const { sleep, SelfDrainingQueue } = require('./utils.js')

exports.run = async function run(token, query, process, endPoint) {
    return new Promise(resolve=>{
        var queue = new SelfDrainingQueue(process);

        async function onSyncFinish() {  
            while(!queue.isDrained()){
                await sleep(200)
            }
            resolve();
        }
    
        var url;
        endPoint?url=endPoint:url="https://txo.bitbus.network/block";
    
        fetch(url, {
            method: "post",
            headers: {
                'Content-type': 'application/json; charset=utf-8',
                'token': token
            },
            body: JSON.stringify(query)
        })
            .then((res) => {
                res.body.on("end", () => {
                    onSyncFinish();
                }).pipe(es.split())
                    .pipe(es.map((data, callback) => {
                        if (data) {
                            let d = JSON.parse(data);
                            queue.enqueue(d);
                            callback();
                        }
                    }))
            })

    })
   
}

exports.getStatus = async function () {
    return new Promise(resolve => {
        fetch('https://txo.bitbus.network/status').then(async res => {
            var result = await res.json();
            resolve(result);
        }
        )
    })
}