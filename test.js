planariette = require('./index.js');

var token = ''
const query = {
  v:3,
  from: 566470,
  q:{
    find:{
       "out.s2": "1LtyME6b5AnMopQrBPLk4FGN8UBuhxKqrn", 
       "out.s5":"1NSL3EoQqjEzrD2gJzYhezVow7e2ZBmDdz"
       }
    },
    
  }
  
planariette.getAll(token, query,tx=>console.log(tx)).then(()=>console.log('done'))
