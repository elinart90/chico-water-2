'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Building2, Truck, ShoppingBag, CreditCard, Bell, Package, Users, Globe, Shield, ChevronRight, Droplets, LogOut, RefreshCw, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { invalidateSettingsCache } from '@/components/SettingsProvider'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type Setting = { key: string; value: string; label: string; description?: string; category: string; type: string; options?: string; is_public: boolean }

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
  Business:      { icon: Building2,   color: 'text-blue-600 bg-blue-50' },
  Delivery:      { icon: Truck,       color: 'text-green-600 bg-green-50' },
  Orders:        { icon: ShoppingBag, color: 'text-purple-600 bg-purple-50' },
  Payments:      { icon: CreditCard,  color: 'text-orange-600 bg-orange-50' },
  Notifications: { icon: Bell,        color: 'text-pink-600 bg-pink-50' },
  Inventory:     { icon: Package,     color: 'text-amber-600 bg-amber-50' },
  Accounts:      { icon: Users,       color: 'text-indigo-600 bg-indigo-50' },
  Content:       { icon: Globe,       color: 'text-teal-600 bg-teal-50' },
  Security:      { icon: Shield,      color: 'text-red-600 bg-red-50' },
}

function SettingInput({ setting, value, onChange }: { setting: Setting; value: string; onChange: (k: string, v: string) => void }) {
  const [showSecret, setShowSecret] = useState(false)
  const isSecret = ['secret','token','api_key','password'].some(k => setting.key.includes(k))

  if (setting.type === 'boolean') return (
    <button onClick={() => onChange(setting.key, value === 'true' ? 'false' : 'true')}
      className={cn('relative inline-flex h-6 w-11 items-center rounded-full transition-colors', value === 'true' ? 'bg-water-600' : 'bg-gray-200')}>
      <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform', value === 'true' ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  )

  if (setting.type === 'select' && setting.options) {
    const opts: string[] = JSON.parse(setting.options)
    return (
      <select value={value} onChange={e => onChange(setting.key, e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-water-600 bg-white">
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  if (setting.type === 'color') return (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={e => onChange(setting.key, e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
      <input type="text" value={value} onChange={e => onChange(setting.key, e.target.value)} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-water-600 font-mono" />
    </div>
  )

  if (setting.type === 'textarea') return (
    <textarea value={value} onChange={e => onChange(setting.key, e.target.value)} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-water-600 resize-none" />
  )

  return (
    <div className="relative">
      <input
        type={isSecret && !showSecret ? 'password' : setting.type === 'number' ? 'number' : setting.type === 'time' ? 'time' : setting.type === 'email' ? 'email' : 'text'}
        value={value} onChange={e => onChange(setting.key, e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-water-600 pr-10" />
      {isSecret && (
        <button onClick={() => setShowSecret(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [grouped, setGrouped] = useState<Record<string, Setting[]>>({})
  const [values, setValues] = useState<Record<string, string>>({})
  const [dirty, setDirty] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('Business')

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('settings').select('*').order('category').order('key')
    if (data) {
      const g: Record<string, Setting[]> = {}
      const v: Record<string, string> = {}
      data.forEach((s: Setting) => {
        if (!g[s.category]) g[s.category] = []
        g[s.category].push(s)
        v[s.key] = s.value
      })
      setGrouped(g)
      setValues(v)
    }
    if (error) toast.error('Failed to load settings')
    setLoading(false)
  }

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }))
    setDirty(prev => { const n = new Set(Array.from(prev)); n.add(key); return n })
  }

  const saveCategory = async (category: string) => {
    const keys = (grouped[category] || []).map(s => s.key).filter(k => dirty.has(k))
    if (keys.length === 0) { toast('No changes to save'); return }
    setSaving(true)
    const timestamp = new Date().toISOString()
    const results = await Promise.all(
      keys.map(key => supabase.from('settings').update({ value: values[key], updated_at: timestamp }).eq('key', key))
    )
    const failed = results.filter(r => r.error)
    if (failed.length === 0) {
      setDirty(prev => { const n = new Set(Array.from(prev)); keys.forEach(k => n.delete(k)); return n })
      invalidateSettingsCache()
      toast.success(`${category} settings saved`)
    } else {
      toast.error('Some settings failed to save')
    }
    setSaving(false)
  }

  const categories = Object.keys(grouped)
  const activeMeta = CATEGORY_META[activeCategory] || { icon: Shield, color: 'text-gray-600 bg-gray-50' }
  const categorySettings = grouped[activeCategory] || []
  const dirtyCount = categorySettings.filter(s => dirty.has(s.key)).length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-water-900 text-white flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img 
              src="https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png"
              alt="Chico Water Logo"
              className="w-10 h-10"
            />
            <div className="text-left">
              <div className="text-white font-bold text-xl">Chico Water</div>
              <div className="text-water-200 text-xs font-medium uppercase tracking-widest">Limited</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/dashboard/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 mb-3">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to Dashboard
          </Link>
          {categories.map(cat => {
            const meta = CATEGORY_META[cat] || { icon: Shield, color: '' }
            const catDirty = (grouped[cat] || []).filter(s => dirty.has(s.key)).length
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={cn('w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all', activeCategory === cat ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10')}>
                <meta.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{cat}</span>
                {catDirty > 0 && <span className="w-5 h-5 bg-orange-400 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{catDirty}</span>}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/auth/login' }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', activeMeta.color)}>
              <activeMeta.icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">{activeCategory} Settings</h1>
              <p className="text-gray-500 text-sm">{categorySettings.length} setting{categorySettings.length !== 1 ? 's' : ''}{dirtyCount > 0 && <span className="text-orange-600 font-medium ml-2">· {dirtyCount} unsaved</span>}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={loadSettings} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"><RefreshCw className="w-4 h-4 text-gray-500" /></button>
            <button onClick={() => saveCategory(activeCategory)} disabled={saving || dirtyCount === 0}
              className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all', dirtyCount > 0 ? 'bg-water-600 hover:bg-water-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed')}>
              {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader className="w-8 h-8 animate-spin text-water-600" /></div>
        ) : (
          <div className="space-y-4">
            {categorySettings.map(setting => (
              <div key={setting.key} className={cn('bg-white rounded-2xl border p-5 transition-all', dirty.has(setting.key) ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100')}>
                <div className="flex gap-6 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <label className="font-semibold text-gray-900 text-sm">{setting.label}</label>
                      {setting.is_public && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">public</span>}
                      {['secret','token','api_key'].some(k => setting.key.includes(k)) && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">secret</span>}
                      {dirty.has(setting.key) && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">unsaved</span>}
                    </div>
                    {setting.description && <p className="text-xs text-gray-400 mb-3">{setting.description}</p>}
                    <p className="text-[10px] text-gray-300 font-mono">{setting.key}</p>
                  </div>
                  <div className="w-80 shrink-0">
                    <SettingInput setting={setting} value={values[setting.key] ?? setting.value} onChange={handleChange} />
                  </div>
                </div>
              </div>
            ))}
            {categorySettings.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No settings in this category yet.</p>
              </div>
            )}
          </div>
        )}

        {dirty.size > 0 && (
          <div className="fixed bottom-8 right-8 bg-gray-900 text-white rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium">{dirty.size} unsaved change{dirty.size !== 1 ? 's' : ''}</span>
            <button onClick={() => saveCategory(activeCategory)} className="bg-water-600 hover:bg-water-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">Save now</button>
          </div>
        )}
      </main>
    </div>
  )
}
