import React, { useContext, useMemo, useState } from 'react'
import { AppContext } from '../context/AppContext'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import Button from '../components/Button'

export default function Leads() {
  const { leads, createLead, updateLead, deleteLead, fetchLeads } = useContext(AppContext)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [editing, setEditing] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(null)

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (status && l.status !== status) return false
      if (query && !`${l.name} ${l.email}`.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [leads, query, status])

  const openEdit = (lead) => {
    setEditing(lead)
    setShowModal(true)
  }

  const openNew = () => {
    setEditing({ name: '', email: '', phone: '', status: 'New' })
    setShowModal(true)
  }

  const save = async (payload) => {
    if (editing._id) {
      const res = await updateLead(editing._id, payload)
      if (res.ok) setShowModal(false)
    } else {
      const res = await createLead(payload)
      if (res.ok) setShowModal(false)
    }
  }

  const confirmDelete = async (id) => {
    const res = await deleteLead(id)
    if (res.ok) setShowDelete(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Leads</h2>
        <div className="flex items-center gap-2">
          <input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="p-2 border rounded" />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border rounded">
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
          <Button onClick={openNew}>New Lead</Button>
        </div>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2">Name</th>
              <th className="p-2">Contact</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-2">{l.name}</td>
                <td className="p-2">{l.email} <div className="text-xs text-gray-500">{l.phone}</div></td>
                <td className="p-2"><Badge>{l.status}</Badge></td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="text-sm text-blue-600" onClick={() => openEdit(l)}>Edit</button>
                    <button className="text-sm text-red-600" onClick={() => setShowDelete(l._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="p-4 text-sm text-gray-500">No leads found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing._id ? 'Edit Lead' : 'New Lead'} onClose={() => setShowModal(false)}>
          <LeadForm lead={editing} onSave={save} onCancel={() => setShowModal(false)} />
        </Modal>
      )}

      {showDelete && (
        <Modal title="Confirm Delete" onClose={() => setShowDelete(null)}>
          <p>Are you sure you want to delete this lead?</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => confirmDelete(showDelete)}>Delete</Button>
            <button className="px-4 py-2" onClick={() => setShowDelete(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function LeadForm({ lead, onSave, onCancel }) {
  const [form, setForm] = useState({ ...lead })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="text-sm">Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 p-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Email</label>
        <input required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 p-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full mt-1 p-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 p-2 border rounded">
          <option>New</option>
          <option>Contacted</option>
          <option>Converted</option>
          <option>Lost</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">{saving ? 'Saving...' : 'Save'}</Button>
        <button type="button" className="px-4 py-2" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
