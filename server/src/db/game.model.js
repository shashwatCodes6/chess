import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
    roomID : String,
    game : Object,  
  });

export const Game = mongoose.model('Game', GameSchema);