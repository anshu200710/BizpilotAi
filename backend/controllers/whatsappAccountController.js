import WhatsAppAccount from '../models/WhatsAppAccount.js'
import { encrypt } from '../services/crypto.js'
import axios from 'axios'

export const createAccount = async (req, res) => {
  try {
    const userId = req.user?.id
    console.debug('createAccount called by user', userId, 'body:', req.body)
    const { phoneNumberId, accessToken, verifyToken } = req.body

    if (!phoneNumberId || !accessToken) {
      return res.status(400).json({ message: 'phoneNumberId and accessToken are required' })
    }

    // Verify token with WhatsApp Graph API: fetch display phone number
    let displayPhoneNumber = null
    const skipVerify = req.query.skipVerify === 'true' && process.env.NODE_ENV !== 'production'

    if (!skipVerify) {
      try {
        const resp = await axios.get(`https://graph.facebook.com/v18.0/${phoneNumberId}?fields=display_phone_number&access_token=${accessToken}`)
        displayPhoneNumber = resp.data.display_phone_number
      } catch (err) {
        console.warn('Failed to verify WhatsApp credentials', err.response?.data || err.message)
        return res.status(400).json({ message: 'Failed to verify provided phoneNumberId/accessToken' })
      }
    } else {
      console.log('Skipping WhatsApp verification (dev mode)')
    }

    const encryptedAccessToken = encrypt(accessToken)
    const tokenToStore = verifyToken || Math.random().toString(36).slice(2, 12)

    const account = await WhatsAppAccount.create({
      user: userId,
      phoneNumberId,
      displayPhoneNumber,
      encryptedAccessToken,
      verifyToken: tokenToStore,
      isActive: true,
    })

    // Return fresh account without encrypted token
    const returned = await WhatsAppAccount.findById(account._id).select('-encryptedAccessToken')
    res.status(201).json(returned)
  } catch (error) {
    console.error('createAccount error', error.stack || error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const listAccounts = async (req, res) => {
  try {
    const userId = req.user.id
    const accounts = await WhatsAppAccount.find({ user: userId }).select('-encryptedAccessToken')
    res.json(accounts)
  } catch (error) {
    console.error('listAccounts error', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id
    const accountId = req.params.id
    const account = await WhatsAppAccount.findById(accountId)
    if (!account) return res.status(404).json({ message: 'Account not found' })
    if (account.user.toString() !== userId) return res.status(403).json({ message: 'Forbidden' })
    await account.remove()
    res.json({ success: true })
  } catch (error) {
    console.error('deleteAccount error', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
