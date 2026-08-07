'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Factory, ArrowLeft, Loader, CheckCircle, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

type ProductionLog = { id: string; log_date: string; product_name: string; quantity_produced: number; batch_number: string; logger_name: string; approved: boolean; notes: string }
type Product = { id: string; name: string; unit: string }

export default function ProductionPage() {
  const [logs, setLogs] = useState<ProductionLog[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ product_id: '', product_name: '', quantity_produced: '', batch_number: '', notes: '', log_date: new Date().toISOString().split('T')[0] })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [logsData, productsData] = await Promise.all([
      supabase.from('production_logs').select('*').order('log_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, unit').eq('active', true).order('name'),
    ])
    setLogs(logsData.data || [])
    setProducts(productsData.data || [])
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.product_id || !form.quantity_produced) return
    setSaving(true)
    const res = await fetch('/api/production-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Production logged successfully')
      setShowForm(false)
      setForm({ product_id: '', product_name: '', quantity_produced: '', batch_number: '', notes: '', log_date: new Date().toISOString().split('T')[0] })
      loadData()
    } else {
      toast.error('Failed to log production')
    }
    setSaving(false)
  }

  const totalToday = logs.filter(l => l.log_date === new Date().toISOString().split('T')[0]).reduce((s, l) => s + l.quantity_produced, 0)
  const totalThisMonth = logs.filter(l => l.log_date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, l) => s + l.quantity_produced, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin/supply-chain" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900">Production Log</h1>
            <p className="text-gray-500 text-sm">Record daily production output</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-water-600 hover:bg-water-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Log Production
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-water-600 mb-1">{totalToday.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Units produced today</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-water-600 mb-1">{totalThisMonth.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Units this month</div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Log Production</h2>
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
              <div><label className="label">Quantity Produced *</label><input type="number" value={form.quantity_produced} onChange={e => setForm(f => ({ ...f, quantity_produced: e.target.value }))} className="input" placeholder="0" min="1" required /></div>
              <div><label className="label">Batch Number</label><input value={form.batch_number} onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))} className="input" placeholder="e.g. B2024-001" /></div>
              <div><label className="label">Date</label><input type="date" value={form.log_date} onChange={e => setForm(f => ({ ...f, log_date: e.target.value }))} className="input" /></div>
              <div className="sm:col-span-2"><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input resize-none" rows={2} placeholder="Any notes about this production run..." /></div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Factory className="w-4 h-4" />} Save Log
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Logs table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Production History</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-water-600" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Factory className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No production logs yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                {['Date', 'Product', 'Quantity', 'Batch', 'Logged By', 'Status'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-4 text-sm text-gray-600">{new Date(log.log_date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{log.product_name}</td>
                    <td className="p-4 text-sm font-bold text-water-600">{log.quantity_produced.toLocaleString()}</td>
                    <td className="p-4 text-sm text-gray-500">{log.batch_number || '—'}</td>
                    <td className="p-4 text-sm text-gray-500">{log.logger_name || '—'}</td>
                    <td className="p-4">
                      <span className={cn('text-xs font-bold px-2 py-1 rounded-full', log.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700')}>
                        {log.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
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
