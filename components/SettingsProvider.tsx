'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

type SettingsMap = Record<string, string>

const SettingsContext = createContext<SettingsMap>({})

const CACHE_KEY = 'chico_settings_v1'
const CACHE_TTL = 10 * 60 * 1000
const FETCH_TIMEOUT = 8000
const MAX_RETRIES = 2

export const DEFAULTS: SettingsMap = {
  business_name:                'Chico Water Limited Company',
  business_tagline:             'Inspire Natural Mineral Water',
  business_tagline_2:           "Ghana's premier water supplier — delivering purity to homes, businesses, and communities.",
  business_email:               'orders@chicowater.com',
  business_phone:               '+233200000000',
  business_whatsapp:            '233200000000',
  business_address:             'Industrial Area, Accra, Ghana',
  business_website:             'https://chicowater.com',
  business_founded:             '2008',
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
  home_hero_subtitle:           'Bottled water, sachet water, and packaging solutions — for businesses, and wholesale buyers across Ghana.',
  home_announcement:            '',
  home_announcement_on:         'false',
  home_stats_orders:            '50000',
  home_stats_customers:         '12000',
  home_stats_regions:           '16',
  inventory_hide_out_of_stock:  'false',
  accounts_loyalty_enabled:     'false',
  accounts_subscription_enabled:'false',
  business_logo_url: 'https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png',

}

function readCache(): { data: SettingsMap; ts: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeCache(data: SettingsMap) {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

async function fetchSettings(): Promise<SettingsMap | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .abortSignal(controller.signal)
      clearTimeout(timer)
      if (error) throw error
      if (!data?.length) return null
      return Object.fromEntries(data.map((s: any) => [s.key, s.value]))
    } catch (err: any) {
      if (attempt === MAX_RETRIES) return null
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)))
    }
  }
  return null
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Always start with DEFAULTS — prevents hydration mismatch
  const [settings, setSettings] = useState<SettingsMap>(DEFAULTS)

  useEffect(() => {
    const cached = readCache()
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setSettings({ ...DEFAULTS, ...cached.data })
      return
    }
    if (!navigator.onLine) return

    fetchSettings().then(data => {
      if (data) {
        setSettings({ ...DEFAULTS, ...data })
        writeCache(data)
      } else if (cached) {
        setSettings({ ...DEFAULTS, ...cached.data })
      }
    })
  }, [])

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() { return useContext(SettingsContext) }

export function useSetting(key: string, fallback = '') {
  const settings = useContext(SettingsContext)
  return settings[key] ?? DEFAULTS[key] ?? fallback
}

export function invalidateSettingsCache() {
  if (typeof window !== 'undefined') localStorage.removeItem(CACHE_KEY)
}
