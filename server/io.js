const http = require('http');
const { Server } = require('socket.io');

let io;


// put wrap
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

// I don't think I'll have a use for channels
const handleChatMessage = (msg, socket) => {
  io.to([...socket.rooms][1]).emit('chat message', {
    username: socket.request.session.account.username,
    message: msg.message,
  });
};

const handleRoomChange = (obj, socket) => {
  if(obj.join)
  {
    if([...socket.rooms][1])
    {
      socket.leave([...socket.rooms][1]);
    }
    socket.join(obj.join);
    console.log(socket.rooms);
  }
}

const socketSetup = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.use(wrap(sessionMiddleware));

  io.on('connection', (socket) => {
    console.log(socket.request.session.account.username);

    socket.on('disconnect', () => {
      console.log('a user disconnected');

      //clearing the rooms so handlechatmessage will only send to the room the user is connected to
      socket.rooms.size === 0;
    });

    socket.on('chat message', (msg) => handleChatMessage(msg, socket));

    socket.on('room select', (obj) => handleRoomChange(obj, socket));
  });

  return server;
};

module.exports = socketSetup;
