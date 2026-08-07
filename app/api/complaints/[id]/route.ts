import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
    if (!['admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { status, resolution_note } = await req.json()
    const db = supabaseAdmin()

    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'resolved' || status === 'closed') {
      updates.resolution_note = resolution_note || null
      updates.resolved_at = new Date().toISOString()
      updates.resolved_by = user.id
    }

    const { data, error } = await db
      .from('complaints')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ complaint: data })
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
