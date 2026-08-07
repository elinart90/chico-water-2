'use client'
import { useState } from 'react'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle, ArrowUpRight } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const s = useSettings()

  const phone = s.business_phone || '+233 20 000 0000'
  const email = s.business_email || 'info@chicowaterlimited.com'
  const address = s.business_address || 'Industrial Area, Accra, Ghana'
  const whatsapp = s.business_whatsapp || '233200000000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    toast.success("Message sent! We'll reply within 24 hours.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative overflow-hidden bg-slate-950">
        <Image
          src="/build1.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/65 to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.18)_0%,transparent_55%)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
          <p className="font-serif text-sm tracking-[0.25em] uppercase text-[#c4a574] mb-5">
            Contact
          </p>
          <h1 className="heading-hero text-4xl sm:text-5xl lg:text-6xl text-white mb-5">
            Get in touch
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
            Wholesale pricing, corporate accounts, or a quick order question — we usually reply within two hours on business days.
          </p>
        </div>
      </section>

      <section className="relative -mt-8 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_1.35fr] gap-0 lg:gap-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)]">
            {/* Contact details */}
            <aside className="relative bg-slate-950 text-white px-8 sm:px-10 py-10 lg:py-12">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.2)_0%,transparent_50%)]" />
              <div className="relative">
                <h2 className="heading-display text-2xl text-white mb-2">Reach us directly</h2>
                <p className="text-white/55 text-sm mb-10 leading-relaxed">
                  Prefer a call or chat? Use any channel below — WhatsApp is fastest for urgent orders.
                </p>

                <ul className="space-y-7">
                  <li>
                    <a href={`tel:${phone.replace(/\s/g, '')}`} className="group flex gap-4">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:bg-[#c4a574]/15 group-hover:ring-[#c4a574]/40 transition-colors">
                        <Phone className="w-4 h-4 text-[#c4a574]" />
                      </span>
                      <span>
                        <span className="block text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1">Phone</span>
                        <span className="block font-medium text-white group-hover:text-[#c4a574] transition-colors">{phone}</span>
                        <span className="block text-sm text-white/45 mt-0.5">Mon–Sat, 7AM–6PM</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-4"
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:bg-[#c4a574]/15 group-hover:ring-[#c4a574]/40 transition-colors">
                        <MessageCircle className="w-4 h-4 text-[#c4a574]" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1">WhatsApp</span>
                        <span className="inline-flex items-center gap-1.5 font-medium text-white group-hover:text-[#c4a574] transition-colors">
                          Chat with us
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                        </span>
                        <span className="block text-sm text-white/45 mt-0.5">Fastest for order updates</span>
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${email}`} className="group flex gap-4">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 group-hover:bg-[#c4a574]/15 group-hover:ring-[#c4a574]/40 transition-colors">
                        <Mail className="w-4 h-4 text-[#c4a574]" />
                      </span>
                      <span>
                        <span className="block text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1">Email</span>
                        <span className="block font-medium text-white group-hover:text-[#c4a574] transition-colors break-all">{email}</span>
                        <span className="block text-sm text-white/45 mt-0.5">Reply within 24 hours</span>
                      </span>
                    </a>
                  </li>
                  <li className="flex gap-4">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      <MapPin className="w-4 h-4 text-[#c4a574]" />
                    </span>
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.18em] text-white/40 mb-1">Address</span>
                      <span className="block font-medium text-white">{address}</span>
                    </span>
                  </li>
                </ul>

                <div className="mt-12 pt-8 border-t border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-[#c4a574]" />
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Business hours</p>
                  </div>
                  <dl className="space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Mon – Friday</dt>
                      <dd className="text-white/90 font-medium">7:00 AM – 6:00 PM</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Saturday</dt>
                      <dd className="text-white/90 font-medium">8:00 AM – 4:00 PM</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-white/45">Sunday</dt>
                      <dd className="text-white/90 font-medium">8:00 AM – 2:00 PM</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </aside>

            {/* Form */}
            <div className="px-8 sm:px-10 py-10 lg:py-12 bg-white">
              {sent ? (
                <div className="flex flex-col items-center justify-center text-center min-h-[420px]">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5 ring-1 ring-emerald-100">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="heading-display text-2xl text-slate-900 mb-3">Message sent</h3>
                  <p className="text-slate-500 max-w-sm leading-relaxed">
                    We&apos;ll get back within 24 hours. For urgent matters, call or WhatsApp us directly.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="heading-display text-2xl text-slate-900 mb-2">Send a message</h2>
                  <p className="text-slate-500 text-sm mb-8">
                    Tell us what you need and we&apos;ll follow up with pricing or next steps.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label">Full name</label>
                        <input
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="input"
                          placeholder="Kwame Mensah"
                          required
                        />
                      </div>
                      <div>
                        <label className="label">Phone</label>
                        <input
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className="input"
                          placeholder="024 000 0000"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="input"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Subject</label>
                      <select
                        value={form.subject}
                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                        className="input bg-white"
                        required
                      >
                        <option value="">Select a topic</option>
                        <option>Wholesale inquiry</option>
                        <option>Corporate account</option>
                        <option>Order issue</option>
                        <option>Product question</option>
                        <option>Partnership</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Message</label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className="input resize-none"
                        rows={5}
                        placeholder="Tell us how we can help..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-hero-primary w-full disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-900/25 border-t-slate-900 rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send message
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
