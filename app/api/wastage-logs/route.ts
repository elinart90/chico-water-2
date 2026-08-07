import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('wastage_logs')
      .select('*')
      .order('log_date', { ascending: false })
    if (error) throw error
    return NextResponse.json({ logs: data || [] })
  } catch (err) {
    return NextResponse.json({ logs: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

    const { product_id, product_name, quantity, reason, notes, cost_impact, log_date } = await req.json()

    if (!product_id || !product_name || !quantity || !reason) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const db = supabaseAdmin()

    const { data, error } = await db
      .from('wastage_logs')
      .insert({
        product_id,
        product_name,
        quantity: Number(quantity),
        reason,
        notes: notes || null,
        cost_impact: Number(cost_impact || 0),
        log_date: log_date || new Date().toISOString().split('T')[0],
        logged_by: user.id,
        logger_name: user.name,
      })
      .select()
      .single()

    if (error) throw error

    // Deduct from stock
    try {
      await db.rpc('decrement_stock', { p_product_id: product_id, p_quantity: Number(quantity) })
    } catch { /* non-fatal */ }

    return NextResponse.json({ log: data }, { status: 201 })
  } catch (err) {
    console.error('Wastage log error:', err)
    return NextResponse.json({ message: 'Failed to save wastage log' }, { status: 500 })
  }
}
