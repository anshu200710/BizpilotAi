import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'

export default function Conversations() {
  const {
    leads,
    fetchConversations,
    conversations,
    setConversations,
    postAiReply,
  } = useContext(AppContext)

  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (leads.length && !selected) setSelected(leads[0])
    // eslint-disable-next-line
  }, [leads])

  const loadConversation = async (lead) => {
    setSelected(lead)
    setLoading(true)
    await fetchConversations(lead._id)
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!message.trim() || !selected) return

    const leadId = selected._id
    const userMsg = {
      role: 'user',
      text: message,
      createdAt: new Date().toISOString(),
    }

    setConversations((prev) => ({
      ...prev,
      [leadId]: [...(prev[leadId] || []), userMsg],
    }))

    setMessage('')

    const res = await postAiReply(leadId, message)
    if (!res.ok) alert(res.message || 'Failed to send message')
  }

  const msgs = conversations[selected?._id] || []

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50">

      {/* Leads Sidebar */}
      <aside className="md:col-span-1 bg-white rounded-xl shadow-sm flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Leads</h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y">
          {leads.map((l) => (
            <button
              key={l._id}
              onClick={() => loadConversation(l)}
              className={`w-full text-left px-4 py-3 transition
                ${selected?._id === l._id
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50'
                }`}
            >
              <div className="font-medium text-gray-800">{l.name}</div>
              <div className="text-xs text-gray-500">{l.customerNumber}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Panel */}
      <main className="md:col-span-3 bg-white rounded-xl shadow-sm flex flex-col">

        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          {selected ? (
            <div>
              <div className="font-semibold text-gray-800">
                {selected.name}
              </div>
              <div className="text-xs text-gray-500">
                {selected.customerNumber}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select a lead</div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading && (
            <div className="text-sm text-gray-400">Loading conversation…</div>
          )}

          {!loading && msgs.length === 0 && (
            <div className="text-sm text-gray-400 text-center mt-10">
              No messages yet
            </div>
          )}

          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm shadow-sm
                  ${
                    m.role === 'assistant'
                      ? 'bg-white border text-gray-800'
                      : 'bg-blue-600 text-white'
                  }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[10px] mt-1 text-right ${
                    m.role === 'assistant'
                      ? 'text-gray-400'
                      : 'text-blue-200'
                  }`}
                >
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message or ask AI…"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  )
}
