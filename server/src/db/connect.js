import mongoose from 'mongoose';

export async function connectDB() {
    return mongoose.connect(process.env.DATABASE_URL || "");
}