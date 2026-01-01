import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Badge from '../components/Badge'

export default function Dashboard() {
  const { leads, invoices, analytics, whatsappAccounts } = useContext(AppContext)

  const totalLeads = leads.length
  const activeLeads = leads.filter((l) => l.status !== 'Converted' && l.status !== 'Lost').length
  const totalRevenue = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const pending = invoices.filter((i) => i.status !== 'Paid').length

  const leadsOverTime = analytics.leadsOverTime || []
  const revenueOverTime = analytics.revenueOverTime || []

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500">Total Leads</div>
          <div className="text-2xl font-semibold">{totalLeads}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Active Leads</div>
          <div className="text-2xl font-semibold">{activeLeads}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Pending Payments</div>
          <div className="text-2xl font-semibold">{pending}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold mb-3">Leads over time</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsOverTime}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Revenue</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverTime}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fill="#d1fae5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <ul className="space-y-2">
            {leads.slice(0, 6).map((l) => (
              <li key={l._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-gray-500">{l.email}</div>
                </div>
                <Badge>{l.status}</Badge>
              </li>
            ))}
            {leads.length === 0 && <li className="text-sm text-gray-500">No recent activity</li>}
          </ul>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Invoices</h3>
          <ul className="space-y-2">
            {invoices.slice(0, 6).map((inv) => (
              <li key={inv._id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">#{inv._id}</div>
                  <div className="text-sm text-gray-500">{inv.clientName}</div>
                </div>
                <Badge>{inv.status}</Badge>
              </li>
            ))}
            {invoices.length === 0 && <li className="text-sm text-gray-500">No invoices yet</li>}
          </ul>
        </div>
      </div>

      <div className="mt-6 card">
        <h3 className="font-semibold mb-3">Connected WhatsApp Number</h3>
        {whatsappAccounts.length === 0 ? (
          <div className="text-sm text-gray-500">No WhatsApp account connected. Go to WhatsApp setup to add one.</div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{whatsappAccounts[0].displayPhoneNumber || whatsappAccounts[0].phoneNumberId}</div>
              <div className="text-sm text-gray-500">verify token: <code className="bg-gray-100 px-1 rounded">{whatsappAccounts[0].verifyToken}</code></div>
            </div>
            <a href="/whatsapp" className="text-blue-600">Manage</a>
          </div>
        )}
      </div>
    </div>
  )
}
