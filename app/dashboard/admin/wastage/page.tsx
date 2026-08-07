'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader, X, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type WastageLog = { id: string; log_date: string; product_name: string; quantity: number; reason: string; cost_impact: number; logger_name: string; notes: string }
type Product = { id: string; name: string; unit: string; cost_price: number }

const REASONS = ['damaged', 'expired', 'spilled', 'contaminated', 'other']
const REASON_COLORS: Record<string, string> = {
  damaged: 'bg-orange-100 text-orange-700',
  expired: 'bg-red-100 text-red-700',
  spilled: 'bg-blue-100 text-blue-700',
  contaminated: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
}

export default function WastagePage() {
  const [logs, setLogs] = useState<WastageLog[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ product_id: '', product_name: '', quantity: '', reason: 'damaged', notes: '', cost_impact: '', log_date: new Date().toISOString().split('T')[0] })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [logsData, productsData] = await Promise.all([
      supabase.from('wastage_logs').select('*').order('log_date', { ascending: false }),
      supabase.from('products').select('id, name, unit, cost_price').eq('active', true).order('name'),
    ])
    setLogs(logsData.data || [])
    setProducts(productsData.data || [])
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/wastage-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Wastage recorded and stock updated')
      setShowForm(false)
      setForm({ product_id: '', product_name: '', quantity: '', reason: 'damaged', notes: '', cost_impact: '', log_date: new Date().toISOString().split('T')[0] })
      loadData()
    } else {
      toast.error('Failed to record wastage')
    }
    setSaving(false)
  }

  const totalCostImpact = logs.reduce((s, l) => s + (l.cost_impact || 0), 0)
  const thisMonth = logs.filter(l => l.log_date?.startsWith(new Date().toISOString().slice(0, 7)))
  const monthCost = thisMonth.reduce((s, l) => s + (l.cost_impact || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin/supply-chain" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900">Wastage Tracking</h1>
            <p className="text-gray-500 text-sm">Record damaged, expired, or lost inventory</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Log Wastage
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-red-600 mb-1">{formatCurrency(monthCost)}</div>
            <div className="text-sm text-gray-500">Wastage cost this month</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-orange-600 mb-1">{thisMonth.length}</div>
            <div className="text-sm text-gray-500">Wastage events this month</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-gray-900 mb-1">{formatCurrency(totalCostImpact)}</div>
            <div className="text-sm text-gray-500">Total wastage cost (all time)</div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="font-bold text-gray-900">Record Wastage</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Product *</label>
                <select value={form.product_id} onChange={e => {
                  const p = products.find(x => x.id === e.target.value)
                  setForm(f => ({ ...f, product_id: e.target.value, product_name: p?.name || '' }))
                }} className="input bg-white" required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label className="label">Quantity Wasted *</label><input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} className="input" placeholder="0" min="1" required /></div>
              <div>
                <label className="label">Reason *</label>
                <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} className="input bg-white">
                  {REASONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              <div><label className="label">Estimated Cost Impact (GH₵)</label><input type="number" value={form.cost_impact} onChange={e => setForm(f => ({ ...f, cost_impact: e.target.value }))} className="input" placeholder="0.00" step="0.01" /></div>
              <div><label className="label">Date</label><input type="date" value={form.log_date} onChange={e => setForm(f => ({ ...f, log_date: e.target.value }))} className="input" /></div>
              <div><label className="label">Notes</label><input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input" placeholder="What happened?" /></div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Record Wastage
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100"><h2 className="font-bold text-gray-900">Wastage History</h2></div>
          {loading ? <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-water-600" /></div>
          : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><Trash2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">No wastage recorded</p></div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                {['Date', 'Product', 'Qty', 'Reason', 'Cost Impact', 'Logged By'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">{new Date(log.log_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{log.product_name}</td>
                    <td className="p-4 text-sm font-bold text-red-600">{log.quantity}</td>
                    <td className="p-4"><span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', REASON_COLORS[log.reason] || 'bg-gray-100 text-gray-600')}>{log.reason}</span></td>
                    <td className="p-4 text-sm font-bold text-gray-900">{log.cost_impact ? formatCurrency(log.cost_impact) : '—'}</td>
                    <td className="p-4 text-sm text-gray-500">{log.logger_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
