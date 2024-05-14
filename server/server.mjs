import express from 'express';
const app = express();
import cors from 'cors';
import chess from 'chess';
import http from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'

const x_map = {
  0 : "a",
  1 : "b",
  2 : "c",
  3 : "d",
  4 : "e",
  5 : "f",
  6 : "g",
  7 : "h",
}; 

const y_map = {
  0 : "8",
  1 : "7",
  2 : "6",
  3 : "5",
  4 : "4",
  5 : "3",
  6 : "2",
  7 : "1",
};

app.use(express.json());
app.use(cors());
dotenv.config({path:['.env']})


const db = mongoose.connect(process.env.DATABASE_URL);

const UserSchema = new mongoose.Schema({
  email : String,
  name : String,
  password : String,
  username : String,
});

const GameSchema = new mongoose.Schema({
  roomID : String,
  game : Object,  
});
 

const User = mongoose.model('User', UserSchema);
const Game = mongoose.model('Game', GameSchema);

let games = new Map();
let rmap = new Map();
let timer = new Map();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
  secure : true
});




io.on('connection', (socket) => {
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
    const rooms = io.of("/").adapter.rooms;
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

  // app.jsx
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



  // square.jsx
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
});

app.post("/signup", async (req, res) => {
  const input = req.body;
    let found = false;
    const value = await User.findOne({username : input.username})
    //console.log(input, value);
    if(value !== null){
      found = true;
    }
    //console.log(found);
    if(found === true){
      return res.status(400).json({message : "User Already exists"});
    }else{
      const usernew = new User({
        email : input.email,
        name : input.name,
        password : input.password,
        username : input.username,
      });
      async function save(){
        await usernew.save();
      }
      save();
      const obj = {
        username : input.username,
        password : input.password
      };
      const token = jwt.sign(obj, process.env.KEY);
      //console.log(token);
      return res.json({token : token})
    }
});

app.post("/login", async (req, res) => {
  const input = req.body;
    let found = false;
    const value = await User.findOne({username : input.username})
    //console.log(input, value);
    if(value !== null){
      found = true;
    }
    // console.log(found);
    if(found === false){
      return res.status(400).json({message : "User does not exists"});
    }else{
      const obj = {
        username : input.username,
        password : input.password
      };
      if(input.password === value.password){
        const token = jwt.sign(obj, process.env.KEY);
        //console.log(token);
        return res.json({token : token})
      }else{
        return res.status(404).json({msg : "Incorrect password!"})
      }
    }
});

app.post("/verifyToken", (req, res)=>{
    const token = req.body.token;
    //console.log(req.body);
    try{
      const verifyToken = jwt.verify(token, process.env.KEY);
      return res.json({msg : "Success"});
    }catch(err){
      return res.json({msg : "Invalid token"});
    }
});

app.post("/verifyRoomID", (req, res)=>{
  const roomID = req.body.roomID;
  console.log("aaya", req.body, rmap[roomID]);
  if(rmap[roomID] === undefined){
    return res.status(404).json({msg : "room not found"});
  }else{
    return res.json({msg : "ok"});
  }
});


const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
