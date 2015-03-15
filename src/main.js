var express = require('express');
var index = require('./index');
var page = require('./page');

var app = express();
app.get('/', index);
app.get('/page', page);

console.log("Listening on port 4000...");
app.listen(4000);
