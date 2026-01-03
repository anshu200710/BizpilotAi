import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import API from '../utils/axios'
import Button from '../components/Button'

export default function BusinessProfile() {
  const { addToast } = useContext(AppContext)

  const [form, setForm] = useState({
    businessName: '',
    description: '',
    services: '',
    products: '',
    location: '',
    workingHours: '',
    tone: 'friendly',
    extraInstructions: '',
  })

  const [loading, setLoading] = useState(false)

  // 🔹 Load business profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get('/api/profile')

        if (res.data) {
          setForm({
            businessName: res.data.businessName || '',
            description: res.data.description || '',
            services: res.data.services?.join(', ') || '',
            products: res.data.products?.join(', ') || '',
            location: res.data.location || '',
            workingHours: res.data.workingHours || '',
            tone: res.data.tone || 'friendly',
            extraInstructions: res.data.extraInstructions || '',
          })
        }
      } catch (err) {
        console.error('Failed to load profile', err)
        addToast({
          type: 'error',
          message: 'Failed to load business profile',
        })
      }
    }

    loadProfile()
  }, [addToast])

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...form,
      services: form.services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      products: form.products
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean),
    }

    try {
      await API.post('/api/profile', payload)

      addToast({
        type: 'success',
        message: 'Business profile updated successfully',
      })
    } catch (err) {
      console.error('Save profile error', err)
      addToast({
        type: 'error',
        message: 'Could not save profile',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">
        Business Profile (Chatbot Settings)
      </h2>

      <form onSubmit={saveProfile} className="space-y-3">
        <input
          name="businessName"
          placeholder="Business Name"
          value={form.businessName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="Business Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="services"
          placeholder="Services (comma separated)"
          value={form.services}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="products"
          placeholder="Products (comma separated)"
          value={form.products}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          name="workingHours"
          placeholder="Working Hours"
          value={form.workingHours}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <select
          name="tone"
          value={form.tone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="friendly">Friendly</option>
          <option value="professional">Professional</option>
          <option value="salesy">Sales focused</option>
        </select>

        <textarea
          name="extraInstructions"
          placeholder="Extra chatbot instructions (optional)"
          value={form.extraInstructions}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  )
}
