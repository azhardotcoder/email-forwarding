import { NextResponse } from 'next/server'
import { fetchEmails } from '@/lib/emailService'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
    try {
        // Check authentication
        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') as 'reset' | 'household' | 'signin'

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Fetch emails
        const emails = await fetchEmails(type)
        return NextResponse.json(emails)

    } catch (error) {
        console.error('Error fetching emails:', error)
        return NextResponse.json(
            { error: 'Failed to fetch emails' },
            { status: 500 }
        )
    }
} 