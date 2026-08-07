import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = getCurrentUser()
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('users')
      .select('id, name, email, phone, role, segment, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ users: data || [] })
  } catch (err) {
    return NextResponse.json({ users: [] })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }
    const { id, role } = await req.json()
    if (!id || !role) return NextResponse.json({ message: 'Missing id or role' }, { status: 400 })

    const db = supabaseAdmin()
    const { data, error } = await db
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, email, role')
      .single()

    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }
    const { id } = await req.json()
    if (!id) return NextResponse.json({ message: 'Missing id' }, { status: 400 })

    // Prevent deleting yourself
    if (id === user.id) {
      return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { error } = await db.from('users').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
