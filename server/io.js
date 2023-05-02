const http = require('http');
const { Server } = require('socket.io');

let io;
// let p1char;
// let p1pow;
// let p1weak;
let voteNum = 0;

// put wrap
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);

// I don't think I'll have a use for channels
const handleChatMessage = (msg, socket) => {
  io.to([...socket.rooms][1]).emit('chat message', {
    username: socket.request.session.account.username,
    message: msg.message,
  });
};

const handleRoomChange = async (obj, socket) => {
  if (obj.join) {
    if ([...socket.rooms][1]) {
      socket.leave([...socket.rooms][1]);
    }
    socket.join(obj.join);
    console.log(socket.rooms);
    // ask austin later because this doesn't get the amount of current users in the room
    // but also for the purpose of tracking which user joined at which time to queue them
    //  for the next round I'm not sure how I would access this. For now I'll just use a
    // counter to get the first two to hopefully work

    // console.log([io.sockets.adapter.rooms.get("room-1")]);
    // const sockets = await io.in("room-1").fetchSockets(); //sockets.length
    // console.log(sockets);
  }
};

const handleDeck = async (obj, socket) => {
  const sockets = await io.in([...socket.rooms][1]).fetchSockets();
  if (obj.character && obj.power && obj.weakness) {
    io.to([...socket.rooms][1]).emit('deck select', {
      username: socket.request.session.account.username,
      character: obj.character,
      power: obj.power,
      weakness: obj.weakness,
      queuePos: sockets.length,
    });
  }
};

const handleData = async (obj, socket) => {
  // p1char = obj.character;
  // p1pow = obj.power;
  // p1weak = obj.weakness;
  const sockets = await io.in([...socket.rooms][1]).fetchSockets();
  io.to([...socket.rooms][1]).emit(
    'pull data 1',
    {
      queuePos: sockets.length,
    },
  );
};

// const handleData2 = async (obj, socket) => {
//  io.to([...socket.rooms][1]).emit(
//    'pull data 2',
//    {
//
//    },
//  );
// };

const handleVote = async (obj, socket) => {
  voteNum++;
  io.to([...socket.rooms][1]).emit('add vote', {
    votes: voteNum,
  });
};

const socketSetup = (app, sessionMiddleware) => {
  const server = http.createServer(app);
  io = new Server(server);

  io.use(wrap(sessionMiddleware));

  io.on('connection', (socket) => {
    // causing an error now for some reason
    // console.log(socket.request.session.account.username);

    socket.on('disconnect', () => {
      console.log('a user disconnected');

      // clearing the rooms so handlechatmessage will only send to the room the user is connected to
      // socket.rooms.size === 0;
    });

    // io.sockets.adapter.rooms.get("room-1"); //is a set so should contain the user ids.
    // I can check those somewhere to make in the client code
    // console.log([io.sockets.adapter.rooms.get("room-1")]);

    socket.on('chat message', (msg) => handleChatMessage(msg, socket));

    socket.on('room select', (obj) => handleRoomChange(obj, socket));

    socket.on('deck select', (obj) => handleDeck(obj, socket));

    socket.on('pull data', (obj) => handleData(obj, socket));

    socket.on('add vote', (obj) => handleVote(obj, socket));
  });

  return server;
};

module.exports = socketSetup;
