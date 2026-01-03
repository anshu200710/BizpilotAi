import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import API from '../utils/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function InvoiceForm({ invoice, onSave }) {
  const previewRef = useRef(null)

  const [form, setForm] = useState({
    clientName: '',
    company: { name: '', logo: '' },
    items: [{ name: '', qty: 1, price: 0, total: 0 }],
    gstPercent: 18,
    subtotal: 0,
    gstAmount: 0,
    total: 0,
    footerNote: '',
    status: 'Unpaid',
  })

  /* 🔁 SYNC FORM WHEN EDITING */
  useEffect(() => {
    if (invoice) {
      setForm({
        clientName: invoice.clientName || '',
        company: {
          name: invoice.company?.name || '',
          logo: invoice.company?.logo || '',
        },
        items: invoice.items?.length
          ? invoice.items
          : [{ name: '', qty: 1, price: 0, total: 0 }],
        gstPercent: invoice.gstPercent || 18,
        subtotal: invoice.subtotal || 0,
        gstAmount: invoice.gstAmount || 0,
        total: invoice.total || 0,
        footerNote: invoice.footerNote || '',
        status: invoice.status || 'Unpaid',
      })
    }
  }, [invoice])

  /* 🔢 CALCULATIONS */
  const recalc = (items) => {
    const subtotal = items.reduce((s, i) => s + i.total, 0)
    const gstAmount = (subtotal * form.gstPercent) / 100
    setForm((p) => ({ ...p, items, subtotal, gstAmount, total: subtotal + gstAmount }))
  }

  const updateItem = (i, field, value) => {
    const items = [...form.items]
    items[i][field] = value
    items[i].total = items[i].qty * items[i].price
    recalc(items)
  }

  const addItem = () =>
    recalc([...form.items, { name: '', qty: 1, price: 0, total: 0 }])

  /* ☁️ UPLOAD LOGO */
  const uploadLogo = async (file) => {
    if (!file) return
    const fd = new FormData()
    fd.append('logo', file)

    const res = await API.post('/api/invoices/upload-logo', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    setForm((p) => ({
      ...p,
      company: { ...p.company, logo: res.data.url },
    }))
  }

  /* 🧾 PDF */
  const loadImage = (url) =>
    new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.src = url
    })

  const downloadPDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4')
    let y = 20

    if (form.company.logo) {
      const img = await loadImage(form.company.logo)
      doc.addImage(img, 'PNG', 14, 10, 30, 15)
      y = 30
    }

    doc.setFontSize(16)
    doc.text(form.company.name || 'Invoice', 14, y)

    doc.setFontSize(11)
    doc.text(`Client: ${form.clientName}`, 14, y + 8)

    autoTable(doc, {
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: form.items.map((i) => [
        i.name,
        i.qty,
        `₹${i.price}`,
        `₹${i.total}`,
      ]),
      startY: y + 15,
      styles: { fontSize: 10 },
    })

    const endY = doc.lastAutoTable.finalY + 6
    doc.text(`Subtotal: ₹${form.subtotal}`, 14, endY)
    doc.text(`GST: ₹${form.gstAmount}`, 14, endY + 6)
    doc.text(`Total: ₹${form.total}`, 14, endY + 12)

    if (form.footerNote) {
      doc.setFontSize(10)
      doc.text(form.footerNote, 14, endY + 24)
    }

    doc.save(`invoice-${Date.now()}.pdf`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ================= FORM ================= */}
      <div className="space-y-4">

        <input
          placeholder="Client Name"
          value={form.clientName}
          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <input
          placeholder="Company Name"
          value={form.company.name}
          onChange={(e) =>
            setForm({ ...form, company: { ...form.company, name: e.target.value } })
          }
          className="w-full p-2 border rounded"
        />

        {/* LOGO UPLOAD */}
        <div>
          <label className="text-sm font-medium">Company Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => uploadLogo(e.target.files[0])}
            className="block w-full text-sm mt-1
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:bg-gray-100 file:text-gray-700
              hover:file:bg-gray-200"
          />
          {form.company.logo && (
            <img
              src={form.company.logo}
              className="h-16 mt-2 border rounded bg-white p-1 object-contain"
            />
          )}
        </div>

        {/* ITEMS */}
        {form.items.map((item, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            <input value={item.name} placeholder="Item"
              onChange={(e) => updateItem(i, 'name', e.target.value)}
              className="p-2 border rounded" />
            <input type="number" value={item.qty}
              onChange={(e) => updateItem(i, 'qty', +e.target.value)}
              className="p-2 border rounded" />
            <input type="number" value={item.price}
              onChange={(e) => updateItem(i, 'price', +e.target.value)}
              className="p-2 border rounded" />
            <input disabled value={item.total}
              className="p-2 border bg-gray-50 rounded" />
          </div>
        ))}

        <Button type="button" onClick={addItem}>+ Add Item</Button>

        <textarea
          placeholder="Footer note"
          value={form.footerNote}
          onChange={(e) => setForm({ ...form, footerNote: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <div className="flex gap-2">
          <Button onClick={() => onSave(form)}>Save</Button>
          <Button variant="secondary" onClick={downloadPDF}>Download PDF</Button>
        </div>
      </div>

      {/* ================= PREVIEW ================= */}
      {/* ================= PREVIEW ================= */}
<div
  ref={previewRef}
  className="bg-white border rounded-lg shadow-sm p-6 w-full max-w-[800px]"
>
  {/* HEADER */}
  <div className="flex justify-between items-start mb-6">
    <div>
      <h2 className="text-xl font-semibold">
        {form.company.name || 'Company Name'}
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Invoice for <strong>{form.clientName || 'Client Name'}</strong>
      </p>
    </div>

    {form.company.logo && (
      <img
        src={form.company.logo}
        className="h-16 object-contain border rounded p-1"
        alt="Company Logo"
      />
    )}
  </div>

  {/* ITEMS TABLE */}
  <table className="w-full text-sm border border-gray-300 mb-4">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-2 border">Item</th>
        <th className="p-2 border text-center">Qty</th>
        <th className="p-2 border text-right">Price</th>
        <th className="p-2 border text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      {form.items.map((item, i) => (
        <tr key={i}>
          <td className="p-2 border">{item.name || '-'}</td>
          <td className="p-2 border text-center">{item.qty}</td>
          <td className="p-2 border text-right">₹{item.price}</td>
          <td className="p-2 border text-right">₹{item.total}</td>
        </tr>
      ))}
    </tbody>
  </table>

  {/* TOTALS */}
  <div className="flex justify-end">
    <div className="w-64 text-sm space-y-1">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₹{form.subtotal}</span>
      </div>
      <div className="flex justify-between">
        <span>GST</span>
        <span>₹{form.gstAmount}</span>
      </div>
      <div className="flex justify-between font-semibold border-t pt-1">
        <span>Total</span>
        <span>₹{form.total}</span>
      </div>
    </div>
  </div>

  {/* FOOTER */}
  {form.footerNote && (
    <div className="mt-6 text-xs text-gray-600 border-t pt-3">
      {form.footerNote}
    </div>
  )}
</div>

    </div>
  )
}
