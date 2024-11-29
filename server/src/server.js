import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import cors from 'cors';
import http from "http";
import { Server } from "socket.io";
import RoomManager from './controllers/RoomManager.controller.js';
import { connectDB } from './db/connect.js';
import { User }  from './db/user.model.js'



const app = express();
app.use(express.json());
app.use(cors());
dotenv.config({path:['.env']})



connectDB() 
  .then(res => {
    console.log(`connected to db`)
  })
  .catch(err => {
    console.log(`err connecting to db ${err}`)
  });

  

// const server = http.Server(app);
// const io = new Server(server, {
//   path: '',
//   cors: {
//     origin: process.env.CORS_ORIGIN,
//     methods: ['GET', 'POST']
//   },
//   transports: ['websocket', 'polling']
// });


// io.on('connection', RoomManager);


app.post("/signup", async (req, res) => {
  const input = req.body;
    let found = false;
    const value = (input.username ? await User.findOne({username : input.username}) : null);
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
    const value = (input.username ? await User.findOne({username : input.username}) : null);
    // console.log(input.username , value);
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
  // console.log("aaya", req.body, rmap[roomID]);
  // if(rmap[roomID] === undefined){
  //   return res.status(404).json({msg : "room not found"});
  // }
    return res.json({msg : "ok"});

});


const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});