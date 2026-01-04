import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Leads from './pages/Leads'
import Conversations from './pages/Conversations'
import Invoices from './pages/Invoices'
import Analytics from './pages/Analytics'
import WhatsAppSetup from './pages/WhatsAppSetup'
import BusinessProfile from './pages/BusinessProfile'
import DataScraper from './pages/DataScraper'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ✅ FULL WIDTH TOPBAR */}
      <Topbar />

      {/* ✅ BELOW TOPBAR: SIDEBAR + CONTENT */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/whatsapp" element={<ProtectedRoute><WhatsAppSetup /></ProtectedRoute>} />
            <Route path="/business-profile" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
            <Route path="/data-scraper" element={<ProtectedRoute><DataScraper /></ProtectedRoute>} />
          </Routes>
        </main>

      </div>
    </div>
  )
}
