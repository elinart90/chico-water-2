import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ message: 'Only admin can approve requests' }, { status: 403 })

    const { action, approval_note } = await req.json()
    if (!['approved', 'rejected', 'purchased', 'cancelled'].includes(action)) {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const updates: Record<string, any> = {
      status: action,
      updated_at: new Date().toISOString(),
    }

    if (action === 'approved' || action === 'rejected') {
      updates.approved_by = user.id
      updates.approver_name = user.name
      updates.approval_note = approval_note || null
      updates.approved_at = new Date().toISOString()
    }

    if (action === 'purchased') {
      updates.purchased_at = new Date().toISOString()
    }

    const { data, error } = await db
      .from('purchase_requests')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ request: data })
  } catch (err) {
    console.error('PR PATCH error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
