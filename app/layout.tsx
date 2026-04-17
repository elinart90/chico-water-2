import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { SettingsProvider } from '@/components/SettingsProvider'
import NetworkStatus from '@/components/NetworkStatus'

export const metadata: Metadata = {
  title: 'Chico Water Limited | Inspire Natural Mineral Water',
  description: "Ghana's premium water supplier — bottled water, sachet water, and packaging delivered to your door.",
  keywords: 'water delivery Ghana, bottled water Accra, sachet water wholesale, Chico Water, mineral water Ghana',
  icons: {
    icon: 'https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png',
    shortcut: 'https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png',
    apple: 'https://vlufaqecdxfdvmpxmfas.supabase.co/storage/v1/object/public/assets/chico-logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <SettingsProvider>
          <NetworkStatus />
          {children}
        </SettingsProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px', fontSize: '14px', fontWeight: '500' },
            success: { iconTheme: { primary: '#0077B6', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
