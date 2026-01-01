import React, { createContext, useCallback, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

export const ToastContext = createContext()

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(16).slice(2)
    const t = { id, duration: 4000, ...toast }
    setToasts((p) => [t, ...p])
    return id
  }, [])

  const removeToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), [])

  useEffect(() => {
    const timers = toasts.map((t) => {
      const timer = setTimeout(() => removeToast(t.id), t.duration || 4000)
      return () => clearTimeout(timer)
    })
    return () => timers.forEach((c) => c && c())
  }, [toasts, removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-xs w-full p-3 rounded shadow ${t.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-white border'} `}>
            <div className="flex items-start gap-2">
              <div className="flex-1 text-sm">{t.message}</div>
              <button className="text-xs text-gray-400" onClick={() => removeToast(t.id)}>Dismiss</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

ToastProvider.propTypes = { children: PropTypes.node }
