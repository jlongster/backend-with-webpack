import path from 'path';
import http from 'http';
import express from 'express';
import socketio from 'socket.io';
import index from './index';
import page from './page';

let app = express();
app.use(express.static(path.join(__dirname, '../static')));

let server = http.createServer(app);
let io = socketio(server);

function broadcastFrom(socket, point) {
  let data = {
    color: socket.color,
    point: point,
    lastPoint: socket.lastPoint
  }
  socket.broadcast.emit('data', data);
  socket.emit('data', data);
  socket.lastPoint = point;
}

function getColor() {
  return (
    'rgb(' +
    (Math.random() * 150 + 105 | 0) + ',' +
    (Math.random() * 150 + 105 | 0) + ',' +
    (Math.random() * 150 + 105 | 0) +
    ')'
  );
}

var sockets = [];
io.on('connection', socket => {
  sockets.push(socket);
  socket.color = getColor();

  socket.on('data', function(msg) {
    broadcastFrom(socket, msg);
  });

  socket.on('disconnect', () => {
    sockets = sockets.filter(s => s !== socket);
  });
});

function __eval() {
  // sockets.forEach((s, i) => {
  //   s.color = getColor();
  //   console.log('socket' + i, s.color);
  // });
}

export default server;
