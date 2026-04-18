'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Droplets, Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { CustomerSegment } from '@/types'

const segments: { id: CustomerSegment; label: string }[] = [
  // { id: 'household', label: 'Household' }, 
  { id: 'retail', label: 'Retail' },
  { id: 'wholesale', label: 'Wholesale' }, 
  { id: 'corporate', label: 'Corporate' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', segment: 'household' as CustomerSegment })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Account created! Welcome to Chico Water.')
        router.push('/dashboard/customer')
      } else {
        toast.error(data.message || 'Registration failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-water-900 via-water-800 to-water-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img 
              src="https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png"
              alt="Chico Water Logo"
              className="w-10 h-10 object-contain"
            />
            <div className="text-left">
              <div className="text-white font-bold text-xl">Chico Water</div>
              <div className="text-water-200 text-xs font-medium uppercase tracking-widest">Limited</div>
            </div>
          </Link>
          <p className="text-white/60 text-sm mt-4">Create your account</p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h1 className="text-2xl font-black text-gray-900 mb-6">Get started</h1>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input pl-10" placeholder="Kwame Mensah" required /></div>
            </div>
            <div>
              <label className="label">Email</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input pl-10" placeholder="you@example.com" required /></div>
            </div>
            <div>
              <label className="label">Phone Number</label>
              <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input pl-10" placeholder="024 000 0000" required /></div>
            </div>
            <div>
              <label className="label">Customer Type</label>
              <div className="grid grid-cols-2 gap-2">
                {segments.map(seg => (
                  <button type="button" key={seg.id} onClick={() => setForm(f => ({ ...f, segment: seg.id }))}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.segment === seg.id ? 'border-water-600 bg-water-50 text-water-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {seg.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={show ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input pl-10 pr-12" placeholder="Min. 8 characters" minLength={8} required />
                <button type="button" onClick={() => setShow(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-60 mt-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Already have an account? <Link href="/auth/login" className="text-water-600 font-semibold hover:underline">Sign in</Link></p>
          </div>
        </div>
        <div className="text-center mt-6">
          <Link href="/" className="text-white/50 text-sm hover:text-white/80 transition-colors">← Back to website</Link>
        </div>
      </div>
    </div>
  )
}
