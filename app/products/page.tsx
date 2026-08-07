'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Filter, Search, ArrowRight, ChevronDown, Package } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ProductMedia from '@/components/ProductMedia'
import { formatCurrency } from '@/lib/utils'
import { Product, CustomerSegment } from '@/types'
import toast from 'react-hot-toast'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'bottled', label: 'Bottled Water' },
  { id: 'sachet', label: 'Sachet Water' },
  { id: 'empty_bottle', label: 'Bottle' },
]

const segments: { id: CustomerSegment; label: string }[] = [
  { id: 'retail', label: 'Retail' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'corporate', label: 'Corporate' },
]

function getPriceForSegment(product: Product, segment: CustomerSegment) {
  const map = { household: product.price_household, retail: product.price_retail, wholesale: product.price_wholesale, corporate: product.price_corporate }
  return map[segment]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [segment, setSegment] = useState<CustomerSegment>('retail')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => { if (d.products) setProducts(d.products) })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    (category === 'all' || p.category === category) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
  )

  const categoryLabel = categories.find(c => c.id === category)?.label ?? 'All'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950">
        <Image
          src="/chi1.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-40"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/75 to-slate-950" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-14 text-center">
          <p className="text-slate-300 text-lg max-w-xl mx-auto leading-relaxed">
            Select your customer type to see your pricing tier. Bulk orders always get the best rates.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filters — in document flow (no sticky overlap) */}
        <div className="relative z-20 -mt-10 mb-10">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-medium p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="input pl-10 h-11"
                  />
                </div>
                <div className="relative sm:w-52 shrink-0">
                  <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                  <select
                    id="category-filter"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="input appearance-none pr-10 h-11 cursor-pointer font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:shrink-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-water-600" /> Customer type
                </span>
                <div className="flex gap-2 flex-wrap">
                  {segments.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSegment(s.id)}
                      className={segment === s.id ? 'segment-pill segment-pill-active py-2 px-4 text-sm' : 'segment-pill segment-pill-inactive py-2 px-4 text-sm'}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
              <span>
                Showing <strong className="text-slate-800">{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
                {category !== 'all' && <> in <strong className="text-slate-800">{categoryLabel}</strong></>}
              </span>
              <span className="text-water-600 font-medium">{segments.find(s => s.id === segment)?.label} pricing</span>
            </div>
          </div>
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 card p-12">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="heading-display text-xl text-slate-700">No products found</p>
            <p className="text-sm text-slate-500 mt-2">Try a different category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => {
              const price = getPriceForSegment(product, segment)
              const isLowStock = product.stock < 100
              return (
                <article key={product.id} className="card-interactive overflow-hidden group flex flex-col">
                  <div className={`h-44 sm:h-48 relative overflow-hidden shrink-0 ${
                    product.category === 'bottled' ? 'bg-slate-100' :
                    product.category === 'sachet' ? 'bg-emerald-50' :
                    'bg-amber-50'
                  }`}>
                    <ProductMedia
                      product={product}
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                    {isLowStock && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 uppercase tracking-wide">
                        Low Stock
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display font-bold text-slate-900 text-base leading-snug">{product.name}</h3>
                      <span className="product-badge shrink-0">{product.size}</span>
                    </div>
                    <p className="text-slate-500 text-xs mb-4 leading-relaxed line-clamp-2">{product.description}</p>

                    <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1.5 border border-slate-100 mt-auto">
                      {segments.map(s => (
                        <div
                          key={s.id}
                          className={`flex justify-between text-xs ${s.id === segment ? 'font-semibold text-water-600' : 'text-slate-500'}`}
                        >
                          <span>{s.label}</span>
                          <span>{formatCurrency(getPriceForSegment(product, s.id))}/{product.unit}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-2xl font-display font-bold text-water-600">{formatCurrency(price)}</span>
                        <span className="text-xs text-slate-400">/{product.unit}</span>
                      </div>
                      <Link
                        href={`/order?product=${product.id}&segment=${segment}`}
                        className="btn-primary text-xs px-4 py-2.5"
                      >
                        Order
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        <div className="mt-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-water-700 via-water-800 to-slate-950 p-10 lg:p-14 text-center">
          <div className="absolute inset-0 bg-mesh-hero opacity-40 pointer-events-none" />
          <div className="relative">
            <h2 className="heading-display text-3xl text-white mb-3">Need a bulk quote?</h2>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto">
              For orders above GH₵ 2,000, we offer custom pricing and dedicated account management.
            </p>
            <Link
              href="/order?segment=wholesale"
              className="inline-flex items-center gap-2 bg-white text-water-700 font-bold px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all shadow-medium"
            >
              Get Wholesale Quote <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
