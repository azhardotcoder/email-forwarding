import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (!code) {
      console.error('Callback: No code provided in callback URL')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Callback: Error exchanging code for session:', error.message)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    console.log('Callback: Successfully exchanged code for session')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('Callback: Unexpected error:', error)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
} 