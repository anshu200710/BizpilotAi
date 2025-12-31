import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Users, MessageCircle, FileText, BarChart2, LogOut } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

const items = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/leads', label: 'Leads', icon: Users },
  { to: '/conversations', label: 'Conversations', icon: MessageCircle },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function Sidebar() {
  const { logout } = useContext(AuthContext)
  return (
    <aside className="w-64 h-screen bg-white border-r hidden md:block">
      <div className="p-6">
        <h1 className="text-xl font-semibold">AI Smart Sales</h1>
        <p className="text-sm text-gray-500">Sales & Support Agent</p>
      </div>
      <nav className="p-4">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end
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
      <div className="mt-auto p-4">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
