'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, ArrowLeft, Loader, Send, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

type Supplier = { id: string; name: string; category: string }
type LineItem = { name: string; quantity: string; unit: string; unit_cost: string; total_cost: number }

const EMPTY_ITEM: LineItem = { name: '', quantity: '', unit: 'units', total_cost: 0, unit_cost: '' }

export default function NewPurchaseRequestPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [form, setForm] = useState({ supplier_id: '', supplier_name: '', reason: '', urgency: 'normal' })
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }])
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('suppliers')
      .select('id, name, category')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => setSuppliers(data || []))
  }, [])

  const updateItem = (index: number, field: keyof LineItem, value: string) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unit_cost') {
        updated.total_cost = (parseFloat(updated.quantity) || 0) * (parseFloat(updated.unit_cost) || 0)
      }
      return updated
    }))
  }

  const addItem = () => setItems(prev => [...prev, { ...EMPTY_ITEM }])
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i))

  const totalCost = items.reduce((s, i) => s + (i.total_cost || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.reason || items.some(i => !i.name || !i.quantity)) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    const res = await fetch('/api/purchase-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplier_id: form.supplier_id || null,
        supplier_name: form.supplier_name || null,
        items: items.map(i => ({
          name: i.name,
          quantity: parseFloat(i.quantity),
          unit: i.unit,
          unit_cost: parseFloat(i.unit_cost) || 0,
          total_cost: i.total_cost,
        })),
        total_cost: totalCost,
        reason: form.reason,
        urgency: form.urgency,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setSubmitted(data.request_number)
      toast.success(`Request ${data.request_number} submitted`)
    } else {
      toast.error(data.message || 'Failed to submit request')
    }
    setSaving(false)
  }

  // ── Success screen ──
  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Request Submitted!</h2>
        <p className="text-gray-500 mb-6">Your purchase request has been sent to the admin for approval. You'll see the decision in your dashboard.</p>
        <div className="bg-water-50 border border-water-100 rounded-2xl p-5 mb-8">
          <p className="text-sm text-gray-500 mb-1">Request number</p>
          <p className="text-2xl font-black text-water-600">{submitted}</p>
          <p className="text-xs text-gray-400 mt-2">Use this number to reference your request</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => {
              setSubmitted(null)
              setItems([{ ...EMPTY_ITEM }])
              setForm({ supplier_id: '', supplier_name: '', reason: '', urgency: 'normal' })
            }}
            className="btn-primary w-full">
            Submit Another Request
          </button>
          <Link href="/dashboard/sales" className="btn-secondary w-full block text-center">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )

  // ── Form ──
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/sales" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">New Purchase Request</h1>
            <p className="text-gray-500 text-sm">All requests must be approved by the admin before any purchase is made</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Request details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-5">Request Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Supplier</label>
                <select
                  value={form.supplier_id}
                  onChange={e => {
                    const s = suppliers.find(x => x.id === e.target.value)
                    setForm(f => ({ ...f, supplier_id: e.target.value, supplier_name: s?.name || '' }))
                  }}
                  className="input bg-white">
                  <option value="">Select supplier (optional)</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Urgency *</label>
                <select
                  value={form.urgency}
                  onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}
                  className="input bg-white">
                  <option value="low">Low — not urgent</option>
                  <option value="normal">Normal</option>
                  <option value="high">High — needed soon</option>
                  <option value="urgent">Urgent — stock critical</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Reason for Purchase *</label>
                <textarea
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  className="input resize-none" rows={3}
                  placeholder="Explain why this purchase is needed (e.g. sachet water bags running low, need restock before next week's orders)"
                  required />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Items to Purchase</h2>
              <button type="button" onClick={addItem}
                className="flex items-center gap-1.5 text-water-600 text-sm font-semibold hover:text-water-700">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-4">
                    {i === 0 && <label className="label">Item Name *</label>}
                    <input
                      value={item.name}
                      onChange={e => updateItem(i, 'name', e.target.value)}
                      className="input" placeholder="e.g. 500ml PET Bottles" required />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="label">Qty *</label>}
                    <input
                      type="number" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)}
                      className="input" placeholder="0" min="1" required />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="label">Unit</label>}
                    <input
                      value={item.unit}
                      onChange={e => updateItem(i, 'unit', e.target.value)}
                      className="input" placeholder="bags" />
                  </div>
                  <div className="col-span-2">
                    {i === 0 && <label className="label">Unit Cost</label>}
                    <input
                      type="number" value={item.unit_cost}
                      onChange={e => updateItem(i, 'unit_cost', e.target.value)}
                      className="input" placeholder="0.00" step="0.01" />
                  </div>
                  <div className="col-span-1">
                    {i === 0 && <label className="label">Total</label>}
                    <div className="h-[46px] flex items-center text-sm font-bold text-gray-900">
                      {item.total_cost > 0 ? formatCurrency(item.total_cost) : '—'}
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end pb-1">
                    {i === 0 && <div className="h-7" />}
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(i)}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between items-center">
              <span className="font-semibold text-gray-700">Estimated Total</span>
              <span className="text-xl font-black text-water-600">{formatCurrency(totalCost)}</span>
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-water-600 hover:bg-water-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-60 text-base">
            {saving
              ? <><Loader className="w-5 h-5 animate-spin" /> Submitting...</>
              : <><Send className="w-5 h-5" /> Submit for Admin Approval</>}
          </button>

          <p className="text-center text-xs text-gray-400">
            This request will be reviewed by the admin before any purchase is made. You will be notified of the decision in your dashboard.
          </p>
        </form>
      </div>
    </div>
  )
}