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

    function decryptBoard(squares){
      let ans = [
        ['-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-'],
        ['-', '-', '-', '-', '-', '-', '-', '-'],
      ];
      for(let i = 0; i < 64; i++){
        if(squares[i].piece !== null){
            const color = squares[i].piece.side.name[0];
            let piece = squares[i].piece.notation.toLowerCase()[0];
            //console.log(color, piece);
            if(piece === undefined){
                piece = 'p';
            }
            ans[7 - Math.floor(i / 8)][i % 8] = (color + "_" + piece + String(squares[i].file) + String(squares[i].rank));
        }
      }
      return ans;
    }

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
          if((message.game.playerBlack === username && message.game.playerWhite === null) || 
          (message.game.playerBlack === null && message.game.playerWhite === username)){
            setFound(false);
          }else setFound(true);
          if(message.game.playerBlack === null && message.game.playerWhite !== username){
            message.game.playerBlack = username;
            socket.emit("newGame", {game : message.game, roomID : roomID, fl : true});
          }else if(message.game.playerWhite === null && message.game.playerBlack !== username){
            message.game.playerWhite = username;
            socket.emit("newGame", {game : message.game, roomID : roomID, fl : true});
          }
          const sq = decryptBoard(message.board);
          game = message.game;
          game.chess_board = sq;
          setGame(game);
       //   alert("damn");
        }
    });

    socket.on("gameCreated", (message) => {
      console.log("Message!!!", message);
      const sq = decryptBoard(message.board);
      game = message.game;
      game.chess_board = sq;
      setGame(game);
      console.log(game);
    });

    socket.on("move", (move) => {
      // game.turn = 1 - game.turn;
      // const sq = decryptBoard(move.board);
      // game.chess_board = sq;
      // console.log("MOVE!!!", game);
      // setGame(game);
      const sq = decryptBoard(move.board);
      setGame(prevGame => ({
        ...prevGame,
        turn: 1 - prevGame.turn,
        chess_board: sq,
      }));
      console.log(game);
    });

    socket.on("gameEnded", obj => {
      if(obj.result === "Win"){
        alert("Game Ended! Winner is " + obj.winner);
      }else{
        alert("Game Ended! It's a draw!");
      }
      socket.emit("leave-room", {roomID : roomID, auth : Cookies.get().username});
      navigate("/roomGen");
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