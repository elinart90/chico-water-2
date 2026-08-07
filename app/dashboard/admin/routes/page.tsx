'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, MapPin, Loader, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ORDER_STATUS_COLORS, formatCurrency, cn } from '@/lib/utils'
import { Order } from '@/types'

type GroupedRoute = { region: string; orders: Order[]; totalValue: number; count: number }

export default function RoutesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['confirmed', 'packed'])
      .order('delivery_region')
    setOrders(data || [])
    setLoading(false)
  }

  // Group orders by region for route optimization
  const grouped: GroupedRoute[] = Object.entries(
    orders.reduce((acc: Record<string, Order[]>, order) => {
      const region = order.delivery_region || 'Unknown'
      if (!acc[region]) acc[region] = []
      acc[region].push(order)
      return acc
    }, {})
  ).map(([region, orders]) => ({
    region,
    orders,
    totalValue: orders.reduce((s, o) => s + o.total, 0),
    count: orders.length,
  })).sort((a, b) => b.count - a.count)

  const REGION_COLORS = [
    'border-blue-200 bg-blue-50',
    'border-green-200 bg-green-50',
    'border-purple-200 bg-purple-50',
    'border-orange-200 bg-orange-50',
    'border-pink-200 bg-pink-50',
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/admin/supply-chain" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900">Delivery Route Optimisation</h1>
            <p className="text-gray-500 text-sm">Orders grouped by region — assign drivers per area to reduce travel time</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-5 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-water-600 mb-1">{orders.length}</div>
            <div className="text-sm text-gray-500">Orders ready to dispatch</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-water-600 mb-1">{grouped.length}</div>
            <div className="text-sm text-gray-500">Delivery regions</div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-3xl font-black text-water-600 mb-1">{formatCurrency(orders.reduce((s, o) => s + o.total, 0))}</div>
            <div className="text-sm text-gray-500">Total value to deliver</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-water-600" /></div>
        ) : grouped.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <Truck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 mb-2">No orders ready for delivery</h3>
            <p className="text-gray-500 text-sm">Orders need to be confirmed or packed before they appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Routing tip:</strong> Assign one driver per region below. Orders in the same region should be delivered in a single trip — sorted by address within each area.
              </p>
            </div>

            {grouped.map((group, i) => (
              <div key={group.region} className={cn('rounded-2xl border-2 overflow-hidden', REGION_COLORS[i % REGION_COLORS.length])}>
                <button
                  onClick={() => setExpanded(expanded === group.region ? null : group.region)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:opacity-90 transition-opacity"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-water-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{group.region}</h3>
                    <p className="text-sm text-gray-600">{group.count} order{group.count !== 1 ? 's' : ''} · {formatCurrency(group.totalValue)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-water-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      {group.count} stops
                    </div>
                    {expanded === group.region
                      ? <ChevronDown className="w-5 h-5 text-gray-500" />
                      : <ChevronRight className="w-5 h-5 text-gray-500" />
                    }
                  </div>
                </button>

                {expanded === group.region && (
                  <div className="border-t border-current/20 bg-white">
                    <table className="w-full">
                      <thead><tr className="border-b border-gray-100 bg-gray-50">
                        {['Order #', 'Customer', 'Address', 'Items', 'Total', 'Status'].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider p-3">{h}</th>
                        ))}
                      </tr></thead>
                      <tbody className="divide-y divide-gray-50">
                        {group.orders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs font-bold text-water-600">{order.order_number}</td>
                            <td className="p-3">
                              <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                              <div className="text-xs text-gray-400">{order.customer_phone}</div>
                            </td>
                            <td className="p-3 text-xs text-gray-500 max-w-[160px]">{order.delivery_address}</td>
                            <td className="p-3 text-xs text-gray-600">{order.items.map(i => `${i.quantity}× ${i.product_name}`).join(', ')}</td>
                            <td className="p-3 text-sm font-bold text-gray-900">{formatCurrency(order.total)}</td>
                            <td className="p-3">
                              <span className={cn('text-xs font-bold px-2 py-1 rounded-full', ORDER_STATUS_COLORS[order.status])}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
