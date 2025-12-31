import React, { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import API from '../utils/axios'

export const AuthContext = createContext()

function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (e) {
    return null
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auto-auth on app load
    const stored = localStorage.getItem('token')
    if (stored) {
      const payload = decodeToken(stored)
      if (payload && payload.exp * 1000 > Date.now()) {
        setToken(stored)
        setUser({ ...payload })
      } else {
        // token expired
        logout()
      }
    }
    setLoading(false)

    // Listen for global logout events (from axios interceptor)
    const onLogout = () => logout()
    window.addEventListener('app:logout', onLogout)
    return () => window.removeEventListener('app:logout', onLogout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email, password) => {
    try {
      const res = await API.post('/api/auth/login', { email, password })
      const receivedToken = res.data.token
      localStorage.setItem('token', receivedToken)
      setToken(receivedToken)
      const payload = decodeToken(receivedToken)
      setUser({ ...payload })
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      const res = await API.post('/api/auth/register', { name, email, password })
      const receivedToken = res.data.token
      localStorage.setItem('token', receivedToken)
      setToken(receivedToken)
      const payload = decodeToken(receivedToken)
      setUser({ ...payload })
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = { children: PropTypes.node }
