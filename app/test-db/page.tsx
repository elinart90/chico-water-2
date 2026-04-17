'use client'
import { useState } from 'react'
import { CheckCircle, XCircle, Loader, Database, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Result = { name: string; status: 'idle' | 'loading' | 'pass' | 'fail'; detail?: string }

export default function TestPage() {
  const [results, setResults] = useState<Result[]>([])
  const [running, setRunning] = useState(false)
  const [loginTest, setLoginTest] = useState({ email: '', password: '' })
  const [loginResult, setLoginResult] = useState<string | null>(null)

  const upd = (name: string, status: Result['status'], detail?: string) => {
    setResults(prev => {
      const exists = prev.find(r => r.name === name)
      if (exists) return prev.map(r => r.name === name ? { ...r, status, detail } : r)
      return [...prev, { name, status, detail }]
    })
  }

  const run = async () => {
    setRunning(true)
    setResults([
      { name: '1. Connect to Supabase', status: 'loading' },
      { name: '2. Read settings table', status: 'loading' },
      { name: '3. Read products table', status: 'loading' },
      { name: '4. Read orders table', status: 'loading' },
      { name: '5. Read users table', status: 'loading' },
    ])

    // Test 1 - connection
    try {
      const start = Date.now()
      const { error } = await supabase.from('settings').select('key').limit(1)
      if (error) throw error
      upd('1. Connect to Supabase', 'pass', `Connected in ${Date.now() - start}ms`)
    } catch (e: any) {
      upd('1. Connect to Supabase', 'fail', e?.message)
      setRunning(false)
      return
    }

    // Test 2 - settings
    try {
      const { data, error, count } = await supabase.from('settings').select('*', { count: 'exact' })
      if (error) throw error
      upd('2. Read settings table', data?.length ? 'pass' : 'fail',
        data?.length ? `${count} rows — settings loaded` : 'Table exists but NO rows. Run supabase-settings.sql')
    } catch (e: any) {
      upd('2. Read settings table', 'fail', e?.message)
    }

    // Test 3 - products
    try {
      const { data, error, count } = await supabase.from('products').select('*', { count: 'exact' })
      if (error) throw error
      upd('3. Read products table', data?.length ? 'pass' : 'fail',
        data?.length ? `${count} products found: ${data.map((p: any) => p.name).join(', ')}` : 'NO products. Run supabase-schema.sql seed section')
    } catch (e: any) {
      upd('3. Read products table', 'fail', e?.message)
    }

    // Test 4 - orders
    try {
      const { data, error, count } = await supabase.from('orders').select('*', { count: 'exact' })
      if (error) throw error
      upd('4. Read orders table', 'pass', `${count} orders in database`)
    } catch (e: any) {
      upd('4. Read orders table', 'fail', e?.message)
    }

    // Test 5 - users
    try {
      const { data, error, count } = await supabase.from('users').select('id, name, email, role', { count: 'exact' })
      if (error) throw error
      if (!data?.length) {
        upd('5. Read users table', 'fail', 'NO users found — this is why login fails! Create admin/salesperson using the SQL in the chat.')
      } else {
        upd('5. Read users table', 'pass',
          `${count} user(s): ${data.map((u: any) => `${u.name} (${u.role})`).join(', ')}`)
      }
    } catch (e: any) {
      upd('5. Read users table', 'fail', e?.message)
    }

    setRunning(false)
  }

  const testLogin = async () => {
    setLoginResult('Testing...')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginTest),
      })
      const data = await res.json()
      if (res.ok) {
        setLoginResult(`✅ LOGIN SUCCESS — Welcome ${data.user.name} (${data.user.role})`)
      } else {
        setLoginResult(`❌ LOGIN FAILED — ${data.message}`)
      }
    } catch (e: any) {
      setLoginResult(`❌ Network error: ${e.message}`)
    }
  }

  const allPass = results.length > 0 && results.every(r => r.status === 'pass')
  const anyFail = results.some(r => r.status === 'fail')

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-water-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Database Test</h1>
            <p className="text-gray-500 text-sm">Check Supabase connection and data</p>
          </div>
        </div>

        {/* Env check */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Environment Variables</p>
          <div className="space-y-2">
            {[
              { key: 'NEXT_PUBLIC_SUPABASE_URL', val: process.env.NEXT_PUBLIC_SUPABASE_URL },
              { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', val: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
            ].map(({ key, val }) => (
              <div key={key} className="flex items-center gap-3">
                {val && !val.includes('your-project') && !val.includes('your-anon')
                  ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                }
                <span className="text-xs font-mono text-gray-500 flex-1">{key}</span>
                <span className={`text-xs font-mono ${val && !val.includes('your-') ? 'text-gray-700' : 'text-red-500 font-bold'}`}>
                  {val ? (val.length > 40 ? val.slice(0, 40) + '...' : val) : 'NOT SET'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Test results */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {results.map((r, i) => (
              <div key={r.name} className={`p-4 flex items-start gap-3 ${i < results.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="mt-0.5 shrink-0">
                  {r.status === 'idle' && <div className="w-5 h-5 rounded-full border-2 border-gray-200" />}
                  {r.status === 'loading' && <Loader className="w-5 h-5 text-water-600 animate-spin" />}
                  {r.status === 'pass' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {r.status === 'fail' && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${r.status === 'fail' ? 'text-red-700' : r.status === 'pass' ? 'text-green-700' : 'text-gray-700'}`}>
                    {r.name}
                  </p>
                  {r.detail && (
                    <p className={`text-xs mt-1 ${r.status === 'fail' ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                      {r.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {allPass && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <p className="text-green-800 font-semibold text-sm">All tests passed! Database is fully connected.</p>
          </div>
        )}

        {anyFail && !running && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="font-bold text-red-800 mb-2 text-sm">Fixes:</p>
            <ul className="space-y-1 text-xs text-red-700 list-disc list-inside">
              <li>Make sure <code className="bg-red-100 px-1 rounded">.env.local</code> has your real Supabase URL and anon key</li>
              <li>Restart dev server after editing .env.local: stop → <code className="bg-red-100 px-1 rounded">npm run dev</code></li>
              <li>Run <code className="bg-red-100 px-1 rounded">supabase-schema.sql</code> in Supabase SQL Editor</li>
              <li>Check if your Supabase project is paused — go to supabase.com and restore it</li>
            </ul>
          </div>
        )}

        <button onClick={run} disabled={running}
          className="w-full flex items-center justify-center gap-2 bg-water-600 hover:bg-water-700 disabled:bg-water-400 text-white font-bold py-4 rounded-2xl transition-all">
          {running ? <><Loader className="w-5 h-5 animate-spin" /> Running tests...</> : <><RefreshCw className="w-5 h-5" /> Run DB Tests</>}
        </button>

        {/* Login tester */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-1">Test Login</h2>
          <p className="text-gray-500 text-xs mb-4">Test your admin or salesperson credentials directly</p>
          <div className="space-y-3 mb-4">
            <input
              type="email"
              placeholder="Email (e.g. admin@chicowater.com)"
              value={loginTest.email}
              onChange={e => setLoginTest(p => ({ ...p, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-water-600"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginTest.password}
              onChange={e => setLoginTest(p => ({ ...p, password: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-water-600"
            />
          </div>
          <button onClick={testLogin}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-sm transition-colors">
            Test Login →
          </button>
          {loginResult && (
            <div className={`mt-3 p-3 rounded-xl text-sm font-medium ${loginResult.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {loginResult}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Delete <code>app/test-db/</code> before going live.
        </p>
      </div>
    </div>
  )
}
