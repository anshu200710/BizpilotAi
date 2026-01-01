import connectDb from '../config/db.js'

export default async function dbMiddleware(req, res, next) {
  try {
    await connectDb()
    next()
  } catch (err) {
    console.error('DB ERROR:', err.message)
    res.status(500).json({ message: 'Database unavailable' })
  }
}
