'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ArrowRight, Filter } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatCurrency } from '@/lib/utils'
import { Product, CustomerSegment } from '@/types'
import { useSettings } from '@/components/SettingsProvider'
import toast from 'react-hot-toast'

const categories = [
  { id: 'all', label: 'All Products' },
  { id: 'bottled', label: 'Bottled Water' },
  { id: 'sachet', label: 'Sachet Water' },
  { id: 'empty_bottle', label: 'Empty Bottles' },
]

const segments: { id: CustomerSegment; label: string }[] = [
  { id: 'household', label: 'Household' },
  { id: 'retail', label: 'Retail' },
  { id: 'wholesale', label: 'Wholesale' },
  { id: 'corporate', label: 'Corporate' },
]

function getPriceForSegment(product: Product, segment: CustomerSegment) {
  const map = { household: product.price_household, retail: product.price_retail, wholesale: product.price_wholesale, corporate: product.price_corporate }
  return map[segment]
}

export default function ProductsPage() {
  const s = useSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [segment, setSegment] = useState<CustomerSegment>('household')
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
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-br from-water-900 to-water-700 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-tag bg-white/10 text-white border border-white/20 mb-4">Our Products</div>
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-4">Pure water, every form.</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto">Select your customer type to see your pricing tier.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c.id} onClick={() => setCategory(c.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${category === c.id ? 'bg-water-600 text-white border-water-600' : 'bg-white text-gray-600 border-gray-200 hover:border-water-300'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-8">
          <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-water-600" /> Your customer type (affects pricing)
          </p>
          <div className="flex gap-2 flex-wrap">
            {segments.map(seg => (
              <button key={seg.id} onClick={() => setSegment(seg.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${segment === seg.id ? 'bg-water-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-2xl shimmer" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(product => {
              const price = getPriceForSegment(product, segment)
              const isLowStock = product.stock < 100
              return (
                <div key={product.id} className="card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className={`h-44 flex items-center justify-center text-6xl relative ${product.category === 'bottled' ? 'bg-gradient-to-br from-blue-50 to-cyan-100' : product.category === 'sachet' ? 'bg-gradient-to-br from-green-50 to-emerald-100' : 'bg-gradient-to-br from-amber-50 to-yellow-100'}`}>
                    {product.category === 'bottled' ? '💧' : product.category === 'sachet' ? '🛍️' : '🫙'}
                    {isLowStock && <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">Low Stock</span>}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-base leading-snug">{product.name}</h3>
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded ml-2 shrink-0">{product.size}</span>
                    </div>
                    <p className="text-gray-500 text-xs mb-4 leading-relaxed">{product.description}</p>
                    <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
                      {segments.map(seg => (
                        <div key={seg.id} className={`flex justify-between text-xs ${seg.id === segment ? 'font-bold text-water-600' : 'text-gray-500'}`}>
                          <span>{seg.label}</span>
                          <span>{formatCurrency(getPriceForSegment(product, seg.id))}/{product.unit}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-water-600">{formatCurrency(price)}</span>
                        <span className="text-xs text-gray-400">/{product.unit}</span>
                      </div>
                      <Link href={`/order?product=${product.id}&segment=${segment}`} className="bg-water-600 hover:bg-water-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">Order →</Link>
                    </div>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && !loading && (
              <div className="col-span-full text-center py-16 text-gray-400">
                <p className="text-lg font-medium">No products found</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-16 bg-gradient-to-r from-water-600 to-water-800 rounded-3xl p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Need a bulk quote?</h2>
          <p className="text-white/70 mb-8">For orders above GH₵ 2,000, we offer custom pricing and dedicated account management.</p>
          <Link href="/order?segment=wholesale" className="inline-flex items-center gap-2 bg-white text-water-700 font-bold px-8 py-4 rounded-2xl hover:bg-water-50 transition-all">
            Get Wholesale Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
