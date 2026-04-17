import { NextRequest, NextResponse } from 'next/server'

const DASHBOARD_ROLES: Record<string, string[]> = {
  '/dashboard/admin':    ['admin'],
  '/dashboard/sales':    ['admin', 'salesperson'],
  '/dashboard/customer': ['admin', 'customer'],
  '/dashboard/driver':   ['admin', 'driver'],
}

const ROLE_HOME: Record<string, string> = {
  admin:       '/dashboard/admin',
  salesperson: '/dashboard/sales',
  customer:    '/dashboard/customer',
  driver:      '/dashboard/driver',
}

function parseJwtPayload(token: string) {
  try {
    const base64 = token.split('.')[1]
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('chico_auth')?.value

  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  const payload = parseJwtPayload(token)

  if (!payload || !payload.role) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  const matchedRoute = Object.keys(DASHBOARD_ROLES).find(route =>
    pathname.startsWith(route)
  )

  if (matchedRoute) {
    const allowed = DASHBOARD_ROLES[matchedRoute]
    if (!allowed.includes(payload.role)) {
      const url = req.nextUrl.clone()
      url.pathname = ROLE_HOME[payload.role] || '/'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
