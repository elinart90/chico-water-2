'use client'
import Link from 'next/link'
import { ArrowRight, Home, Phone, ShoppingCart, Truck } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-water-900 via-water-800 to-water-600 flex items-center justify-center p-4">
      {/* Background circles */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-water-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative text-center max-w-lg w-full">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <img
            src="/logo.png"
            alt="Chico Water"
            className="w-12 h-12 object-contain"
            onError={(e) => {
              // Fallback to styled div if logo not found
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                const div = document.createElement('div')
                div.className = 'w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center'
                div.innerHTML = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6 10 4 14 4 16a8 8 0 0016 0c0-2-2-6-8-14z"/></svg>`
                parent.insertBefore(div, target)
              }
            }}
          />
          <div className="text-left">
            <div className="text-white font-bold text-lg leading-none">Chico Water</div>
            <div className="text-water-300 text-[10px] font-medium uppercase tracking-widest">Limited Company</div>
          </div>
        </div>

        {/* 404 content */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 mb-8">
          {/* Water drop illustration */}
          <div className="relative mb-6">
            <div className="text-[120px] leading-none select-none opacity-20 absolute inset-0 flex items-center justify-center">
              💧
            </div>
            <div className="relative z-10 py-4">
              <div className="text-8xl font-black text-white/30 leading-none">404</div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-white mb-3">
            This page ran dry.
          </h1>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            We couldn't find what you were looking for. The page may have moved, been removed, or the link might be incorrect. Let us point you in the right direction.
          </p>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { href: '/', label: 'Homepage', icon: Home },
              { href: '/order', label: 'Place an Order', icon: ShoppingCart },
              { href: '/track', label: 'Track Order', icon: Truck },
              { href: '/contact', label: 'Contact Us', icon: Phone },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-4 py-3 text-white text-sm font-medium transition-all hover:-translate-y-0.5 group"
              >
                <item.icon className="w-4 h-4 text-water-300 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white text-water-700 font-bold px-8 py-3.5 rounded-2xl hover:bg-water-50 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Back to Home
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Help text */}
        <p className="text-white/50 text-sm">
          Need help?{' '}
          <a
            href="https://wa.me/233200000000"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 hover:text-white underline underline-offset-2 transition-colors"
          >
            WhatsApp us
          </a>
          {' '}and we'll assist you right away.
        </p>
      </div>
    </div>
  )
}
