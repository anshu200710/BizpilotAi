import React, { useContext, useState } from 'react'
import { AppContext } from '../context/AppContext'
import Button from '../components/Button'

export default function WhatsAppSetup() {
  const {
    whatsappAccounts,
    createWhatsappAccount,
    deleteWhatsappAccount,
    updateWhatsappToken,
    addToast,
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
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">WhatsApp Setup</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ADD ACCOUNT */}
        <div className="card">
          <h3 className="font-semibold mb-3">Add WhatsApp Account</h3>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="text-sm">Phone Number ID</label>
              <input
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="text-sm">Access Token</label>
              <input
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="text-sm">Verify Token (optional)</label>
              <input
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full mt-1 p-2 border rounded"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="skip"
                type="checkbox"
                checked={skipVerify}
                onChange={(e) => setSkipVerify(e.target.checked)}
              />
              <label htmlFor="skip" className="text-xs text-gray-500">
                Skip verification (dev only)
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Account'}
              </Button>

              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 border rounded"
              >
                Reset
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Copy the verify token and use it while setting webhook in Meta
              Developer Console.
            </p>
          </form>
        </div>

        {/* CONNECTED ACCOUNTS */}
        <div className="card">
          <h3 className="font-semibold mb-3">Connected Accounts</h3>

          {whatsappAccounts.length === 0 && (
            <div className="text-sm text-gray-500">
              No accounts connected
            </div>
          )}

          <div className="space-y-2">
            {whatsappAccounts.map((a) => (
              <div
                key={a._id}
                className="border rounded p-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {a.displayPhoneNumber || a.phoneNumberId}
                  </div>
                  <div className="text-xs text-gray-500">
                    verify token:{' '}
                    <code className="bg-gray-100 px-1 rounded">
                      {a.verifyToken}
                    </code>
                  </div>
                </div>

                {/* ✅ ACTION BUTTONS (CORRECT SCOPE) */}
                <div className="flex gap-3">
                  <button
                    onClick={() => copyToken(a.verifyToken)}
                    className="text-sm text-blue-600"
                  >
                    Copy token
                  </button>

                  <button
                    onClick={async () => {
                      const newToken = prompt(
                        'Enter new WhatsApp access token'
                      )
                      if (!newToken) return

                      const res = await updateWhatsappToken(a._id, newToken)

                      if (res.ok) {
                        addToast({
                          type: 'success',
                          message: 'Token updated successfully',
                        })
                      } else {
                        addToast({
                          type: 'error',
                          message:
                            res.message || 'Token update failed',
                        })
                      }
                    }}
                    className="text-sm text-green-600"
                  >
                    Update token
                  </button>

                  <button
                    onClick={() => handleDelete(a._id)}
                    disabled={deletingId === a._id}
                    className="text-sm text-red-600"
                  >
                    {deletingId === a._id
                      ? 'Deleting...'
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
