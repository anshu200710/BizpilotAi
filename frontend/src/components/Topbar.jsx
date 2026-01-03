import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Menu } from 'lucide-react'

export default function Topbar() {
  const { user } = useContext(AuthContext)
  

  return (
    <>
    <header className="w-full flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold">Welcome{user ? `, ${user.name}` : ''}</h2>
          <p className="text-sm text-gray-500">AI assistant for MSMEs</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">{user?.email}</div>
      </div>
    </header>
    </>
  )
}
