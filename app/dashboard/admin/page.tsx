'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart3, Package, Users, Truck, TrendingUp, AlertTriangle, CheckCircle, ChevronRight, Download, Bell, LogOut, Droplets, ShoppingBag, Settings, Loader } from 'lucide-react'
import { Order, Product } from '@/types'
import { MOCK_ORDERS, MOCK_PRODUCTS } from '@/lib/mock-data'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency, SEGMENT_LABELS, cn } from '@/lib/utils'
import { useSettings } from '@/components/SettingsProvider'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory'>('overview')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const s = useSettings()
  const [scrolled, setScrolled] = useState(false)
  const isHome = false

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()).catch(() => ({ orders: MOCK_ORDERS })),
      fetch('/api/products').then(r => r.json()).catch(() => ({ products: MOCK_PRODUCTS })),
    ]).then(([ordersData, productsData]) => {
      setOrders(ordersData.orders || MOCK_ORDERS)
      setProducts(productsData.products || MOCK_PRODUCTS)
      setLoading(false)
    })
  }, [])

  const dark = scrolled || !isHome

  const todayRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0)
  const activeDeliveries = orders.filter(o => o.status === 'in_transit').length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const lowStockProducts = products.filter(p => p.stock < 200)

  const stats = [
    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Revenue', value: formatCurrency(todayRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Active Deliveries', value: activeDeliveries.toString(), icon: Truck, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Low Stock Alerts', value: lowStockProducts.length.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const segmentRevenue = ['wholesale', 'retail', 'corporate', 'household'].map(seg => ({
    label: SEGMENT_LABELS[seg as keyof typeof SEGMENT_LABELS],
    total: orders.filter(o => o.segment === seg && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  }))
  const maxRevenue = Math.max(...segmentRevenue.map(s => s.total), 1)

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
        <nav className="flex-1 p-4 space-y-1">
          {[{ id: 'overview', label: 'Overview', icon: BarChart3 }, { id: 'orders', label: 'Orders', icon: ShoppingBag }, { id: 'inventory', label: 'Inventory', icon: Package }].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all', activeTab === item.id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10')}>
              <item.icon className="w-4 h-4" />{item.label}
            </button>
          ))}
          <Link href="/dashboard/admin/supply-chain" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Package className="w-4 h-4" /> Supply Chain
          </Link>
          <Link href="/dashboard/admin/settings" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10"><Droplets className="w-4 h-4" /> View Website</Link>
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/auth/login' }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{activeTab === 'overview' ? 'Dashboard' : activeTab === 'orders' ? 'All Orders' : 'Inventory'}</h1>
            <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingOrders > 0 && (
              <div className="relative p-2.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{pendingOrders}</span>
              </div>
            )}
            <div className="w-9 h-9 bg-gradient-to-br from-water-400 to-water-600 rounded-full flex items-center justify-center text-white text-sm font-bold">AD</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader className="w-8 h-8 animate-spin text-water-600" /></div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {stats.map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}><stat.icon className={cn('w-5 h-5', stat.color)} /></div>
                      </div>
                      <div className="text-2xl font-black text-gray-900 mb-1">{stat.value}</div>
                      <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-6">Revenue by Segment</h3>
                    <div className="space-y-4">
                      {segmentRevenue.map(seg => (
                        <div key={seg.label}>
                          <div className="flex justify-between mb-1"><span className="text-sm font-medium text-gray-700">{seg.label}</span><span className="text-sm font-bold">{formatCurrency(seg.total)}</span></div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-water-600 rounded-full transition-all duration-500" style={{ width: `${(seg.total / maxRevenue) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
                    <div className="space-y-3">
                      {(['pending', 'confirmed', 'packed', 'in_transit', 'delivered', 'cancelled'] as const).map(status => {
                        const count = orders.filter(o => o.status === status).length
                        return count > 0 ? (
                          <div key={status} className="flex items-center justify-between">
                            <span className={cn('px-2 py-1 rounded-full text-xs font-bold', ORDER_STATUS_COLORS[status])}>{ORDER_STATUS_LABELS[status]}</span>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-water-600 font-semibold flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead><tr className="border-b border-gray-100">{['Order', 'Customer', 'Segment', 'Total', 'Status'].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 pr-4">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.slice(0, 10).map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="py-3 pr-4 font-mono text-sm font-bold text-water-600">{order.order_number}</td>
                            <td className="py-3 pr-4 text-sm font-medium text-gray-900">{order.customer_name}</td>
                            <td className="py-3 pr-4"><span className="capitalize text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{order.segment}</span></td>
                            <td className="py-3 pr-4 text-sm font-bold text-gray-900">{formatCurrency(order.total)}</td>
                            <td className="py-3"><span className={cn('px-3 py-1 rounded-full text-xs font-bold', ORDER_STATUS_COLORS[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-gray-900">All Orders ({orders.length})</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-gray-100 bg-gray-50">{['Order #', 'Customer', 'Phone', 'Segment', 'Items', 'Total', 'Payment', 'Status'].map(h => <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider p-4">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="p-4 font-mono text-sm font-bold text-water-600">{order.order_number}</td>
                          <td className="p-4 text-sm font-medium text-gray-900">{order.customer_name}</td>
                          <td className="p-4 text-sm text-gray-500">{order.customer_phone}</td>
                          <td className="p-4"><span className="capitalize text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{order.segment}</span></td>
                          <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate">{order.items.map(i => `${i.quantity}× ${i.product_name}`).join(', ')}</td>
                          <td className="p-4 text-sm font-bold text-gray-900">{formatCurrency(order.total)}</td>
                          <td className="p-4"><span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{order.payment_method}</span></td>
                          <td className="p-4"><span className={cn('px-3 py-1 rounded-full text-xs font-bold', ORDER_STATUS_COLORS[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="space-y-6">
                {lowStockProducts.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-red-600" /><h3 className="font-bold text-red-800">Low Stock Alert</h3></div>
                    <div className="flex flex-wrap gap-2">
                      {lowStockProducts.map(p => <span key={p.id} className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">{p.name}: {p.stock} units</span>)}
                    </div>
                  </div>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="p-6 border-b border-gray-100"><h3 className="font-bold text-gray-900">Stock Levels</h3></div>
                  <div className="divide-y divide-gray-50">
                    {products.map(p => {
                      const pct = Math.min((p.stock / 10000) * 100, 100)
                      const low = p.stock < 200
                      return (
                        <div key={p.id} className="p-5 flex items-center gap-4">
                          <div className="text-2xl shrink-0">{p.category === 'bottled' ? '💧' : p.category === 'sachet' ? '🛍️' : '🫙'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                              {low && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">Low</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className={cn('h-full rounded-full', low ? 'bg-red-500' : 'bg-water-600')} style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-sm font-bold text-gray-900 shrink-0">{p.stock.toLocaleString()} units</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
