'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CATEGORIES = [
  { value: 'order_issue', label: 'Order Issue', desc: 'Problem with an existing order' },
  { value: 'delivery', label: 'Delivery Problem', desc: 'Late, missing, or damaged delivery' },
  { value: 'product_quality', label: 'Product Quality', desc: 'Water quality or packaging issue' },
  { value: 'staff_behaviour', label: 'Staff Behaviour', desc: 'Complaint about a staff member' },
  { value: 'payment', label: 'Payment Issue', desc: 'Billing or payment problem' },
  { value: 'system_bug', label: 'System / App Bug', desc: 'Something not working on the website' },
  { value: 'other', label: 'Other', desc: 'Any other complaint or feedback' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', desc: 'Not urgent', color: 'border-gray-200 bg-gray-50 text-gray-700' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention', color: 'border-blue-200 bg-blue-50 text-blue-700' },
  { value: 'high', label: 'High', desc: 'Urgent matter', color: 'border-orange-200 bg-orange-50 text-orange-700' },
  { value: 'urgent', label: 'Urgent', desc: 'Critical issue', color: 'border-red-200 bg-red-50 text-red-700' },
]

export default function ComplaintsPage() {
  const [form, setForm] = useState({
    subject: '',
    category: '',
    description: '',
    priority: 'medium',
  })
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.category) { toast.error('Please select a category'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitted(data.ticket_number)
      } else if (res.status === 401) {
        toast.error('You must be logged in to submit a complaint')
        window.location.href = '/auth/login?redirect=/complaints'
      } else {
        toast.error(data.message || 'Failed to submit complaint')
      }
    } catch {
      toast.error('Network error — please try again')
    }
    setSaving(false)
  }

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Complaint Submitted</h2>
        <p className="text-gray-500 mb-6">Your complaint has been logged and will be reviewed by our team. We'll follow up as soon as possible.</p>
        <div className="bg-water-50 border border-water-100 rounded-2xl p-5 mb-8">
          <p className="text-sm text-gray-500 mb-1">Your ticket number</p>
          <p className="text-2xl font-black text-water-600">{submitted}</p>
          <p className="text-xs text-gray-400 mt-2">Keep this for reference</p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => { setSubmitted(null); setForm({ subject: '', category: '', description: '', priority: 'medium' }) }}
            className="btn-primary w-full">
            Submit Another
          </button>
          <Link href="/" className="btn-secondary w-full block text-center">Back to Home</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">

          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Submit a Complaint</h1>
            <p className="text-gray-500">Something went wrong? Let us know and we'll fix it.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              You must be <Link href="/auth/login?redirect=/complaints" className="font-bold underline">signed in</Link> to submit a complaint. Your name and contact will be pulled from your account automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Category */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">What is this about? *</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                    className={cn(
                      'text-left p-4 rounded-xl border-2 transition-all',
                      form.category === cat.value
                        ? 'border-water-600 bg-water-50'
                        : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                    )}>
                    <p className={cn('font-semibold text-sm', form.category === cat.value ? 'text-water-700' : 'text-gray-900')}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject + Priority */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="label">Subject *</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="input" placeholder="Brief title of your complaint"
                  required />
              </div>

              <div>
                <label className="label">Priority</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                  {PRIORITIES.map(p => (
                    <button key={p.value} type="button"
                      onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        form.priority === p.value ? p.color + ' border-current' : 'border-gray-100 bg-gray-50'
                      )}>
                      <p className="font-bold text-sm">{p.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input resize-none" rows={5}
                  placeholder="Describe your issue in detail. Include order numbers, dates, or any other relevant information."
                  required />
              </div>
            </div>

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-water-600 hover:bg-water-700 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-60 text-base">
              {saving
                ? <><Loader className="w-5 h-5 animate-spin" /> Submitting...</>
                : <><Send className="w-5 h-5" /> Submit Complaint</>}
            </button>

            <p className="text-center text-xs text-gray-400">
              All complaints are reviewed within 24 hours. For urgent issues call{' '}
              <a href="tel:+233200000000" className="text-water-600 font-medium">+233 20 000 0000</a>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
