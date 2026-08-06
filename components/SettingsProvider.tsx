'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type SettingsMap = Record<string, string>
type LoadState = 'loading' | 'loaded' | 'cached' | 'offline' | 'error'

type SettingsContextType = { settings: SettingsMap; state: LoadState }

const SettingsContext = createContext<SettingsContextType>({ settings: {}, state: 'loading' })

const CACHE_KEY = 'chico_settings_cache'
const CACHE_TTL = 10 * 60 * 1000
const FETCH_TIMEOUT = 8000
const MAX_RETRIES = 2

export const DEFAULTS: SettingsMap = {
  business_name:                'Chico Water Limited Company',
  business_tagline:             'Pure water, anywhere in Ghana.',
  business_tagline_2:           "Ghana's premier water supplier — delivering purity to homes, businesses, and communities.",
  business_email:               'orders@chicowater.com',
  business_phone:               '+233200000000',
  business_whatsapp:            '233200000000',
  business_address:             'Pakyi No.1, Kumasi, Ghana',
  business_website:             'https://chicowater.com',
  business_founded:             '2026',
  business_primary_color:       '#0077B6',
  delivery_fee_default:         '15',
  delivery_hours_open:          '7:00 AM',
  delivery_hours_close:         '6:00 PM',
  delivery_sunday_close:        '2:00 PM',
  delivery_free_threshold:      '500',
  delivery_same_day_cutoff:     '12:00',
  payment_currency_symbol:      'GH₵',
  payment_momo_enabled:         'true',
  payment_card_enabled:         'true',
  payment_cash_enabled:         'true',
  payment_momo_networks:        'mtn,vodafone,airteltigo',
  order_allow_guest:            'true',
  order_notes_enabled:          'true',
  order_preferred_date_enabled: 'true',
  home_hero_title:              'Inspire Natural Mineral Water',
  home_hero_subtitle:           'Bottled water, sachet water, and packaging solutions — for businesses, and wholesale buyers.',
  home_announcement:            '',
  home_announcement_on:         'false',
  home_stats_orders:            '50',
  home_stats_customers:         '12000',
  home_stats_regions:           '16',
  inventory_hide_out_of_stock:  'false',
  accounts_loyalty_enabled:     'false',
  accounts_subscription_enabled:'false',
}

function readCache(): { data: SettingsMap; ts: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function writeCache(data: SettingsMap) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

async function fetchSettings(retries = MAX_RETRIES): Promise<SettingsMap | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .abortSignal(controller.signal)
      clearTimeout(timer)
      if (error) throw error
      if (!data || data.length === 0) return null
      return Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]))
    } catch (err: any) {
      if (attempt === retries) {
        console.warn('[Settings] Failed:', err?.message || err)
        return null
      }
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
    }
  }
  return null
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>('loading')
  // Always start with DEFAULTS on both server and client to avoid hydration mismatch.
  // Cache and Supabase data are applied only after mount (in useEffect).
  const [settings, setSettings] = useState<SettingsMap>(DEFAULTS)

  useEffect(() => {
    // Check localStorage cache first — instant, no network needed
    const cached = readCache()
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setSettings({ ...DEFAULTS, ...cached.data })
      setState('cached')
      return
    }

    if (!navigator.onLine) {
      setState('offline')
      return
    }

    fetchSettings().then(data => {
      if (data) {
        setSettings({ ...DEFAULTS, ...data })
        writeCache(data)
        setState('loaded')
      } else {
        // Fetch failed — apply stale cache if any, otherwise keep defaults
        if (cached) {
          setSettings({ ...DEFAULTS, ...cached.data })
          setState('cached')
        } else {
          setState('error')
        }
      }
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, state }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() { return useContext(SettingsContext).settings }
export function useSettingsState() { return useContext(SettingsContext).state }
export function useSetting(key: string, fallback = '') {
  const { settings } = useContext(SettingsContext)
  return settings[key] ?? DEFAULTS[key] ?? fallback
}
export function invalidateSettingsCache() {
  if (typeof window !== 'undefined') localStorage.removeItem(CACHE_KEY)
}