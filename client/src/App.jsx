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
import Timer from './Timer'

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
  const [time, setTime] = useState(1);
  const [timerWhite, setWhiteTimer] = useState(null);
  const [timerBlack, setBlackTimer] = useState(null);
  const [boardSize, setSize] = useState(500);

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

    fetch("http://localhost:3000/verifyRoomID", {
      method : "POST",
      headers : {
        "Content-Type" : "application/json",
      },
      body : JSON.stringify({roomID : roomID}),
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      console.log(data);
        if(data.msg === "ok"){
          console.log("yay");
        }else{
          socket.emit("leave-room", {roomID : roomID})
          alert(data.msg)
          navigate("/roomGen");
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
            console.log("found!!!");
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
          game.timingControls = message.timingControls;
          game.turn = message.turn;
          setGame(game);
          setTime(message.timingControls);
          console.log("time set : ", message.timingControls)
       //   alert("damn");
        }
    });

    socket.on("gameCreated", (message) => {
      console.log("Message!!!", message);
      const sq = decryptBoard(message.board);
      //game.chess_board = sq;
      setGame(prevGame => ({
        ...prevGame,
        playerBlack : message.game.playerBlack,
        playerWhite : message.game.playerWhite,
        chess_board: sq,
      }));
      if(message.game.playerBlack && message.game.playerWhite){
        setFound(true);
      }
      setWhiteTimer(new Date().getTime());
      setBlackTimer(new Date().getTime());
      console.log(game);
    });

    socket.on("move", (move) => {
      const sq = decryptBoard(move.board);
      if(game.turn === 0){
        setWhiteTimer(new Date().getTime());
      }else{
        setBlackTimer(new Date().getTime());
      }
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

    socket.on("gameCancelled", obj => {
      alert("Room does not exist!");
      navigate("/roomGen");
    });

    socket.on("roomExpired", message => {
      alert("Room expired!!");
      socket.emit("leave-room", {roomID : roomID, auth : Cookies.get().username});
      navigate("/roomGen");
    });
  }, []);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 500) { // Set your threshold here
        setSize(window.innerWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);


  if(found === false){
    return (
      <div className="grid grid-cols-3">
        <div className="col-span-1"></div>
        <div className="col-span-1 flex flex-col items-center justify-center" >
          <h1 className="text-3xl font-bold text-center sm:p-0 md:p-10">Waiting for opponent....</h1>
          
          <button onClick = {() => {
            socket.emit("leave-room", {roomID : roomID, auth : Cookies.get().username});
            navigate("/roomGen");
          }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          </button>
        </div>
        <div className="col-span-2"></div>
  
      </div>
    );
  }
  return (
  <div className="bg-gray-800 text-white md:p-10">
    <div className='grid sm:grid-cols-1 md:grid-cols-4'>
      <div className='grid-span-1 flex flex-col justify-between'>
          <div className='flex'>  
            <div className='text-3xl'>
              {game ? game.playerBlack : null}
            </div>
            <div>
              <Timer on = {1} totalTime = {time.time*60} roomID={roomID} />            
            </div>
          </div>
          <div className='hidden md:flex'>  
            <div className='text-3xl'>
              {game ? game.playerWhite : null}
            </div>
            <div>
              <Timer on = {0} totalTime = {time.time*60} roomID={roomID} />            
            </div>
          </div>
        </div>
      <div className='grid-span-2'>
        <DndProvider backend={HTML5Backend}>
          <div className='' style = {{width : boardSize, height : boardSize}} id='board' >
            <Chessboard game = {game} />
          </div>
        </DndProvider>
      </div>
      <div className='grid-span-1'>
          <div className='flex md:hidden'>
            <div className='text-3xl'>
              {game ? game.playerWhite : null}
            </div>
            <div>
              <Timer on = {0} totalTime = {time.time*60} roomID={roomID} />            
            </div>
          </div>
      </div>
    </div>
  </div>
  );
}


export default App;