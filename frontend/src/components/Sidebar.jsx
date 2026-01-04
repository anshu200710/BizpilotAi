import React, { useContext, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Home,
  Users,
  MessageCircle,
  MessageSquare,
  FileText,
  BarChart2,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

const items = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/conversations', label: 'Conversations', icon: MessageCircle },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { to: '/business-profile', label: 'Business Profile', icon: FileText },
  { to: '/data-scraper', label: 'Data Scraper', icon: BarChart2 },
]

export default function Sidebar() {
  const { logout } = useContext(AuthContext)
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* MOBILE MENU BUTTON (under awning) */}
      {/* MOBILE COUNTER MENU */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setOpen(true)}
          className="bg-red-600 text-white px-4 py-3 rounded-full shadow-lg"
        >
          Open Menu
        </button>
      </div>



      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static z-50 inset-y-0 left-0 w-64 bg-white border-r
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0`}
      >
        {/* HEADER */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">AI Smart Sales</h1>
            <p className="text-sm text-gray-500">Sales & Support Agent</p>
          </div>

          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MENU */}
        <nav className="p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `
                group flex items-center gap-3 px-3 py-2 rounded-lg
                transition-all duration-200
                ${isActive
                  ? 'bg-red-50 text-red-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                }
                `
              }
            >
              {/* ICON */}
              <div
                className={`
                  p-2 rounded-md transition-colors
                  ${({ isActive }) =>
                    isActive
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }
                `}
              >
                <it.icon className="w-4 h-4" />
              </div>

              {/* LABEL */}
              <span className="text-sm">{it.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT */}
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
            text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
