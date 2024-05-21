const express = require('express');
const app = express();

app.get('/',function(req,res){
    res.write('Cristiano esta aqui!');
    res.end();
});

app.listen(8080);