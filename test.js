p = require('./index.js')
b = require('run-bitbus')
s = require('bitsocket-connect')

function process(tx, t) {
    // console.log(tx)
    if (t == 'u') {
        console.log(tx)
    } else if (t == 'r') {
        console.log('success')
    }
}



var q = {
    "q":
    {
        "find": {},
        limit:1
    }
}

p.start(token, q, process,()=>'finished crawl', true)
// b.run(token,q,tx=>console.log(tx),'https://bob.bitbus.network/block');
// s.connect(q, process,null, 'https://bob.bitsocket.network/s/')