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

    const phoneNumberId = `pn_${ts}`
    const accessToken = 'SAMPLE_ACCESS_TOKEN'

    console.log('Creating WhatsApp account (skipping verification)')
    const acc = await axios.post(`${BASE}/api/whatsapp/accounts?skipVerify=true`, { phoneNumberId, accessToken }, { headers })
    console.log('Account created:', acc.data)

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

    if (leads.data.length === 0) {
      throw new Error('No leads created')
    }

    console.log('SMOKE FLOW PASSED')
    process.exit(0)
  } catch (err) {
    console.error('SMOKE FAILED', err.response?.data || err.message)
    process.exit(1)
  }
}

run()
