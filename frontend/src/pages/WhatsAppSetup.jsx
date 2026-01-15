import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import Button from '../components/Button'

export default function WhatsAppSetup() {
  const {
    whatsappAccounts,
    createWhatsappAccount,
    deleteWhatsappAccount,
    updateWhatsappToken,
    fetchWhatsappAccounts,
    addToast,
    sendTestMessage,
  } = useContext(AppContext)

  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [skipVerify, setSkipVerify] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const resetForm = () => {
    setPhoneNumberId('')
    setAccessToken('')
    setVerifyToken('')
    setSkipVerify(false)
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!phoneNumberId.trim() || !accessToken.trim()) {
      addToast({
        type: 'error',
        message: 'Phone Number ID and Access Token are required',
      })
      return
    }

    setLoading(true)

    const payload = {
      phoneNumberId,
      accessToken,
      verifyToken,
      _skipVerify: skipVerify,
    }

    const res = await createWhatsappAccount(payload)
    setLoading(false)

    if (res.ok) {
      addToast({ type: 'success', message: 'WhatsApp account added' })
      resetForm()
    } else {
      addToast({
        type: 'error',
        message: res.message || 'Could not add account',
      })
    }
  }

  const copyToken = async (token) => {
    try {
      await navigator.clipboard.writeText(token)
      addToast({ type: 'success', message: 'Verify token copied' })
    } catch {
      addToast({ type: 'error', message: 'Clipboard not available' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this account?')) return

    setDeletingId(id)
    const res = await deleteWhatsappAccount(id)
    setDeletingId(null)

    if (res.ok) {
      addToast({ type: 'success', message: 'Account deleted' })
    } else {
      addToast({
        type: 'error',
        message: res.message || 'Could not delete',
      })
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          WhatsApp Setup
        </h2>
        <p className="text-sm text-gray-500">
          Connect and manage WhatsApp Cloud API accounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ADD ACCOUNT */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Add WhatsApp Account
          </h3>

          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="text-sm text-gray-600">
                Phone Number ID
              </label>
              <input
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Ex: 123456789012345"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Access Token
              </label>
              <input
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Permanent or temporary token"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Verify Token (optional)
              </label>
              <input
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Webhook verify token"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="skip"
                type="checkbox"
                checked={skipVerify}
                onChange={(e) => setSkipVerify(e.target.checked)}
              />
              <label
                htmlFor="skip"
                className="text-xs text-gray-500"
              >
                Skip verification (development only)
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding…' : 'Add Account'}
              </Button>

              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Use the verify token while configuring webhook in Meta
              Developer Console.
            </div>
          </form>
        </div>

        {/* CONNECTED ACCOUNTS */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Connected Accounts
          </h3>

          {whatsappAccounts.length === 0 && (
            <div className="text-sm text-gray-500">
              No WhatsApp accounts connected
            </div>
          )}

          <div className="space-y-3">
            {whatsappAccounts.map((a) => (
              <div
                key={a._id}
                className="border rounded-lg p-4 flex flex-col gap-3"
              >
                <div>
                  <div className="font-medium text-gray-800">
                    {a.displayPhoneNumber || a.phoneNumberId}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Verify token:{' '}
                    <code className="bg-gray-100 px-2 py-0.5 rounded">
                      {a.verifyToken}
                    </code>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <button
                    onClick={() => copyToken(a.verifyToken)}
                    className="text-blue-600 hover:underline"
                  >
                    Copy token
                  </button>

                  <button
                    onClick={async () => {
                      const newToken = prompt(
                        'Enter new WhatsApp access token'
                      )
                      if (!newToken) return

                      const res = await updateWhatsappToken(
                        a._id,
                        newToken,
                        true
                      )

                      if (res.ok) {
                        addToast({
                          type: 'success',
                          message: 'Token updated successfully',
                        })
                        await fetchWhatsappAccounts()
                      } else {
                        addToast({
                          type: 'error',
                          message:
                            res.message || 'Token update failed',
                        })
                      }
                    }}
                    className="text-green-600 hover:underline"
                  >
                    Update token
                  </button>

                  <button
                    onClick={async () => {
                      const to = prompt(
                        'Enter WhatsApp number with country code'
                      )
                      if (!to) return

                      const res = await sendTestMessage(a._id, to)

                      if (res.ok) {
                        addToast({
                          type: 'success',
                          message: 'Test message sent',
                        })
                      } else {
                        addToast({
                          type: 'error',
                          message: res.message,
                        })
                      }
                    }}
                    className="text-purple-600 hover:underline"
                  >
                    Send test message
                  </button>

                  <button
                    onClick={() => handleDelete(a._id)}
                    disabled={deletingId === a._id}
                    className="text-red-600 hover:underline"
                  >
                    {deletingId === a._id
                      ? 'Deleting…'
                      : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
