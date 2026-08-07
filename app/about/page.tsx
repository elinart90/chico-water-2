'use client'
import Navbar from '@/components/layout/Navbar'
import Image from 'next/image'
import { useSettings } from '@/components/SettingsProvider'
import Footer from '@/components/layout/Footer'
import { Shield, Award, Leaf, Heart, MapPin, Users, User } from 'lucide-react'

const values = [
  { icon: Shield, title: 'Quality Assured', desc: 'Every batch is tested and certified before it reaches you. We meet and exceed Ghana Standards Authority requirements.' },
  { icon: Leaf, title: 'Sustainable', desc: 'Our bottles are 100% recyclable. We partner with local communities on plastic collection initiatives.' },
  { icon: Heart, title: 'Community First', desc: 'We hire locally, pay fairly, and invest a portion of profits into clean water access in underserved areas.' },
  { icon: Award, title: 'Award-Winning', desc: 'GSA-certified, ISO quality standards, and recognized by the Ghana Chamber of Commerce since 2012.' },
]

const team = [
  { name: 'Stephen Kingsford Boamah', role: 'Founder & CEO', photo: '' },
  { name: 'Abena Asante', role: 'Operations Director', photo: '' },
  { name: 'Kofi Mensah', role: 'Sales Manager', photo: '' },
  { name: 'Grace Twumasi', role: 'Quality Control', photo: '' },
]

export default function AboutPage() {
  const s = useSettings()
  const founded = s.business_founded || '2008'
  const name = s.business_name || 'Chico Water Limited'
  const statsCustomers = parseInt(s.home_stats_customers || '12000').toLocaleString() + '+'
  const statsRegions = s.home_stats_regions || '16'
  const statsOrders = parseInt(s.home_stats_orders || '50000').toLocaleString() + '+'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="relative overflow-hidden bg-slate-950">
        <Image
          src="/build1.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/70 to-slate-950/95" />
        <div className="absolute inset-0 bg-slate-950/30" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
          <div className="section-tag-light mb-6">Our Story</div>
          <h1 className="heading-hero text-4xl lg:text-5xl text-white mb-6 leading-tight">
            Bringing pure water to every Ghanaian.
          </h1>
          <p className="text-white/80 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            {`Founded in ${founded}, ${name} started as a small bottling operation with one goal: deliver clean, affordable water to Ghanaian families and businesses.`}
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-tag mb-6">Our Mission</div>
              <h2 className="heading-display text-4xl text-slate-900 mb-6">Water is not a luxury. It&apos;s a right.</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>{name} was built on a simple idea: every Ghanaian — whether in a city or a rural community — deserves access to clean, safe drinking water at an honest price.</p>
                <p>What started as a small bottling operation has grown into a trusted supplier serving {statsCustomers.replace('+', '')}+ customers across all {statsRegions} regions of Ghana.</p>
                <p>We sell bottled water, sachet water, and quality packaging to retail shops, wholesale distributors, and corporate accounts — each with pricing and service designed for their specific needs.</p>
              </div>
            </div>
            <div className="space-y-5">
              <div className="relative rounded-2xl overflow-hidden shadow-medium aspect-[4/3] ring-1 ring-slate-200/60">
                <img
                  src="/build1.jpg"
                  alt="Chico Water bottling facility"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 right-5 text-white text-sm font-medium">
                  Our bottling facility
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: founded, label: 'Founded', icon: Award },
                  { value: statsCustomers, label: 'Customers', icon: Users },
                  { value: statsRegions, label: 'Regions served', icon: MapPin },
                  { value: statsOrders, label: 'Orders delivered', icon: Shield },
                ].map(stat => (
                  <div key={stat.label} className="stat-card py-5">
                    <stat.icon className="w-6 h-6 text-water-600 mx-auto mb-2" />
                    <div className="text-2xl font-display font-bold text-slate-900 mb-0.5">{stat.value}</div>
                    <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">What We Stand For</div>
            <h2 className="heading-display text-4xl text-slate-900">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(v => (
              <div key={v.title} className="card-interactive p-7">
                <div className="w-12 h-12 bg-gradient-to-br from-water-50 to-water-100 rounded-xl flex items-center justify-center mb-5">
                  <v.icon className="w-6 h-6 text-water-600" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-tag mb-4">Our Team</div>
            <h2 className="heading-display text-4xl text-slate-900">The people behind the water</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.name} className="card-interactive p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200/80">
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover object-center"
                      sizes="96px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200/80">
                      <User className="w-9 h-9 text-slate-400" strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <h3 className="font-display font-bold text-slate-900 leading-snug">{member.name}</h3>
                <p className="text-slate-500 text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
