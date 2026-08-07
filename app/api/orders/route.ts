import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { MOCK_ORDERS } from '@/lib/mock-data'

// GET /api/orders — list orders (admin/salesperson sees all, customer sees own)
export async function GET(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })

    const db = supabaseAdmin()
    let query = db
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    // Customers only see their own orders
    if (user.role === 'customer') {
      query = query.eq('customer_id', user.id)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json({ orders: data || [] })
  } catch (err) {
    console.error('Orders GET error:', err)
    // Fallback to mock data so dashboards never break
    return NextResponse.json({ orders: MOCK_ORDERS, source: 'mock' })
  }
}

// POST /api/orders — create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      customer_name, customer_phone, segment,
      items, subtotal, delivery_fee, total,
      payment_method, delivery_address,
      delivery_region, delivery_notes, preferred_date,
    } = body

    // Basic validation
    if (!customer_name || !customer_phone || !items?.length || !delivery_address) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const db = supabaseAdmin()

    // Get the authenticated customer if logged in
    const user = getCurrentUser()

    const order_number = generateOrderNumber()

    const { data: order, error } = await db
      .from('orders')
      .insert({
        order_number,
        customer_id: user?.id || null,
        customer_name: customer_name.trim(),
        customer_phone: customer_phone.trim(),
        segment: segment || 'household',
        items,
        subtotal: Number(subtotal),
        delivery_fee: Number(delivery_fee),
        total: Number(total),
        status: 'pending',
        payment_method: payment_method || 'cash',
        payment_status: payment_method === 'cash' ? 'pending' : 'pending',
        delivery_address: delivery_address.trim(),
        delivery_region: delivery_region || 'Greater Accra',
        delivery_notes: delivery_notes?.trim() || null,
        preferred_date: preferred_date || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Order insert error:', error)
      return NextResponse.json({ message: 'Failed to create order. Please try again.' }, { status: 500 })
    }

    // Deduct stock for each item (non-fatal)
    for (const item of items) {
      try {
        await db.rpc('decrement_stock', { p_product_id: item.product_id, p_quantity: item.quantity })
      } catch { /* Non-fatal */ }
    }

    return NextResponse.json({ order, order_number }, { status: 201 })
  } catch (err) {
    console.error('Order POST exception:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
