import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { OrderStatus } from '@/types'

const VALID_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'packed', 'in_transit', 'delivered', 'cancelled']

// GET /api/orders/[id] — get single order by order_number or id
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = supabaseAdmin()
    const { id } = params

    // Try by order_number first (e.g. CW-10421), then by uuid
    let query = db.from('orders').select('*')
    if (id.startsWith('CW-')) {
      query = query.eq('order_number', id.toUpperCase())
    } else {
      query = query.eq('id', id)
    }

    const { data, error } = await query.maybeSingle()

    if (error) throw error
    if (!data) return NextResponse.json({ message: 'Order not found' }, { status: 404 })

    return NextResponse.json({ order: data })
  } catch (err) {
    console.error('Order GET error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/orders/[id] — update order status (salesperson/admin only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getCurrentUser()
    if (!user) return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
    if (!['admin', 'salesperson', 'driver'].includes(user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { status, driver_id } = body

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
    }

    const db = supabaseAdmin()

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (driver_id) updates.driver_id = driver_id
    if (status === 'confirmed') updates.salesperson_id = user.id

    const { data, error } = await db
      .from('orders')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ order: data })
  } catch (err) {
    console.error('Order PATCH error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
