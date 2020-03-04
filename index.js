const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const usersController = require('./controllers/users');

const server = http.createServer(app);
const io = socketio(server);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/users', usersController);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

/*===============GAME===============*/

class Player {
  constructor(username) {
    this.username = username;
    this.hand = [];
    this.score = 0;
    this.team = 0;
    this.turn = false;
  }
}
class Room {
  constructor() {
    this.players = {
      player1: { username: '', hand: [], score: 0, team: '1' },
      player2: { username: '', hand: [], score: 0, team: '2' },
      player3: { username: '', hand: [], score: 0, team: '1' },
      player4: { username: '', hand: [], score: 0, team: '2' }
    };
    this.deck = [];
  }
  generateDeck = () => {
    const suits = ['Spades', 'Clubs', 'Hearts', 'Diamonds'];
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
    let tempDeck = [];
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < ranks.length; j++) {
        tempDeck.push({
          suit: suits[i],
          rank: ranks[j],
          value: values[j],
          name: `${ranks[j]} of ${suits[i]}`,
          power: 0
        });
      }
    }
    this.deck = tempDeck;
    console.log('Generated deck');
  };
  shuffleDeck = () => {
    for (let i = 0; i < this.deck.length; i++) {
      let j = Math.floor(Math.random() * this.deck.length);
      let temp = this.deck[i];
      this.deck[i] = this.deck[j];
      this.deck[j] = temp;
    }
  };
  dealCards = () => {
    for (let i = 1; i <= 4; i++) {
      this.players[`player${i}`].hand = [];
      for (let j = 0; j < 13; j++) {
        let cardIndex = j + (i - 1) * 13;
        let tempCard = this.deck[cardIndex];
        tempCard.player = `player${i}`;
        this.players[`player${i}`].hand.push(tempCard);
      }
      this.players[`player${i}`].hand = this.players[`player${i}`].hand.sort(
        (a, b) => a.suit - b.suit
      );
    }
    console.log('Dealt cards');
  };
  startGame = () => {
    this.generateDeck();
    this.shuffleDeck();
    this.dealCards();
  };
}

class Card {
  constructor(suit, value, number) {
    this.suit = suit;
    this.value = value;
    this.number = number;
    this.name = `${this.value} of ${this.suit}`;
  }
}

const rooms = {};

io.on('connection', socket => {
  console.log('New connection');

  socket.on('disconnect', () => {
    console.log('User left');
  });
  socket.on('test', data => {
    console.log(data);
  });

  socket.on('get_rooms', () => {
    io.emit('return_rooms', rooms);
  });
  socket.on('create_room', roomName => {
    rooms[roomName] = new Room();
    io.emit('return_rooms', rooms);
  });
  socket.on('join_room', roomName => {
    socket.join(roomName);
    io.emit('return_room', rooms[roomName]);
  });
  socket.on('choose_seat', ({ player, playerNumber, username, roomName }) => {
    // Put player in their seat

    rooms[roomName].players[`player${playerNumber}`].username = username;
    const playerNames = {
      player1: rooms[roomName].players.player1.username,
      player2: rooms[roomName].players.player2.username,
      player3: rooms[roomName].players.player3.username,
      player4: rooms[roomName].players.player4.username
    };
    const data = {
      room: rooms[roomName].players,
      tempPlayerNames: playerNames
    };
    console.log('return_seats', data);
    console.log(roomName);
    io.in(roomName).emit('return_seats', data);
  });
  socket.on('start_game', roomName => {
    console.log(roomName);
    console.log(rooms);
    rooms[roomName].startGame();
    io.in(roomName).emit('return_room', rooms[roomName]);
  });
  socket.on('leave_room', ({ roomName, playerNumber }) => {
    socket.leave(roomName);
    console.log('user left room');
    rooms[roomName].players[`player${playerNumber}`] = {
      username: '',
      hand: [],
      score: 0,
      team: 2 - (playerNumber % 2)
    }; /* Team 1 if playerNumber is 1 || 3. Team 2 if playerNumber is 2 || 4. */
    io.in(roomName).emit('return_room', rooms[roomName]);
  });
});
