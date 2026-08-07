'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package, ShoppingCart, Factory, Trash2, TrendingUp, Truck,
  AlertTriangle, CheckCircle, Clock, ArrowRight, Droplets, LogOut,
  BarChart3, Settings, ChevronRight, Loader, Plus
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'

type PR = { id: string; request_number: string; requester_name: string; total_cost: number; status: string; urgency: string; reason: string; created_at: string; supplier_name?: string }
type WastageLog = { id: string; product_name: string; quantity: number; reason: string; cost_impact: number; log_date: string }
type LowStock = { id: string; name: string; stock: number; low_stock_threshold: number; supplier_name: string | null }

const URGENCY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const PR_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  purchased: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-600',
}

export default function SupplyChainPage() {
  const [pendingPRs, setPendingPRs] = useState<PR[]>([])
  const [recentWastage, setRecentWastage] = useState<WastageLog[]>([])
  const [lowStock, setLowStock] = useState<LowStock[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    const [prs, wastage, stock] = await Promise.all([
      supabase.from('purchase_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('wastage_logs').select('*').order('log_date', { ascending: false }).limit(5),
      supabase.from('low_stock_products').select('*').in('stock_status', ['low', 'out_of_stock']),
    ])
    setPendingPRs(prs.data || [])
    setRecentWastage(wastage.data || [])
    setLowStock(stock.data || [])
    setLoading(false)
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    const res = await fetch(`/api/purchase-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approved' }),
    })
    if (res.ok) {
      setPendingPRs(prev => prev.filter(p => p.id !== id))
    }
    setActionLoading(null)
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    const res = await fetch(`/api/purchase-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rejected', approval_note: rejectNote }),
    })
    if (res.ok) {
      setPendingPRs(prev => prev.filter(p => p.id !== id))
      setShowRejectModal(null)
      setRejectNote('')
    }
    setActionLoading(null)
  }

  const navItems = [
    { href: '/dashboard/admin', icon: BarChart3, label: 'Dashboard' },
    { href: '/dashboard/admin/supply-chain', icon: Package, label: 'Supply Chain', active: true },
    { href: '/dashboard/admin/suppliers', icon: ShoppingCart, label: 'Suppliers' },
    { href: '/dashboard/admin/production', icon: Factory, label: 'Production' },
    { href: '/dashboard/admin/wastage', icon: Trash2, label: 'Wastage' },
    { href: '/dashboard/admin/margins', icon: TrendingUp, label: 'Profit Margins' },
    { href: '/dashboard/admin/routes', icon: Truck, label: 'Delivery Routes' },
    { href: '/dashboard/admin/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-water-900 text-white flex flex-col fixed h-full z-40 overflow-y-auto">
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
              <div className="text-water-300 text-[10px] uppercase tracking-widest">Supply Chain</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                item.active ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10')}>
              <item.icon className="w-4 h-4 shrink-0" />{item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/auth/login' }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Supply Chain</h1>
          <p className="text-gray-500 text-sm">Manage suppliers, purchases, production, and stock</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Pending Approvals', value: pendingPRs.length, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', urgent: pendingPRs.length > 0 },
            { label: 'Low Stock Items', value: lowStock.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', urgent: lowStock.length > 0 },
            { label: 'Recent Wastage Events', value: recentWastage.length, icon: Trash2, color: 'text-orange-600', bg: 'bg-orange-50', urgent: false },
            { label: 'Total Wastage Cost', value: formatCurrency(recentWastage.reduce((s, w) => s + (w.cost_impact || 0), 0)), icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50', urgent: false },
          ].map(stat => (
            <div key={stat.label} className={cn('bg-white rounded-2xl border shadow-sm p-5', stat.urgent ? 'border-red-200' : 'border-gray-100')}>
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Purchase Requests — Mr. Stephen approves here */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">Purchase Requests</h2>
                <p className="text-xs text-gray-500 mt-0.5">Approve or reject before any purchase is made</p>
              </div>
              <Link href="/dashboard/admin/suppliers" className="text-xs text-water-600 font-semibold flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-water-600" /></div>
            ) : pendingPRs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-medium">No pending requests</p>
                <p className="text-gray-400 text-xs">All purchase requests have been reviewed</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingPRs.map(pr => (
                  <div key={pr.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono font-black text-water-600 text-sm">{pr.request_number}</span>
                          <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full capitalize', URGENCY_COLORS[pr.urgency])}>
                            {pr.urgency}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">{pr.requester_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{pr.reason}</p>
                        {pr.supplier_name && <p className="text-xs text-gray-400 mt-0.5">Supplier: {pr.supplier_name}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black text-gray-900">{formatCurrency(pr.total_cost)}</div>
                        <div className="text-xs text-gray-400">{new Date(pr.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(pr.id)}
                        disabled={actionLoading === pr.id}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60"
                      >
                        {actionLoading === pr.id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => setShowRejectModal(pr.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-2.5 rounded-xl transition-colors"
                      >
                        Reject
                      </button>
                    </div>

                    {/* Reject modal inline */}
                    {showRejectModal === pr.id && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-xs font-semibold text-red-700 mb-2">Reason for rejection:</p>
                        <textarea
                          value={rejectNote}
                          onChange={e => setRejectNote(e.target.value)}
                          className="w-full text-xs border border-red-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
                          rows={2}
                          placeholder="Explain why this request is rejected..."
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleReject(pr.id)} disabled={actionLoading === pr.id}
                            className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg">
                            Confirm Reject
                          </button>
                          <button onClick={() => { setShowRejectModal(null); setRejectNote('') }}
                            className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-lg">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Low stock alerts */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">Low Stock Alerts</h2>
                <p className="text-xs text-gray-500 mt-0.5">Products that need restocking</p>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-8"><Loader className="w-5 h-5 animate-spin text-water-600" /></div>
              ) : lowStock.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">All stock levels are healthy</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {lowStock.map(item => (
                    <div key={item.id} className="p-4 flex items-center gap-4">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', item.stock === 0 ? 'bg-red-100' : 'bg-orange-100')}>
                        <AlertTriangle className={cn('w-4 h-4', item.stock === 0 ? 'text-red-600' : 'text-orange-600')} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{item.name}</p>
                        {item.supplier_name && <p className="text-xs text-gray-400">Supplier: {item.supplier_name}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className={cn('text-sm font-black', item.stock === 0 ? 'text-red-600' : 'text-orange-600')}>
                          {item.stock} units
                        </div>
                        <div className="text-xs text-gray-400">threshold: {item.low_stock_threshold}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { href: '/dashboard/admin/suppliers', icon: ShoppingCart, label: 'Manage Suppliers', desc: 'Add or edit suppliers' },
                  { href: '/dashboard/admin/production', icon: Factory, label: 'Log Production', desc: 'Record daily production' },
                  { href: '/dashboard/admin/wastage', icon: Trash2, label: 'Log Wastage', desc: 'Record damaged/expired stock' },
                  { href: '/dashboard/admin/margins', icon: TrendingUp, label: 'Profit Margins', desc: 'Cost vs selling price' },
                  { href: '/dashboard/admin/routes', icon: Truck, label: 'Route Planning', desc: 'Optimise delivery routes' },
                ].map(action => (
                  <Link key={action.href} href={action.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 bg-water-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-water-600 transition-colors">
                      <action.icon className="w-4 h-4 text-water-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                      <p className="text-xs text-gray-400">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-water-600 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
