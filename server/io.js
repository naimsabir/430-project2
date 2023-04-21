const http = require('http');
const { Server } = require('socket.io');

let io;

// put wrap
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

// I don't think I'll have a use for channels
const handleChatMessage = (msg, socket) => {
  io.emit('chat message', {
    username: socket.request.session.account.username,
    message: msg.message,
  });
};

const socketSetup = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.use(wrap(sessionMiddleware));

  io.on('connection', (socket) => {
    console.log(socket.request.session.account.username);

    socket.on('disconnect', () => {
      console.log('a user disconnected');
    });

    socket.on('chat message', (msg) => handleChatMessage(msg, socket));
  });

  return server;
};

module.exports = socketSetup;
