'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const fetchEmails = async (type: 'reset' | 'household' | 'signin' | 'secret') => {
    try {
      setLoading(type)
      const response = await fetch(`/api/emails?type=${type}`)
      if (!response.ok) {
        throw new Error('Failed to fetch emails')
      }
      const data = await response.json()
      // Emit event to update dashboard
      window.dispatchEvent(new CustomEvent('emailsUpdated', { detail: data }))
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to fetch emails')
    } finally {
      setLoading(null)
    }
  }

  return (
    <nav className="bg-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <button 
            onClick={() => fetchEmails('reset')}
            className="bg-red-600 text-white px-4 py-2 rounded flex items-center"
            disabled={loading !== null}
          >
            {loading === 'reset' ? 'Loading...' : '🔄 Refresh'}
          </button>
          <button 
            onClick={() => fetchEmails('household')}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={loading !== null}
          >
            {loading === 'household' ? 'Loading...' : 'Household Email'}
          </button>
          <button 
            onClick={() => fetchEmails('reset')}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={loading !== null}
          >
            {loading === 'reset' ? 'Loading...' : 'Reset Link Email'}
          </button>
          <button 
            onClick={() => fetchEmails('signin')}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={loading !== null}
          >
            {loading === 'signin' ? 'Loading...' : 'Signin Code'}
          </button>
          <button 
            onClick={() => fetchEmails('secret')}
            className="bg-red-600 text-white px-4 py-2 rounded"
            disabled={loading !== null}
          >
            {loading === 'secret' ? 'Loading...' : 'Secret Store'}
          </button>
        </div>
        <button 
          onClick={handleSignOut}
          className="bg-gray-600 text-white px-4 py-2 rounded"
          disabled={loading !== null}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
} 