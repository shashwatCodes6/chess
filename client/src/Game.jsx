import { socket } from './socket';

export class Game{
    chess_board = [
    ['b_r8', 'b_n7', 'b_b6', 'b_q5', 'b_k4', 'b_b3', 'b_n2', 'b_r1'],
    ['b_p8', 'b_p7', 'b_p6', 'b_p5', 'b_p4', 'b_p3', 'b_p2', 'b_p1'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['-', '-', '-', '-', '-', '-', '-', '-'],
    ['w_p1', 'w_p2', 'w_p3', 'w_p4', 'w_p5', 'w_p6', 'w_p7', 'w_p8'],
    ['w_r1', 'w_n2', 'w_b3', 'w_q4', 'w_k5', 'w_b6', 'w_n7', 'w_r8']
  ];
  observe(o){

  }
  turn = 0;
  playerBlack = null;
  playerWhite = null;
  canMove(move){

  }
  playMove(move){

  }
  isOver(){

  }
  emitChange(){
    
  }
}