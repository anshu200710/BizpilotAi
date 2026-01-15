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
    if (!confirm('Delete this invoice?')) return
    await deleteInvoice(id)
  }

  const statusColor = (status) => {
    if (status === 'Paid') return 'success'
    if (status === 'Overdue') return 'danger'
    return 'warning'
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Invoices
          </h2>
          <p className="text-sm text-gray-500">
            Manage billing and payments
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
        >
          + New Invoice
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left">Invoice</th>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {invoices.map((inv) => (
              <tr key={inv._id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium">
                  {inv.invoiceNumber}
                </td>
                <td className="p-4">{inv.clientName}</td>
                <td className="p-4 font-semibold">
                  ₹{inv.total}
                </td>
                <td className="p-4">
                  <Badge variant={statusColor(inv.status)}>
                    {inv.status}
                  </Badge>
                </td>
                <td className="p-4 text-right space-x-3">
                  <button
                    onClick={() => {
                      setEditing(inv)
                      setOpen(true)
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(inv._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-10 text-center text-gray-400"
                >
                  No invoices created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && (
        <Modal
          title={editing ? 'Edit Invoice' : 'Create Invoice'}
          onClose={() => setOpen(false)}
          size="lg"
        >
          <InvoiceForm invoice={editing} onSave={save} />
        </Modal>
      )}
    </div>
  )
}
