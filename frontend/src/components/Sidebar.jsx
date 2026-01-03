import React, { useContext } from 'react'
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
  const [open, setOpen] = React.useState(false)

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex p-4 items-start mt-4 border-b bg-white">
        <button onClick={() => setOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-white border-r transform transition-transform
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0 md:block`}
      >
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">AI Smart Sales</h1>
            <p className="text-sm text-gray-500">Sales & Support Agent</p>
          </div>

          <button className="md:hidden" onClick={() => setOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 ${
                  isActive ? 'bg-gray-100 font-medium' : 'text-gray-700'
                }`
              }
            >
              <it.icon className="w-5 h-5" />
              <span>{it.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
