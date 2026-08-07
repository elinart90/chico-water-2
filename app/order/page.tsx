'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, CheckCircle, CreditCard, Smartphone, Banknote, MapPin, User, Phone as PhoneIcon, CalendarDays, ClipboardList } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { formatCurrency, GHANA_REGIONS } from '@/lib/utils'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { CustomerSegment, OrderItem, PaymentMethod, Product } from '@/types'
import { useSettings } from '@/components/SettingsProvider'
import toast from 'react-hot-toast'

const segments: { id: CustomerSegment; label: string; desc: string }[] = [
  // { id: 'household', label: 'Household', desc: 'Personal home delivery' }, remove household from order
  { id: 'retail', label: 'Retail', desc: 'Shops & kiosks' },
  { id: 'wholesale', label: 'Wholesale', desc: 'Bulk orders, best rates' },
  { id: 'corporate', label: 'Corporate', desc: 'Office & company supply' },
]

const STEPS = ['Category', 'Products', 'Delivery', 'Payment', 'Confirm']

function getPriceForSegment(product: Product, segment: CustomerSegment) {
  const map = { household: product.price_household, retail: product.price_retail, wholesale: product.price_wholesale, corporate: product.price_corporate }
  return map[segment]
}

function OrderPageInner() {
  const searchParams = useSearchParams()
  const s = useSettings()

  const [step, setStep] = useState(0)
  const [segment, setSegment] = useState<CustomerSegment>((searchParams.get('segment') as CustomerSegment) || 'household')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState({ name: '', phone: '', address: '', region: 'Greater Accra', date: '', notes: '' })
  const [payment, setPayment] = useState<PaymentMethod>('momo')
  const [momoNetwork, setMomoNetwork] = useState('mtn')
  const [loading, setLoading] = useState(false)
  const [placed, setPlaced] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')

  const DELIVERY_FEE = parseFloat(s.delivery_fee_default || '15')

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => {
      const prods = d.products || MOCK_PRODUCTS
      setProducts(prods)
      const pid = searchParams.get('product')
      if (pid) setCart({ [pid]: 1 })
    })
  }, [])

  const addToCart = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const removeFromCart = (id: string) => setCart(c => {
    if (!c[id] || c[id] <= 1) { const n = { ...c }; delete n[id]; return n }
    return { ...c, [id]: c[id] - 1 }
  })
  const deleteFromCart = (id: string) => setCart(c => { const n = { ...c }; delete n[id]; return n })

  const cartItems: OrderItem[] = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(x => x.id === id)
    if (!p) return null
    const price = getPriceForSegment(p, segment)
    return { product_id: id, product_name: p.name, quantity: qty, unit_price: price, total: price * qty }
  }).filter(Boolean) as OrderItem[]

  const subtotal = cartItems.reduce((s, i) => s + i.total, 0)
  const total = subtotal + DELIVERY_FEE

  const canNext = () => {
    if (step === 1) return cartItems.length > 0
    if (step === 2) return !!(form.name && form.phone && form.address)
    return true
  }

  const placeOrder = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          segment,
          items: cartItems,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total,
          payment_method: payment,
          delivery_address: form.address,
          delivery_region: form.region,
          delivery_notes: form.notes,
          preferred_date: form.date,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setOrderNumber(data.order_number)
        setPlaced(true)
        toast.success(`Order ${data.order_number} placed!`)
      } else {
        toast.error(data.message || 'Failed to place order')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (placed) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-32 text-center">
        <div className="card p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-6">Your order has been received. You'll be contacted shortly.</p>
          <div className="bg-water-50 rounded-2xl p-5 mb-8">
            <p className="text-sm text-gray-500 mb-1">Your order number</p>
            <p className="text-3xl font-black text-water-600">{orderNumber}</p>
            <p className="text-xs text-gray-400 mt-1">Save this to track your order</p>
          </div>
          <div className="space-y-3">
            <Link href={`/track?id=${orderNumber}`} className="btn-primary w-full block text-center">Track My Order</Link>
            <Link href="/" className="btn-secondary w-full block text-center">Back to Home</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="bg-gradient-to-br from-water-900 to-water-700 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black text-white mb-2">Place an Order</h1>
          <p className="text-white/70">Fresh water, delivered to your door across Ghana.</p>
          <div className="flex items-center gap-2 mt-8 flex-wrap">
            {STEPS.map((st, i) => (
              <div key={st} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${i === step ? 'bg-white text-water-700' : i < step ? 'bg-water-500/50 text-white' : 'bg-white/10 text-white/50'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i < step ? 'bg-green-400 text-white' : i === step ? 'bg-water-600 text-white' : 'bg-white/20 text-white/50'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  {st}
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-white/30" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 0 */}
            {step === 0 && (
              <div className="card p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-2">Who are you ordering for?</h2>
                <p className="text-gray-500 mb-8">This determines your pricing tier.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {segments.map(seg => (
                    <button key={seg.id} onClick={() => setSegment(seg.id)}
                      className={`p-5 rounded-2xl border-2 text-left transition-all ${segment === seg.id ? 'border-water-600 bg-water-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">{seg.label}</span>
                        {segment === seg.id && <CheckCircle className="w-5 h-5 text-water-600" />}
                      </div>
                      <span className="text-sm text-gray-500">{seg.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <div className="card p-6">
                <h2 className="text-2xl font-black text-gray-900 mb-1">Select products</h2>
                <p className="text-gray-500 text-sm mb-6">Prices for <span className="font-semibold text-water-600 capitalize">{segment}</span> customers.</p>
                <div className="space-y-3">
                  {products.map(product => {
                    const price = getPriceForSegment(product, segment)
                    const qty = cart[product.id] || 0
                    return (
                      <div key={product.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${qty > 0 ? 'border-water-300 bg-water-50' : 'border-gray-100 bg-gray-50'}`}>
                        <div className="text-3xl shrink-0">{product.category === 'bottled' ? '💧' : product.category === 'sachet' ? '🛍️' : '🫙'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.size} · per {product.unit}</div>
                        </div>
                        <div className="text-water-600 font-bold text-sm shrink-0">{formatCurrency(price)}</div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Minus className="w-3 h-3 text-gray-600" /></button>
                          <span className="w-8 text-center font-bold text-sm">{qty}</span>
                          <button onClick={() => addToCart(product.id)} className="w-8 h-8 rounded-full bg-water-600 flex items-center justify-center hover:bg-water-700"><Plus className="w-3 h-3 text-white" /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="card p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Delivery details</h2>
                <div className="grid gap-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label"><User className="w-4 h-4 inline mr-1 text-gray-400" />Full Name</label>
                      <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" placeholder="Kwame Mensah" />
                    </div>
                    <div>
                      <label className="label"><PhoneIcon className="w-4 h-4 inline mr-1 text-gray-400" />Phone Number</label>
                      <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input" placeholder="024 000 0000" />
                    </div>
                  </div>
                  <div>
                    <label className="label"><MapPin className="w-4 h-4 inline mr-1 text-gray-400" />Delivery Address</label>
                    <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="input" placeholder="Street name, neighbourhood, landmark" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label">Region</label>
                      <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className="input bg-white">
                        {GHANA_REGIONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label"><CalendarDays className="w-4 h-4 inline mr-1 text-gray-400" />Preferred Date</label>
                      <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div>
                    <label className="label"><ClipboardList className="w-4 h-4 inline mr-1 text-gray-400" />Delivery Notes (optional)</label>
                    <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="input resize-none" rows={3} placeholder="e.g. Leave with security guard, call on arrival..." />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="card p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Payment method</h2>
                <div className="space-y-3 mb-8">
                  {[{ id: 'momo', label: 'Mobile Money', desc: 'MTN, Vodafone, AirtelTigo', icon: Smartphone }, { id: 'card', label: 'Debit / Credit Card', desc: 'Visa, Mastercard', icon: CreditCard }, { id: 'cash', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: Banknote }]
                    .map(m => (
                      <button key={m.id} onClick={() => setPayment(m.id as PaymentMethod)}
                        className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all ${payment === m.id ? 'border-water-600 bg-water-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${payment === m.id ? 'bg-water-600' : 'bg-gray-100'}`}>
                          <m.icon className={`w-6 h-6 ${payment === m.id ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900">{m.label}</div>
                          <div className="text-sm text-gray-500">{m.desc}</div>
                        </div>
                        {payment === m.id && <CheckCircle className="w-5 h-5 text-water-600" />}
                      </button>
                    ))}
                </div>
                {payment === 'momo' && (
                  <div>
                    <label className="label">MoMo Network</label>
                    <div className="flex gap-3">
                      {[{ id: 'mtn', label: 'MTN' }, { id: 'vodafone', label: 'Vodafone' }, { id: 'airteltigo', label: 'AirtelTigo' }].map(n => (
                        <button key={n.id} onClick={() => setMomoNetwork(n.id)}
                          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${momoNetwork === n.id ? 'border-water-600 bg-water-50 text-water-700' : 'border-gray-200 text-gray-600'}`}>
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="card p-8">
                <h2 className="text-2xl font-black text-gray-900 mb-6">Order summary</h2>
                <div className="space-y-4 mb-8">
                  {cartItems.map(item => (
                    <div key={item.product_id} className="flex justify-between items-center py-3 border-b border-gray-100">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{item.product_name}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity} × {formatCurrency(item.unit_price)}</div>
                      </div>
                      <div className="font-bold text-gray-900">{formatCurrency(item.total)}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3 mb-8">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Deliver to</span><span className="font-medium text-right max-w-[200px]">{form.address}, {form.region}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-medium capitalize">{payment === 'momo' ? `MoMo (${momoNetwork.toUpperCase()})` : payment}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery fee</span><span className="font-medium">{formatCurrency(DELIVERY_FEE)}</span></div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between"><span className="font-bold text-gray-900">Total</span><span className="font-black text-xl text-water-600">{formatCurrency(total)}</span></div>
                </div>
                <button onClick={placeOrder} disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60">
                  {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing order...</> : <><ShoppingCart className="w-5 h-5" /> Place Order · {formatCurrency(total)}</>}
                </button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              {step > 0 ? <button onClick={() => setStep(s => s - 1)} className="btn-secondary">← Back</button> : <div />}
              {step < 4 && (
                <button onClick={() => canNext() && setStep(s => s + 1)} disabled={!canNext()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-water-600" /> Your cart
                {cartItems.length > 0 && <span className="bg-water-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartItems.length}</span>}
              </h3>
              {cartItems.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No items yet. Select products in step 2.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {cartItems.map(item => (
                    <div key={item.product_id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{item.product_name}</div>
                        <div className="text-xs text-gray-500">{item.quantity} × {formatCurrency(item.unit_price)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-water-600">{formatCurrency(item.total)}</span>
                        <button onClick={() => deleteFromCart(item.product_id)} className="text-gray-300 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between text-sm text-gray-500"><span>Delivery</span><span>{formatCurrency(DELIVERY_FEE)}</span></div>
                  <div className="flex justify-between font-black text-gray-900 text-lg"><span>Total</span><span className="text-water-600">{formatCurrency(total)}</span></div>
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">Questions? <a href={`https://wa.me/${s.business_whatsapp || '233200000000'}`} target="_blank" rel="noopener noreferrer" className="text-water-600 font-medium">WhatsApp us</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function OrderPage() {
  return <Suspense><OrderPageInner /></Suspense>
}
