'use client'
import Link from 'next/link'
import { Droplets, Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'

export default function Footer() {
  const s = useSettings()
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5">
            <img 
              src="https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png"
              alt="Chico Water Logo"
              className="w-12 h-12 object-contain"
            />
            <div className="text-left">
              <div className="text-white font-bold text-xl">Chico Water</div>
              <div className="text-water-200 text-xs font-medium uppercase tracking-widest">Limited</div>
            </div>
          </Link>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">{s.business_tagline_2 || "Ghana's premier water supplier."}</p>
            <a href={`https://wa.me/${s.business_whatsapp || '233200000000'}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
              <MessageCircle className="w-4 h-4" /> WhatsApp Us
            </a>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[{ label: 'Products', href: '/products' }, { label: 'Place an Order', href: '/order' }, { label: 'Track Your Order', href: '/track' }, { label: 'Wholesale Inquiry', href: '/order?segment=wholesale' }, { label: 'About Us', href: '/about' }].map(link => (
                <li key={link.href}><Link href={link.href} className="text-sm hover:text-water-400 transition-colors">{link.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Our Products</h4>
            <ul className="space-y-2.5">
              {['Bottled Water (500ml)', 'Bottled Water (1L)', 'Bottled Water (1.5L)', 'Sachet Water (Per Bag)', 'Sachet Water (Crate)', 'Empty Bottles'].map(p => (
                <li key={p}><Link href="/products" className="text-sm hover:text-water-400 transition-colors">{p}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-water-400 mt-0.5 shrink-0" /><span className="text-sm">{s.business_address || 'Industrial Area, Accra, Ghana'}</span></li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 text-water-400 shrink-0" /><a href={`tel:${s.business_phone}`} className="text-sm hover:text-water-400">{s.business_phone || '+233200000000'}</a></li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 text-water-400 shrink-0" /><a href={`mailto:${s.business_email}`} className="text-sm hover:text-water-400">{s.business_email || 'orders@chicowater.com'}</a></li>
            </ul>
            <div className="mt-5 pt-5 border-t border-gray-800">
              <p className="text-xs text-gray-600 mb-2">Delivery hours</p>
              <p className="text-sm">Mon – Sat: {s.delivery_hours_open || '7:00 AM'} – {s.delivery_hours_close || '6:00 PM'}</p>
              <p className="text-sm">Sun: 8:00 AM – {s.delivery_sunday_close || '2:00 PM'}</p>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} {s.business_name || 'Chico Water Limited Company'}. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <Link href="/privacy" className="hover:text-water-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-water-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
