import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return NextResponse.json({ suppliers: data || [] })
  } catch (err) {
    return NextResponse.json({ suppliers: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('suppliers')
      .insert(body)
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ supplier: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'Failed to create supplier' }, { status: 500 })
  }
}
