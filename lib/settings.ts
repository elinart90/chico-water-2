import { supabase } from './supabase'

let _cache: Record<string, string> | null = null
let _cacheTime = 0
const CACHE_TTL = 60_000

export async function getAllSettings(): Promise<Record<string, string>> {
  const now = Date.now()
  if (_cache && now - _cacheTime < CACHE_TTL) return _cache
  const { data } = await supabase.from('settings').select('key, value')
  if (!data) return _cache || {}
  _cache = Object.fromEntries(data.map((s: any) => [s.key, s.value]))
  _cacheTime = now
  return _cache!
}

export async function getSetting(key: string, fallback = ''): Promise<string> {
  const all = await getAllSettings()
  return all[key] ?? fallback
}

export async function updateSetting(key: string, value: string): Promise<boolean> {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)
  if (!error) _cache = null
  return !error
}

export async function updateSettings(updates: Record<string, string>): Promise<boolean> {
  const timestamp = new Date().toISOString()
  const results = await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      supabase.from('settings').update({ value, updated_at: timestamp }).eq('key', key)
    )
  )
  const hasError = results.some(r => r.error)
  if (!hasError) _cache = null
  return !hasError
}

export function invalidateSettingsCache() {
  _cache = null
  _cacheTime = 0
}
