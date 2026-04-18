'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/components/SettingsProvider'

const navLinks = [
  { label: 'Products', href: '/products' },
  { label: 'Wholesale', href: '/products#wholesale' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<{ role: string } | null>(null)
  const pathname = usePathname()
  const s = useSettings()
  const isHome = pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user) })
      .catch(() => {})
  }, [])

  const dark = scrolled || !isHome

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      dark ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img
              src="https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png"
              alt="Chico Water Logo"
              className="w-10 h-10 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="flex flex-col leading-none">
              <span className={cn(
                'font-bold text-base tracking-tight transition-colors',
                dark ? 'text-gray-900' : 'text-white'
              )}>
                {s.business_name?.split(' ')[0] || 'Chico Water'}
              </span>
              <span className="text-[10px] text-water-400 font-medium uppercase tracking-widest">Limited</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  dark ? 'text-gray-600 hover:text-water-600 hover:bg-water-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                )}>
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/complaints"
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  dark ? 'text-gray-600 hover:text-water-600 hover:bg-water-50' : 'text-white/80 hover:text-white hover:bg-white/10'
                )}>
                Complaints
              </Link>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/track" className={cn(
              'text-sm font-medium px-4 py-2 rounded-lg transition-colors',
              dark ? 'text-gray-600 hover:text-water-600' : 'text-white/80 hover:text-white'
            )}>
              Track Order
            </Link>
            <Link href="/auth/login" className={cn(
              'text-sm font-medium px-4 py-2 rounded-lg border transition-colors',
              dark
                ? 'border-gray-200 text-gray-700 hover:border-water-600 hover:text-water-600'
                : 'border-white/30 text-white hover:bg-white/10'
            )}>
              Sign In
            </Link>
            <Link href="/order"
              className="bg-water-600 hover:bg-water-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5">
              Order Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className={cn('lg:hidden p-2 rounded-lg', dark ? 'text-gray-700' : 'text-white')}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-water-600 hover:bg-water-50 rounded-xl font-medium text-sm transition-colors">
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/complaints" onClick={() => setOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:text-water-600 hover:bg-water-50 rounded-xl font-medium text-sm transition-colors">
                Complaints
              </Link>
            )}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link href="/track" onClick={() => setOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium">
                Track Order
              </Link>
              <Link href="/auth/login" onClick={() => setOpen(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium">
                Sign In
              </Link>
              <Link href="/order" onClick={() => setOpen(false)}
                className="block text-center bg-water-600 text-white px-4 py-3 rounded-xl text-sm font-semibold">
                Order Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}