import express from 'express'
import {
  verifyWebhook,
  receiveMessage,
} from '../controllers/whatsappController.js'
import {
  createAccount,
  listAccounts,
  deleteAccount,
  updateAccountToken,
} from '../controllers/whatsappAccountController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { webhookLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// Webhook
router.get('/webhook', verifyWebhook)
router.post('/webhook', webhookLimiter, receiveMessage)

// Account management
router.post('/accounts', authMiddleware, createAccount)
router.get('/accounts', authMiddleware, listAccounts)
router.delete('/accounts/:id', authMiddleware, deleteAccount)

// 🔥 UPDATE TOKEN
router.put('/accounts/:id/token', authMiddleware, updateAccountToken)

export default router
