import React from 'react';
import {useEffect, useState} from 'react'
import Chessboard from './Chessboard';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { Game } from './Game';
import { useParams } from "react-router-dom";
import { socket } from './socket';
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom';



const containerStyle = {
  width: 500,
  height: 500,
  border: '1px solid gray',
}

function App() {
  const roomID = useParams().roomID;  
  const tokeninBrowser = Cookies.get();
  let [game, setGame] = useState(new Game());
  const navigate = useNavigate();


  useEffect(() => {
    if(!tokeninBrowser){
      navigate("/login");
    }
    fetch("http://localhost:3000/verifyToken", {
      method : "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokeninBrowser),
    }) 
    .then((response) => {
      return response.json();
    }).then(data => {
      if(data.msg === "Success"){
        console.log(data);
      }else{
        alert("Not authenticated!!");
        navigate("/login");
      }
    })
    socket.emit("join-room", {roomID : roomID, auth : Cookies.get().token});
    socket.on('roomCreated', (message) => {
      console.log(message);
        if(message.message === "ok"){
          //game = new Game();
          socket.emit("newGame", {game, roomID});
        }else if(message.message === "Exists"){
          //setGame(message.game);
          alert("damn");
        }
    });
  },[]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div style = {containerStyle}>
        <Chessboard game = {game} />
      </div>
    </DndProvider>
  );
}


export default App;