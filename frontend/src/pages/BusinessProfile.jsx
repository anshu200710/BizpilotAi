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


  // ai generate text for business data
  const generateWithAI = async () => {
    setLoading(true)

    try {
      const res = await API.post('/api/ai/generate-business-profile', {
        businessName: form.businessName,
        businessType: aiInput.businessType,
        location: form.location,
        services: form.services,
      })

      setForm((prev) => ({
        ...prev,
        description: res.data.description || '',
        services: res.data.services?.join(', ') || '',
        products: res.data.products?.join(', ') || '',
        workingHours: res.data.workingHours || '',
        tone: res.data.tone || 'friendly',
        extraInstructions: res.data.extraInstructions || '',
      }))

      addToast({
        type: 'success',
        message: 'AI generated business profile 🎉',
      })
    } catch (err) {
      addToast({
        type: 'error',
        message: 'AI generation failed',
      })
    } finally {
      setLoading(false)
    }
  }


  // for delete profile
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

    addToast({
      type: 'success',
      message: 'Business profile deleted',
    })
  } catch {
    addToast({
      type: 'error',
      message: 'Failed to delete profile',
    })
  }
}



  return (
  <div className="p-6 space-y-6">

    {/* 🔹 AI GENERATION SECTION */}
    <div className="bg-white border rounded-lg p-5">
      <h2 className="text-lg font-semibold mb-3">
        🤖 AI Business Setup
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          name="businessName"
          placeholder="Business Name"
          value={form.businessName}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          placeholder="Business Type (Salon, Clinic, Restaurant...)"
          value={aiInput.businessType}
          onChange={(e) =>
            setAiInput((p) => ({ ...p, businessType: e.target.value }))
          }
          className="p-2 border rounded"
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="p-2 border rounded"
        />

        <input
          name="services"
          placeholder="Services (comma separated)"
          value={form.services}
          onChange={handleChange}
          className="p-2 border rounded"
        />
      </div>

      <div className="mt-4">
        <Button
          type="button"
          onClick={generateWithAI}
          disabled={loading}
        >
          {loading ? 'Generating...' : '✨ Generate with AI'}
        </Button>
      </div>
    </div>

    {/* 🔹 MAIN CONTENT */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* LEFT: FORM */}
      <div className="bg-white border rounded-lg p-5">
        <h3 className="text-lg font-semibold mb-4">
          ✏️ Edit Business Profile
        </h3>

        <form onSubmit={saveProfile} className="space-y-3">
          <textarea
            name="description"
            placeholder="Business Description"
            value={form.description}
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
            placeholder="Extra chatbot instructions"
            value={form.extraInstructions}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : '💾 Save Profile'}
          </Button>
        </form>
      </div>

      {/* RIGHT: PREVIEW */}
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