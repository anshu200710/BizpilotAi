import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function Analytics() {
  const { analytics } = useContext(AppContext)

  const leadsSeries = analytics.leadsOverTime || []
  const revenueSeries = analytics.revenueOverTime || []
  const funnel =
    analytics.funnel || [
      { name: 'New', value: 60 },
      { name: 'Contacted', value: 30 },
      { name: 'Converted', value: 10 },
    ]

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981']

  const totalLeads = leadsSeries.reduce((a, b) => a + (b.count || 0), 0)
  const totalRevenue = revenueSeries.reduce((a, b) => a + (b.amount || 0), 0)

  return (
    <div className="p-6 space-y-6 bg-gray-50">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          Analytics
        </h2>
        <p className="text-sm text-gray-500">
          Performance overview and insights
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-semibold text-gray-800">
            {totalLeads}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-semibold text-gray-800">
            ₹{totalRevenue}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Conversion Rate</p>
          <p className="text-2xl font-semibold text-gray-800">
            {funnel.length
              ? Math.round(
                  (funnel[funnel.length - 1].value /
                    funnel.reduce((a, b) => a + b.value, 0)) *
                    100
                )
              : 0}
            %
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Avg. Revenue / Lead</p>
          <p className="text-2xl font-semibold text-gray-800">
            ₹{totalLeads ? Math.round(totalRevenue / totalLeads) : 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Leads Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Leads (Last 30 Days)
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsSeries}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Conversion Funnel
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={funnel}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {funnel.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          Revenue (Monthly)
        </h3>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueSeries}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
