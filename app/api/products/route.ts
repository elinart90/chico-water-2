import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { MOCK_PRODUCTS } from '@/lib/mock-data'

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('active', true)
      .order('category')
      .order('name')

    if (error) throw error
    if (!data || data.length === 0) {
      // Supabase connected but no products seeded — return mock so UI isn't empty
      return NextResponse.json({ products: MOCK_PRODUCTS, source: 'mock' })
    }

    return NextResponse.json({ products: data, source: 'db' })
  } catch (err) {
    console.error('Products fetch error:', err)
    // Fallback to mock data so the site never shows a blank products page
    return NextResponse.json({ products: MOCK_PRODUCTS, source: 'mock' })
  }
}
