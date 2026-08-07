'use client'
import { useState, useEffect } from 'react'
import { WifiOff, X, RefreshCw } from 'lucide-react'

export default function NetworkStatus() {
  const [online, setOnline] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setOnline(navigator.onLine)
    const up = () => { setOnline(true); setDismissed(false) }
    const down = () => { setOnline(false); setDismissed(false) }
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  if (online || dismissed) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
      <WifiOff className="w-4 h-4 text-red-400 shrink-0" />
      <span className="text-sm font-medium flex-1">
        You're offline — the site is running on cached data. Check your connection.
      </span>
      <button onClick={() => window.location.reload()} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors">
        <RefreshCw className="w-3 h-3" /> Retry
      </button>
      <button onClick={() => setDismissed(true)} className="text-white/50 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
