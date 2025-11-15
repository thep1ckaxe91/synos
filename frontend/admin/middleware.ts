import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  // Add token from localStorage to API requests
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const requestHeaders = new Headers(request.headers)
    if (token) {
      requestHeaders.set('authorization', `Bearer ${token}`)
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*', '/login'],
}
