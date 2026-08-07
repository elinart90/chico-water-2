'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Phone, Mail, MapPin, Package, Droplets, ArrowLeft, Loader, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Supplier = { id: string; name: string; contact_name: string; phone: string; email: string; address: string; region: string; category: string; notes: string; is_active: boolean }

const CATEGORIES = ['water_source', 'bottles', 'packaging', 'chemicals', 'equipment', 'other']
const CAT_COLORS: Record<string, string> = {
  water_source: 'bg-blue-100 text-blue-700',
  bottles: 'bg-green-100 text-green-700',
  packaging: 'bg-purple-100 text-purple-700',
  chemicals: 'bg-orange-100 text-orange-700',
  equipment: 'bg-gray-100 text-gray-700',
  other: 'bg-gray-100 text-gray-600',
}

const EMPTY_FORM = { name: '', contact_name: '', phone: '', email: '', address: '', region: 'Greater Accra', category: 'bottles', notes: '' }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadSuppliers() }, [])

  const loadSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*').order('name')
    setSuppliers(data || [])
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) return
    setSaving(true)
    const res = await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Supplier added')
      setShowForm(false)
      setForm(EMPTY_FORM)
      loadSuppliers()
    } else {
      toast.error('Failed to add supplier')
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin/supply-chain" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900">Suppliers</h1>
            <p className="text-gray-500 text-sm">Manage your raw material and packaging suppliers</p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-water-600 hover:bg-water-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Add Supplier
          </button>
        </div>

        {/* Add supplier form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">New Supplier</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="grid sm:grid-cols-2 gap-4">
              <div><label className="label">Company Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Accra Packaging Ltd" required /></div>
              <div><label className="label">Contact Person</label><input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} className="input" placeholder="Kwame Asante" /></div>
              <div><label className="label">Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="+233244000000" /></div>
              <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="sales@supplier.com" /></div>
              <div><label className="label">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input bg-white">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div><label className="label">Region</label><input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="input" placeholder="Greater Accra" /></div>
              <div className="sm:col-span-2"><label className="label">Address</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input" placeholder="Street, Area, City" /></div>
              <div className="sm:col-span-2"><label className="label">Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input resize-none" rows={2} placeholder="Any additional notes about this supplier..." /></div>
              <div className="sm:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Supplier
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-water-600" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suppliers.map(s => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    {s.contact_name && <p className="text-sm text-gray-500">{s.contact_name}</p>}
                  </div>
                  <span className={cn('text-xs font-semibold px-2 py-1 rounded-full capitalize', CAT_COLORS[s.category] || 'bg-gray-100 text-gray-600')}>
                    {s.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-2">
                  {s.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />{s.phone}</div>}
                  {s.email && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />{s.email}</div>}
                  {s.address && <div className="flex items-start gap-2 text-sm text-gray-600"><MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />{s.address}</div>}
                  {s.notes && <p className="text-xs text-gray-400 italic mt-2">{s.notes}</p>}
                </div>
              </div>
            ))}
            {suppliers.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No suppliers yet</p>
                <p className="text-sm">Add your first supplier to get started</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
