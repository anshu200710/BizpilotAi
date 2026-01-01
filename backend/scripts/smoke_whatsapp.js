const axios = require('axios')

const BASE = process.env.API_BASE || 'http://localhost:5000'

async function run() {
  try {
    const ts = Date.now()
    const email = `copilot_user_${ts}@example.com`
    const password = 'Password123!'
    console.log('Registering user', email)
    await axios.post(`${BASE}/api/auth/register`, { name: 'Smoke User', email, password })
    const login = await axios.post(`${BASE}/api/auth/login`, { email, password })
    const token = login.data.token
    const headers = { Authorization: `Bearer ${token}` }

    // Create a WhatsApp account (mock token) - note: this will call WhatsApp Graph API to verify; if you don't have real credentials, skip this step
    const phoneNumberId = process.env.SAMPLE_PHONE_NUMBER_ID || '111111111'
    const accessToken = process.env.SAMPLE_ACCESS_TOKEN || 'SAMPLE_TOKEN'

    console.log('Creating WhatsApp account (if you have real credentials set SAMPLE_ env vars)')
    try {
      const acc = await axios.post(`${BASE}/api/whatsapp/accounts`, { phoneNumberId, accessToken }, { headers })
      console.log('Account created:', acc.data)
    } catch (err) {
      console.warn('Could not create real account (expected in dev without real creds):', err.response?.data || err.message)
    }

    // Simulate webhook payload
    console.log('Simulating webhook')
    const payload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'entryid',
          changes: [
            {
              value: {
                metadata: { phone_number_id: phoneNumberId },
                messages: [
                  { from: '15551234567', id: 'mid', timestamp: `${Math.floor(ts/1000)}`, text: { body: 'Hello from smoke test' }, type: 'text' }
                ]
              }
            }
          ]
        }
      ]
    }

    await axios.post(`${BASE}/api/whatsapp/webhook`, payload)
    console.log('Posted webhook payload')

    // Check leads
    const leads = await axios.get(`${BASE}/api/leads`, { headers })
    console.log('Leads for user:', leads.data.length)

    // Done
    process.exit(0)
  } catch (err) {
    console.error('SMOKE FAILED', err.response?.data || err.message)
    process.exit(1)
  }
}

run()
