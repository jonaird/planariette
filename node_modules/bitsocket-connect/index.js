const EventSource = require('eventsource');
const { sleep, SelfDrainingQueue } = require('./utils.js');
const es = require('event-stream');
const fetch = require('node-fetch')

var socket;
var lastEventId = null;
var latestTxMatch = null;
var interval;


exports.close = function () {
    if (socket) {
        socket.close();
    }
    if (interval) {
        clearInterval(interval);
        interval = null;
    }

    socket = null;
    latestTxMatch = null;
    var leid = lastEventId;
    lastEventId = null;

    return leid;

}

exports.getLatest = async function () {
    return new Promise(async resolve => {
        if (socket && latestTxMatch) {
            resolve(latestTxMatch);
        } else if (socket && !latestTxMatch) {
            while (!latestTxMatch) {
                await sleep(1000);
            }
            resolve(latestTxMatch);
        } else {
            console.log('You must open a Bitsocket connection in order to call getLatest()')
            resolve(null);
        }
    })

}

exports.connect = function (query, process, leid, endPoint) {
    const b64 = Buffer.from(JSON.stringify(query)).toString("base64")
    var queue = new SelfDrainingQueue(process);
    var url;
    endPoint ? url = endPoint : url = 'https://txo.bitsocket.network/s/';


    function reopenSocket() {
        socket.close();
        openSocket(lastEventId);
    }

    function openSocket(leid) {
        if (leid) {
            socket = new EventSource(url + b64, { headers: { "Last-Event-Id": leid } })
        }
        else {
            socket = new EventSource(url + b64)
        }
        socket.onmessage = function (e) {

            lastEventId = e.lastEventId;
            d = JSON.parse(e.data);
            if (d.type != 'open') {
                d.data.forEach(tx => {
                    if (!latestTxMatch) {
                        latestTxMatch = tx;
                    } else {
                        queue.enqueue(tx);
                    }

                });
            }
        }

    }

    openSocket(leid);

    interval = setInterval(() => {
        reopenSocket();
    }, 3600000);



}

exports.crawlRecent = async function crawlRecent(token, query, process, endPoint) {
    return new Promise(resolve => {
        var queue = new SelfDrainingQueue(process);

        async function onSyncFinish() {
            while (!queue.isDrained()) {
                await sleep(200);
            }
            resolve();
        }

        var url;
        endPoint ? url = endPoint : url = "https://txo.bitsocket.network/crawl";

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