import React, { createContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import API from '../utils/axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // Load user on app start or token change
  useEffect(() => {
    const initAuth = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await API.get('/api/auth/me')
        setUser(res.data) // { name, email }
      } catch (err) {
        logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const login = async (email, password) => {
    try {
      const res = await API.post('/api/auth/login', { email, password })
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      setUser(res.data.user) // DIRECT USER OBJECT
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      const res = await API.post('/api/auth/register', {
        name,
        email,
        password,
      })
      localStorage.setItem('token', res.data.token)
      setToken(res.data.token)
      setUser(res.data.user)
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}
