// import mongoose from "mongoose";

// const connectDb = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI )
//         console.log("MONGODB IS CONNECTED");
//     } catch (error) {
//         console.log(error);
        
//     } 
// }

// export default connectDb
import mongoose from 'mongoose'

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

const connectDb = async () => {
  if (cached.conn) return cached.conn

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI missing')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  console.log('✅ MongoDB connected')
  return cached.conn
}

export default connectDb
