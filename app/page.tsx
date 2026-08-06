"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Droplets,
  Package,
  ShoppingBag,
  Building2,
  Home,
  Store,
  CheckCircle,
  Truck,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Phone,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useSettings } from "@/components/SettingsProvider";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductMedia from "@/components/ProductMedia";

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

const segments = [
  {
    id: "retail",
    label: "Retail",
    icon: Store,
    desc: "Shops, kiosks & resellers",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    id: "wholesale",
    label: "Wholesale",
    icon: Package,
    desc: "Bulk orders, best rates",
    color: "bg-water-50 text-water-600 border-water-200",
    featured: true,
  },
  {
    id: "corporate",
    label: "Corporate",
    icon: Building2,
    desc: "Office & company supply",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
];

const features = [
  {
    icon: Truck,
    title: "Same-Day Delivery",
    desc: "Order before 12PM, delivered same day across Kumasi and surrounding areas.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    desc: "Every batch tested and certified for purity and safety.",
  },
  {
    icon: Clock,
    title: "Real-Time Tracking",
    desc: "Follow your order from warehouse to your door.",
  },
  {
    icon: CheckCircle,
    title: "Flexible Payment",
    desc: "MTN MoMo, Vodafone Cash, AirtelTigo, card, or cash.",
  },
];

const testimonials = [
  {
    name: "Kwame Mensah",
    role: "Wholesale buyer, Tema",
    text: "Chico Water has been our water supplier for 2 years. Consistent quality, on-time delivery, no complaints.",
    stars: 5,
  },
  {
    name: "Abena Owusu",
    role: "Retail shop, Pakyi No.1",
    text: "I order every week. The app makes it so easy and the delivery guys are always professional.",
    stars: 5,
  },
  {
    name: "Emmanuel K.",
    role: "Store owner, Kumasi",
    text: "Sachet water crates arrive sealed and on time. Better pricing than any other supplier I've tried.",
    stars: 5,
  },
];

export default function HomePage() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const s = useSettings();

  const orders = useCountUp(
    parseInt(s.home_stats_orders || "50"),
    2200,
    statsVisible,
  );
  const regions = useCountUp(
    parseInt(s.home_stats_regions || "16"),
    1800,
    statsVisible,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const featuredProducts = MOCK_PRODUCTS.slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <Image
          src="/chi1.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center scale-105"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.4)_100%)]" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-4 sm:px-6 pt-28 pb-32 sm:pb-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.25em] text-white/70">
              Premium Water · Pakyi No.1, Kumasi · Est. {s.business_founded || "2026"}
            </span>
          </div>

          <h1 className="heading-hero text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white max-w-4xl leading-[1.12]">
            {s.home_hero_title || "Inspire Natural Mineral Water"}
          </h1>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-white/65 leading-relaxed font-light">
            {s.home_hero_subtitle ||
              "Bottled water, sachet water, and packaging solutions — for businesses, and wholesale buyers."}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Link href="/order" className="btn-hero-primary min-w-[180px]">
              Order Water <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="btn-hero-outline min-w-[180px]">
              Explore Products
            </Link>
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-md">
          <div className="max-w-4xl mx-auto grid grid-cols-3 divide-x divide-white/10 py-6 sm:py-8">
            {[
              { value: "99.9%", label: "Purity" },
              { value: s.home_stats_regions || "16", label: "Regions" },
              { value: s.business_founded || "2026", label: "Est." },
            ].map((item) => (
              <div key={item.label} className="text-center px-2">
                <p className="hero-stat-value">{item.value}</p>
                <p className="hero-stat-label">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="bg-slate-50 py-20 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6 max-w-4xl mx-auto">
            {[
              {
                value: orders.toLocaleString(),
                label: "Orders fulfilled",
                icon: CheckCircle,
              },
              {
                value: regions.toString(),
                label: "Regions covered",
                icon: MapPin,
              },
              {
                value: s.business_founded || "2026",
                label: "Year established",
                icon: Droplets,
              },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="w-11 h-11 bg-gradient-to-br from-water-50 to-water-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-5 h-5 text-water-600" />
                </div>
                <div className="text-3xl lg:text-4xl font-display font-bold text-slate-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CUSTOMER SEGMENTS */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Who We Serve</div>
            <h2 className="heading-display text-4xl text-slate-900 mb-4">
              Choose your category
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Tailored pricing and service for retail shops, wholesale distributors, and corporate accounts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {segments.map((seg) => (
              <Link
                key={seg.id}
                href={`/order?segment=${seg.id}`}
                className={`group relative card-interactive p-7 ${seg.featured ? "ring-2 ring-water-600 ring-offset-2" : ""}`}
              >
                {seg.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-water-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-glow">
                    Best Rates
                  </div>
                )}
                <div
                  className={`w-12 h-12 rounded-xl border ${seg.color} flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}
                >
                  <seg.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg mb-2">
                  {seg.label}
                </h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">{seg.desc}</p>
                <div className="flex items-center text-water-600 text-sm font-semibold group-hover:gap-2 gap-1 transition-all">
                  Order now <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS PREVIEW */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-14 gap-6">
            <div>
              <div className="section-tag mb-4">Our Products</div>
              <h2 className="heading-display text-4xl text-slate-900">
                Premium water products
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-water-600 font-semibold hover:gap-3 transition-all group"
            >
              View all products
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="card-interactive overflow-hidden group"
              >
                <div
                  className={`h-48 flex items-center justify-center relative overflow-hidden ${
                    product.category === "bottled"
                      ? "bg-gradient-to-br from-blue-50 to-cyan-100"
                      : product.category === "sachet"
                        ? "bg-gradient-to-br from-green-50 to-emerald-100"
                        : "bg-gradient-to-br from-amber-50 to-yellow-100"
                  }`}
                >
                  <ProductMedia
                    product={product}
                    className="group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-slate-900 text-lg leading-tight">
                      {product.name}
                    </h3>
                    <span className="product-badge ml-2 shrink-0">
                      {product.size}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">from</span>
                      <div className="text-2xl font-display font-bold text-water-600">
                        {formatCurrency(product.price_wholesale)}
                      </div>
                      <span className="text-xs text-slate-400">
                        per {product.unit}
                      </span>
                    </div>
                    <Link
                      href={`/order?product=${product.id}`}
                      className="btn-primary text-sm px-4 py-2.5"
                    >
                      Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Why Chico Water</div>
            <h2 className="heading-display text-4xl text-slate-900 mb-4">
              Built for Ghana
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Enterprise-grade logistics and quality control, designed for Ghanaian homes and businesses.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-interactive p-7">
                <div className="w-12 h-12 bg-gradient-to-br from-water-50 to-water-100 rounded-xl flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-water-600" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER TRACKING CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 sm:p-10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-water-600 to-water-800 rounded-2xl flex items-center justify-center shrink-0 shadow-glow">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="heading-display text-2xl text-slate-900 mb-1">
                  Track your order
                </h3>
                <p className="text-slate-500">
                  Enter your Order ID to see real-time delivery status.
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <input
                  placeholder="e.g. CW-10422"
                  className="input flex-1 sm:w-48"
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      window.location.href = `/track?id=${(e.target as HTMLInputElement).value}`;
                  }}
                />
                <Link href="/track" className="btn-primary whitespace-nowrap">
                  Track →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-slate-950 relative overflow-hidden bg-mesh-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <div className="section-tag-light mb-4">Customer Reviews</div>
            <h2 className="heading-display text-4xl text-white mb-4">
              What our customers say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="glass rounded-2xl p-7 hover:bg-white/15 transition-colors duration-300"
              >
                <div className="flex text-amber-400 text-sm mb-4 gap-0.5">
                  {"★".repeat(t.stars)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-water-400 to-water-700 flex items-center justify-center text-white text-xs font-bold">
                    {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-water-700 via-water-800 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-hero opacity-50 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="heading-display text-4xl lg:text-5xl text-white mb-5">
            Ready to order?
          </h2>
          <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of Ghanaians who trust Chico Water every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order" className="btn-primary px-10 py-4 text-lg rounded-2xl bg-white text-water-700 hover:bg-slate-50 shadow-medium">
              Place an Order <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${s.business_whatsapp || "233200000000"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost px-10 py-4 text-lg rounded-2xl"
            >
              <Phone className="w-5 h-5" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
