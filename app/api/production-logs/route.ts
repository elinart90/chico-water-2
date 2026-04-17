import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('production_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })
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

    const { product_id, product_name, quantity_produced, batch_number, notes, log_date } = await req.json()

    if (!product_id || !product_name || !quantity_produced) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const db = supabaseAdmin()

    const { data, error } = await db
      .from('production_logs')
      .insert({
        product_id,
        product_name,
        quantity_produced: Number(quantity_produced),
        batch_number: batch_number || null,
        notes: notes || null,
        log_date: log_date || new Date().toISOString().split('T')[0],
        logged_by: user.id,
        logger_name: user.name,
        approved: user.role === 'admin',
        approved_by: user.role === 'admin' ? user.id : null,
      })
      .select()
      .single()

    if (error) throw error

    // If admin logs it, auto-increase stock
    if (user.role === 'admin') {
      try {
        // Try RPC first
        await db.rpc('increment_stock', { p_product_id: product_id, p_quantity: Number(quantity_produced) })
      } catch {
        // Fallback: manual increment
        const { data: prod } = await db.from('products').select('stock').eq('id', product_id).single()
        if (prod) {
          await db.from('products').update({ stock: prod.stock + Number(quantity_produced), updated_at: new Date().toISOString() }).eq('id', product_id)
        }
      }
    }

    return NextResponse.json({ log: data }, { status: 201 })
  } catch (err) {
    console.error('Production log error:', err)
    return NextResponse.json({ message: 'Failed to save log' }, { status: 500 })
  }
}
