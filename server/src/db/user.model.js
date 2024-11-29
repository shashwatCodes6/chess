
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email : String,
    name : String,
    password : String,
    username : String,
});

export const User = mongoose.model('User', UserSchema);