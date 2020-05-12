planariette = require('./index.js');
bitsocket = require('bitsocket-connect')
bitbus = require('run-bitbus')

var token = 'eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiIxR1VlQnVFUEFSOTkxeGlFeW5SbmFjb1BZeTJSa0NZeGZ2IiwiaXNzdWVyIjoiZ2VuZXJpYy1iaXRhdXRoIn0.SURuOVZVejFJNWw4TXlRTk9HSiswNUFiemd1T0xvRTl2cTV0Nm9qVnVSejRNMExsb3YxT3pEaHVwZWNybk51allVT1R0L0FiRmdDN3MyUk4vbGJQN2dRPQ'
paymails = ['jonathan.aird@gmail.com']
var protocolPrefix = '14FLDQhDGmxKCsX79qEtMm36YcdUVyGQm5'


function findCorrectTape(tx) {
  var correctTape;

  for (var output of tx.out) {
      for (var tape of output.tape) {
          //making sure these are not null before checking if protocol prefix
          if (tape[1] && tape[1].cell[0].s && tape[1].cell[0].s == protocolPrefix) {
              correctTape = tape
              break
          }
      }
      if (correctTape) {
          break
      }

  }

  return correctTape
}

function serialize(tx) {

  var tape = findCorrectTape(tx)
  var name;
  try {
      var nameText = tape.cell[1].s
      if (nameText.length <= 50) {
          var publicKey = Buffer.from(tape.cell[3].b, 'base64').toString('hex')
          var address = new bsv.PublicKey(publicKey).toAddress().toString()
          name = {
              name: nameText,
              paymail: tape.cell[2].s,
              publicKey,
              address,
              signature: tape.cell[4].s
          }
      }

  } catch (err) {

  }

  return name
}

function verify(tx) {
  return Message.verify(tx.name, tx.address, tx.signature);
}



getNames = function (t, p) {
  return new Promise(resolve => {
      query = {
          q: {
              find: {
                  
                  $or: []
              }
          }
      }

      for (var paymail of paymails) {
          query.q.find.$or.push({
            'out.tape.cell.s': protocolPrefix,
              'out.tape.cell.s': paymail
          })
      }
      console.log(query)
      var names = {}
      var toReturn = []
      function process(tx) {
          console.log(tx)
          name = serialize(tx)
          if (name) {
              names[tx.address] = name
          }
      }

      function callback() {

          keys = Object.keys(names)

          keys.forEach(key => {
              if (verify(names[key])) {
                  toReturn[toReturn.length] = {
                      paymail: names[key].paymail,
                      name: names[key].name,
                      publicKey: names[key].publicKey
                  }
              }
          })
          resolve(toReturn)

      }
      planariette.getAll(token, query, process, true).then(callback).catch(er=>console.log(er))
  })


}

getNames(token, paymails).then(names=>console.log(names))