'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Truck, ArrowRight, Plus, LogOut, Droplets, RefreshCw, Loader, User } from 'lucide-react'
import { Order } from '@/types'
import { MOCK_ORDERS } from '@/lib/mock-data'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCurrency, cn } from '@/lib/utils'

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{name:string}|null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{if(d.user)setUser(d.user)}).catch(()=>{})
    fetch('/api/orders').then(r=>r.json()).then(d=>setOrders(d.orders||[])).catch(()=>setOrders(MOCK_ORDERS.slice(0,2))).finally(()=>setLoading(false))
  }, [])

  const active = orders.filter(o=>!['delivered','cancelled'].includes(o.status))
  const completed = orders.filter(o=>o.status==='delivered')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-water-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            <Link href="/order" className="text-xs bg-white text-water-700 font-bold px-4 py-2 rounded-xl">+ New Order</Link>
            <button onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});window.location.href='/auth/login'}} className="text-white/60 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-water-600 to-water-800 rounded-3xl p-6 mb-8 text-white">
          <p className="text-white/70 text-sm mb-1">Welcome back,</p>
          <h1 className="text-2xl font-black mb-4">{user?.name||'Customer'} </h1>
          <div className="grid grid-cols-3 gap-4">
            {[{label:'Total Orders',value:orders.length},{label:'Active',value:active.length},{label:'Delivered',value:completed.length}].map(stat=>(
              <div key={stat.label} className="bg-white/10 rounded-2xl p-3 text-center">
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-white/60 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/order" className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-water-50 rounded-2xl flex items-center justify-center"><Plus className="w-6 h-6 text-water-600" /></div>
            <div><div className="font-bold text-gray-900">New Order</div><div className="text-xs text-gray-500">Order water products</div></div>
          </Link>
          <Link href="/track" className="card p-5 flex items-center gap-4 hover:-translate-y-0.5 transition-all">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center"><Truck className="w-6 h-6 text-green-600" /></div>
            <div><div className="font-bold text-gray-900">Track Order</div><div className="text-xs text-gray-500">Real-time status</div></div>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader className="w-8 h-8 animate-spin text-water-600" /></div>
        ) : orders.length === 0 ? (
          <div className="card p-10 text-center text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-4">No orders yet</p>
            <Link href="/order" className="btn-primary inline-flex items-center gap-2">Place your first order <ArrowRight className="w-4 h-4" /></Link>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-4">Order History</h2>
            <div className="space-y-3">
              {orders.map(order=>(
                <div key={order.id} className="card p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-water-600">{order.order_number}</span>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold',ORDER_STATUS_COLORS[order.status])}>{ORDER_STATUS_LABELS[order.status]}</span>
                      </div>
                      <p className="text-sm text-gray-500">{order.items.map(i=>`${i.quantity}× ${i.product_name}`).join(', ')}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString('en-GH',{day:'numeric',month:'short',year:'numeric'})}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-gray-900">{formatCurrency(order.total)}</span>
                      <Link href={`/track?id=${order.order_number}`} className="flex items-center gap-1.5 text-xs text-water-600 font-semibold border border-water-200 bg-water-50 px-3 py-2 rounded-xl">
                        <RefreshCw className="w-3 h-3" /> Track
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
