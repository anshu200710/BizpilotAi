import React from 'react'

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
