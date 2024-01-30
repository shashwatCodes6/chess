import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import Square from './Square';
import Piece from './Pieces';

const boardStyle = {
  width: "100%",
  height: "100%",
  position:"relative",
  display: "flex",
  flexWrap: "wrap",
};


const Chessboard = ({game}) => {
  console.log("chess_board", game);
  let [game1, setGame] = useState(game);
  let [board, setBoard] = useState(game.chess_board);
  let [squares, setSq] = useState([]);
  //useEffect(() => game.observe(setBoard));
  useEffect(() => {
    board = game.chess_board;
    setGame(game);
    function renderSquare(i){
      const x = i%8;
      const y = Math.floor(i/8);
      const black = (x + y) % 2 === 1;
      return (
        <div style = {{width:"12.5%", height : "12.5%"}} key = {i}>
          <Square black = {black} game = {game} x = {x} y = {y}>
            {
              board[y][x] === '-' ? 
              null : 
              <Piece pid={board[y][x]} />
            }
          </Square>
        </div>
      );
    }
    let squares1 = [];
    for(let i = 0; i < 64; i++){
      squares1.push(renderSquare(i));
    }
    squares = squares1;
    setSq(squares1);
    console.log("sq waale mei hu", squares);
    
  }, [game]);
  return (
    <div
      style = {boardStyle}
    >
      {squares}
    </div>
  );
};

export default Chessboard;
