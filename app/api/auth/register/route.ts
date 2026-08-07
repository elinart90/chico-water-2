import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password, segment } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const db = supabaseAdmin()

    // Check duplicate email
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: 'An account with this email already exists' }, { status: 409 })
    }

    const password_hash = await hashPassword(password)

    const { data: user, error } = await db
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password_hash,
        role: 'customer',
        // segment: segment || 'household',
      })
      .select('id, name, email, role')
      .single()

    if (error || !user) {
      console.error('Register error:', error)
      return NextResponse.json({ message: 'Registration failed. Please try again.' }, { status: 500 })
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name })
    setAuthCookie(token)

    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error('Register exception:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
