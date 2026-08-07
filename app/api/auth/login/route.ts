import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    const db = supabaseAdmin()

    const { data: user, error } = await db
      .from('users')
      .select('id, name, email, password_hash, role, segment')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (error || !user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const valid = await comparePassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    setAuthCookie(token)

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, segment: user.segment }
    })
  } catch (err) {
    console.error('Login exception:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
