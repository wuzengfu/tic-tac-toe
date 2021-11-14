#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const http = require('http');
const {Server} = require("socket.io");

/**
 * Get port from environment and store in Express.
 */

let port = normalizePort(process.env.PORT || '3001');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);
const io = new Server(server, {cors: {origin: "*"}});
const TicTacToe = require('../logic/TicTacToe');

let roomNum = 1;
let rooms = {};
io.on("connection", socket => {
    console.log("A new user is connected:  " + socket.id);

    //add a new user
    socket.on("add user", username => {
        //set username in socket
        socket.username = username;
        socket.gameHistory = [];
        console.log("A new user is added:  " + username);
        updateConnectedUsers();
    });

    //send a list of rooms available on connection
    updateRooms();

    //users create a room
    socket.on("create room", async callback => {
        //set room name to be room + a number
        const roomName = "room" + roomNum;

        //join the room
        await socket.join(roomName);

        //pass room name to client
        callback(roomName);

        //create a new room object
        let room = {
            users: [{"socketid": socket.id, "username": socket.username, "ready": false}],
            game: null,
            started: false,
            status: "Available"
        };

        //add the newly created room object to rooms
        rooms[roomName] = room;

        //increment room number
        roomNum++;

        //update frontend room list
        updateRooms();
    });

    //users join a room
    socket.on("join room", async roomName => {
        //get all users in this room
        let users = rooms[roomName].users;

        //user object
        let mySelf = {"socketid": socket.id, "username": socket.username};

        //allow the user to join the room
        await socket.join(roomName);

        //change room status to Occupied
        rooms[roomName].status = "Occupied";

        //add the user to this room
        users.push(mySelf);

        //inform all clients in this room
        io.in(roomName).emit("someone joined", users);

        //update frontend room list
        updateRooms();
    });

    //users leave a room
    socket.on("leave room", async roomName => {
        if (rooms[roomName].users.length === 2) { // if there are two players in the room
            //remove the user from room
            rooms[roomName].users.forEach((user, i, obj) => {
                if (user.socketid === socket.id) {
                    obj.splice(i, 1);
                }
            });

            if (rooms[roomName].started) {
                rooms[roomName].users[0].ready = false;
                rooms[roomName].started = false;
            }

            //update room status
            rooms[roomName].status = "Available";

            //inform all clients in this room
            io.in(roomName).emit("onePlayer left", socket.id);
        } else { //if there is only one user in the room
            //delete this room if no player is in this room
            delete rooms[roomName];
        }

        //allow user to leave the room
        await socket.leave(roomName);

        //update frontend room list
        updateRooms();
    });

    //users get ready
    socket.on("game ready", async roomName => {
        let users = rooms[roomName].users;

        users.forEach(user => {
            if (user.socketid === socket.id) {
                //set user's ready status to true
                user.ready = true;
            } else if (user.ready) {
                //game start - both players are ready
                rooms[roomName].started = true;
                rooms[roomName].status = "In Game";

                //update frontend room list
                updateRooms();
            }
        });

        //inform all clients in this room
        io.in(roomName).emit("someone ready", rooms[roomName]);

        //game start - both players are ready
        if (rooms[roomName].started) {
            let players = rooms[roomName].users;
            let ticTacToe = new TicTacToe(players[0].socketid, players[1].socketid);
            rooms[roomName].game = ticTacToe;
            io.in(roomName).emit("game start", ticTacToe);
        }
    });

    //someone moved piece
    socket.on("make move", (roomName, coordinate) => {
        let ticTacToe = rooms[roomName].game;
        ticTacToe.makeMove(coordinate, socket.id);

        if (ticTacToe.gameStatus === "in game") { //the game is not finished
            io.in(roomName).emit("someone made a move", ticTacToe.lastCoordinate, ticTacToe.lastMovedBy, ticTacToe.firstPlayer);
        } else {
            io.in(roomName).emit("game over", ticTacToe.gameStatus, ticTacToe.lastMovedBy, ticTacToe.lastCoordinate, ticTacToe.firstPlayer);
            rooms[roomName] = {
                users: rooms[roomName].users,
                game: null,
                started: false,
                status: "Available"
            };
            rooms[roomName].users[0].ready = false;
            rooms[roomName].users[1].ready = false;

            //update game history
            let opponentPosition = rooms[roomName].users[0].socketid === socket.id ? 1 : 0;
            let gameStatus = ticTacToe.gameStatus;
            let currentTime = new Date().toLocaleTimeString();
            io.sockets.sockets.forEach(ele => {
                if (ele.id === rooms[roomName].users[opponentPosition].socketid) { //opponentHistory
                    if (gameStatus !== "draw") gameStatus = "lose";
                    ele.gameHistory.push({
                        opponentName: socket.username,
                        myName: ele.username,
                        result: gameStatus,
                        time: currentTime
                    });
                } else if (ele.id === socket.id) { //my history
                    if (gameStatus !== "draw") gameStatus = "win";
                    ele.gameHistory.push({
                        opponentName: rooms[roomName].users[opponentPosition].username,
                        myName: ele.username,
                        result: gameStatus,
                        time: currentTime
                    });
                }
            });
        }
    });

    socket.on("invite player", (selectedUser, roomName) => {
        socket.to(selectedUser).emit("receive invitation", {socketid: socket.id, username: socket.username, roomName});
    });

    socket.on("reject invitation", inviterSocketId => {
        socket.to(inviterSocketId).emit("reject invitation", socket.username);
    });

    socket.on("get game history", (socketid, callback) => {
        io.sockets.sockets.forEach(ele => {
            if (ele.id === socketid) {
                return callback(ele.gameHistory);
            }
        })
    });

    socket.on("disconnect", () => {
        console.log("A user has left");

        //move the user from the room
        Object.keys(rooms).forEach(key => {
            rooms[key].users.forEach(async (user, i) => {
                if (user.socketid === socket.id) {

                    if (rooms[key].users.length === 1) { //there is only one player in the room
                        delete rooms[key]; //delete the room
                    } else { //there are two players in the room
                        rooms[key].users.splice(i, 1); //remove the user who disconnects
                        rooms[key].status = "Available"; //set room status to available
                        rooms[key].game = null; //clear the game data
                        rooms[key].users[0].ready = rooms[key].started ? false : rooms[key].users[0].ready; //change the last player's ready' status to false if the opponent quits during the game
                        rooms[key].started = false; //reset game status
                        io.in(key).emit("onePlayer left", socket.id); //notify another user in the room
                    }

                    await socket.leave(key); //remove the user from the room
                    updateRooms(); //update the room status
                }
            });
        });

        updateConnectedUsers();
    });

});

//update frontend room list
function updateRooms() {
    io.emit("update room", rooms);
}


//update frontend connected user list
function updateConnectedUsers() {
    let connectedUsers = [];

    io.sockets.sockets.forEach(ele => {
        connectedUsers.push({username: ele.username, socketid: ele.id});
    });

    console.log("Connected Users: " + connectedUsers.length);

    io.emit("update user", connectedUsers);
}


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
    default:
        throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const address = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + address
        : 'port ' + address.port;
    console.log(`Server running on http://localhost:${address.port}`);
}
