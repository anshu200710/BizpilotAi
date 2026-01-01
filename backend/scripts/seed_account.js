const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { encrypt } = require('../services/crypto')
const WhatsAppAccount = require('../models/WhatsAppAccount')

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to DB')
    const userId = process.env.SAMPLE_USER_ID
    if (!userId) throw new Error('Set SAMPLE_USER_ID in env for seeding')
    const phoneNumberId = process.env.SAMPLE_PHONE_NUMBER_ID || '1111111'
    const accessToken = process.env.SAMPLE_ACCESS_TOKEN || 'SAMPLE'
    const encrypted = encrypt(accessToken)
    const acc = await WhatsAppAccount.create({ user: userId, phoneNumberId, displayPhoneNumber: '+1000000', encryptedAccessToken: encrypted, verifyToken: 'seedtoken' })
    console.log('Created account', acc._id)
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

run()
