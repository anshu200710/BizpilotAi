import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'

export default function Conversations() {
  const { leads, fetchConversations, conversations, postAiReply } = useContext(AppContext)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (leads.length && !selected) setSelected(leads[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads])

  const loadConversation = async (lead) => {
    setSelected(lead)
    setLoading(true)
    await fetchConversations(lead._id)
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!message.trim() || !selected) return
    // append user message locally
    const userMsg = { sender: 'user', text: message, createdAt: new Date().toISOString() }
    // show immediately
    // update conversations state optimistically
    // The AppContext.postAiReply will append AI reply
    setMessage('')
    const leadId = selected._id
    // Append user message
    // Direct mutation avoided; we'll call fetchConversations to refresh after AI reply
    // Call AI endpoint to get reply; it will be appended by context
    await postAiReply(leadId, message)
  }

  const msgs = conversations[selected?._id] || []

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <aside className="md:col-span-1 bg-white rounded p-3 shadow">
        <h3 className="font-semibold mb-2">Leads</h3>
        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {leads.map((l) => (
            <button
              key={l._id}
              onClick={() => loadConversation(l)}
              className={`w-full text-left p-2 rounded ${selected?._id === l._id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              <div className="font-medium">{l.name}</div>
              <div className="text-sm text-gray-500">{l.email}</div>
            </button>
          ))}
        </div>
      </aside>

      <main className="md:col-span-3 card flex flex-col">
        {!selected && <div>Select a lead to view conversation</div>}
        {selected && (
          <>
            <div className="flex-1 overflow-auto space-y-3 p-3">
              {loading && <div className="text-sm text-gray-500">Loading...</div>}
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] p-3 rounded ${m.sender === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>
                    <div className="text-sm">{m.text}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t flex items-center gap-2">
              <input value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Send message or ask AI" />
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={sendMessage}>Send</button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
