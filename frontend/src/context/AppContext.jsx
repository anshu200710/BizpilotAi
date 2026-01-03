import React, { createContext, useContext, useEffect, useState } from 'react'
import API from '../utils/axios'
import { AuthContext } from './AuthContext'
import PropTypes from 'prop-types'

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [leads, setLeads] = useState([])
  const [invoices, setInvoices] = useState([])
  const [conversations, setConversations] = useState({}) // { leadId: [messages] }
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(false)
  const [whatsappAccounts, setWhatsappAccounts] = useState([])
  const [toasts, setToasts] = useState([])

  // Fetch initial data when user logs in
  useEffect(() => {
    if (user) {
      fetchLeads()
      fetchInvoices()
      fetchAnalytics()
      fetchWhatsappAccounts()
    } else {
      // reset state on logout
      setLeads([])
      setInvoices([])
      setConversations({})
      setAnalytics({})
      setWhatsappAccounts([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  /* Leads API */
  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await API.get('/api/leads')
      console.log(res);

      setLeads(res.data)
    } catch (err) {
      console.error('Failed to fetch leads', err)
    } finally {
      setLoading(false)
    }
  }

  const createLead = async (payload) => {
    try {
      const res = await API.post('/api/leads', payload)
      setLeads((p) => [res.data, ...p])
      return { ok: true, data: res.data }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const updateLead = async (id, payload) => {
    try {
      const res = await API.put(`/api/leads/${id}`, payload)
      setLeads((p) => p.map((l) => (l._id === id ? res.data : l)))
      return { ok: true, data: res.data }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const deleteLead = async (id) => {
    try {
      await API.delete(`/api/leads/${id}`)
      setLeads((p) => p.filter((l) => l._id !== id))
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  /* Conversations */
  const fetchConversations = async (leadId) => {
    try {
      const res = await API.get(`/api/conversations/${leadId}`)

      // setConversations((p) => ({ ...p, [leadId]: res.data }))
      setConversations((p) => ({
        ...p,
        [leadId]: res.data?.messages || []
      }))

      return { ok: true, data: res.data }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const postAiReply = async (leadId, message) => {
    try {
      const res = await API.post('/api/ai/reply', { leadId, message })
      // append AI message
      // setConversations((p) => ({ ...p, [leadId]: [...(p[leadId] || []), res.data] }))
      setConversations((p) => ({
        ...p,
        [leadId]: [
          ...(p[leadId] || []),
          {
            role: "assistant",
            text: res.data.text,
            createdAt: new Date().toISOString()
          }
        ]
      }))

      return { ok: true, data: res.data }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  /* Invoices */
  const fetchInvoices = async () => {
    try {
      const res = await API.get('/api/invoices')
      console.log(res);

      setInvoices(res.data)
    } catch (err) {
      console.error('failed to fetch invoices', err)
    }
  }

  const createInvoice = async (payload) => {
    try {
      const res = await API.post('/api/invoices', payload)
      setInvoices((p) => [res.data, ...p])
      return { ok: true, data: res.data }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const updateInvoice = async (id, payload) => {
    try {
      const res = await API.put(`/api/invoices/${id}`, payload)
      setInvoices((p) => p.map((inv) => (inv._id === id ? res.data : inv)))
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const deleteInvoice = async (id) => {
    try {
      await API.delete(`/api/invoices/${id}`)
      setInvoices((p) => p.filter((inv) => inv._id !== id))
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  /* Analytics */
  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/api/analytics')
      setAnalytics(res.data)
    } catch (err) {
      // Not essential; backend may provide custom analytics
      console.warn('analytics not available', err.message)
    }
  }

  /* WhatsApp Accounts */
  const fetchWhatsappAccounts = async () => {
    try {
      const res = await API.get('/api/whatsapp/accounts')
      setWhatsappAccounts(res.data)
    } catch (err) {
      console.warn('Could not fetch whatsapp accounts', err.message)
    }
  }

  const createWhatsappAccount = async (payload) => {
    try {
      const data = { ...payload }
      let url = '/api/whatsapp/accounts'
      if (data._skipVerify) {
        url += '?skipVerify=true'
        delete data._skipVerify
      }
      const res = await API.post(url, data)
      setWhatsappAccounts((p) => [res.data, ...p])
      return { ok: true, data: res.data }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const deleteWhatsappAccount = async (id) => {
    try {
      await API.delete(`/api/whatsapp/accounts/${id}`)
      setWhatsappAccounts((p) => p.filter((a) => a._id !== id && a.id !== id))
      return { ok: true }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  // const updateWhatsappToken = async (id, accessToken, skipVerify = false) => {
  //   try {
  //     const res = await fetch(`/api/whatsapp/accounts/${id}/token`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ accessToken, skipVerify }),
  //     })

  //     const data = await res.json()
  //     return { ok: res.ok, ...data }
  //   } catch (err) {
  //     return { ok: false, message: 'Network error' }
  //   }
  // }

  const updateWhatsappToken = async (id, accessToken, skipVerify = false) => {
  try {
    const token = localStorage.getItem('token')

    const res = await fetch(`/api/whatsapp/accounts/${id}/token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ accessToken, skipVerify }),
    })

    const data = await res.json()
    return { ok: res.ok, ...data }
  } catch (err) {
    return { ok: false, message: 'Network error' }
  }
}



  /* Toasts */
  const addToast = ({ type = 'info', message, duration = 3000 }) => {
    const id = Date.now()

    setToasts((prev) => [...prev, { id, type, message }])

    // auto remove
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <AppContext.Provider
      value={{
        leads,
        invoices,
        conversations,
        analytics,
        loading,
        whatsappAccounts,
        fetchLeads,
        createLead,
        updateLead,
        deleteLead,
        fetchConversations,
        postAiReply,
        fetchInvoices,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        fetchAnalytics,
        fetchWhatsappAccounts,
        createWhatsappAccount,
        deleteWhatsappAccount,
        updateWhatsappToken,
        setConversations,
        addToast,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

AppProvider.propTypes = { children: PropTypes.node }
