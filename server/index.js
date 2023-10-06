const http = require("http")
const express = require("express");
const app = express();
const fs = require("fs");

const server = http.createServer(app)


const Redis = require('ioredis');
const redis = new Redis(); // Connect to the default Redis server (localhost:6379)
const socketIo = require('socket.io');
const io = socketIo(server);
const redisAdapter = require('socket.io-redis');

// Configure Socket.IO to use Redis as the adapt
// io.adapter(redisAdapter({ host: 'localhost', port: 6379 }));  //un command this then redis can work

// ... Your existing Socket.IO code ...


// const redis = require('redis');
// const client = redis.createClient(); 

const clients = {};
require('../config/db');
// Serve static resources
app.use(express.static(__dirname + "/../client/"));
app.use(express.static(__dirname + "/../node_modules/"));

app.get("/", (req, res) => {
    const stream = fs.createReadStream(__dirname + "/../client/index.html");
    stream.pipe(res);
});
const player = require('../routes/playerRoute');
var players = {}; // opponent: scoket.id of the opponent, symbol = "X" | "O", socket: player's socket
var unmatched;
// client.on('ready', () => {
//     // Now you can perform Redis operations
// });

// // Handle errors
// client.on('error', (err) => {
//     console.error('Redis Error:', err);
// });



// When a client connects
io.on("connection", function(socket) {
    let id = socket.id;

    console.log("New client connected. ID: ", socket.id);
    clients[socket.id] = socket;

    socket.on("disconnect", () => {// Bind event for that socket (player)
        console.log("Client disconnected. ID: ", socket.id);
        delete clients[socket.id];
        socket.broadcast.emit("clientdisconnect", id);
    });

    join(socket); // Fill 'players' data structure

    if (opponentOf(socket)) { // If the current player has an opponent the game can begin
        socket.emit("game.begin", { // Send the game.begin event to the player
            symbol: players[socket.id].symbol
        });

        opponentOf(socket).emit("game.begin", { // Send the game.begin event to the opponent
            symbol: players[opponentOf(socket).id].symbol 
        });
    }

    const gameId = socket.id;
    const channel = `game:${gameId}`;
    // Event for when any player makes a move
    socket.on("make.move", function(data) {
        if (!opponentOf(socket)) {
            // This shouldn't be possible since if a player doens't have an opponent the game board is disabled
            return;
        }
       // Unique game identifier
      
        socket.join(channel);
        // Validation of the moves can be done here
        const message = JSON.stringify({ position: data.position, symbol: data.symbol });
    redis.publish(channel, message);
        // const message = JSON.stringify(data);
        // client.publish(channel, message, (err, numSubscribed) => {
        //     if (err) {
        //         console.error('Failed to publish to Redis:', err);
        //     } else {
        //         console.log(`Published to Redis channel: ${channel}`);
        //     }
        // });
        socket.emit("move.made", data); // Emit for the player who made the move
        opponentOf(socket).emit("move.made", data); // Emit for the opponent
    });
// Listen for Redis messages on the channel
redis.subscribe(channel, (err, count) => {
    if (err) {
        console.error('Failed to subscribe to Redis channel:', err);
    } else {
        console.log(`Subscribed to Redis channel: ${channel}`);
    }
});

// Handle incoming Redis messages
redis.on('message', (channel, message) => {
    // Parse the message and emit it to the appropriate socket or handle it as needed
    const data = JSON.parse(message);
    io.to(channel).emit('move.made', data); // Emit to all sockets in the channel
});

    socket.on("join.game", function (gameId) {
        const channel = `game:${gameId}`;
    
        // client.subscribe(channel, (err, numChannels) => {
        //     if (err) {
        //         console.error('Failed to subscribe to Redis channel:', err);
        //     } else {
                
        //         console.log(`Subscribed to Redis channel: ${channel}`);
        //     }
        // });
    
        // Handle incoming Redis messages
        // client.on('message', (channel, message) => {
        //     console.log(message,"87877878")
        //     // Parse the message and emit it to the appropriate socket or handle it as needed
        //     const data = JSON.parse(message);
        //     socket.emit("move.made", data); // Emit to the player who made the move
        // });
    });
    socket.on("leave.game", function (gameId) {
        const channel = `game:${gameId}`;
        // client.unsubscribe(channel);
        // Handle leaving the game logic
    });
    // Event to inform player that the opponent left
    socket.on("disconnect", function() {
        if (opponentOf(socket)) {
        opponentOf(socket).emit("opponent.left");
        }
    });
});
// client.quit(); 

function join(socket) {
    players[socket.id] = {
        opponent: unmatched,
        symbol: "X",
        socket: socket
    };

    // If 'unmatched' is defined it contains the socket.id of the player who was waiting for an opponent
    // then, the current socket is player #2
    if (unmatched) { 
        players[socket.id].symbol = "O";
        players[unmatched].opponent = socket.id;
        unmatched = null;
    } else { //If 'unmatched' is not define it means the player (current socket) is waiting for an opponent (player #1)
        unmatched = socket.id;
    }
}

function opponentOf(socket) {
    if (!players[socket.id].opponent) {
        return undefined;
    }
    return players[players[socket.id].opponent].socket;
}


app.use(express.json());

// Define your player route
app.use('/', player);

const port = 8080;

server.listen(port, () => {
  console.log(`Server running on port : ${port}`);
});