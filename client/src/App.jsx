import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Mail, Activity, Zap, BarChart3, Shield, Upload, Send,
  Terminal, CheckCircle, XCircle, AlertTriangle, ChevronRight,
  Clock, Users, TrendingUp, Cpu, X, Eye, EyeOff, Layers,
  FileText, Inbox, Settings, Bell
} from 'lucide-react'
import Papa from 'papaparse'

// ─── API Base URL Config ─────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const NAV_TABS = ['Dashboard', 'Single Dispatch', 'Bulk Campaign', 'Logs']

// ─── Sub-components ───────────────────────────────────────────────────────────

function GoldLettermark() {
  return (
    <div className="relative flex items-center justify-center w-9 h-9 rounded-lg overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #1A1408 0%, #2A1E0A 100%)', border: '1px solid #3D2E12' }}>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 80% at 50% 20%, rgba(214,169,103,0.18) 0%, transparent 70%)'
      }} />
      <span className="relative font-bold text-lg leading-none gold-text" style={{ fontFamily: 'var(--font-mono)' }}>M</span>
    </div>
  )
}

function StatusBadge({ online }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium"
         style={{ border: online ? '1px solid rgba(16,185,129,0.3)' : '1px solid #292E36' }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: online ? '#10B981' : '#EF4444' }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: online ? '#10B981' : '#EF4444' }} />
      </span>
      <span style={{ color: online ? '#10B981' : '#EF4444' }}>
        {online ? 'API Engine Online' : 'API Offline'}
      </span>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, sub, badge, badgeColor, accent }) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group"
         style={{ transition: 'border-color 0.2s' }}
         onMouseEnter={e => (e.currentTarget.style.borderColor = '#3D3520')}
         onMouseLeave={e => (e.currentTarget.style.borderColor = '#292E36')}>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
           style={{ background: `radial-gradient(circle, ${accent || 'rgba(214,169,103,0.06)'} 0%, transparent 70%)`, transform: 'translate(30%, -30%)' }} />
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl"
             style={{ background: 'rgba(214,169,103,0.08)', border: '1px solid rgba(214,169,103,0.15)' }}>
          <Icon size={18} style={{ color: '#D6A967' }} strokeWidth={1.5} />
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: badgeColor || 'rgba(16,185,129,0.12)', color: badgeColor ? '#EF4444' : '#10B981', border: `1px solid ${badgeColor ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight" style={{ color: '#F5F2EA' }}>{value}</div>
        <div className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{label}</div>
      </div>
      <div className="text-xs font-medium" style={{ color: '#9CA3AF' }}>{sub}</div>
    </div>
  )
}

function ProgressBar({ label, value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs" style={{ color: '#9CA3AF' }}>
        <span>{label}</span>
        <span style={{ color: '#F5F2EA' }}>{value} / {max}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: '#1E2530' }}>
        <div className="h-full rounded-full progress-pulse" style={{ width: `${pct}%`, background: color, transition: 'width 0.6s ease' }} />
      </div>
      <div className="text-right text-xs" style={{ color: '#9CA3AF' }}>{pct}% used</div>
    </div>
  )
}

function LogPill({ type }) {
  const map = {
    success: { label: 'OK', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    error:   { label: 'ERR', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)' },
    info:    { label: 'QUEUE', color: '#D6A967', bg: 'rgba(214,169,103,0.1)', border: 'rgba(214,169,103,0.2)' },
  }
  const s = map[type] || map.info
  return (
    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  )
}

// ─── OTP Security Modal ──────────────────────────────────────────────────────

function OtpModal({ isOpen, onClose, onConfirm, senderEmail, isVerifying }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [timeLeft, setTimeLeft] = useState(300)
  const refs = useRef([])

  useEffect(() => {
    if (!isOpen) { setDigits(['', '', '', '', '', '']); setTimeLeft(300); return }
    const t = setInterval(() => setTimeLeft(p => (p <= 1 ? (clearInterval(t), 0) : p - 1)), 1000)
    return () => clearInterval(t)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) setTimeout(() => refs.current[0]?.focus(), 80)
  }, [isOpen])

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  const handleChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]; next[i] = v; setDigits(next)
    if (v && i < 5) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...digits]
    pasted.split('').forEach((c, idx) => { if (idx < 6) next[idx] = c })
    setDigits(next)
    refs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')
  const complete = digits.every(d => d !== '')
  const otpString = digits.join('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop"
         style={{ background: 'rgba(9,11,15,0.85)' }}
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass rounded-2xl w-full max-w-md mx-4 relative overflow-hidden"
           style={{ border: '1px solid #292E36' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
             style={{ background: 'linear-gradient(90deg, transparent, #D6A967, #C49848, transparent)' }} />
        <div className="absolute top-0 left-0 right-0 h-16"
             style={{ background: 'linear-gradient(180deg, rgba(214,169,103,0.06) 0%, transparent 100%)' }} />

        <div className="relative p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                   style={{ background: 'rgba(214,169,103,0.1)', border: '1px solid rgba(214,169,103,0.2)' }}>
                <Shield size={20} style={{ color: '#D6A967' }} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-semibold text-base" style={{ color: '#F5F2EA' }}>🔒 Security Verification</h3>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Enter authorization code</p>
              </div>
            </div>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                    style={{ color: '#9CA3AF' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F5F2EA'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = 'transparent' }}>
              <X size={16} />
            </button>
          </div>

          <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
            A 6-digit verification code was sent to <strong>{senderEmail || 'configured sender'}</strong>. Enter code below:
          </p>

          <div className="flex gap-3 justify-center mb-5" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { refs.current[i] = el }}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
              />
            ))}
          </div>

          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              <AlertTriangle size={12} />
              ⚠️ Code expires in {mm}:{ss}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
                    disabled={isVerifying}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #292E36', color: '#9CA3AF' }}>
              Cancel
            </button>
            <button onClick={() => complete && onConfirm(otpString)}
                    disabled={!complete || isVerifying}
                    className="btn-gold flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {isVerifying ? 'Verifying Code...' : 'Confirm & Dispatch'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main App Workspace ──────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState('Bulk Campaign')
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isRequestingOtp, setIsRequestingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const [senderEmail, setSenderEmail] = useState('kashyapbajaj733@gmail.com')
  const [csvFile, setCsvFile] = useState(null)
  const [parsedContacts, setParsedContacts] = useState([])
  const [subject, setSubject] = useState('Hey {{name}}, quick update for you 🚀')
  const [aiPrompt, setAiPrompt] = useState('Write a warm, personalized 2-sentence email for {{name}}.')

  const [isDispatching, setIsDispatching] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [dispatchDone, setDispatchDone] = useState(false)

  const [apiOnline, setApiOnline] = useState(true)
  const [stats, setStats] = useState({ totalLogs: '0', sentCount: '0', failedCount: '0', completionRate: '100.0%' })
  const terminalRef = useRef(null)

  // Auto-scroll terminal console
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = 0
  }, [logs])

  // Poll DB statistics from server
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`)
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setApiOnline(true)
      } else {
        setApiOnline(false)
      }
    } catch {
      setApiOnline(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 4000)
    return () => clearInterval(interval)
  }, [fetchStats])

  const addTerminalLog = (type, recipient, message) => {
    const newLog = {
      id: Date.now() + Math.random(),
      type,
      recipient,
      message,
      time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
    }
    setLogs(prev => [newLog, ...prev].slice(0, 30))
  }

  // Parse CSV File via Papaparse
  const processCsvFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid = results.data.filter(c => c.email && c.email.includes('@'))
        setParsedContacts(valid)
        setCsvFile({ name: file.name, count: valid.length })
        addTerminalLog('info', 'CSV_PARSER', `Loaded ${valid.length} recipients from ${file.name}`)
      },
      error: (err) => {
        addTerminalLog('error', 'CSV_PARSER', `Failed to read file: ${err.message}`)
      }
    })
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) processCsvFile(file)
  }, [])

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) processCsvFile(file)
  }

  // Step 1: Trigger OTP via Server
  const handleInitiateBulkCampaign = async () => {
    if (parsedContacts.length === 0) {
      alert('Please upload a CSV file with valid recipient emails first.')
      return
    }
    if (!subject.trim()) {
      alert('Please enter an email subject line.')
      return
    }

    setIsRequestingOtp(true)
    addTerminalLog('info', senderEmail, 'Requesting authorization OTP...')

    try {
      const res = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: senderEmail }),
      })

      const data = await res.json()

      if (res.ok) {
        addTerminalLog('info', senderEmail, 'OTP code dispatched to sender inbox!')
        setIsOtpModalOpen(true)
      } else {
        addTerminalLog('error', senderEmail, `OTP failure: ${data.error}`)
        alert(`Failed to send OTP: ${data.error}`)
      }
    } catch (err) {
      addTerminalLog('error', senderEmail, `Connection error: ${err.message}`)
      alert('Could not connect to Express backend server.')
    } finally {
      setIsRequestingOtp(false)
    }
  }

  // Step 2: Verify OTP and Dispatch Bulk Emails
  const handleVerifyAndDispatchBulk = async (otp) => {
    setIsVerifyingOtp(true)
    addTerminalLog('info', 'SECURITY', 'Verifying security OTP...')

    try {
      setIsOtpModalOpen(false)
      setIsDispatching(true)
      setProgress(10)
      setDispatchDone(false)

      addTerminalLog('info', 'RESEND_API', `Dispatching ${parsedContacts.length} emails...`)

      const res = await fetch(`${API_BASE_URL}/api/emails/bulk-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: parsedContacts,
          subject,
          templatePrompt: aiPrompt,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setProgress(100)
        setIsDispatching(false)
        setDispatchDone(true)

        data.results.forEach((r) => {
          addTerminalLog(
            r.status === 'SENT' ? 'success' : 'error',
            r.email,
            r.status === 'SENT' ? `Delivered (ID: ${r.resendId})` : `Failed: ${r.error}`
          )
        })

        fetchStats()
      } else {
        setIsDispatching(false)
        addTerminalLog('error', 'BULK_ERROR', data.error || 'Bulk dispatch failed.')
      }
    } catch (err) {
      setIsDispatching(false)
      addTerminalLog('error', 'SERVER_ERROR', err.message)
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  return (
    <div className="min-h-screen bg-glow">
      <OtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onConfirm={handleVerifyAndDispatchBulk}
        senderEmail={senderEmail}
        isVerifying={isVerifyingOtp}
      />

      {/* ── HEADER ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 glass" style={{ borderBottom: '1px solid #1E2530' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <GoldLettermark />
            <div>
              <div className="font-bold text-sm leading-tight" style={{ color: '#F5F2EA' }}>MailFreeli</div>
              <div className="text-xs leading-tight" style={{ color: '#9CA3AF', letterSpacing: '0.04em' }}>ENTERPRISE</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_TABS.map(tab => (
              <button key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`nav-tab px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab ? 'active' : ''}`}
                      style={{
                        color: activeTab === tab ? '#D6A967' : '#9CA3AF',
                        background: activeTab === tab ? 'rgba(214,169,103,0.07)' : 'transparent',
                      }}>
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <StatusBadge online={apiOnline} />
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                 style={{ background: 'linear-gradient(135deg, #C49848, #D6A967)', color: '#0D0F14' }}>
              MF
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT WORKSPACE ───────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#F5F2EA' }}>
              Dispatch <span className="gold-text">Control Center</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>
              Resend API Engine · Workspace: production
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
               style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', color: '#10B981' }}>
            <Activity size={12} />
            All systems nominal
          </div>
        </div>

        {/* ── METRICS GRID ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Mail}
            label="Total Mails Logged"
            value={stats.totalLogs ? String(stats.totalLogs) : '0'}
            sub={`Sent: ${stats.sentCount || 0} | Failed: ${stats.failedCount || 0}`}
            badge={stats.completionRate || '100.0%'}
            accent="rgba(16,185,129,0.06)"
          />
          <MetricCard
            icon={Layers}
            label="Active Queue"
            value={isDispatching ? `${parsedContacts.length}` : '0'}
            sub={isDispatching ? 'Dispatching CSV batch...' : 'Awaiting dispatch trigger'}
            badge={isDispatching ? 'LIVE' : undefined}
            accent="rgba(214,169,103,0.06)"
          />
          <MetricCard
            icon={Zap}
            label="Dispatch Velocity"
            value="0.50s"
            sub="Per email · Resend API delay"
            accent="rgba(99,102,241,0.06)"
          />
          <div className="glass rounded-2xl p-5 flex flex-col gap-3 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl"
                   style={{ background: 'rgba(214,169,103,0.08)', border: '1px solid rgba(214,169,103,0.15)' }}>
                <BarChart3 size={18} style={{ color: '#D6A967' }} strokeWidth={1.5} />
              </div>
              <div className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Daily Quota Tracker</div>
            </div>
            <div className="space-y-3">
              <ProgressBar label="Resend API" value={parsedContacts.length} max={100} color="#D6A967" />
              <ProgressBar label="Gmail SMTP" value={Number(stats.sentCount) || 0} max={500} color="#10B981" />
            </div>
          </div>
        </div>

        {/* ── BULK WORKSPACE (2-COLUMN GRID) ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Campaign Setup Form */}
          <div className="glass rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid #1E2530' }}>
              <FileText size={16} style={{ color: '#D6A967' }} strokeWidth={1.5} />
              <h2 className="font-semibold text-sm" style={{ color: '#F5F2EA' }}>Campaign Setup</h2>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#9CA3AF' }}>Sender Verification Address</label>
              <input
                type="email"
                value={senderEmail}
                onChange={e => setSenderEmail(e.target.value)}
                placeholder="sender@domain.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(16,20,27,0.8)', border: '1px solid #292E36', color: '#F5F2EA' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#9CA3AF' }}>Recipient List (CSV)</label>
              <label
                className={`drag-zone block rounded-xl p-6 text-center cursor-pointer ${isDragging ? 'dragging' : ''}`}
                style={{
                  border: `2px dashed ${csvFile ? '#D6A967' : '#292E36'}`,
                  background: csvFile ? 'rgba(214,169,103,0.04)' : 'rgba(20,25,34,0.5)',
                }}
                onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
                {csvFile ? (
                  <div className="space-y-2">
                    <CheckCircle size={24} style={{ color: '#10B981', margin: '0 auto' }} strokeWidth={1.5} />
                    <div className="text-sm font-semibold" style={{ color: '#F5F2EA' }}>{csvFile.name}</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                         style={{ background: 'rgba(214,169,103,0.12)', border: '1px solid rgba(214,169,103,0.25)', color: '#D6A967' }}>
                      <Users size={11} />
                      {parsedContacts.length} contacts parsed
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload size={24} style={{ color: '#9CA3AF', margin: '0 auto' }} strokeWidth={1.5} />
                    <div className="text-sm font-medium" style={{ color: '#9CA3AF' }}>Drop CSV here or click to browse</div>
                    <div className="text-xs" style={{ color: '#6B7280' }}>Columns needed: email, name, company</div>
                  </div>
                )}
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: '#9CA3AF' }}>Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject with {{name}} tag"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(16,20,27,0.8)', border: '1px solid #292E36', color: '#F5F2EA' }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: '#9CA3AF' }}>Groq AI Template Prompt</label>
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono font-semibold"
                      style={{ background: 'rgba(214,169,103,0.1)', color: '#D6A967', border: '1px solid rgba(214,169,103,0.2)' }}>
                  {'{{name}}'}
                </span>
              </div>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Personalization prompt using CSV variables"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={{ background: 'rgba(16,20,27,0.8)', border: '1px solid #292E36', color: '#F5F2EA' }}
              />
            </div>

            <button
              onClick={handleInitiateBulkCampaign}
              disabled={isDispatching || isRequestingOtp}
              className="btn-gold w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
              {isRequestingOtp ? (
                'Requesting OTP Verification...'
              ) : isDispatching ? (
                'Dispatching Campaign...'
              ) : (
                '🚀 Launch Bulk Campaign'
              )}
            </button>
          </div>

          {/* RIGHT: Live Terminal Output */}
          <div className="glass rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1" style={{ borderBottom: '1px solid #1E2530' }}>
              <div className="flex items-center gap-2">
                <Terminal size={16} style={{ color: '#D6A967' }} strokeWidth={1.5} />
                <h2 className="font-semibold text-sm" style={{ color: '#F5F2EA' }}>Live Dispatch Terminal</h2>
              </div>
              {dispatchDone && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  ✓ Batch complete
                </span>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-2" style={{ color: '#9CA3AF' }}>
                <span>Progress</span>
                <span style={{ color: '#D6A967', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#10141B', border: '1px solid #1E2530' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #B88A48, #D6A967, #F0C980)',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            <div
              ref={terminalRef}
              className="flex-1 rounded-xl p-4 overflow-y-auto terminal-scroll space-y-2"
              style={{
                background: '#10141B',
                border: '1px solid #1A1F28',
                fontFamily: 'var(--font-mono)',
                minHeight: '280px',
                maxHeight: '320px',
              }}>
              <div className="flex items-center gap-1.5 pb-2 mb-1" style={{ borderBottom: '1px solid #1E2530' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
                <span className="ml-2 text-xs" style={{ color: '#4B5563' }}>mailfreeli — resend-engine v2.4.1</span>
              </div>

              {logs.length === 0 ? (
                <div className="text-xs text-gray-500 italic pt-4">No active batch logs. Upload a CSV file to begin.</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="log-entry flex items-start gap-3 text-xs">
                    <span style={{ color: '#4B5563', minWidth: 64 }}>{log.time}</span>
                    <LogPill type={log.type} />
                    <span className="truncate flex-1" style={{ color: log.type === 'error' ? '#EF4444' : log.type === 'info' ? '#D6A967' : '#9CA3AF' }}>
                      {log.recipient}
                    </span>
                    <span style={{ color: '#6B7280', minWidth: 'max-content' }}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}