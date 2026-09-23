import React, { useState, useEffect, useRef } from 'react'

// ─── Top Navigation Bar ───────────────────────────────────────────────────────

function TopNav({ page, setPage }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'single', label: 'Single Dispatch' },
    { id: 'bulk', label: 'Bulk Campaign' },
    { id: 'logs', label: 'Logs' },
  ]

  return (
    <nav
      className="glass-card sticky top-0 z-50 flex items-center justify-between px-6"
      style={{ height: 64, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          className="gold-gradient flex items-center justify-center font-extrabold text-lg"
          style={{ width: 36, height: 36, borderRadius: 9, color: '#090B0F', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          M
        </div>
        <div>
          <div className="font-bold text-white" style={{ fontSize: 16, lineHeight: 1.1, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            MailFreeli
          </div>
          <div
            className="mono"
            style={{ fontSize: 9, letterSpacing: '0.15em', color: '#D6A967', lineHeight: 1 }}
          >
            ENTERPRISE
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center" style={{ gap: 2 }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setPage(t.id)}
            className={`px-5 py-2 text-sm font-semibold rounded-t-lg transition-all ${page === t.id ? 'nav-pill-active' : 'nav-pill'}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Right Cluster */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div
          className="status-badge glow-green"
          style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
        >
          <span className="pulse-dot" style={{ background: '#10B981', color: '#10B981' }} />
          API Engine Online
        </div>
        <button
          className="relative"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid #292E36', borderRadius: 8, padding: '7px 9px', cursor: 'pointer' }}
        >
          <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            className="absolute"
            style={{ top: 5, right: 5, width: 7, height: 7, background: '#D6A967', borderRadius: '50%', border: '1.5px solid #090B0F' }}
          />
        </button>
        <div
          className="gold-gradient flex items-center justify-center font-bold text-sm"
          style={{ width: 34, height: 34, borderRadius: '50%', color: '#090B0F', cursor: 'pointer' }}
        >
          JD
        </div>
      </div>
    </nav>
  )
}

// ─── Page 1: Dashboard ───────────────────────────────────────────────────────

function Dashboard({ setPage }) {
  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>
      {/* Hero Banner */}
      <div
        className="glass-card gold-border"
        style={{ borderRadius: 16, padding: '36px 40px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}
      >
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(214,169,103,0.07) 0%, transparent 60%)',
            pointerEvents: 'none'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720 }}>
            <div className="flex items-center gap-3 mb-4">
              <span
                className="status-badge"
                style={{ background: 'rgba(214,169,103,0.12)', color: '#D6A967', border: '1px solid rgba(214,169,103,0.3)', fontSize: 10 }}
              >
                <span className="pulse-dot" style={{ background: '#D6A967', color: '#D6A967' }} />
                v3.2.1 STABLE
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(22px, 3vw, 32px)',
                fontWeight: 800,
                color: '#F1F3F8',
                lineHeight: 1.2,
                marginBottom: 12,
                letterSpacing: '-0.02em'
              }}
            >
              Welcome to{' '}
              <span className="gold-text">MailFreeli Enterprise</span>{' '}
              AI Engine
            </h1>
            <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Multi-provider SMTP orchestration powered by <span style={{ color: '#D6A967' }}>Groq LLaMA-3.3</span> for hyper-personalized outbound. Intelligent failover across Resend, Gmail SMTP, and custom providers — with sub-200ms dispatch velocity and OTP-secured batch authorization.
            </p>
            <div className="flex items-center gap-3">
              <button
                className="btn-primary"
                onClick={() => setPage('bulk')}
                style={{ padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 700 }}
              >
                Open Campaign Setup
              </button>
              <button
                style={{
                  padding: '9px 22px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid #292E36',
                  color: '#9CA3AF', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                View API Docs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}
      >
        {/* Metric 1 */}
        <div className="glass-card metric-card" style={{ borderRadius: 12, padding: '22px 24px' }}>
          <div style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Total Emails Sent</div>
          <div className="flex items-end gap-3">
            <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: '#F1F3F8', lineHeight: 1 }}>48,291</div>
            <div
              className="status-badge"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', marginBottom: 3, fontSize: 10 }}
            >
              +12.4%
            </div>
          </div>
          <div style={{ color: '#4B5563', fontSize: 12, marginTop: 8 }}>vs. last 30 days</div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card metric-card" style={{ borderRadius: 12, padding: '22px 24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Active Queue</div>
            <span className="status-badge" style={{ background: 'rgba(214,169,103,0.12)', color: '#D6A967', border: '1px solid rgba(214,169,103,0.3)', fontSize: 9 }}>
              <span className="pulse-dot" style={{ background: '#D6A967' }} />
              LIVE
            </span>
          </div>
          <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: '#D6A967', lineHeight: 1 }}>342</div>
          <div style={{ color: '#4B5563', fontSize: 12, marginTop: 8 }}>messages pending dispatch</div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card metric-card" style={{ borderRadius: 12, padding: '22px 24px' }}>
          <div style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Dispatch Velocity</div>
          <div className="flex items-baseline gap-1">
            <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: '#F1F3F8', lineHeight: 1 }}>0.18</div>
            <div className="mono" style={{ fontSize: 16, color: '#6B7280' }}>s/mail</div>
          </div>
          <div style={{ color: '#4B5563', fontSize: 12, marginTop: 8 }}>avg. across all providers</div>
        </div>

        {/* Metric 4 — Daily Quota */}
        <div className="glass-card metric-card" style={{ borderRadius: 12, padding: '22px 24px' }}>
          <div style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Daily Quota</div>
          <div style={{ marginBottom: 12 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Resend API</span>
              <span className="mono" style={{ fontSize: 11, color: '#D6A967' }}>67/100</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '67%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Gmail SMTP</span>
              <span className="mono" style={{ fontSize: 11, color: '#10B981' }}>318/500</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: '63.6%', background: 'linear-gradient(90deg, #10B981, #059669)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlight Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Card A */}
        <div className="glass-card" style={{ borderRadius: 14, padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute', top: 0, right: 0, width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(214,169,103,0.08) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="gold-gradient"
              style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="20" height="20" fill="none" stroke="#090B0F" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#F1F3F8', fontSize: 14 }}>Groq AI Personalization</div>
              <div className="mono" style={{ fontSize: 10, color: '#D6A967' }}>LLaMA-3.3-70B</div>
            </div>
          </div>
          <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
            Real-time content generation per recipient using contextual variables, company data, and behavioral signals.
          </p>
          <div className="flex gap-4">
            {[ ['Tokens/req', '~840'], ['Avg latency', '1.2s'], ['Quality', '94%'] ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: '#4B5563', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
                <div className="mono" style={{ fontSize: 15, color: '#D6A967', fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card B */}
        <div className="glass-card" style={{ borderRadius: 14, padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute', top: 0, right: 0, width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="20" height="20" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#F1F3F8', fontSize: 14 }}>Multi-Provider Failover</div>
              <div style={{ fontSize: 11, color: '#10B981' }}>2 of 2 providers active</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Resend API', status: 'Primary', color: '#10B981' },
              { name: 'Gmail SMTP', status: 'Failover', color: '#D6A967' },
              { name: 'SendGrid', status: 'Standby', color: '#4B5563' },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: 13, color: '#E8EAF0' }}>{p.name}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card C */}
        <div className="glass-card" style={{ borderRadius: 14, padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute', top: 0, right: 0, width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <svg width="20" height="20" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#F1F3F8', fontSize: 14 }}>OTP Security Shield</div>
              <div style={{ fontSize: 11, color: '#EF4444' }}>Batch authorization active</div>
            </div>
          </div>
          <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6, marginBottom: 12 }}>
            All bulk dispatch operations require 6-digit OTP verification. Codes expire in 5 minutes.
          </p>
          <div className="flex gap-3">
            {[ ['Batch >50', 'OTP Required'], ['Expiry', '5 min'], ['Max Tries', '3'] ].map(([lbl, val]) => (
              <div key={lbl}>
                <div style={{ fontSize: 10, color: '#4B5563', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{lbl}</div>
                <div className="mono" style={{ fontSize: 12, color: '#EF4444', fontWeight: 700 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page 2: Single Dispatch ──────────────────────────────────────────────────

function SingleDispatch() {
  const [email, setEmail] = useState('sarah.chen@acmecorp.io')
  const [subject, setSubject] = useState('Q4 Partnership Proposal — MailFreeli Integration')
  const [body, setBody] = useState(`Hi Sarah,\n\nI hope this message finds you well. Following up on our conversation from the conference last week — I wanted to share how MailFreeli Enterprise can streamline your outbound comms infrastructure.\n\nOur Groq-powered AI engine achieves 94% personalization quality at sub-200ms dispatch velocity. Attached is a tailored overview for Acme Corp's current scale.\n\nWould you be open to a 20-minute demo this Thursday or Friday?\n\nBest,\nJames Dowell\nEnterprise AE — MailFreeli`)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [enhancing, setEnhancing] = useState(false)

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSend = () => {
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1500)
    setTimeout(() => setSent(false), 5000)
  }

  const handleEnhance = () => {
    setEnhancing(true)
    setTimeout(() => {
      setBody(prev => prev + '\n\n[Groq AI enhanced: Added personalized pain-point reference and social proof aligned to Acme Corp\'s industry vertical. Readability score improved: 82 → 91.]')
      setEnhancing(false)
    }, 1800)
  }

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em', marginBottom: 4 }}>Single Dispatch</h2>
        <p style={{ color: '#4B5563', fontSize: 13 }}>Compose and send an individual email with AI-enhanced personalization.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Composer */}
        <div className="glass-card" style={{ borderRadius: 14, padding: 28 }}>
          <div style={{ fontWeight: 700, color: '#F1F3F8', fontSize: 15, marginBottom: 22 }}>Email Composer</div>

          {/* Recipient */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Recipient</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="recipient@company.com"
                style={{ paddingRight: 36 }}
              />
              {validEmail && (
                <svg
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                  width="16" height="16" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject..." />
          </div>

          {/* Body */}
          <div style={{ marginBottom: 20 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Body</label>
              <button
                onClick={handleEnhance}
                disabled={enhancing}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: 'rgba(214,169,103,0.1)', border: '1px solid rgba(214,169,103,0.3)',
                  color: '#D6A967', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  opacity: enhancing ? 0.6 : 1
                }}
              >
                {enhancing ? 'Enhancing…' : '✨ Groq AI Enhance'}
              </button>
            </div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
              style={{ resize: 'vertical', lineHeight: 1.7, fontSize: 13 }}
            />
          </div>

          {/* Provider Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Provider</label>
            <select
              style={{
                width: '100%', background: 'rgba(20, 25, 34, 0.6)', border: '1px solid #292E36',
                color: '#E8EAF0', borderRadius: 8, padding: '10px 14px',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, outline: 'none', cursor: 'pointer'
              }}
            >
              <option style={{ background: '#141922' }}>Resend API (Primary)</option>
              <option style={{ background: '#141922' }}>Gmail SMTP (Failover)</option>
              <option style={{ background: '#141922' }}>Auto (Smart Routing)</option>
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={sending || !validEmail}
            style={{ width: '100%', padding: '12px', borderRadius: 9, fontSize: 14, fontWeight: 700, opacity: (!validEmail || sending) ? 0.5 : 1 }}
          >
            {sending ? 'Sending…' : '🚀 Send Single Email'}
          </button>
        </div>

        {/* Right: Live Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ borderRadius: 14, padding: 24, flex: 1 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#F1F3F8', fontSize: 15 }}>Live Preview</div>
              <span className="status-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)', fontSize: 10 }}>
                <span className="pulse-dot" style={{ background: '#10B981' }} />
                HTML Render
              </span>
            </div>
            <div
              style={{
                background: '#FFFFFF', borderRadius: 10, padding: '24px 28px', color: '#1F2937',
                fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.7, minHeight: 240,
                boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
              }}
            >
              <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>To: {email || '—'}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{subject || 'No subject'}</div>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{body}</div>
            </div>
          </div>

          {/* Toast Notification */}
          {sent && (
            <div
              className="glass-card"
              style={{
                borderRadius: 12, padding: '16px 20px',
                border: '1px solid rgba(16,185,129,0.4)',
                background: 'rgba(16,185,129,0.08)',
                display: 'flex', alignItems: 'center', gap: 12
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#10B981" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#10B981', fontSize: 13 }}>Email Dispatched Successfully</div>
                <div className="mono" style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                  via Resend API · msg_01HK2M3N4P5Q · 0.14s
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page 3: Bulk Campaign ────────────────────────────────────────────────────

const FAKE_LOGS = [
  { t: '09:41:03', e: 'sarah.chen@acmecorp.io', s: 'ok', msg: '250 OK · Resend · 0.12s' },
  { t: '09:41:04', e: 'marcus.wells@bridgetech.com', s: 'ok', msg: '250 OK · Resend · 0.09s' },
  { t: '09:41:04', e: 'invalid@no-mx.xyz', s: 'err', msg: 'MX lookup failed · bounced' },
  { t: '09:41:05', e: 'priya.sharma@globalops.io', s: 'ok', msg: '250 OK · Resend · 0.11s' },
  { t: '09:41:05', e: 'tom.riley@techstack.co', s: 'queue', msg: 'Rate limit · queued for retry' },
  { t: '09:41:06', e: 'naomi.obi@nexusventures.com', s: 'ok', msg: '250 OK · Gmail SMTP · 0.21s' },
  { t: '09:41:07', e: 'dev@spam-trap.test', s: 'err', msg: 'Blocklist match · skipped' },
  { t: '09:41:07', e: 'lucas.morin@plateforme.fr', s: 'ok', msg: '250 OK · Resend · 0.14s' },
]

function BulkCampaign() {
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef([])
  const [countdown, setCountdown] = useState(300)
  const [launched, setLaunched] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])
  const [delivered, setDelivered] = useState(0)
  const [failed, setFailed] = useState(0)
  const [queued, setQueued] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [subject, setSubject] = useState('Exclusive Q4 Offer for {{company}} — Tailored for {{name}}')
  const [prompt, setPrompt] = useState('Write a personalized cold email for a B2B SaaS decision-maker at {{company}}. Reference their industry and mention MailFreeli\'s AI dispatch velocity. Keep it under 120 words. Sign off from "James at MailFreeli".')

  useEffect(() => {
    if (!showOtp) return
    const timer = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    return () => clearInterval(timer)
  }, [showOtp])

  useEffect(() => {
    if (!launched) return
    let i = 0
    const logInterval = setInterval(() => {
      if (i >= FAKE_LOGS.length) { clearInterval(logInterval); return }
      const log = FAKE_LOGS[i]
      setLogs(prev => [...prev, log])
      setProgress(Math.round(((i + 1) / FAKE_LOGS.length) * 100))
      if (log.s === 'ok') setDelivered(d => d + 1)
      else if (log.s === 'err') setFailed(f => f + 1)
      else setQueued(q => q + 1)
      i++
    }, 600)
    return () => clearInterval(logInterval)
  }, [launched])

  const handleOtpChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[idx] = digit
    setOtp(next)
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus()
  }

  const handleOtpKey = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus()
    }
  }

  const handleConfirm = () => {
    setShowOtp(false)
    setLaunched(true)
    setLogs([])
    setProgress(0)
    setDelivered(0)
    setFailed(0)
    setQueued(0)
  }

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em', marginBottom: 4 }}>Bulk Campaign</h2>
        <p style={{ color: '#4B5563', fontSize: 13 }}>Batch email dispatch with AI personalization and real-time terminal monitoring.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left Column: Setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* CSV Dropzone */}
          <div className="glass-card" style={{ borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Recipient List (CSV)</div>
            <div
              className={`dropzone ${dragging ? 'active' : ''}`}
              style={{ padding: '32px 24px', textAlign: 'center' }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault(); setDragging(false)
                const f = e.dataTransfer.files[0]
                if (f) setFileName(f.name)
              }}
              onClick={() => {
                const inp = document.createElement('input')
                inp.type = 'file'
                inp.accept = '.csv'
                inp.onchange = (ev) => {
                  const f = ev.target.files?.[0]
                  if (f) setFileName(f.name)
                }
                inp.click()
              }}
            >
              {fileName ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                  <div style={{ fontSize: 13, color: '#10B981', fontWeight: 600, marginBottom: 4 }}>{fileName}</div>
                  <div className="mono" style={{ fontSize: 11, color: '#D6A967' }}>847 contacts parsed · 3 fields detected</div>
                </>
              ) : (
                <>
                  <svg style={{ margin: '0 auto 10px', display: 'block' }} width="32" height="32" fill="none" stroke="#4B5563" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>Drop CSV here or click to browse</div>
                  <div style={{ fontSize: 11, color: '#374151' }}>Supports: email, name, company columns</div>
                </>
              )}
            </div>
          </div>

          {/* Subject Template */}
          <div className="glass-card" style={{ borderRadius: 14, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Subject Template</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} />
          </div>

          {/* Groq Prompt */}
          <div className="glass-card" style={{ borderRadius: 14, padding: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Groq AI Template Prompt</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={4} style={{ lineHeight: 1.65, fontSize: 13 }} />
          </div>

          {/* Launch CTA */}
          <button
            className="btn-primary"
            onClick={() => { setShowOtp(true); setCountdown(300) }}
            style={{ width: '100%', padding: '15px', borderRadius: 10, fontSize: 15, fontWeight: 800 }}
          >
            🚀 Launch Bulk Campaign
          </button>
        </div>

        {/* Right Column: Live Terminal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ borderRadius: 14, padding: 24 }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, color: '#F1F3F8', fontSize: 15 }}>Batch Progress</div>
              <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: progress === 100 ? '#10B981' : '#D6A967' }}>{progress}%</span>
            </div>
            <div className="progress-bar-track" style={{ height: 8, marginBottom: 12 }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%`, background: progress === 100 ? 'linear-gradient(90deg, #10B981, #059669)' : 'linear-gradient(90deg, #D6A967, #B88A48)' }} />
            </div>
          </div>

          {/* Live Terminal Window */}
          <div className="terminal-window" style={{ flex: 1, minHeight: 300 }}>
            <div className="terminal-topbar">
              <div className="terminal-dot" style={{ background: '#EF4444' }} />
              <div className="terminal-dot" style={{ background: '#F59E0B' }} />
              <div className="terminal-dot" style={{ background: '#10B981' }} />
              <span className="mono" style={{ fontSize: 11, color: '#4B5563', marginLeft: 8 }}>mailfreeli-dispatch — bulk-run-2026</span>
            </div>
            <div style={{ padding: '14px 18px', minHeight: 240, maxHeight: 340, overflowY: 'auto' }}>
              {!launched ? (
                <div className="mono log-dim" style={{ fontSize: 12 }}>$ Awaiting campaign launch…</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mono" style={{ fontSize: 11, lineHeight: 2, display: 'flex', gap: 12 }}>
                    <span className="log-dim">[{log.t}]</span>
                    <span className={log.s === 'ok' ? 'log-ok' : log.s === 'err' ? 'log-err' : 'log-queue'}>
                      {log.s === 'ok' ? '✓ SENT' : log.s === 'err' ? '✗ ERR ' : '⏸ QUEUE'}
                    </span>
                    <span style={{ color: '#9CA3AF', flex: 1 }}>{log.e}</span>
                    <span className="log-dim">{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Summary Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: 'Delivered', val: delivered, color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
              { label: 'Failed', val: failed, color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
              { label: 'Queued', val: queued, color: '#D6A967', bg: 'rgba(214,169,103,0.08)', border: 'rgba(214,169,103,0.2)' },
            ].map(c => (
              <div key={c.label} className="glass-card" style={{ borderRadius: 10, padding: '14px 16px', textAlign: 'center', background: c.bg, borderColor: c.border }}>
                <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.val}</div>
                <div style={{ fontSize: 11, color: '#4B5563', fontWeight: 600, textTransform: 'uppercase', marginTop: 3 }}>{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtp && (
        <div className="modal-overlay" onClick={() => setShowOtp(false)}>
          <div className="glass-card" style={{ borderRadius: 20, padding: '40px 48px', maxWidth: 440, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 800, color: '#F1F3F8', marginBottom: 8 }}>
                🔒 OTP Security Verification
              </h3>
              <p style={{ color: '#6B7280', fontSize: 13 }}>Enter the 6-digit verification code to authorize bulk dispatch.</p>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={el => { otpRefs.current[i] = el }}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKey(i, e)}
                />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <span className="mono" style={{ fontSize: 12, color: countdown > 60 ? '#D6A967' : '#EF4444' }}>
                Expires in {fmt(countdown)}
              </span>
            </div>

            <button className="btn-primary" onClick={handleConfirm} style={{ width: '100%', padding: '14px', borderRadius: 10, fontSize: 14 }}>
              Confirm & Dispatch
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page 4: Logs & Analytics ─────────────────────────────────────────────────

const ALL_LOGS = [
  { ts: '2026-09-23 09:41:07', email: 'dev@spam-trap.test', type: 'bounced', provider: 'Resend', code: '550', reason: 'Blocklist match — spam trap' },
  { ts: '2026-09-23 09:41:07', email: 'lucas.morin@plateforme.fr', type: 'delivered', provider: 'Resend', code: '250', reason: 'Message accepted' },
  { ts: '2026-09-23 09:41:06', email: 'naomi.obi@nexusventures.com', type: 'delivered', provider: 'Gmail SMTP', code: '250', reason: 'Message accepted' },
  { ts: '2026-09-23 09:41:05', email: 'tom.riley@techstack.co', type: 'queued', provider: 'Resend', code: '429', reason: 'Rate limit — queued for retry' },
  { ts: '2026-09-23 09:41:05', email: 'priya.sharma@globalops.io', type: 'delivered', provider: 'Resend', code: '250', reason: 'Message accepted' },
]

function Logs() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ALL_LOGS.filter(l => {
    if (filter !== 'all' && l.type !== filter) return false
    if (search && !l.email.includes(search) && !l.reason.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ padding: '32px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: '#F1F3F8', letterSpacing: '-0.02em', marginBottom: 4 }}>Logs & Analytics</h2>
        <p style={{ color: '#4B5563', fontSize: 13 }}>Full audit trail for all dispatch operations.</p>
      </div>

      <div className="glass-card" style={{ borderRadius: 14, padding: '18px 22px', marginBottom: 20 }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or status..."
        />
      </div>

      <div className="terminal-window">
        <div style={{ padding: '16px 20px', maxHeight: 400, overflowY: 'auto' }}>
          {filtered.map((log, i) => (
            <div key={i} className="mono" style={{ fontSize: 11.5, lineHeight: 2, display: 'flex', gap: 16 }}>
              <span className="log-dim">{log.ts}</span>
              <span className={log.type === 'delivered' ? 'log-ok' : log.type === 'bounced' ? 'log-err' : 'log-queue'}>
                {log.type.toUpperCase()}
              </span>
              <span style={{ color: '#9CA3AF', flex: 1 }}>{log.email}</span>
              <span className="log-dim">{log.reason}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Root App Component ───────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', background: '#090B0F', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="ambient-bg" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TopNav page={page} setPage={setPage} />
        {page === 'dashboard' && <Dashboard setPage={setPage} />}
        {page === 'single' && <SingleDispatch />}
        {page === 'bulk' && <BulkCampaign />}
        {page === 'logs' && <Logs />}
      </div>
    </div>
  )
}