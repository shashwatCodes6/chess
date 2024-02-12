import { useEffect } from 'react';
import { socket } from './socket';



export class Game{
  chess_board = [
    ['b_r8', 'b_n7', 'b_b6', 'b_q5', 'b_k4', 'b_b3', 'b_n2', 'b_r1'],
    ['b_p18', 'b_p17', 'b_p16', 'b_p15', 'b_p14', 'b_p13', 'b_p12', 'b_p11'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['w_p11', 'w_p12', 'w_p13', 'w_p14', 'w_p15', 'w_p16', 'w_p17', 'w_p18'],
    ['w_r1', 'w_n2', 'w_b3', 'w_q4', 'w_k5', 'w_b6', 'w_n7', 'w_r8']
  ];
  
  turn = 0;
  playerBlack = null;
  playerWhite = null;
  roomID = null;
  setRoomID(roomID){
    this.roomID = roomID;
  }
}