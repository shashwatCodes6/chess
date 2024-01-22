import express from 'express';
const app = express();
import cors from 'cors';
import chess from 'chess';
import http from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
const key = "mysecret";

app.use(express.json());
app.use(cors());
const db = mongoose.connect("mongodb+srv://shashwat123:shashwat123@cluster0.qkxrwkq.mongodb.net/");

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
  socket.on("join-room", async obj => {
    const roomID = obj.roomID;
    const auth = obj.auth;
    console.log(obj);
    const rooms = io.of("/").adapter.rooms;
   // console.log(games[roomID]);
    if(games[roomID] === undefined){
      const gameClient = chess.create({ PGN : true });
     // console.log(gameClient);
      games[roomID] = gameClient;
     // console.log("yoooo");
      socket.join(roomID); 
      io.to(roomID).emit('roomCreated', {message : "ok"});
    }
    else{
   //   console.log("yaha sab theek hai")
      socket.join(roomID); 
      const gameforRoomID = await Game.findOne({roomID : roomID});
      console.log(gameforRoomID);
      io.to(roomID).emit('roomCreated', {message : "Exists", game : gameforRoomID.game});
    }
  }); 

  // app.jsx
  socket.on("newGame", async obj => {
    //console.log(obj);
    const roomID = obj.roomID;
    const game = obj.game;
    const flag = obj.fl;
    if(flag === true){
      await Game.deleteOne({roomID : roomID}).then((res) => {});
    }
    const gameforRoomID = new Game({
      roomID : roomID,
      game : game
    });
    await gameforRoomID.save();
    io.to(roomID).emit("gameCreated", {game : game});
  });



  // square.jsx
  socket.on("checkMove", obj => {
    const roomID = obj.roomID;
    const from = obj.from;
    const to = obj.to;
    const game = games[roomID];
    const move = game.move({from : from, to : to});
    if(move !== null){
      io.to(roomID).emit("move", {from : from, to : to});
    } 
  }); 


  socket.on("leave-room", roomID =>{
    games.erase(roomID)// = undefined;
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
      const token = jwt.sign(obj, key);
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
        const token = jwt.sign(obj, key);
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
      const verifyToken = jwt.verify(token, key);
      return res.json({msg : "Success"});
    }catch(err){
      return res.json({msg : "Invalid token"});
    }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
