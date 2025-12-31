import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

export default function Analytics() {
  const { analytics } = useContext(AppContext)
  const leadsSeries = analytics.leadsOverTime || []
  const revenueSeries = analytics.revenueOverTime || []
  const funnel = analytics.funnel || [ { name: 'New', value: 60 }, { name: 'Contacted', value: 30 }, { name: 'Converted', value: 10 } ]
  const COLORS = ['#60a5fa', '#fbbf24', '#10b981']

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold mb-3">Leads (last 30 days)</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsSeries}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Conversion funnel</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={funnel} dataKey="value" nameKey="name" outerRadius={80} label>
                  {funnel.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 card">
        <h3 className="font-semibold mb-3">Revenue (monthly)</h3>
        <div style={{ height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={revenueSeries}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
