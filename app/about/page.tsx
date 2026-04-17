'use client'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Shield, Award, Leaf, Heart, MapPin, Users } from 'lucide-react'
import { useSettings } from '@/components/SettingsProvider'

const values = [
  { icon: Shield, title: 'Quality Assured', desc: 'Every batch tested and certified. We meet Ghana Standards Authority requirements.' },
  { icon: Leaf, title: 'Sustainable', desc: 'Our bottles are 100% recyclable. We partner with communities on plastic collection.' },
  { icon: Heart, title: 'Community First', desc: 'We hire locally and invest in clean water access in underserved areas.' },
  { icon: Award, title: 'Award-Winning', desc: 'GSA-certified, ISO quality standards, Ghana Chamber of Commerce recognized.' },
]

export default function AboutPage() {
  const s = useSettings()
  const founded = s.business_founded || '2008'
  const name = s.business_name || 'Chico Water Limited'
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="bg-gradient-to-br from-water-900 to-water-700 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-tag bg-white/10 text-white border border-white/20 mb-6">Our Story</div>
          <h1 className="text-5xl font-black text-white mb-6">Bringing pure water to every Ghanaian.</h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Founded in {founded}, {name} started as a small bottling operation with one goal: deliver clean, affordable water to Ghanaian families and businesses.
          </p>
        </div>
      </div>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-tag mb-6">Our Mission</div>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Water is not a luxury. It's a right.</h2>
              <p className="text-gray-600 leading-relaxed mb-4">{name} was built on a simple idea: every Ghanaian deserves access to clean, safe drinking water at an honest price.</p>
              <p className="text-gray-600 leading-relaxed">We sell bottled water, sachet water, and packaging to households, shops, wholesale distributors, and corporate accounts — each with pricing designed for their needs.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: founded, label: 'Founded', icon: Award },
                { value: parseInt(s.home_stats_customers||'12000').toLocaleString()+'+', label: 'Customers', icon: Users },
                { value: s.home_stats_regions||'16', label: 'Regions served', icon: MapPin },
                { value: parseInt(s.home_stats_orders||'50000').toLocaleString()+'+', label: 'Orders delivered', icon: Shield },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-2xl p-6 text-center">
                  <stat.icon className="w-7 h-7 text-water-600 mx-auto mb-3" />
                  <div className="text-3xl font-black text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">What We Stand For</div>
            <h2 className="text-4xl font-black text-gray-900">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="card p-6">
                <div className="w-12 h-12 bg-water-50 rounded-xl flex items-center justify-center mb-4"><v.icon className="w-6 h-6 text-water-600" /></div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
