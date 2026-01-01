// import dotenv from "dotenv";
// dotenv.config();

// import express from 'express'
// import cors from 'cors'
// import connectDb from './config/db.js'
// import authRoutes from './routes/authRoutes.js'
// import aiRoutes from './routes/aiRoutes.js'
// import leadRoutes from './routes/leadRoutes.js'
// import invoiceRoutes from './routes/invoiceRoutes.js'
// import conversationRoutes from './routes/coversationRoutes.js'
// import whatsappRoutes from "./routes/whatsappRoutes.js";




// const app = express()

// connectDb()

// app.use(cors())
// app.use(express.json())

// const PORT = process.env.PORT || 5000

// app.use("/api/auth", authRoutes);
// app.use("/api/ai", aiRoutes);
// app.use("/api/leads", leadRoutes);
// app.use("/api/invoices", invoiceRoutes);
// app.use("/api/conversations", conversationRoutes);
// app.use("/api/whatsapp", whatsappRoutes);


// app.get("/", (req, res) => {
//     res.send("API IS WORKING")
// })

// app.listen(PORT, ()=> {
//     console.log(`Server is running on port ${PORT}`)
// })



import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import connectDb from './config/db.js'

import authRoutes from './routes/authRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import leadRoutes from './routes/leadRoutes.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import conversationRoutes from './routes/coversationRoutes.js'
import whatsappRoutes from './routes/whatsappRoutes.js'

const app = express()

// 🔥 REQUIRED for Vercel / reverse proxy
app.set('trust proxy', 1)

// middlewares
app.use(cors())
app.use(express.json())

// routes
app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/conversations', conversationRoutes)
app.use('/api/whatsapp', whatsappRoutes)

app.get('/', (req, res) => {
  res.send('API IS WORKING')
})

const PORT = process.env.PORT || 5000

// ❌ DO NOT await DB here on Vercel
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
