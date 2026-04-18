import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ complaints: data || [] })
  } catch (err) {
    return NextResponse.json({ complaints: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

    const body = await req.json()
    const { subject, category, description, priority } = body

    if (!subject || !category || !description) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data: ticketData } = await db.rpc('generate_ticket_number')
    const ticket_number = ticketData || `TKT-${Date.now()}`

    const { data, error } = await db
      .from('complaints')
      .insert({
        ticket_number,
        submitted_by: user.id,
        submitter_name: user.name,
        submitter_email: user.email,
        submitter_role: user.role,
        subject,
        category,
        description,
        priority: priority || 'medium',
        status: 'open',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ complaint: data, ticket_number }, { status: 201 })
  } catch (err) {
    console.error('Complaint POST error:', err)
    return NextResponse.json({ message: 'Failed to submit complaint' }, { status: 500 })
  }
}
