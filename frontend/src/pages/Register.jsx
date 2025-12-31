import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Button from '../components/Button'

export default function Register() {
  const { register } = useContext(AuthContext)
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await register(name, email, password)
    setLoading(false)
    if (res.ok) {
      navigate('/')
    } else {
      setError(res.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-semibold mb-4">Create an account</h2>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="text-sm">Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>
          <div>
            <label className="text-sm">Email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 p-2 border rounded" />
          </div>
          <Button type="submit" className="w-full">{loading ? 'Creating...' : 'Create account'}</Button>
          <div className="text-sm text-gray-600">Already have an account? <Link to="/login" className="text-blue-600">Sign in</Link></div>
        </form>
      </div>
    </div>
  )
}
