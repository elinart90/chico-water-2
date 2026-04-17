import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { UserRole } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'chico-water-secret-change-in-prod'
const COOKIE_NAME = 'chico_auth'

export interface TokenPayload {
  id: string
  email: string
  role: UserRole
  name: string
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function getAuthToken(): string | null {
  try {
    const cookieStore = cookies()
    return cookieStore.get(COOKIE_NAME)?.value || null
  } catch {
    return null
  }
}

export function getCurrentUser(): TokenPayload | null {
  const token = getAuthToken()
  if (!token) return null
  return verifyToken(token)
}

export function setAuthCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
}

export function requireRole(allowed: UserRole[]) {
  const user = getCurrentUser()
  if (!user) return null
  if (!allowed.includes(user.role)) return null
  return user
}
