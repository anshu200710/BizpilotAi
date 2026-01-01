import crypto from 'crypto'

const getKey = () => {
  const raw = process.env.ENCRYPTION_KEY
  if (!raw) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('ENCRYPTION_KEY not set, falling back to ephemeral dev key (NOT FOR PRODUCTION)')
      // Create a deterministic dev key so encrypt/decrypt within same process works
      const devKey = Buffer.alloc(32, 0)
      Buffer.from('dev_ephemeral_key_for_local_testing').copy(devKey)
      return devKey
    }
    throw new Error('ENCRYPTION_KEY not set in environment')
  }

  // Try base64 first, then hex
  let key = Buffer.from(raw, 'base64')
  if (key.length !== 32) key = Buffer.from(raw, 'hex')
  if (key.length !== 32) throw new Error('ENCRYPTION_KEY must decode to 32 bytes (base64 or hex)')
  return key
}

export const encrypt = (plaintext) => {
  const key = getKey()
  const iv = crypto.randomBytes(12) // recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // encode as iv:tag:ciphertext (base64)
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`
}

export const decrypt = (payload) => {
  const key = getKey()
  const [ivB64, tagB64, encB64] = payload.split(':')
  if (!ivB64 || !tagB64 || !encB64) throw new Error('Invalid encrypted payload format')
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const enc = Buffer.from(encB64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(enc), decipher.final()])
  return decrypted.toString('utf8')
}
