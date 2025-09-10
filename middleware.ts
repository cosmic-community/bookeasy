import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if the request is for protected routes
  if (pathname.startsWith('/bookings') || pathname.startsWith('/settings')) {
    // Get the access code from environment variables
    const requiredAccessCode = process.env.ACCESS_CODE
    
    // If no access code is configured, allow access (for development)
    if (!requiredAccessCode) {
      return NextResponse.next()
    }

    // Check if user has provided the access code via cookie or query parameter
    const accessCodeCookie = request.cookies.get('access_code')?.value
    const accessCodeQuery = request.nextUrl.searchParams.get('access_code')

    // If access code is provided via query parameter, set cookie and redirect
    if (accessCodeQuery === requiredAccessCode) {
      const response = NextResponse.redirect(new URL(pathname, request.url))
      response.cookies.set('access_code', accessCodeQuery, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })
      return response
    }

    // If valid access code cookie exists, allow access
    if (accessCodeCookie === requiredAccessCode) {
      return NextResponse.next()
    }

    // Redirect to access code form
    const loginUrl = new URL('/admin-login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/bookings/:path*', '/settings/:path*']
}