'use client'
import { useEffect } from 'react'
import { Droplets } from 'lucide-react'

export default function LogoutPage() {
  useEffect(() => {
    fetch('/api/auth/logout', { method: 'POST' })
      .finally(() => {
        window.location.href = '/auth/login'
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-water-900 to-water-700 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Droplets className="w-7 h-7 text-white" />
        </div>
        <p className="font-semibold">Signing out...</p>
      </div>
    </div>
  )
}
