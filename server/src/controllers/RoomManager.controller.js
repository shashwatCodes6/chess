import { x_map, y_map } from '../constants/mappings.js'
import { Game } from '../db/game.model.js'
import chess from 'chess';
import { Server } from "socket.io";
import http from 'http';


class RoomManager {
  static instance = null;
  rmap = {};
  games = {};
  io;

  // private
  constructor() {
    if (RoomManager.instance) {
      return RoomManager.instance;
    }
    RoomManager.instance = this;
    // RoomManager.getInstance().rmap = new Map();
    // RoomManager.getInstance().games = new Map();
    // const server = http.Server(app);

    // RoomManager.getInstance().io = new Server(server, {
    //   path: '',
    //   cors: {
    //     origin: process.env.CORS_ORIGIN,
    //     methods: ['GET', 'POST']
    //   },
    //   transports: ['websocket', 'polling']
    // });


    // RoomManager.getInstance().io.on('connection', RoomManager.getInstance().handleRoomManager.bind(this));

  }

  static getInstance() {
    if(RoomManager.instance === null) {
      RoomManager.instance = new RoomManager();
    }
    return RoomManager.instance;
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

  handleRoomManager(socket) {
    // console.log(socket);
    socket.on("createRoom", obj => {
      const roomID = obj.roomID;
      RoomManager.getInstance().rmap[roomID] = {
        timingControls : obj.timingControls
      }
      setTimeout (() => {
        console.log(RoomManager.getInstance().rmap[roomID]);
        if(!RoomManager.getInstance().rmap[roomID].playerBlack || !RoomManager.getInstance().rmap[roomID].playerWhite){
          RoomManager.getInstance().io.to(roomID).emit("roomExpired", {message : "bye bye"});
        }
      }, 1000 * 30);
    });

    socket.on("join-room", async obj => {
      const roomID = obj.roomID;
      const auth = obj.auth;
      console.log(obj);
      // const rooms = RoomManager.getInstance().io.of("/").adapter.rooms;
      console.log( "yo", RoomManager.getInstance().rmap[roomID]);
    
      if(RoomManager.getInstance().games[roomID] === undefined){
        const gameClient = chess.create({ PGN : true });
       // console.log(gameClient);
        RoomManager.getInstance().games[roomID] = gameClient;
        RoomManager.getInstance().rmap[roomID] = {
          ...RoomManager.getInstance().rmap[roomID], 
          playerWhite : null,
          playerBlack : null,
          turn : 0
        };
       // console.log("yoooo");
        socket.join(roomID); 
        RoomManager.getInstance().io.to(roomID).emit('roomCreated', {message : "ok"});
      }
      else{
     //   console.log("yaha sab theek hai")
        socket.join(roomID); 
        const gameforRoomID = await Game.findOne({roomID : roomID});
       // console.log(gameforRoomID);
        RoomManager.getInstance().rmap[roomID] = {
          ...RoomManager.getInstance().rmap[roomID],
          playerWhite : gameforRoomID.game.playerWhite,
          playerBlack : gameforRoomID.game.playerBlack,
        };
        RoomManager.getInstance().io.to(roomID).emit('roomCreated', {
          message : "Exists", 
          game : gameforRoomID.game, 
          board : RoomManager.getInstance().games[roomID].game.board.squares, 
          timingControls : RoomManager.getInstance().rmap[roomID].timingControls,
          turn : RoomManager.getInstance().rmap[roomID].turn
        });
      
      }
    }); 
  
    socket.on("getTimer", obj => {
      RoomManager.getInstance().io.to(obj.roomID).emit("timer", {
        start : RoomManager.getInstance().rmap[obj.roomID].start, 
        turn : RoomManager.getInstance().rmap[obj.roomID].turn
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
        RoomManager.getInstance().rmap[roomID] = {
          ...RoomManager.getInstance().rmap[roomID],
          playerWhite : game.playerWhite,
          playerBlack : game.playerBlack,
          turn : game.turn,
          start : new Date().getTime()
        }
        RoomManager.getInstance().io.to(roomID).emit("gameCreated", {
            game : game, 
            board : RoomManager.getInstance().games[roomID].game.board.squares, 
            timingControls : RoomManager.getInstance().rmap[roomID].timingControls, 
            start : {
              white : RoomManager.getInstance().rmap[roomID].start,
              black : RoomManager.getInstance().rmap[roomID].start
            }
          }
        );
      }catch(err){
        RoomManager.getInstance().io.to(roomID).emit("gameCancelled");
      }
    });
  
    socket.on("checkMove", obj => {
      const roomID = obj.roomID;
     // const from = String(x_map[obj.from.y]) + String(y_map[obj.from.x]);
     if((RoomManager.getInstance().rmap[roomID].turn === 0 && obj.username === RoomManager.getInstance().rmap[roomID].playerWhite) || 
      (RoomManager.getInstance().rmap[roomID].turn === 1 && obj.username === RoomManager.getInstance().rmap[roomID].playerBlack)){
      const from = obj.from.x  + obj.from.y; 
      const to = String(x_map[obj.to.y]) + String(y_map[obj.to.x]);
      const gameClient = RoomManager.getInstance().games[roomID];
      const status = gameClient.getStatus();
     if((RoomManager.getInstance().rmap[roomID].turn === 0 && obj.username === RoomManager.getInstance().rmap[roomID].playerWhite) || 
      (RoomManager.getInstance().rmap[roomID].turn === 1 && obj.username === RoomManager.getInstance().rmap[roomID].playerBlack)){
        console.log(from, to);
        Object.entries(status.notatedMoves).forEach(([key, move]) => {
          if(move.src.file === from[0] && String(move.src.rank) === from[1] && move.dest.file === to[0] && String(move.dest.rank) === to[1]){
            gameClient.move(key);
            RoomManager.getInstance().rmap[roomID].turn = 1 - RoomManager.getInstance().rmap[roomID].turn;
            RoomManager.getInstance().rmap[roomID].start = new Date().getTime();
            RoomManager.getInstance().io.to(roomID).emit("move", {from : obj.from, to : obj.to, board : RoomManager.getInstance().games[roomID].game.board.squares});
            RoomManager.getInstance().io.to(roomID).emit("timer", {start : RoomManager.getInstance().rmap[roomID].start, turn : RoomManager.getInstance().rmap[roomID].turn});
            console.log("start", RoomManager.getInstance().rmap[roomID].start);
          }
        });
      }
      if(gameClient.getStatus().isCheckmate === true){
        RoomManager.getInstance().io.to(roomID).emit("gameEnded", {result : "Win" ,winner : obj.username});
      }else if(gameClient.getStatus().isStalemate === true || gameClient.getStatus().isRepetition === true){
        RoomManager.getInstance().io.to(roomID).emit("gameEnded", {winner : obj.username, result : "Draw"});
      }
      //console.log(obj);
      }
    }); 
  
    socket.on("resign", async obj => {
      RoomManager.getInstance().io.to(obj.roomID).emit("gameEnded", {
          result : "Win", 
          winner : (obj.auth === RoomManager.getInstance().rmap[obj.roomID].playerWhite ? 
            RoomManager.getInstance().rmap[obj.roomID].playerBlack : 
            RoomManager.getInstance().rmap[obj.roomID].playerWhite
            )
      });
    });
  
    socket.on("leave-room", async obj =>{
      if(RoomManager.getInstance().games[obj.roomID] !== undefined)
          delete RoomManager.getInstance().games[obj.roomID];
      if(RoomManager.getInstance().rmap[obj.roomID] !== undefined)
          delete RoomManager.getInstance().rmap[obj.roomID];
      if(socket[obj.roomID] !== undefined)
          delete socket[obj.roomID];
      if(RoomManager.getInstance().io.of("/").adapter.rooms[obj.roomID] !== undefined)
          delete RoomManager.getInstance().io.of("/").adapter.rooms[obj.roomID]
      await Game.deleteMany({roomID : obj.roomID}).then((res) => {});
    //  console.log("deleted",RoomManager.getInstance().io.of("/").adapter.rooms, RoomManager.getInstance().games);
    });
  
  }
};

export { RoomManager }