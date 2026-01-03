import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Badge from '../components/Badge'
import InvoiceForm from '../components/InvoiceForm'

export default function Invoices() {
  const { invoices, createInvoice, updateInvoice, deleteInvoice } =
    useContext(AppContext)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const save = async (data) => {
    if (editing?._id) {
      await updateInvoice(editing._id, data)
    } else {
      await createInvoice(data)
    }
    setOpen(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete invoice?')) return
    await deleteInvoice(id)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <Button onClick={() => { setEditing(null); setOpen(true) }}>
          + New Invoice
        </Button>
      </div>

      <div className="bg-white border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Invoice</th>
              <th className="p-3">Client</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-t">
                <td className="p-3">{inv.invoiceNumber}</td>
                <td className="p-3">{inv.clientName}</td>
                <td className="p-3">₹{inv.total}</td>
                <td className="p-3">
                  <select
                    value={inv.status}
                    onChange={(e) =>
                      updateInvoice(inv._id, { status: e.target.value })
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option>Unpaid</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => { setEditing(inv); setOpen(true) }} className="text-blue-600">Edit</button>
                  <button onClick={() => remove(inv._id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No invoices
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Edit Invoice' : 'Create Invoice'} onClose={() => setOpen(false)} size="lg">
          <InvoiceForm invoice={editing} onSave={save} />
        </Modal>
      )}
    </div>
  )
}
