'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users, AlertCircle, BarChart3, Shield, Settings,
  LogOut, Droplets, ChevronRight, Loader, TrendingUp,
  Package, ShoppingBag, CheckCircle, Clock, XCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, cn } from '@/lib/utils'

type Stats = {
  totalUsers: number; totalOrders: number; openComplaints: number;
  totalRevenue: number; admins: number; salespersons: number; customers: number
}

type Complaint = {
  id: string; ticket_number: string; submitter_name: string; submitter_role: string;
  subject: string; category: string; priority: string; status: string; created_at: string
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalOrders: 0, openComplaints: 0,
    totalRevenue: 0, admins: 0, salespersons: 0, customers: 0,
  })
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [users, orders, complaints] = await Promise.all([
      supabase.from('users').select('id, role'),
      supabase.from('orders').select('id, total, status'),
      supabase.from('complaints').select('*').order('created_at', { ascending: false }).limit(8),
    ])

    const u = users.data || []
    const o = orders.data || []
    const c = complaints.data || []

    setStats({
      totalUsers: u.length,
      admins: u.filter((x: any) => x.role === 'admin').length,
      salespersons: u.filter((x: any) => x.role === 'salesperson').length,
      customers: u.filter((x: any) => x.role === 'customer').length,
      totalOrders: o.length,
      totalRevenue: o.filter((x: any) => x.status !== 'cancelled').reduce((s: number, x: any) => s + (x.total || 0), 0),
      openComplaints: c.filter((x: any) => x.status === 'open').length,
    })
    setRecentComplaints(c)
    setLoading(false)
  }

  const navItems = [
    { href: '/dashboard/super-admin', label: 'Overview', icon: BarChart3, active: true },
    { href: '/dashboard/super-admin/complaints', label: 'Complaints', icon: AlertCircle },
    { href: '/dashboard/super-admin/users', label: 'User Management', icon: Users },
    { href: '/dashboard/admin', label: 'Admin Dashboard', icon: Shield },
    { href: '/dashboard/admin/supply-chain', label: 'Supply Chain', icon: Package },
    { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img
              src="https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png"
              alt="Chico Water Logo"
              className="w-10 h-10 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base tracking-tight">Chico Water</span>
              <div className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Super Admin</div>
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
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 mb-1">
            <Droplets className="w-4 h-4" /> View Website
          </Link>
          <button onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/auth/login' }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-white/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">Super Admin Overview</h1>
          <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32"><Loader className="w-8 h-8 animate-spin text-gray-600" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Open Complaints', value: stats.openComplaints, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', urgent: stats.openComplaints > 0 },
              ].map(s => (
                <div key={s.label} className={cn('bg-white rounded-2xl border shadow-sm p-5', (s as any).urgent ? 'border-red-200' : 'border-gray-100')}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', s.bg)}>
                    <s.icon className={cn('w-5 h-5', s.color)} />
                  </div>
                  <div className="text-2xl font-black text-gray-900 mb-1">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* User breakdown */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">User Breakdown</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Customers', value: stats.customers, color: 'bg-blue-500' },
                    { label: 'Salespersons', value: stats.salespersons, color: 'bg-purple-500' },
                    { label: 'Admins', value: stats.admins, color: 'bg-orange-500' },
                  ].map(u => (
                    <div key={u.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{u.label}</span>
                        <span className="font-bold text-gray-900">{u.value}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full', u.color)}
                          style={{ width: `${stats.totalUsers > 0 ? (u.value / stats.totalUsers) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/super-admin/users"
                  className="mt-5 flex items-center justify-between text-sm font-semibold text-water-600 hover:text-water-700">
                  Manage users <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick links */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { href: '/dashboard/super-admin/complaints', icon: AlertCircle, label: 'View Complaints', desc: `${stats.openComplaints} open`, color: 'bg-red-50 text-red-600' },
                    { href: '/dashboard/super-admin/users', icon: Users, label: 'Manage Users', desc: `${stats.totalUsers} total`, color: 'bg-blue-50 text-blue-600' },
                    { href: '/dashboard/admin', icon: Shield, label: 'Admin Panel', desc: 'Orders & inventory', color: 'bg-purple-50 text-purple-600' },
                    { href: '/dashboard/admin/settings', icon: Settings, label: 'System Settings', desc: 'Configure platform', color: 'bg-gray-50 text-gray-600' },
                  ].map(a => (
                    <Link key={a.href} href={a.href}
                      className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', a.color)}>
                        <a.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{a.label}</p>
                        <p className="text-xs text-gray-400">{a.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent complaints */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Recent Complaints</h2>
                <Link href="/dashboard/super-admin/complaints" className="text-sm text-water-600 font-semibold flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              {recentComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">No complaints yet</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead><tr className="border-b border-gray-100 bg-gray-50">
                    {['Ticket', 'Submitted By', 'Subject', 'Priority', 'Status', 'Date'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider p-4">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentComplaints.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-4 font-mono text-sm font-bold text-water-600">{c.ticket_number}</td>
                        <td className="p-4">
                          <p className="text-sm font-medium text-gray-900">{c.submitter_name}</p>
                          <p className="text-xs text-gray-400 capitalize">{c.submitter_role}</p>
                        </td>
                        <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate">{c.subject}</td>
                        <td className="p-4"><span className={cn('text-xs font-bold px-2 py-1 rounded-full capitalize', PRIORITY_COLORS[c.priority])}>{c.priority}</span></td>
                        <td className="p-4"><span className={cn('text-xs font-bold px-2 py-1 rounded-full capitalize', STATUS_COLORS[c.status])}>{c.status.replace('_', ' ')}</span></td>
                        <td className="p-4 text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
