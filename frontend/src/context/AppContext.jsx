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

  // Fetch initial data when user logs in
  useEffect(() => {
    if (user) {
      fetchLeads()
      fetchInvoices()
      fetchAnalytics()
    } else {
      // reset state on logout
      setLeads([])
      setInvoices([])
      setConversations({})
      setAnalytics({})
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
      
      setConversations((p) => ({ ...p, [leadId]: res.data }))
      return { ok: true, data: res.data }
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || err.message }
    }
  }

  const postAiReply = async (leadId, message) => {
    try {
      const res = await API.post('/api/ai/reply', { leadId, message })
      // append AI message
      setConversations((p) => ({ ...p, [leadId]: [...(p[leadId] || []), res.data] }))
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

  return (
    <AppContext.Provider
      value={{
        leads,
        invoices,
        conversations,
        analytics,
        loading,
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

AppProvider.propTypes = { children: PropTypes.node }
