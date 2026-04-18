'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Droplets, Package, CheckCircle, Truck, Clock, Shield, Star, ChevronRight, Phone, MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useSettings } from '@/components/SettingsProvider'
import { Product } from '@/types'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start || !target) return
    let startTime: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      setCount(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

const segments = [
  {
    id: 'retail',
    label: 'Retail',
    icon: '🏪',
    desc: 'Perfect for shops, kiosks, and resellers looking for reliable stock.',
    color: 'from-green-50 to-emerald-100',
    border: 'border-green-200',
    tag: 'text-green-700 bg-green-100',
  },
  {
    id: 'wholesale',
    label: 'Wholesale',
    icon: '📦',
    desc: 'Bulk orders at the best rates. Ideal for distributors and large buyers.',
    color: 'from-water-50 to-blue-100',
    border: 'border-water-300',
    tag: 'text-water-700 bg-water-100',
    featured: true,
  },
  {
    id: 'corporate',
    label: 'Corporate',
    icon: '🏢',
    desc: 'Dedicated supply for offices, institutions, and company accounts.',
    color: 'from-purple-50 to-violet-100',
    border: 'border-purple-200',
    tag: 'text-purple-700 bg-purple-100',
  },
]

const features = [
  { icon: Truck, title: 'Same-Day Delivery', desc: 'Order before 12PM, delivered same day across Greater Accra.' },
  { icon: Shield, title: 'Quality Assured', desc: 'Every batch tested and certified for purity and safety.' },
  { icon: Clock, title: 'Real-Time Tracking', desc: 'Follow your order from warehouse to your door.' },
  { icon: CheckCircle, title: 'Flexible Payment', desc: 'MTN MoMo, Vodafone Cash, AirtelTigo, card, or cash.' },
]

const testimonials = [
  { name: 'Kwame Mensah', role: 'Wholesale buyer, Tema', text: 'Chico Water has been our supplier for 2 years. Consistent quality, on-time delivery, no complaints.', stars: 5 },
  { name: 'Emmanuel K.', role: 'Store owner, Kumasi', text: "Sachet water crates arrive sealed and on time. Better pricing than any other supplier I've tried.", stars: 5 },
  { name: 'Abena Owusu', role: 'Office Manager, Accra', text: 'Our corporate account is seamless. One call and water is here. The team is professional and reliable.', stars: 5 },
]

export default function HomePage() {
  const s = useSettings()
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  const orders = useCountUp(parseInt(s.home_stats_orders || '50000'), 2200, statsVisible)
  const customers = useCountUp(parseInt(s.home_stats_customers || '12000'), 2000, statsVisible)
  const regions = useCountUp(parseInt(s.home_stats_regions || '16'), 1800, statsVisible)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => { if (d.products) setProducts(d.products.slice(0, 3)) })
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen bg-gradient-to-br from-water-900 via-water-800 to-water-600 flex items-center overflow-hidden">
        <div className="absolute top-20 right-10 w-96 h-96 bg-water-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5 mb-8">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/90 text-sm font-medium">Now delivering across all 16 regions</span>
              </div>
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
                {s.home_hero_title || 'Inspire Natural Mineral Water'}
              </h1>
              <p className="text-white/70 text-lg lg:text-xl leading-relaxed mb-10 max-w-lg">
                {'Bottled water, sachet water, and packaging solutions — for businesses, and wholesale buyers.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/order" className="inline-flex items-center justify-center gap-2 bg-white text-water-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-water-50 transition-all hover:shadow-2xl hover:-translate-y-1">
                  Order Now <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/products" className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-base hover:bg-white/20 transition-all">
                  View Products
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['KM','AO','EK','BT'].map((init, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-water-400 to-water-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">{init}</div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 text-sm">{'★★★★★'}</div>
                  <p className="text-white/60 text-sm">Trusted by {parseInt(s.home_stats_customers || '12000').toLocaleString()}+ customers</p>
                </div>
              </div>
            </div>

            {/* Hero card */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl transform translate-x-4 translate-y-4" />
                <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 animate-float">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-white/60 text-sm">Latest order</p>
                      <p className="text-white font-bold text-lg">CW-10422</p>
                    </div>
                    <div className="bg-green-400/20 text-green-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-400/30">In Transit</div>
                  </div>
                  <div className="space-y-3 mb-6">
                    {[{ label: 'Customer', value: 'Abena Owusu' }, { label: 'Items', value: '24× 500ml + 3 bags sachet' }, { label: 'Total', value: 'GH₵ 99.00' }, { label: 'ETA', value: 'Today, 3:30 PM' }].map(r => (
                      <div key={r.label} className="flex justify-between text-sm">
                        <span className="text-white/50">{r.label}</span>
                        <span className="text-white font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
                    <div className="w-9 h-9 bg-water-500 rounded-full flex items-center justify-center"><Truck className="w-4 h-4 text-white" /></div>
                    <div>
                      <p className="text-white text-sm font-medium">Kojo (Driver)</p>
                      <p className="text-white/50 text-xs">3.2 km away</p>
                    </div>
                    <a href={`tel:${s.business_phone || '+233200000000'}`} className="ml-auto bg-white/10 border border-white/20 text-white text-xs px-3 py-1.5 rounded-lg">Call</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none"><path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="#f9fafb" /></svg>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: orders.toLocaleString() + '+', label: 'Orders fulfilled', icon: CheckCircle },
              { value: customers.toLocaleString() + '+', label: 'Happy customers', icon: Star },
              { value: regions.toString(), label: 'Regions covered', icon: MapPin },
              { value: s.business_founded || '2008', label: 'Year established', icon: Droplets },
            ].map(stat => (
              <div key={stat.label} className="card p-6 text-center">
                <stat.icon className="w-6 h-6 text-water-600 mx-auto mb-3" />
                <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEGMENTS */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Who We Serve</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Choose your category</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">Tailored pricing and service for every type of customer.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {segments.map(seg => (
              <Link key={seg.id} href={`/order?segment=${seg.id}`}
                className={`group relative flex flex-col rounded-3xl border-2 ${seg.border} overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-sm hover:shadow-xl`}>
                {seg.featured && (
                  <div className="absolute top-4 right-4 bg-water-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                    Best Rates
                  </div>
                )}
                {/* Colored top banner */}
                <div className={`bg-gradient-to-br ${seg.color} h-36 flex items-center justify-center text-6xl`}>
                  {seg.icon}
                </div>
                {/* Content */}
                <div className="flex-1 bg-white p-6 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-black text-gray-900 text-xl">{seg.label}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${seg.tag}`}>
                      {seg.id}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{seg.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-water-600 text-sm font-bold group-hover:underline underline-offset-2">
                      Order now
                    </span>
                    <div className="w-8 h-8 rounded-full bg-water-600 flex items-center justify-center group-hover:bg-water-700 transition-colors">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-8">
            Are you a household customer?{' '}
            <Link href="/order?segment=household" className="text-water-600 font-semibold hover:underline">
              Order here →
            </Link>
          </p>
        </div>
      </section>

      {/* PRODUCTS */}
      {products.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-14">
              <div>
                <div className="section-tag mb-4">Our Products</div>
                <h2 className="text-4xl font-black text-gray-900">Pure water, every form.</h2>
              </div>
              <Link href="/products" className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-water-600 font-semibold hover:gap-3 transition-all">
                View all products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(product => (
                <div key={product.id} className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-48 flex items-center justify-center text-7xl ${product.category === 'bottled' ? 'bg-gradient-to-br from-blue-50 to-cyan-100' : product.category === 'sachet' ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-amber-50 to-yellow-100'}`}>
                    {product.category === 'bottled' ? '💧' : product.category === 'sachet' ? '🛍️' : '🫙'}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{product.name}</h3>
                      <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-lg ml-2 shrink-0">{product.size}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400">from</span>
                        <div className="text-xl font-black text-water-600">{formatCurrency(product.price_wholesale)}</div>
                        <span className="text-xs text-gray-400">per {product.unit}</span>
                      </div>
                      <Link href={`/order?product=${product.id}`} className="bg-water-600 hover:bg-water-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">Order →</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Why Chico Water</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Built for Ghana</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(f => (
              <div key={f.title} className="card p-6">
                <div className="w-12 h-12 bg-water-50 rounded-xl flex items-center justify-center mb-4"><f.icon className="w-6 h-6 text-water-600" /></div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACK CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-water-600 rounded-2xl flex items-center justify-center shrink-0"><Truck className="w-8 h-8 text-white" /></div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-black text-gray-900 mb-1">Track your order</h3>
                <p className="text-gray-500">Enter your Order ID to see real-time delivery status.</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <input placeholder="e.g. CW-10422" className="input flex-1 sm:w-48"
                  onKeyDown={e => { if (e.key === 'Enter') window.location.href = `/track?id=${(e.target as HTMLInputElement).value}` }} />
                <Link href="/track" className="btn-primary whitespace-nowrap">Track →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-water-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-white mb-4">What our customers say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6">
                <div className="flex text-yellow-400 text-sm mb-4">{'★'.repeat(t.stars)}</div>
                <p className="text-white/80 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/50 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-r from-water-600 to-water-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-5">Ready to order?</h2>
          <p className="text-white/70 text-lg mb-10">Join thousands of Ghanaians who trust Chico Water every day.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="inline-flex items-center justify-center gap-2 bg-white text-water-700 font-bold px-10 py-4 rounded-2xl text-lg hover:bg-water-50 transition-all hover:shadow-2xl hover:-translate-y-1">
              Place an Order <ArrowRight className="w-5 h-5" />
            </Link>
            <a href={`https://wa.me/${s.business_whatsapp || '233200000000'}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-10 py-4 rounded-2xl text-lg hover:bg-white/20 transition-all">
              <Phone className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}