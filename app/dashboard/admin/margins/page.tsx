'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Loader, Edit2, Save, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type MarginProduct = {
  id: string; name: string; category: string; size: string; unit: string
  cost_price: number
  price_wholesale: number; price_retail: number; price_household: number; price_corporate: number
  wholesale_margin: number; retail_margin: number
  wholesale_margin_pct: number; retail_margin_pct: number
}

export default function MarginsPage() {
  const [products, setProducts] = useState<MarginProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editCost, setEditCost] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase.from('product_margins').select('*')
    setProducts(data || [])
    setLoading(false)
  }

  const startEdit = (product: MarginProduct) => {
    setEditing(product.id)
    setEditCost(product.cost_price?.toString() || '0')
  }

  const saveCost = async (productId: string) => {
    setSaving(true)
    const { error } = await supabase
      .from('products')
      .update({ cost_price: parseFloat(editCost) || 0 })
      .eq('id', productId)
    if (!error) {
      toast.success('Cost price updated')
      setEditing(null)
      loadData()
    } else {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  const totalRevenue = products.reduce((s, p) => s + p.price_wholesale, 0)
  const totalCost = products.reduce((s, p) => s + (p.cost_price || 0), 0)
  const avgMargin = products.length > 0
    ? products.filter(p => p.cost_price > 0).reduce((s, p) => s + p.wholesale_margin_pct, 0) / Math.max(products.filter(p => p.cost_price > 0).length, 1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin/supply-chain" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Profit Margins</h1>
            <p className="text-gray-500 text-sm">Cost of goods vs selling price — click the edit icon to set cost prices</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-water-600 mb-1">{avgMargin.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Avg wholesale margin</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-green-600 mb-1">{products.filter(p => p.cost_price > 0 && p.wholesale_margin_pct > 30).length}</div>
            <div className="text-sm text-gray-500">Products with &gt;30% margin</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-red-600 mb-1">{products.filter(p => p.cost_price === 0).length}</div>
            <div className="text-sm text-gray-500">Products missing cost price</div>
          </div>
        </div>

        {products.filter(p => p.cost_price === 0).length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Set cost prices</strong> for accurate margin calculations. Click the edit icon on any product row to enter the cost to produce or purchase that product.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-water-600" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                {['Product', 'Cost Price', 'Retail Price', 'Wholesale Price', 'Wholesale Margin', 'Retail Margin', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                      <div className="text-xs text-gray-400">{p.size} · per {p.unit}</div>
                    </td>
                    <td className="p-4">
                      {editing === p.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editCost} onChange={e => setEditCost(e.target.value)}
                            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-water-600"
                            step="0.01" min="0" autoFocus />
                          <button onClick={() => saveCost(p.id)} disabled={saving} className="text-green-600 hover:text-green-700">
                            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          </button>
                          <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                      ) : (
                        <span className={cn('text-sm font-bold', p.cost_price > 0 ? 'text-gray-900' : 'text-gray-300')}>
                          {p.cost_price > 0 ? formatCurrency(p.cost_price) : 'Not set'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{formatCurrency(p.price_retail)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatCurrency(p.price_wholesale)}</td>
                    <td className="p-4">
                      {p.cost_price > 0 ? (
                        <div>
                          <span className={cn('text-sm font-black', p.wholesale_margin_pct >= 30 ? 'text-green-600' : p.wholesale_margin_pct >= 10 ? 'text-orange-600' : 'text-red-600')}>
                            {p.wholesale_margin_pct}%
                          </span>
                          <span className="text-xs text-gray-400 ml-1">({formatCurrency(p.wholesale_margin)})</span>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="p-4">
                      {p.cost_price > 0 ? (
                        <div>
                          <span className={cn('text-sm font-black', p.retail_margin_pct >= 30 ? 'text-green-600' : p.retail_margin_pct >= 10 ? 'text-orange-600' : 'text-red-600')}>
                            {p.retail_margin_pct}%
                          </span>
                          <span className="text-xs text-gray-400 ml-1">({formatCurrency(p.retail_margin)})</span>
                        </div>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="p-4">
                      {editing !== p.id && (
                        <button onClick={() => startEdit(p)} className="text-gray-400 hover:text-water-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
