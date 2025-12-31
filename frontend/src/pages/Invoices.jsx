import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Badge from '../components/Badge'

export default function Invoices() {
  const { invoices, createInvoice, updateInvoice, deleteInvoice } = useContext(AppContext)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showDelete, setShowDelete] = useState(null)

  const openNew = () => {
    setEditing({ clientName: '', items: [], total: 0, status: 'Unpaid' })
    setShowModal(true)
  }

  const save = async (payload) => {
    if (editing._id) {
      await updateInvoice(editing._id, payload)
    } else {
      await createInvoice(payload)
    }
    setShowModal(false)
  }

  const confirmDelete = async (id) => {
    await deleteInvoice(id)
    setShowDelete(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <Button onClick={openNew}>Create Invoice</Button>
      </div>

      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2">Invoice</th>
              <th className="p-2">Client</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-t">
                <td className="p-2">#{inv._id}</td>
                <td className="p-2">{inv.clientName}</td>
                <td className="p-2">${(inv.total || 0).toFixed(2)}</td>
                <td className="p-2"><Badge>{inv.status}</Badge></td>
                <td className="p-2 flex gap-2">
                  <button className="text-blue-600" onClick={() => { setEditing(inv); setShowModal(true) }}>Edit</button>
                  <button className="text-red-600" onClick={() => setShowDelete(inv._id)}>Delete</button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && <tr><td colSpan={5} className="p-4 text-sm text-gray-500">No invoices</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title={editing._id ? 'Edit Invoice' : 'Create Invoice'} onClose={() => setShowModal(false)}>
          <InvoiceForm invoice={editing} onSave={save} onCancel={() => setShowModal(false)} />
        </Modal>
      )}

      {showDelete && (
        <Modal title="Confirm Delete" onClose={() => setShowDelete(null)}>
          <p>Delete invoice?</p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => confirmDelete(showDelete)}>Delete</Button>
            <button className="px-4 py-2" onClick={() => setShowDelete(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function InvoiceForm({ invoice, onSave }) {
  const [form, setForm] = useState({ ...invoice })
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
        <label className="text-sm">Client</label>
        <input required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} className="w-full mt-1 p-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Total</label>
        <input required type="number" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} className="w-full mt-1 p-2 border rounded" />
      </div>
      <div>
        <label className="text-sm">Status</label>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full mt-1 p-2 border rounded">
          <option>Unpaid</option>
          <option>Paid</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  )
}
