import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'

export default function AIChat() {
  const { postAiReply } = useContext(AppContext)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { sender: 'user', text: input, createdAt: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    const res = await postAiReply(null, input) // backend can accept null leadId for generic chat
    setLoading(false)
    if (res.ok) setMessages((m) => [...m, { sender: 'ai', text: res.data.text, createdAt: new Date().toISOString() }])
    else setMessages((m) => [...m, { sender: 'ai', text: 'Sorry, I could not process that right now.' }])
  }

  return (
    <div className="p-6 flex flex-col h-[80vh]">
      <div className="flex-1 overflow-auto space-y-3 p-3 card">
        {messages.map((m, i) => (
          <div key={i} className={`${m.sender === 'ai' ? 'text-left' : 'text-right'}`}>
            <div className={`inline-block p-3 rounded ${m.sender === 'ai' ? 'bg-gray-100 text-gray-800' : 'bg-blue-600 text-white'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 border rounded" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={send}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  )
}
