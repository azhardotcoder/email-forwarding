import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ImapFlow } from 'imapflow'

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '').replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ').trim()
}

function cleanContent(content: string): string {
    if (!content) return ''
    return content
        .replace(/--[a-zA-Z0-9]+(-[a-zA-Z0-9]+)?/g, '')
        .replace(/^(Content-Type|Content-Transfer-Encoding):.*$/gm, '')
        .replace(/^[A-Za-z-]+:.*$/gm, '')
        .replace(/^base64$/gm, '')
        .split('\n')
        .filter(line => line.trim())
        .join('\n')
        .trim()
}

function parseEmailContent(textContent: string | null, htmlContent: string | null): string {
    if (!textContent && !htmlContent) return ''
    
    if (textContent) {
        const content = textContent.toString()
        return cleanContent(content)
    }
    
    if (htmlContent) {
        const content = htmlContent.toString()
        return cleanContent(stripHtml(content))
    }
    
    return ''
}

function formatSender(from: any): string {
    if (!from || !from[0]) return 'Unknown sender'
    const sender = from[0]
    if (sender.name) return `${sender.name} <${sender.address}>`
    return sender.address || 'Unknown sender'
}

export async function GET(request: Request) {
    try {
        // Get search query from URL
        const { searchParams } = new URL(request.url)
        const searchQuery = searchParams.get('query')?.toLowerCase() || ''
        
        // Await cookies() to fix the error
        const cookieStore = await cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
            console.error('Session error:', sessionError)
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = new ImapFlow({
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER!,
                pass: process.env.GMAIL_APP_PASSWORD!
            },
            logger: false
        })

        try {
            await client.connect()
            const lock = await client.getMailboxLock('INBOX')
            
            try {
                const last7Days = new Date()
                last7Days.setDate(last7Days.getDate() - 7)

                const messages = []
                for await (const message of client.fetch({ since: last7Days }, {
                    uid: true,
                    envelope: true,
                    bodyParts: ['text']
                })) {
                    const textContent = message.bodyParts.get('text')
                    const content = parseEmailContent(textContent, null)
                    
                    if (content) {
                        const emailData = {
                            id: message.uid.toString(),
                            subject: message.envelope.subject?.trim() || '(No subject)',
                            from: formatSender(message.envelope.from),
                            content: content,
                            received_at: message.envelope.date.toISOString()
                        }
                        
                        // If search query exists, filter by it
                        if (searchQuery) {
                            const matchesSubject = emailData.subject.toLowerCase().includes(searchQuery)
                            const matchesContent = emailData.content.toLowerCase().includes(searchQuery)
                            const matchesSender = emailData.from.toLowerCase().includes(searchQuery)
                            
                            if (matchesSubject || matchesContent || matchesSender) {
                                messages.push(emailData)
                            }
                        } else {
                            // No search query, add all emails
                            messages.push(emailData)
                        }
                    }
                }

                const sortedMessages = messages.sort((a, b) => 
                    new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
                )

                return NextResponse.json(sortedMessages)
            } finally {
                lock.release()
            }
        } finally {
            await client.logout()
        }
    } catch (error: any) {
        console.error('Error fetching emails:', error)
        const errorMessage = error?.message || 'Failed to fetch emails'
        return NextResponse.json(
            { error: errorMessage }, 
            { status: 500 }
        )
    }
} 