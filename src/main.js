import express from 'express';
import index from './index';
import page from './page';

var app = express();
app.get('/', index);
app.get('/page', page);

console.log("Listening on port 4000...");
app.listen(4000);
