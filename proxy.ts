import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user

  const isDashboard = nextUrl.pathname.startsWith('/dashboard') ||
    nextUrl.pathname.startsWith('/campaigns') ||
    nextUrl.pathname.startsWith('/leads') ||
    nextUrl.pathname.startsWith('/pipeline') ||
    nextUrl.pathname.startsWith('/emails') ||
    nextUrl.pathname.startsWith('/analytics') ||
    nextUrl.pathname.startsWith('/settings')

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
