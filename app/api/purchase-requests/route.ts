import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

// GET - list all purchase requests
export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ requests: data || [] })
  } catch (err) {
    console.error('PR GET error:', err)
    return NextResponse.json({ requests: [] })
  }
}

// POST - create a new purchase request
export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const { supplier_id, supplier_name, items, total_cost, reason, urgency } = body

    if (!items?.length || !reason || !total_cost) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const db = supabaseAdmin()

    // Generate PR number
    const { data: prNum } = await db.rpc('generate_pr_number')
    const request_number = prNum || `PR-${Date.now()}`

    const { data, error } = await db
      .from('purchase_requests')
      .insert({
        request_number,
        requested_by: user.id,
        requester_name: user.name,
        supplier_id: supplier_id || null,
        supplier_name: supplier_name || null,
        items,
        total_cost: Number(total_cost),
        reason,
        urgency: urgency || 'normal',
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ request: data, request_number }, { status: 201 })
  } catch (err) {
    console.error('PR POST error:', err)
    return NextResponse.json({ message: 'Failed to create request' }, { status: 500 })
  }
}
