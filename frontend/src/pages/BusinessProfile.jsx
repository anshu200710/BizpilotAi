import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import API from '../utils/axios'
import Button from '../components/Button'
import BusinessProfilePreview from '../components/BusinessProfilePreview'

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
  const [aiInput, setAiInput] = useState({
    businessType: '',
  })

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
      } catch {
        addToast({ type: 'error', message: 'Failed to load business profile' })
      }
    }
    loadProfile()
  }, [addToast])

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...form,
      services: form.services.split(',').map(s => s.trim()).filter(Boolean),
      products: form.products.split(',').map(p => p.trim()).filter(Boolean),
    }

    try {
      await API.post('/api/profile', payload)
      addToast({ type: 'success', message: 'Business profile updated successfully' })
    } catch {
      addToast({ type: 'error', message: 'Could not save profile' })
    } finally {
      setLoading(false)
    }
  }

  const generateWithAI = async () => {
    setLoading(true)
    try {
      const res = await API.post('/api/ai/generate-business-profile', {
        businessName: form.businessName,
        businessType: aiInput.businessType,
        location: form.location,
        services: form.services,
      })

      setForm((p) => ({
        ...p,
        description: res.data.description || '',
        services: res.data.services?.join(', ') || '',
        products: res.data.products?.join(', ') || '',
        workingHours: res.data.workingHours || '',
        tone: res.data.tone || 'friendly',
        extraInstructions: res.data.extraInstructions || '',
      }))

      addToast({ type: 'success', message: 'AI generated business profile 🎉' })
    } catch {
      addToast({ type: 'error', message: 'AI generation failed' })
    } finally {
      setLoading(false)
    }
  }

  const deleteProfile = async () => {
    if (!confirm('Delete business profile?')) return
    try {
      await API.delete('/api/whatsapp/profile')
      setForm({
        businessName: '',
        description: '',
        services: '',
        products: '',
        location: '',
        workingHours: '',
        tone: 'friendly',
        extraInstructions: '',
      })
      addToast({ type: 'success', message: 'Business profile deleted' })
    } catch {
      addToast({ type: 'error', message: 'Failed to delete profile' })
    }
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Business Profile
        </h2>
        <p className="text-sm text-gray-500">
          Configure how your AI represents your business
        </p>
      </div>

      {/* AI SETUP */}
      <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
        <h3 className="font-semibold text-gray-800 mb-1">
          🤖 AI Quick Setup
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Let AI generate your business profile automatically
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="businessName"
            placeholder="Business Name"
            value={form.businessName}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400"
          />

          <input
            placeholder="Business Type (Salon, Clinic, Restaurant)"
            value={aiInput.businessType}
            onChange={(e) =>
              setAiInput((p) => ({ ...p, businessType: e.target.value }))
            }
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400"
          />

          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400"
          />

          <input
            name="services"
            placeholder="Services (comma separated)"
            value={form.services}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="mt-5">
          <Button type="button" onClick={generateWithAI} disabled={loading}>
            {loading ? 'Generating…' : '✨ Generate with AI'}
          </Button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* FORM */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            ✏️ Edit Business Details
          </h3>

          <form onSubmit={saveProfile} className="space-y-4">
            <textarea
              name="description"
              placeholder="Business description"
              value={form.description}
              onChange={handleChange}
              className="w-full min-h-[90px] px-3 py-2 border rounded-md"
            />

            <input
              name="products"
              placeholder="Products (comma separated)"
              value={form.products}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              name="workingHours"
              placeholder="Working hours"
              value={form.workingHours}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />

            <select
              name="tone"
              value={form.tone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="salesy">Sales focused</option>
            </select>

            <textarea
              name="extraInstructions"
              placeholder="Extra AI instructions (optional)"
              value={form.extraInstructions}
              onChange={handleChange}
              className="w-full min-h-[80px] px-3 py-2 border rounded-md"
            />

            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : '💾 Save Profile'}
            </Button>
          </form>
        </div>

        {/* PREVIEW */}
        <div className="lg:sticky lg:top-6 h-fit">
          <BusinessProfilePreview
            profile={form}
            onDelete={deleteProfile}
          />
        </div>
      </div>
    </div>
  )
}
