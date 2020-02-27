const express = require('express');
const app = express();

const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 5050;

const router = require('./db/controllers/Router');

app.use(router);

io.on('connection', socket => {
  console.log('New connection');

  socket.on('disconnect', () => {
    console.log('User left');
  });
});

const server = http.createServer(app);
const io = socketio(server);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
