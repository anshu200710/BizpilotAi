import express from 'express'
import {
  verifyWebhook,
  receiveMessage,
} from '../controllers/whatsappController.js'
import { createAccount, listAccounts, deleteAccount } from '../controllers/whatsappAccountController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { webhookLimiter } from '../middleware/rateLimitMiddleware.js'

const router = express.Router()

// Meta webhook verification
router.get('/webhook', verifyWebhook)

// Incoming WhatsApp messages (rate-limited)
router.post('/webhook', webhookLimiter, receiveMessage)

// Account management (protected)
router.post('/accounts', authMiddleware, createAccount)
router.get('/accounts', authMiddleware, listAccounts)
router.delete('/accounts/:id', authMiddleware, deleteAccount)

export default router;
