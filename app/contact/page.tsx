'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const s = useSettings()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    toast.success("Message sent! We'll reply within 24 hours.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-br from-water-900 to-water-700 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-tag bg-white/10 text-white border border-white/20 mb-4">Contact Us</div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">Get in touch</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Questions about pricing, wholesale, or corporate accounts? We respond within 2 hours on business days.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="space-y-5">
            {[
              { icon: Phone, label: 'Phone', value: s.business_phone || '+233 20 000 0000', href: `tel:${s.business_phone}`, sub: 'Mon–Sat, 7AM–6PM' },
              { icon: MessageCircle, label: 'WhatsApp', value: 'WhatsApp Us', href: `https://wa.me/${s.business_whatsapp || '233200000000'}`, sub: 'Fast response guaranteed' },
              { icon: Mail, label: 'Email', value: s.business_email || 'orders@chicowater.com', href: `mailto:${s.business_email}`, sub: 'Response within 24h' },
              { icon: MapPin, label: 'Address', value: s.business_address || 'Industrial Area, Accra, Ghana', href: '#', sub: '' },
            ].map(item => (
              <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                className="card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-all group">
                <div className="w-12 h-12 bg-water-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-water-600 transition-colors">
                  <item.icon className="w-5 h-5 text-water-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
                  {item.sub && <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>}
                </div>
              </a>
            ))}
            <div className="card p-5 bg-gray-50">
              <div className="flex items-center gap-2 mb-3"><Clock className="w-4 h-4 text-water-600" /><p className="font-semibold text-gray-900 text-sm">Business Hours</p></div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Mon – Fri</span><span className="font-medium">{s.delivery_hours_open || '7:00 AM'} – {s.delivery_hours_close || '6:00 PM'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Saturday</span><span className="font-medium">{s.delivery_hours_open || '8:00 AM'} – {s.delivery_hours_close || '4:00 PM'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Sunday</span><span className="font-medium">8:00 AM – {s.delivery_sunday_close || '2:00 PM'}</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 card p-8">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-600" /></div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Message sent!</h3>
                <p className="text-gray-500">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-6">Send us a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div><label className="label">Full Name</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Kwame Mensah" required /></div>
                    <div><label className="label">Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="024 000 0000" /></div>
                  </div>
                  <div><label className="label">Email</label><input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" placeholder="you@example.com" required /></div>
                  <div>
                    <label className="label">Subject</label>
                    <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input bg-white" required>
                      <option value="">Select a topic</option>
                      <option>Wholesale inquiry</option>
                      <option>Corporate account</option>
                      <option>Order issue</option>
                      <option>Product question</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div><label className="label">Message</label><textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="input resize-none" rows={5} placeholder="Tell us how we can help..." required /></div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-4 disabled:opacity-60">
                    {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
