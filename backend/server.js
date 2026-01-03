import dotenv from "dotenv";
dotenv.config();

import express from 'express'
import cors from 'cors'
// import connectDb from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import leadRoutes from './routes/leadRoutes.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import conversationRoutes from './routes/coversationRoutes.js'
import whatsappRoutes from "./routes/whatsappRoutes.js";
import dbMiddleware from './middleware/dbMiddleware.js'
import profileRoutes from './routes/profileRoutes.js'

const app = express()

app.set('etag', false)
app.set('trust proxy', 1)
app.use(dbMiddleware)
// connectDb()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use('/api/profile', profileRoutes);


app.get("/", (req, res) => {
    res.send("API IS WORKING")
})

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)
})

// import dotenv from 'dotenv'
// dotenv.config()

// import express from 'express'
// import cors from 'cors'
// import dbMiddleware from './middleware/dbMiddleware.js'

// import whatsappRoutes from './routes/whatsappRoutes.js'

// const app = express()

// // REQUIRED for Vercel / Meta / rate-limit
// app.set('trust proxy', 1)

// app.use(cors())
// app.use(express.json())

// // 🔥 ENSURE DB FOR EVERY REQUEST
// app.use(dbMiddleware)

// app.use('/api/whatsapp', whatsappRoutes)

// app.get('/', (_, res) => res.send('API IS WORKING'))

// const PORT = process.env.PORT || 5000
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`)
// })
