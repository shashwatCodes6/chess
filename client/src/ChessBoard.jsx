import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import Square from './Square';
import Piece from './Pieces';

const boardStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexWrap: "wrap",
};


const Chessboard = ({game}) => {
  let [board,setBoard] = useState(game.chess_board);
  useEffect(() => game.observe(setBoard));
  function renderSquare(i){
    const x = i%8;
    const y = Math.floor(i/8);
    const black = (x + y) % 2 === 1;
    return (
      <div style = {{width:"12.5%", height : "12.5%"}} key = {i}>
        <Square black = {black} game = {game}>
          {
            board[y][x] === '-' ? 
            null : 
            <Piece pid={board[y][x]} />
          }
        </Square>
      </div>
    );
  }
  let squares = [];
  for(let i = 0; i < 64; i++){
    squares.push(renderSquare(i));
  }
  return (
    <div
      style = {boardStyle}
    >
      {squares}
    </div>
  );
};

export default Chessboard;
