const http = require('http');
const { Server } = require('socket.io');

let io;

const roomData = {};

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
    if (!roomData[[...socket.rooms][1]]) {
      roomData[[...socket.rooms][1]] = {};
    }
    console.log(socket.rooms);
    if (roomData[[...socket.rooms][1]].card1 && roomData[[...socket.rooms][1]].card2) {
      socket.emit('begin voting', roomData[[...socket.rooms][1]]);
    }
  }
};

const handleDeck = async (obj, socket) => {
  const sockets = await io.in([...socket.rooms][1]).fetchSockets();
  if (obj.character && obj.power && obj.weakness) {
    const card = {
      username: socket.request.session.account.username,
      character: obj.character,
      power: obj.power,
      weakness: obj.weakness,
      queuePos: sockets.length,
    };
    io.to([...socket.rooms][1]).emit('deck select', card);
    card.votes = 0;
    if (sockets.length === 1) {
      roomData[[...socket.rooms][1]].card1 = card;
    } else if (sockets.length === 2) {
      roomData[[...socket.rooms][1]].card2 = card;
    }

    if (roomData[[...socket.rooms][1]].card1 && roomData[[...socket.rooms][1]].card2) {
      io.to([...socket.rooms][1]).emit('begin voting', roomData[[...socket.rooms][1]]);
    }
  }
};

const handleVote = async (obj, socket) => {
  const sockets = await io.in([...socket.rooms][1]).fetchSockets();
  if (obj === 'card1') {
    roomData[[...socket.rooms][1]].card1.votes++;
  } else if (obj === 'card2') {
    roomData[[...socket.rooms][1]].card2.votes++;
  }
  if (sockets.length <= (roomData[[...socket.rooms][1]].card1.votes
    + roomData[[...socket.rooms][1]].card2.votes)) {
    if (roomData[[...socket.rooms][1]].card1.votes > roomData[[...socket.rooms][1]].card2.votes) {
      io.to([...socket.rooms][1]).emit('all votes', { cardId: 'card1', username: roomData[[...socket.rooms][1]].card1.username });
      setTimeout(() => {
        delete roomData[[...socket.rooms][1]];
        // roomData[[...socket.rooms][1]].card1 = undefined;
        // roomData[[...socket.rooms][1]].card2 = undefined;
        io.to([...socket.rooms][1]).emit('server-command', 'leave-room');
        sockets.forEach((socketVal) => { // changed to socketVal for eslint
          socketVal.leave([...socket.rooms][1]);
        });
      }, 30000);
    } else if (roomData[[...socket.rooms][1]].card1.votes
      < roomData[[...socket.rooms][1]].card2.votes) {
      io.to([...socket.rooms][1]).emit('all votes', { cardId: 'card2', username: roomData[[...socket.rooms][1]].card2.username });
      setTimeout(() => {
        delete roomData[[...socket.rooms][1]];
        // roomData[[...socket.rooms][1]].card1 = undefined;
        // roomData[[...socket.rooms][1]].card2 = undefined;

        io.to([...socket.rooms][1]).emit('server-command', 'leave-room');
        sockets.forEach((socketVal) => {
          socketVal.leave([...socket.rooms][1]);
        });
      }, 30000);
    }
  }
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

    socket.on('chat message', (msg) => handleChatMessage(msg, socket));

    socket.on('room select', (obj) => handleRoomChange(obj, socket));

    socket.on('deck select', (obj) => handleDeck(obj, socket));

    socket.on('add vote', (obj) => handleVote(obj, socket));
  });

  return server;
};

module.exports = socketSetup;
