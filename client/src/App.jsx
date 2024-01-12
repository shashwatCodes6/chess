import React from 'react';
import {useEffect, useState} from 'react'
import Chessboard from './Chessboard';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { Game } from './Game';
import { useParams } from "react-router-dom";
import { socket } from './socket';


const containerStyle = {
  width: 500,
  height: 500,
  border: '1px solid gray',
}

function App() {
  const roomID = useParams().roomID;
  let [game, setGame] = useState(new Game());
  useEffect(() => {
    socket.emit("join-room", roomID);
    socket.on('roomCreated', (message) => {
        if(message.message === "ok"){
          //game = new Game();
          socket.emit("newGame", {game, roomID});
        }else if(message.message === "Exists"){
          setGame(message.game);
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