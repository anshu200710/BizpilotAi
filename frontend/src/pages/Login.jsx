import React, { useContext, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Button from '../components/Button'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) {
      navigate('/')
    } else {
      setError(res.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-semibold mb-4">Sign in to your account</h2>
        <form onSubmit={submit} className="space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="text-sm">Email</label>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              type="email"
            />
          </div>
          <div>
            <label className="text-sm">Password</label>
            <input
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border rounded"
              type="password"
            />
          </div>
          <Button type="submit" className="w-full">{loading ? 'Signing in...' : 'Sign in'}</Button>
          <div className="text-sm text-gray-600">Don't have an account? <Link to="/register" className="text-blue-600">Register</Link></div>
        </form>
      </div>
    </div>
  )
}
