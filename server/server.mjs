import express from 'express';
const app = express();
import cors from 'cors';
import chess from 'chess';
import http from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { stringify } from 'querystring';
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


const User = mongoose.model('User', UserSchema);

var games = new Map();
var boards = {};
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
  socket.on("join-room", roomID =>{
    const rooms = io.of("/").adapter.rooms;
    console.log(rooms);
    if(games.get(roomID) === undefined){
      const gameClient = chess.create({ PGN : true });
      games[roomID] = gameClient;
      io.to(roomID).emit('roomCreated', {message : "ok"});
    }
    else{
      io.to(roomID).emit('roomCreated', {message : "Exists", game : games[roomID]});
    }
    socket.join(roomID); // logic to handle no of users!!
  }); 
  socket.on("leave-room", roomID =>{
    games.erase(roomID)// = undefined;
  });

  

});

app.post("/signup", async (req, res) => {
  const input = req.body;
    let found = false;
    const value = await User.findOne({username : input.username})
    console.log(input, value);
    if(value !== null){
      found = true;
    }
    console.log(found);
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
      console.log(token);
      return res.json({token : token})
    }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
