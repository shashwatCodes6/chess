import { x_map, y_map } from '../constants/mappings.js'
import { Game } from '../db/game.model.js'
import chess from 'chess';
import { Server } from "socket.io";



class RoomManager {
  instance = null;
  rmap;
  games;
  io;

  // private
  constructor() {
    rmap = new Map();
    games = new Map();
    
    const server = http.Server(app);
    io = new Server(server, {
      path: '',
      cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling']
    });


    io.on('connection', RoomManager);
  
  }

  getInstance() {
    if(this.instance === null) {
      this.instance = new RoomManager();
    }
    return this.instance;
  }

  createNewGame(roomID) {

  }

  createRoom(roomID) {

  }

  joinRoom(roomID) {

  }

  checkMove(roomID, move) {

  }

  resign(roomID, auth) {

  }

  leaveRoom(roomID) {

  }

  RoomManager(socket) {
    //console.log(socket);
    socket.on("createRoom", obj => {
      const roomID = obj.roomID;
      console.log("create room : ", obj);
      rmap[roomID] = {
        timingControls : obj.timingControls
      }
      setTimeout (() => {
        console.log(rmap[roomID]);
        if(!rmap[roomID].playerBlack || !rmap[roomID].playerWhite){
          io.to(roomID).emit("roomExpired", {message : "bye bye"});
        }
      }, 1000 * 30);
    });

    socket.on("join-room", async obj => {
      const roomID = obj.roomID;
      const auth = obj.auth;
      console.log(obj);
      // const rooms = io.of("/").adapter.rooms;
      console.log( "yo", rmap[roomID]);
    
      if(games[roomID] === undefined){
        const gameClient = chess.create({ PGN : true });
       // console.log(gameClient);
        games[roomID] = gameClient;
        rmap[roomID] = {
          ...rmap[roomID], 
          playerWhite : null,
          playerBlack : null,
          turn : 0
        };
       // console.log("yoooo");
        socket.join(roomID); 
        io.to(roomID).emit('roomCreated', {message : "ok"});
      }
      else{
     //   console.log("yaha sab theek hai")
        socket.join(roomID); 
        const gameforRoomID = await Game.findOne({roomID : roomID});
       // console.log(gameforRoomID);
        rmap[roomID] = {
          ...rmap[roomID],
          playerWhite : gameforRoomID.game.playerWhite,
          playerBlack : gameforRoomID.game.playerBlack,
        };
        io.to(roomID).emit('roomCreated', {
          message : "Exists", 
          game : gameforRoomID.game, 
          board : games[roomID].game.board.squares, 
          timingControls : rmap[roomID].timingControls,
          turn : rmap[roomID].turn
        });
      
      }
    }); 
  
    socket.on("getTimer", obj => {
      io.to(obj.roomID).emit("timer", {
        start : rmap[obj.roomID].start, 
        turn : rmap[obj.roomID].turn
      });
    });

    socket.on("newGame", async obj => {
      //console.log(obj);
      const roomID = obj.roomID;
      const game = obj.game;
      const flag = obj.fl;
      try{
        if(flag === true){
          await Game.deleteOne({roomID : roomID}).then((res) => {});
        }
        const gameforRoomID = new Game({
          roomID : roomID,
          game : game
        });
        await gameforRoomID.save();
        rmap[roomID] = {
          ...rmap[roomID],
          playerWhite : game.playerWhite,
          playerBlack : game.playerBlack,
          turn : game.turn,
          start : new Date().getTime()
        }
        io.to(roomID).emit("gameCreated", {
            game : game, 
            board : games[roomID].game.board.squares, 
            timingControls : rmap[roomID].timingControls, 
            start : {
              white : rmap[roomID].start,
              black : rmap[roomID].start
            }
          }
        );
      }catch(err){
        io.to(roomID).emit("gameCancelled");
      }
    });
  
    socket.on("checkMove", obj => {
      const roomID = obj.roomID;
     // const from = String(x_map[obj.from.y]) + String(y_map[obj.from.x]);
     if((rmap[roomID].turn === 0 && obj.username === rmap[roomID].playerWhite) || 
      (rmap[roomID].turn === 1 && obj.username === rmap[roomID].playerBlack)){
      const from = obj.from.x  + obj.from.y; 
      const to = String(x_map[obj.to.y]) + String(y_map[obj.to.x]);
      const gameClient = games[roomID];
      const status = gameClient.getStatus();
     if((rmap[roomID].turn === 0 && obj.username === rmap[roomID].playerWhite) || 
      (rmap[roomID].turn === 1 && obj.username === rmap[roomID].playerBlack)){
        console.log(from, to);
        Object.entries(status.notatedMoves).forEach(([key, move]) => {
          if(move.src.file === from[0] && String(move.src.rank) === from[1] && move.dest.file === to[0] && String(move.dest.rank) === to[1]){
            gameClient.move(key);
            rmap[roomID].turn = 1 - rmap[roomID].turn;
            rmap[roomID].start = new Date().getTime();
            io.to(roomID).emit("move", {from : obj.from, to : obj.to, board : games[roomID].game.board.squares});
            io.to(roomID).emit("timer", {start : rmap[roomID].start, turn : rmap[roomID].turn});
            console.log("start", rmap[roomID].start);
          }
        });
      }
      if(gameClient.getStatus().isCheckmate === true){
        io.to(roomID).emit("gameEnded", {result : "Win" ,winner : obj.username});
      }else if(gameClient.getStatus().isStalemate === true || gameClient.getStatus().isRepetition === true){
        io.to(roomID).emit("gameEnded", {winner : obj.username, result : "Draw"});
      }
      //console.log(obj);
      }
    }); 
  
    socket.on("resign", async obj => {
      io.to(obj.roomID).emit("gameEnded", {
          result : "Win", 
          winner : (obj.auth === rmap[obj.roomID].playerWhite ? 
            rmap[obj.roomID].playerBlack : 
            rmap[obj.roomID].playerWhite
            )
      });
    });
  
    socket.on("leave-room", async obj =>{
      if(games[obj.roomID] !== undefined)
          delete games[obj.roomID];
      if(rmap[obj.roomID] !== undefined)
          delete rmap[obj.roomID];
      if(socket[obj.roomID] !== undefined)
          delete socket[obj.roomID];
      if(io.of("/").adapter.rooms[obj.roomID] !== undefined)
          delete io.of("/").adapter.rooms[obj.roomID]
      await Game.deleteMany({roomID : obj.roomID}).then((res) => {});
    //  console.log("deleted",io.of("/").adapter.rooms, games);
    });
  
  }
};