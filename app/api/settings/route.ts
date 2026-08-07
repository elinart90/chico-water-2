import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { invalidateSettingsCache } from '@/lib/settings'

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db.from('settings').select('*').order('category').order('key')
    if (error) throw error
    return NextResponse.json({ settings: data })
  } catch (err) {
    return NextResponse.json({ message: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ message: 'Admin only' }, { status: 403 })
    }

    const { updates } = await req.json()
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const timestamp = new Date().toISOString()
    const results = await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        db.from('settings').update({ value: String(value), updated_at: timestamp }).eq('key', key)
      )
    )

    const failed = results.filter(r => r.error)
    if (failed.length > 0) {
      console.error('Settings update errors:', failed.map(f => f.error))
      return NextResponse.json({ message: 'Some settings failed to update' }, { status: 500 })
    }

    invalidateSettingsCache()
    return NextResponse.json({ message: 'Settings updated' })
  } catch (err) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
