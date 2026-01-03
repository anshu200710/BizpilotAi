import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {
  getProfile,
  upsertProfile,
} from '../controllers/businessProfileController.js'

const router = express.Router()

router.get('/', authMiddleware, getProfile)
router.post('/', authMiddleware, upsertProfile)

export default router
