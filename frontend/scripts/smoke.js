const axios = require('axios')

const BASE = process.env.VITE_API_URL || 'http://localhost:5000'

async function run() {
  try {
    const ts = Date.now()
    const email = `copilot_test_${ts}@example.com`
    console.log('Registering', email)
    const reg = await axios.post(`${BASE}/api/auth/register`, {
      name: 'Copilot Test',
      email,
      password: 'Password123!'
    })
    const token = reg.data.token
    if (!token) {
      console.error('No token received on register')
      process.exit(1)
    }
    console.log('Registered, token length:', token.length)

    const auth = { headers: { Authorization: `Bearer ${token}` } }

    const leadsRes = await axios.get(`${BASE}/api/leads`, auth)
    console.log('Fetched leads count:', Array.isArray(leadsRes.data) ? leadsRes.data.length : Object.keys(leadsRes.data).length)

    const newLead = await axios.post(`${BASE}/api/leads`, {
      name: 'Smoke Lead',
      email: `lead_${ts}@example.com`,
      phone: '1234567890',
      status: 'New'
    }, auth)

    console.log('Created lead id:', newLead.data._id)

    // cleanup
    await axios.delete(`${BASE}/api/leads/${newLead.data._id}`, auth)
    console.log('Deleted created lead:', newLead.data._id)

    console.log('SMOKE TESTS PASSED')
    process.exit(0)
  } catch (err) {
    console.error('SMOKE TEST FAILED:', err.response ? err.response.data || err.response.statusText : err.message)
    process.exit(1)
  }
}

run()
