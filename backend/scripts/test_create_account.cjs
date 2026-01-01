const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()
const WhatsAppAccount = require('../models/WhatsAppAccount')
const { encrypt } = require('../services/crypto')

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('DB connected')
    const acc = await WhatsAppAccount.create({ user: mongoose.Types.ObjectId(), phoneNumberId: 'test_pn', displayPhoneNumber: '+1000', encryptedAccessToken: encrypt('token'), verifyToken: 'vt', isActive: true })
    console.log('created', acc._id)
    process.exit(0)
  } catch (err) {
    console.error('ERR', err)
    process.exit(1)
  }
}

run()
