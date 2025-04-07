import { ImapFlow } from 'imapflow'

const config = {
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
}

export async function fetchEmails(type: 'reset' | 'household' | 'signin') {
    const client = new ImapFlow(config)

    try {
        await client.connect()
        
        let searchCriteria = ''
        switch(type) {
            case 'reset':
                searchCriteria = 'SUBJECT "Netflix Password Reset"'
                break
            case 'household':
                searchCriteria = 'SUBJECT "Netflix Household"'
                break
            case 'signin':
                searchCriteria = 'SUBJECT "Netflix Sign-in"'
                break
        }

        const lock = await client.getMailboxLock('INBOX')
        try {
            const messages = await client.search({ subject: searchCriteria })
            const emails = []

            for (const message of messages) {
                const email = await client.fetchOne(message.uid, { source: true })
                emails.push({
                    id: message.uid,
                    subject: email.subject,
                    content: email.text,
                    received_at: email.date
                })
            }

            return emails
        } finally {
            lock.release()
        }
    } finally {
        await client.logout()
    }
} 