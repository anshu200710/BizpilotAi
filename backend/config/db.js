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

let isConnected = false

const connectDb = async () => {
  if (isConnected) return

  mongoose.set('strictQuery', true)

  await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false, // 🔥 CRITICAL
  })

  isConnected = true
  console.log('✅ MongoDB connected')
}

export default connectDb
