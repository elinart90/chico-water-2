'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, Loader, Shield, Search, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type User = {
  id: string; name: string; email: string; phone?: string
  role: string; segment?: string; created_at: string
}

const ROLES = ['customer', 'salesperson', 'admin', 'super_admin']

const ROLE_COLORS: Record<string, string> = {
  customer: 'bg-blue-100 text-blue-700',
  salesperson: 'bg-purple-100 text-purple-700',
  admin: 'bg-orange-100 text-orange-700',
  super_admin: 'bg-red-100 text-red-700',
  driver: 'bg-green-100 text-green-700',
}

export default function SuperAdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)
  const [changingRole, setChangingRole] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email, phone, role, segment, created_at')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const updateRole = async (id: string, role: string) => {
    setUpdating(id)
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
      toast.success('Role updated successfully')
      setChangingRole(null)
    } else {
      toast.error('Failed to update role')
    }
    setUpdating(null)
  }

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) return
    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.id !== id))
      toast.success('User deleted')
    } else {
      const d = await res.json()
      toast.error(d.message || 'Failed to delete user')
    }
  }

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  const counts = ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<string, number>)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/super-admin" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900">User Management</h1>
            <p className="text-gray-500 text-sm">{users.length} total users — manage roles and access</p>
          </div>
        </div>

        {/* Role summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {ROLES.map(role => (
            <button key={role} onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
              className={cn('bg-white rounded-2xl border shadow-sm p-4 text-left transition-all',
                roleFilter === role ? 'border-water-600 ring-2 ring-water-100' : 'border-gray-100 hover:border-gray-200')}>
              <div className="text-2xl font-black text-gray-900">{counts[role] || 0}</div>
              <div className={cn('text-xs font-semibold px-2 py-0.5 rounded-full capitalize inline-block mt-1', ROLE_COLORS[role])}>
                {role.replace('_', ' ')}
              </div>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
            placeholder="Search by name or email..." />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 text-xs">Clear</button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-gray-600" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider p-4">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-water-400 to-water-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{user.email}</td>
                    <td className="p-4">
                      {changingRole === user.id ? (
                        <div className="flex items-center gap-2">
                          <select defaultValue={user.role}
                            onChange={e => updateRole(user.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-water-600 bg-white"
                            disabled={updating === user.id}>
                            {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                            <option value="driver">driver</option>
                          </select>
                          <button onClick={() => setChangingRole(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setChangingRole(user.id)}
                          className={cn('flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize cursor-pointer hover:opacity-80 transition-opacity', ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-600')}>
                          {user.role.replace('_', ' ')} <ChevronDown className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <button onClick={() => deleteUser(user.id, user.name)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
