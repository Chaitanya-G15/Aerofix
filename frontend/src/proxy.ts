import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't need authentication
  const isPublicPath = path === '/login'

  // Get the session from cookies
  const token = request.cookies.get('aerofix_session')?.value || ''

  // Redirect to login if trying to access a protected path without a token
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  // Redirect to dashboard if trying to access login with a valid token
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/',
    '/devices/:path*',
    '/login',
  ],
}
