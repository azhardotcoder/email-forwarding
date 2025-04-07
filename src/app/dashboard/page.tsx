'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'

interface Email {
  id: string
  subject: string
  content: string
  received_at: string
  type: 'reset' | 'household' | 'signin' | 'secret'
}

export default function DashboardPage() {
  const router = useRouter()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check auth state
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }
        setUser(user)
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/auth/login')
      }
    })

    // Listen for email updates
    const handleEmailsUpdated = (event: CustomEvent<Email[]>) => {
      setEmails(event.detail)
    }
    
    window.addEventListener('emailsUpdated', handleEmailsUpdated as EventListener)
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('emailsUpdated', handleEmailsUpdated as EventListener)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Emails</h2>
            <div className="text-sm text-gray-600">
              Logged in as: {user?.email}
            </div>
          </div>
          {emails.length === 0 ? (
            <p className="text-gray-500 text-center">Click any button above to fetch emails</p>
          ) : (
            <div className="space-y-4">
              {emails.map((email) => (
                <div 
                  key={email.id} 
                  className="border p-4 rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-bold">{email.subject}</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{email.content}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(email.received_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 