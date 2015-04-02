import * as client from './client';

var socket = io.connect('http://localhost:4000', {
  reconnection: false
});

socket.on('connect', () => {
  client.register(socket);
});


