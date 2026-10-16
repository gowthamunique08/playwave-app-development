import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      const redirect = new URL('/', request.url)
      redirect.searchParams.set('auth_error', 'Your confirmation link is invalid or expired. Request a new signup email and use the latest link.')
      return NextResponse.redirect(redirect)
    }
  } else if (error || errorDescription) {
    const redirect = new URL('/', request.url)
    redirect.searchParams.set('auth_error', 'Your confirmation link is invalid or expired. Request a new signup email and use the latest link.')
    return NextResponse.redirect(redirect)
  }

  return NextResponse.redirect(new URL('/', request.url))
}
