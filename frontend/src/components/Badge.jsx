import React from 'react'

const colorMap = {
  New: 'bg-blue-100 text-blue-800',
  Contacted: 'bg-yellow-100 text-yellow-800',
  Converted: 'bg-green-100 text-green-800',
  Lost: 'bg-red-100 text-red-800',
  Paid: 'bg-green-100 text-green-800',
  Unpaid: 'bg-red-100 text-red-800',
}

export default function Badge({ children }) {
  const cls = colorMap[children] || 'bg-gray-100 text-gray-800'
  return <span className={`px-2 py-1 rounded text-xs font-medium ${cls}`}>{children}</span>
}
