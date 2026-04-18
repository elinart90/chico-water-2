'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Loader, ChevronDown, ChevronUp, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

type Complaint = {
  id: string; ticket_number: string; submitter_name: string; submitter_email: string
  submitter_role: string; subject: string; category: string; description: string
  priority: string; status: string; resolution_note?: string
  resolved_at?: string; created_at: string
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
const CATEGORY_LABELS: Record<string, string> = {
  order_issue: 'Order Issue', delivery: 'Delivery', product_quality: 'Product Quality',
  staff_behaviour: 'Staff Behaviour', payment: 'Payment', system_bug: 'System Bug', other: 'Other',
}

export default function SuperAdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [resolving, setResolving] = useState<string | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadComplaints() }, [])

  const loadComplaints = async () => {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false })
    setComplaints(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string, note?: string) => {
    setUpdating(id)
    const res = await fetch(`/api/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolution_note: note }),
    })
    if (res.ok) {
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, resolution_note: note } : c))
      toast.success(`Complaint marked as ${status.replace('_', ' ')}`)
      setResolving(null)
      setResolutionNote('')
    } else {
      toast.error('Failed to update complaint')
    }
    setUpdating(null)
  }

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter)
  const counts = {
    all: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    closed: complaints.filter(c => c.status === 'closed').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/super-admin" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900">Complaints</h1>
            <p className="text-gray-500 text-sm">Manage and resolve all user complaints</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Object.entries(counts).map(([key, val]) => (
            <button key={key} onClick={() => setFilter(key as typeof filter)}
              className={cn('bg-white rounded-2xl border shadow-sm p-4 text-left transition-all',
                filter === key ? 'border-water-600 ring-2 ring-water-100' : 'border-gray-100 hover:border-gray-200')}>
              <div className="text-2xl font-black text-gray-900">{val}</div>
              <div className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</div>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader className="w-8 h-8 animate-spin text-gray-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-bold text-gray-900">No complaints in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(complaint => (
              <div key={complaint.id} className={cn(
                'bg-white rounded-2xl border-2 shadow-sm overflow-hidden',
                complaint.status === 'open' ? 'border-yellow-200' :
                complaint.status === 'in_progress' ? 'border-blue-200' :
                complaint.status === 'resolved' ? 'border-green-200' : 'border-gray-100'
              )}>
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-black text-water-600 text-sm">{complaint.ticket_number}</span>
                        <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full capitalize', STATUS_COLORS[complaint.status])}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full capitalize', PRIORITY_COLORS[complaint.priority])}>
                          {complaint.priority}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {CATEGORY_LABELS[complaint.category] || complaint.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{complaint.subject}</h3>
                      <p className="text-sm text-gray-500">
                        From: {complaint.submitter_name} ({complaint.submitter_email}) ·
                        <span className="capitalize ml-1">{complaint.submitter_role}</span> ·
                        {' '}{new Date(complaint.created_at).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <button onClick={() => setExpanded(expanded === complaint.id ? null : complaint.id)}
                      className="text-gray-400 hover:text-gray-600">
                      {expanded === complaint.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === complaint.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs text-gray-500 font-medium mb-1">Full description</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{complaint.description}</p>
                    </div>

                    {complaint.resolution_note && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <p className="text-xs font-bold text-green-800 mb-1">Resolution note</p>
                        <p className="text-sm text-green-700">{complaint.resolution_note}</p>
                      </div>
                    )}

                    {/* Resolve form */}
                    {resolving === complaint.id && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-blue-800">Resolution note (optional)</p>
                          <button onClick={() => setResolving(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                        </div>
                        <textarea value={resolutionNote} onChange={e => setResolutionNote(e.target.value)}
                          className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          rows={3} placeholder="Describe how this was resolved..." />
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => updateStatus(complaint.id, 'resolved', resolutionNote)} disabled={updating === complaint.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg disabled:opacity-60">
                            {updating === complaint.id ? 'Saving...' : '✓ Mark Resolved'}
                          </button>
                          <button onClick={() => updateStatus(complaint.id, 'closed', resolutionNote)} disabled={updating === complaint.id}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-xs font-bold py-2 rounded-lg disabled:opacity-60">
                            Close Ticket
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    {complaint.status !== 'resolved' && complaint.status !== 'closed' && resolving !== complaint.id && (
                      <div className="flex gap-2 flex-wrap">
                        {complaint.status === 'open' && (
                          <button onClick={() => updateStatus(complaint.id, 'in_progress')} disabled={updating === complaint.id}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-60">
                            <Clock className="w-3.5 h-3.5" /> Mark In Progress
                          </button>
                        )}
                        <button onClick={() => setResolving(complaint.id)}
                          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolve
                        </button>
                        <button onClick={() => updateStatus(complaint.id, 'closed')} disabled={updating === complaint.id}
                          className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-60">
                          <X className="w-3.5 h-3.5" /> Close
                        </button>
                      </div>
                    )}
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
