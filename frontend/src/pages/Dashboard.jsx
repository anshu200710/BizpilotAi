import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import Badge from '../components/Badge'

export default function Dashboard() {
  const { leads, invoices, analytics, whatsappAccounts } = useContext(AppContext)

  const totalLeads = leads.length
  const activeLeads = leads.filter(l => l.status !== 'closed').length
  const totalRevenue = invoices.reduce((s, i) => s + (i.total || 0), 0)
  const pending = invoices.filter(i => i.status !== 'Paid').length

  const leadsOverTime = analytics.leadsOverTime || []
  const revenueOverTime = analytics.revenueOverTime || []

  const paidInvoices = invoices.filter(i => i.status === 'Paid').length
  const paymentRate = invoices.length
    ? Math.round((paidInvoices / invoices.length) * 100)
    : 0

  const donutData = [
    { name: 'Paid', value: paymentRate },
    { name: 'Pending', value: 100 - paymentRate }
  ]

  return (
    <div className="space-y-6">

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={totalLeads} color="blue" />
        <StatCard title="Active Leads" value={activeLeads} color="green" />
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} color="purple" />
        <StatCard title="Pending Payments" value={pending} color="orange" />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* LINE CHART */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-4">Traffic / Leads Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsOverTime}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
          <h3 className="font-semibold mb-2">Income</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#e5e7eb" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold">{paymentRate}%</div>
            <div className="text-sm text-gray-500">Payment Success</div>
          </div>
        </div>
      </div>

      {/* TARGET / STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ProgressCard label="Lead Conversion" value={64} />
        <ProgressCard label="Expense Control" value={32} color="orange" />
        <ProgressCard label="Revenue Target" value={89} color="green" />
      </div>

      {/* LISTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ACTIVITY */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Recent Activity</h3>
          <ul className="space-y-3">
            {leads.slice(0, 5).map(l => (
              <li key={l._id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-gray-500">{l.customerNumber}</div>
                </div>
                <Badge>{l.status}</Badge>
              </li>
            ))}
            {leads.length === 0 && (
              <div className="text-sm text-gray-500">No recent activity</div>
            )}
          </ul>
        </div>

        {/* INVOICES */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">Invoices</h3>
          <ul className="space-y-3">
            {invoices.slice(0, 5).map(inv => (
              <li key={inv._id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">#{inv._id.slice(-6)}</div>
                  <div className="text-sm text-gray-500">{inv.clientName}</div>
                </div>
                <Badge>{inv.status}</Badge>
              </li>
            ))}
            {invoices.length === 0 && (
              <div className="text-sm text-gray-500">No invoices yet</div>
            )}
          </ul>
        </div>
      </div>

      {/* WHATSAPP */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-2">Connected WhatsApp</h3>
        {whatsappAccounts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No WhatsApp connected. Go to setup.
          </p>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">
                {whatsappAccounts[0].displayPhoneNumber}
              </div>
              <div className="text-sm text-gray-500">
                verify token: {whatsappAccounts[0].verifyToken}
              </div>
            </div>
            <a href="/whatsapp" className="text-blue-600 text-sm">
              Manage
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------ SMALL COMPONENTS ------------------ */

function StatCard({ title, value, color }) {
  const colors = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    purple: 'border-purple-500 text-purple-600',
    orange: 'border-orange-500 text-orange-600'
  }

  return (
    <div className={`bg-white rounded-xl p-4 border-l-4 shadow-sm ${colors[color]}`}>
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}

function ProgressCard({ label, value, color = 'blue' }) {
  const bar = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-400'
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between text-sm mb-2">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${bar[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
