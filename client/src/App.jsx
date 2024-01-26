import React from 'react';
import {useEffect, useState} from 'react'
import Chessboard from './ChessBoard';
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
  const username = Cookies.get().username;
  const navigate = useNavigate();
  let [game, setGame] = useState();
  let [found, setFound] = useState(false);

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

    socket.emit("join-room", {roomID : roomID, auth : Cookies.get().username});

    socket.on('roomCreated', async (message) => {
        console.log("Message", message);


        if(message.message === "ok"){
          game = new Game();
          game.setRoomID(roomID);
          const color = (Math.random() >= 0.5) ? "white" : "black";
          if(color === "white"){
            game.playerWhite = username;
          }else{
            game.playerBlack = username;
          }
          console.log(game);
          setGame(game);
          socket.emit("newGame", {game : game, roomID : roomID, fl : false});
        }
        
        else if(message.message === "Exists"){
          setFound(true);
          if(message.game.playerBlack === null && message.game.playerWhite !== username){
            message.game.playerBlack = username;
            socket.emit("newGame", {game : message.game, roomID : roomID, fl : true});
          }else if(message.game.playerWhite === null && message.game.playerBlack !== username){
            message.game.playerWhite = username;
            socket.emit("newGame", {game : message.game, roomID : roomID, fl : true});
          }
          game = message.game;
          setGame(message.game);
       //   alert("damn");
        }
    });

    socket.on("gameCreated", async (message) => {
      console.log("Message!!!", message.game);
      game = message.game;
      console.log(game);
    });

    socket.on("move", (move) => {
      game.turn = 1 - game.turn;
      game.chess_board[move.to.x][move.to.y] = game.chess_board[move.from.x][move.from.y];
      game.chess_board[move.from.x][move.from.y] = '-';
      console.log("MOVE!!!", game);
      setGame(game);
    });
  }, []);


  if(found === false){
    return (
      <div>
        <h1>Waiting for other player to join!</h1>
      </div>
    );
  }
  return (
    <DndProvider backend={HTML5Backend}>
      <div style = {containerStyle}>
        <Chessboard game = {game} />
      </div>
    </DndProvider>
  );
}


export default App;