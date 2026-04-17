'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CheckCircle, XCircle, Truck, Package, Bell, LogOut,
  Droplets, ShoppingBag, Clock, Loader, Plus, AlertCircle
} from 'lucide-react'
import { Order, OrderStatus } from '@/types'
import { MOCK_ORDERS } from '@/lib/mock-data'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency, cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

type PR = {
  id: string; request_number: string; supplier_name?: string
  items: { name: string; quantity: number; unit: string; unit_cost: number; total_cost: number }[]
  total_cost: number; reason: string; urgency: string; status: string
  approval_note?: string; approver_name?: string; approved_at?: string; created_at: string
}

const PR_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800', purchased: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-600',
}
const URGENCY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600', normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700', urgent: 'bg-red-100 text-red-700',
}

export default function SalesDashboard() {
  const [tab, setTab] = useState<'orders' | 'requests'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [prs, setPrs] = useState<PR[]>([])
  const [loading, setLoading] = useState(true)
  const [prLoading, setPrLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/orders').then(r => r.json()).then(d => setOrders(d.orders || MOCK_ORDERS)).catch(() => setOrders(MOCK_ORDERS)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    supabase.from('purchase_requests').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setPrs(data || []); setPrLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id)
    try {
      await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success(`Order updated to ${ORDER_STATUS_LABELS[status]}`)
    } catch {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
      toast.success(`Order updated to ${ORDER_STATUS_LABELS[status]}`)
    } finally { setUpdating(null) }
  }

  const filtered = orders.filter(o => filter === 'all' || o.status === filter)
  const pending = orders.filter(o => o.status === 'pending').length
  const inTransit = orders.filter(o => o.status === 'in_transit').length
  const totalRevenue = orders.filter(o => !['cancelled','pending'].includes(o.status)).reduce((s, o) => s + o.total, 0)
  const rejectedCount = prs.filter(p => p.status === 'rejected').length

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-56 bg-water-800 text-white flex flex-col fixed h-full z-40">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img 
              src="https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png"
              alt="Chico Water Logo"
              className="w-10 h-10"
            />
            <div className="text-left">
              <div className="text-white font-bold text-xl">Chico Water</div>
              <div className="text-water-300 text-[10px] uppercase tracking-widest">Sales</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <button onClick={() => setTab('orders')}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all', tab === 'orders' ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10')}>
            <Package className="w-4 h-4" /><span className="flex-1 text-left">My Requests</span>
            {rejectedCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{rejectedCount}</span>}
          </button>
          <Link href="/dashboard/sales/purchase-request" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Plus className="w-4 h-4" /> New PR
          </Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10">
            <Droplets className="w-4 h-4" /> View Website
          </Link>
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/auth/login' }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 p-6">
        {tab === 'orders' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div><h1 className="text-xl font-black text-gray-900">My Orders</h1><p className="text-gray-500 text-sm">Manage and process incoming orders</p></div>
              <div className="flex items-center gap-3">
                {pending > 0 && <div className="relative"><Bell className="w-5 h-5 text-gray-600" /><span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{pending}</span></div>}
                <div className="w-8 h-8 bg-gradient-to-br from-water-400 to-water-600 rounded-full flex items-center justify-center text-white text-xs font-bold">KA</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[{ label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' }, { label: 'In Transit', value: inTransit, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' }, { label: 'Revenue', value: formatCurrency(totalRevenue), icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-50' }].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', stat.bg)}><stat.icon className={cn('w-4 h-4', stat.color)} /></div>
                  <div className="text-xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-5 flex-wrap">
              {(['all','pending','confirmed','packed','in_transit','delivered'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all', filter === f ? 'bg-water-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300')}>
                  {f === 'all' ? 'All' : ORDER_STATUS_LABELS[f]}
                  {f === 'pending' && pending > 0 && <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 text-[10px]">{pending}</span>}
                </button>
              ))}
            </div>

            {loading ? <div className="flex items-center justify-center py-32"><Loader className="w-8 h-8 animate-spin text-water-600" /></div> : (
              <div className="space-y-4">
                {filtered.map(order => (
                  <div key={order.id} className={cn('bg-white rounded-2xl border-2 shadow-sm p-5', order.status === 'pending' ? 'border-yellow-200' : 'border-gray-100')}>
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-mono font-black text-water-600">{order.order_number}</span>
                          <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold', ORDER_STATUS_COLORS[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span>
                          <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{order.segment}</span>
                        </div>
                        <p className="font-semibold text-gray-900">{order.customer_name} · {order.customer_phone}</p>
                        <p className="text-sm text-gray-500">{order.delivery_address}, {order.delivery_region}</p>
                        {order.delivery_notes && <p className="text-xs text-amber-600 mt-1 font-medium">Note: {order.delivery_notes}</p>}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-gray-900">{formatCurrency(order.total)}</div>
                        <div className="text-xs text-gray-400 capitalize">{order.payment_method} · {order.payment_status}</div>
                        <div className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-1">
                          <span className="text-gray-700">{item.quantity}× {item.product_name}</span>
                          <span className="font-medium text-gray-900">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {order.status === 'pending' && (<>
                        <button onClick={() => updateStatus(order.id, 'confirmed')} disabled={updating === order.id} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"><CheckCircle className="w-3.5 h-3.5" /> Accept</button>
                        <button onClick={() => updateStatus(order.id, 'cancelled')} disabled={updating === order.id} className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"><XCircle className="w-3.5 h-3.5" /> Decline</button>
                      </>)}
                      {order.status === 'confirmed' && <button onClick={() => updateStatus(order.id, 'packed')} disabled={updating === order.id} className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"><Package className="w-3.5 h-3.5" /> Mark as Packed</button>}
                      {order.status === 'packed' && <button onClick={() => updateStatus(order.id, 'in_transit')} disabled={updating === order.id} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"><Truck className="w-3.5 h-3.5" /> Dispatch</button>}
                      {order.status === 'in_transit' && <button onClick={() => updateStatus(order.id, 'delivered')} disabled={updating === order.id} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"><CheckCircle className="w-3.5 h-3.5" /> Mark Delivered</button>}
                      {updating === order.id && <Loader className="w-4 h-4 animate-spin text-gray-400 ml-2" />}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-30" /><p className="font-medium">No orders in this category</p></div>}
              </div>
            )}
          </>
        )}

        {tab === 'requests' && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div><h1 className="text-xl font-black text-gray-900">My Purchase Requests</h1><p className="text-gray-500 text-sm">Track the status of your submitted requests</p></div>
              <Link href="/dashboard/sales/purchase-request" className="flex items-center gap-2 bg-water-600 hover:bg-water-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"><Plus className="w-4 h-4" /> New Request</Link>
            </div>

            {rejectedCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800 text-sm">{rejectedCount} purchase request{rejectedCount !== 1 ? 's were' : ' was'} rejected</p>
                  <p className="text-red-600 text-xs mt-0.5">Review the reason below and submit a revised request if needed.</p>
                </div>
              </div>
            )}

            {prLoading ? <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-water-600" /></div> : prs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">No purchase requests yet</h3>
                <p className="text-gray-500 text-sm mb-6">Submit a request when you need to purchase raw materials or supplies.</p>
                <Link href="/dashboard/sales/purchase-request" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Submit First Request</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {prs.map(pr => (
                  <div key={pr.id} className={cn('bg-white rounded-2xl border-2 shadow-sm p-5', pr.status === 'rejected' ? 'border-red-200' : pr.status === 'approved' ? 'border-green-200' : pr.status === 'pending' ? 'border-yellow-200' : 'border-gray-100')}>
                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono font-black text-water-600 text-sm">{pr.request_number}</span>
                          <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold capitalize', PR_STATUS_COLORS[pr.status])}>{pr.status}</span>
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold capitalize', URGENCY_COLORS[pr.urgency])}>{pr.urgency}</span>
                        </div>
                        {pr.supplier_name && <p className="text-sm text-gray-500">Supplier: {pr.supplier_name}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">Submitted {new Date(pr.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="text-xl font-black text-gray-900">{formatCurrency(pr.total_cost)}</div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Reason</p>
                      <p className="text-sm text-gray-700">{pr.reason}</p>
                    </div>

                    {pr.items?.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-xs text-gray-500 font-medium mb-2">Items</p>
                        {pr.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm py-1">
                            <span className="text-gray-700">{item.quantity} {item.unit} × {item.name}</span>
                            <span className="font-medium text-gray-900">{item.total_cost > 0 ? formatCurrency(item.total_cost) : '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {pr.status === 'approved' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-green-800">Approved by {pr.approver_name || 'Admin'}{pr.approved_at && ` on ${new Date(pr.approved_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}`}</p>
                          {pr.approval_note && <p className="text-xs text-green-700 mt-0.5">{pr.approval_note}</p>}
                          <p className="text-xs text-green-600 mt-1 font-medium">You may now proceed with this purchase.</p>
                        </div>
                      </div>
                    )}

                    {pr.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-red-800">Rejected by {pr.approver_name || 'Admin'}{pr.approved_at && ` on ${new Date(pr.approved_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}`}</p>
                          {pr.approval_note && <p className="text-xs text-red-700 mt-1 bg-red-100 rounded-lg px-2 py-1">Reason: {pr.approval_note}</p>}
                          <Link href="/dashboard/sales/purchase-request" className="inline-flex items-center gap-1 text-xs text-red-700 font-semibold mt-2 hover:underline"><Plus className="w-3 h-3" /> Submit revised request</Link>
                        </div>
                      </div>
                    )}

                    {pr.status === 'pending' && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
                        <p className="text-xs text-yellow-800 font-medium">Waiting for admin approval. You will see the decision here once reviewed.</p>
                      </div>
                    )}

                    {pr.status === 'purchased' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                        <p className="text-xs text-blue-800 font-medium">Purchase completed and recorded.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}