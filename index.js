const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
const usersController = require('./controllers/users');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/users', usersController);

const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

/*===============GAME===============*/

class Player {
  constructor(username) {
    this.username = username;
    (this.hand = []); (this.score = 0); (this.team = 0);
    this.turn = false
  }
}
class Room {
  constructor() {
    this.players = {
      player1: new Player('kalichi'),
      player2: new Player('bassel'),
      player3: new Player('nader'),
      player4: new Player('rama')
    };
    this.deck = [];
  }
  generateDeck = () => {
    const suits = ['Spades', 'Clubs', 'Hearts', 'Diamonds'];
    const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King', 'Ace'];
    let tempDeck = [];
    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < values.length; j++) {
        tempDeck.push({
          suit: suits[i],
          value: values[j],
          number: numbers[j],
          name: `${values[j]} of ${suits[i]}`,
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
      this.players[`player${i}`].hand = []
      for (let j = 0; j < 13; j++) {
        let cardIndex = j + (i - 1) * 13;
        let tempCard = this.deck[cardIndex];
        tempCard.player = `player${i}`;
        this.players[`player${i}`].hand.push(tempCard);
      }
      this.players[`player${i}`].hand = this.players[`player${i}`].hand.sort((a, b) => a.suit - b.suit)
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
const qusai = new Room();

const rooms = {
  qusai: qusai
};
io.on('connection', socket => {
  console.log('New connection');

  socket.on('disconnect', () => {
    console.log('User left');
  });
  socket.on('test', data => {
    console.log(data);
  });

  socket.on('get_rooms', () => {
    socket.emit('return_rooms', rooms);
  });
  socket.on('create_room', room => {
    rooms[room] = new Room();
    socket.emit('return_rooms', rooms);
  });
  socket.on('generate_deck', room => {
    rooms[room].generateDeck();
    socket.emit('return_deck', rooms[room].deck);
  });
  socket.on('start_game', room => {
    rooms[room].startGame();
    socket.emit('return_room', rooms[room])
  })
});
