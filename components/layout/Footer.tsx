'use client'
import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'

export default function Footer() {
  const s = useSettings()
  const whatsappUrl = `https://wa.me/${s.business_whatsapp || '233200000000'}`

  return (
    <footer className="relative bg-slate-950 text-slate-400 overflow-hidden">
      <div className="absolute inset-0 bg-mesh-dark pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-water-500/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3 mb-5">
              <img src="/firstlogo.png" alt="Chico Water" className="h-14 w-auto brightness-0 invert opacity-90" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 mb-6 max-w-sm">
              {s.business_tagline_2 || "Ghana's premier water supplier — pure, reliable, and delivered nationwide."}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all hover:shadow-glow"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-5 tracking-wide">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Products', href: '/products' },
                { label: 'Place an Order', href: '/order' },
                { label: 'Track Your Order', href: '/track' },
                { label: 'Wholesale Inquiry', href: '/order?segment=wholesale' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-500 hover:text-water-400 transition-colors inline-flex items-center gap-1 group">
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold text-sm mb-5 tracking-wide">Our Products</h4>
            <ul className="space-y-3">
              {['Bottled Water (500ml)', 'Bottled Water (1L)', 'Bottled Water (1.5L)', 'Sachet Water (Per Bag)', 'Sachet Water (Crate)', 'Empty Bottles'].map(p => (
                <li key={p}>
                  <Link href="/products" className="text-sm text-slate-500 hover:text-water-400 transition-colors">{p}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-white font-semibold text-sm mb-5 tracking-wide">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-water-400" />
                </div>
                <span className="text-sm text-slate-500 pt-1.5">{s.business_address || 'Industrial Area, Accra, Ghana'}</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-water-400" />
                </div>
                <a href={`tel:${s.business_phone}`} className="text-sm hover:text-water-400 transition-colors">
                  {s.business_phone || '+233200000000'}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-water-400" />
                </div>
                <a href={`mailto:${s.business_email}`} className="text-sm hover:text-water-400 transition-colors">
                  {s.business_email || 'info@chicowaterlimited.com'}
                </a>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider font-medium">Delivery hours</p>
              <p className="text-sm text-slate-500">Mon – Sat: {s.delivery_hours_open || '7:00 AM'} – {s.delivery_hours_close || '6:00 PM'}</p>
              <p className="text-sm text-slate-500">Sun: 8:00 AM – {s.delivery_sunday_close || '2:00 PM'}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} {s.business_name || 'Chico Water Limited Company'}. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/privacy" className="text-slate-600 hover:text-water-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-slate-600 hover:text-water-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
