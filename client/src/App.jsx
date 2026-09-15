import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// SEPARATED FOOTER COMPONENT
function Footer() {
  return (
    <footer style={styles.fullFooter}>
      <div style={styles.footerInner} className="footer-inner">
        <div style={styles.footerBrandGroup}>
          <span style={{ color: '#F5F2EA', fontWeight: '600' }}>© 2026 MailFreeli</span>
          <span style={{ color: '#292E36' }}>•</span>
          <span>Built for smarter communication</span>
          <span style={{ color: '#292E36' }}>•</span>
          <span>Powered by AI</span>
        </div>

        <div style={styles.footerStatusGroup}>
          <span className="pulse-dot" style={styles.statusDot}></span>
          <span>System Online</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isDispatched, setIsDispatched] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // OTP Countdown Timer (300 seconds = 5 mins)
  const [otpTimeLeft, setOtpTimeLeft] = useState(300);

  // Mid-Top Alert State
  const [toast, setToast] = useState(null);

  const [stats, setStats] = useState({
    completionRate: '100.0%',
    activeQueue: '0',
    velocity: '0.18s',
    totalLogs: '0',
    sentCount: '0',
  });

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // OTP Countdown Timer Logic
  useEffect(() => {
    let timer;
    if (showOtpModal && otpTimeLeft > 0) {
      timer = setInterval(() => {
        setOtpTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (otpTimeLeft === 0) {
      setShowOtpModal(false);
      showToast('OTP expired! Please request a new one.', 'error');
    }
    return () => clearInterval(timer);
  }, [showOtpModal, otpTimeLeft]);

  // CONFETTI BURST ANIMATION
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D6A967', '#35D0A0', '#F5F2EA', '#F0C98A']
    });
  };

  const handleReelDemoFill = () => {
    setSender('demo.agent@mailfreeli.ai');
    setRecipient('alex.client@enterprise.com');
    setMeetingLink('https://meet.google.com/abc-demo-xyz');
    setPrompt('Draft a concise follow-up email requesting a 15-minute alignment sync tomorrow to review sprint progress.');
    showToast('🎬 Reel Demo Mode: Sample data auto-filled!', 'success');
  };

  const handleQuickSuggestion = (text) => setPrompt(text);

  const handleGenerateDraft = async () => {
    if (!recipient || !prompt) {
      showToast('Please fill in recipient email and prompt!', 'error');
      return;
    }

    setGenerating(true);
    setIsDispatched(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, prompt, meetingLink }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubject(data.subject || 'Follow-up from MailFreeli');
        setBody(data.body || prompt);
        showToast('AI Draft generated successfully!', 'success');
        fetchStats();
      } else {
        showToast(`Error: ${data.error || 'AI generation failed.'}`, 'error');
      }
    } catch (error) {
      showToast('Failed to generate draft. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleInitiateDispatch = async () => {
    if (!recipient || !subject || !body) {
      showToast('Missing email content to dispatch!', 'error');
      return;
    }

    setDispatching(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpTimeLeft(300); // Reset to 5 mins
        setShowOtpModal(true);
        showToast(data.message || 'OTP sent! Check your sender inbox.', 'success');
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showToast('Failed to request OTP.', 'error');
    } finally {
      setDispatching(false);
    }
  };

  const handleVerifyAndDispatch = async () => {
    if (!otpInput) {
      showToast('Please enter the verification OTP!', 'error');
      return;
    }

    setVerifyingOtp(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-and-dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp: otpInput,
          sender,
          recipient,
          prompt,
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDispatched(true);
        setShowOtpModal(false);
        setOtpInput('');
        triggerConfetti(); // TRIGGER CONFETTI ON DISPATCH
        showToast('OTP verified & email dispatched successfully!', 'success');
        fetchStats();
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showToast('OTP verification failed.', 'error');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const copyToClipboard = () => {
    if (!body) return;
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    showToast('Copied draft to clipboard!', 'success');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div style={styles.appContainer}>
      <style>{`
        html, body, #root {
          background-color: #090B0F !important;
          color: #F5F2EA !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          overflow-x: hidden !important;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        * { box-sizing: border-box; }
        
        input:focus, textarea:focus { border-color: #D6A967 !important; outline: none !important; box-shadow: 0 0 10px rgba(214, 169, 103, 0.2) !important; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #10141B; }
        ::-webkit-scrollbar-thumb { background: #292E36; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #D6A967; }

        @keyframes dropDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @keyframes modalScale {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(53, 208, 160, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(53, 208, 160, 0); }
          100% { box-shadow: 0 0 0 0 rgba(53, 208, 160, 0); }
        }

        .pulse-dot {
          animation: pulseGlow 2s infinite;
        }

        .glow-btn {
          transition: all 0.3s ease !important;
        }
        .glow-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(214, 169, 103, 0.4) !important;
        }

        .hover-card {
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
        }
        .hover-card:hover {
          transform: translateY(-4px) !important;
          border-color: rgba(214, 169, 103, 0.4) !important;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5) !important;
        }

        @media (max-width: 900px) {
          .cockpit-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .main-layout {
            padding: 16px 14px !important;
            gap: 16px !important;
          }
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .modal-box {
            width: 92% !important;
            padding: 20px 16px !important;
          }
          .footer-inner {
            flex-direction: column !important;
            text-align: center !important;
            gap: 10px !important;
          }
        }

        @media (max-width: 420px) {
          .kpi-grid {
            grid-template-columns: 1fr !important;
          }
          .header-title-sub {
            display: none !important;
          }
        }
      `}</style>

      {/* MID-TOP POPUP ALERT */}
      {toast && (
        <div style={styles.midTopAlert}>
          <div style={{
            ...styles.alertIcon,
            backgroundColor: toast.type === 'success' ? 'rgba(53, 208, 160, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: toast.type === 'success' ? '#35D0A0' : '#EF4444'
          }}>
            {toast.type === 'success' ? '✓' : '⚠️'}
          </div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#F5F2EA' }}>
            {toast.message}
          </div>
        </div>
      )}

      {/* OTP VERIFICATION MODAL WITH COUNTDOWN TIMER */}
      {showOtpModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="modal-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#F5F2EA', margin: 0 }}>
                🔒 Security Verification
              </h3>
              <div style={styles.timerBadge}>
                ⏱️ {formatTime(otpTimeLeft)}
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px', lineHeight: '1.5' }}>
              A 6-digit OTP has been sent to <strong>{sender || 'your sender email'}</strong>. Enter it below to authorize this email dispatch.
            </p>

            <input
              type="text"
              maxLength="6"
              placeholder="Enter OTP"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              style={{ ...styles.input, textAlign: 'center', letterSpacing: '4px', fontSize: '18px', fontWeight: 'bold' }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={styles.secondaryBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyAndDispatch}
                disabled={verifyingOtp}
                className="glow-btn"
                style={{ ...styles.primaryBtn, marginTop: 0, opacity: verifyingOtp ? 0.6 : 1 }}
              >
                {verifyingOtp ? 'Verifying...' : 'Verify & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-WIDTH HEADER WITH REEL DEMO MODE BUTTON */}
      <header style={styles.fullHeader}>
        <div style={styles.headerInner}>
          <div style={styles.logoGroup}>
            <div style={styles.logoBadge}>M</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '700', fontSize: '16px', color: '#F5F2EA' }}>MailFreeli</span>
                <span style={styles.enterprisePill}>Enterprise</span>
              </div>
              <div style={{ fontSize: '11px', color: '#9CA3AF' }} className="header-title-sub">AI-Powered Email Dispatch</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleReelDemoFill}
              style={styles.demoModeBtn}
              title="Auto-fill sample data for demo video"
            >
              🎬 Demo Mode
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={styles.avatar}>U</div>
              <span style={{ fontSize: '13px', color: '#F5F2EA', fontWeight: '500' }}>Hello, User</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.main} className="main-layout">
        <div style={styles.gridTwoCol} className="cockpit-grid">
          
          {/* LEFT: AI COCKPIT */}
          <section style={styles.card} className="hover-card">
            <div>
              <h2 style={styles.cardTitle}>AI Dispatch Cockpit</h2>
              <p style={styles.cardSub}>Compose your email with AI assistance</p>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>FROM (SENDER EMAIL)</label>
                <input
                  type="email"
                  placeholder="sender@domain.com"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  style={styles.input}
                />

                <label style={styles.label}>TO (RECIPIENT EMAIL)</label>
                <input
                  type="email"
                  placeholder="recipient@domain.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  style={styles.input}
                />

                <label style={styles.label}>MEETING / CALENDAR LINK (OPTIONAL)</label>
                <input
                  type="text"
                  placeholder="Calendar or Google Meet URL"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  style={styles.input}
                />

                <label style={styles.label}>AI CONTEXT / PROMPT</label>
                <textarea
                  rows={3}
                  placeholder="Enter AI prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  style={styles.textarea}
                />

                <label style={{ ...styles.label, marginBottom: '4px' }}>QUICK SUGGESTIONS</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Follow-up email', prompt: 'Draft a follow-up email after meeting.' },
                    { label: 'Meeting request', prompt: 'Request a 15-minute quick alignment meeting.' },
                    { label: 'Project update', prompt: 'Provide a quick weekly project progress update.' },
                    { label: 'Introduction', prompt: 'Introduction email to new client.' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickSuggestion(item.prompt)}
                      style={styles.pillBtn}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={generating}
              className="glow-btn"
              style={{ ...styles.primaryBtn, opacity: generating ? 0.6 : 1 }}
            >
              ✨ {generating ? 'Generating AI Draft...' : 'Generate AI Draft'}
            </button>
          </section>

          {/* RIGHT: EDITABLE DRAFT & PREVIEW */}
          <section style={styles.card} className="hover-card">
            <div>
              <h2 style={styles.cardTitle}>Editable Draft & Preview</h2>
              <p style={styles.cardSub}>Review and edit your AI-generated email</p>

              <div style={styles.fieldGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={styles.label}>SUBJECT</label>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{subject.length}/120</span>
                </div>
                <input
                  type="text"
                  placeholder="Email Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={styles.input}
                />

                <div style={styles.previewBox}>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    style={styles.copyBtn}
                    title="Copy Draft"
                  >
                    📋
                  </button>

                  <div style={styles.previewMeta}>
                    <div><span style={{ color: '#9CA3AF' }}>To:</span> {recipient || 'recipient@domain.com'}</div>
                    <div><span style={{ color: '#9CA3AF' }}>From:</span> {sender || 'sender@domain.com'}</div>
                  </div>

                  <textarea
                    placeholder="Your AI-generated email body will appear here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    style={styles.previewTextarea}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={handleInitiateDispatch}
                disabled={dispatching || !body}
                className="glow-btn"
                style={{ ...styles.primaryBtn, opacity: dispatching || !body ? 0.5 : 1 }}
              >
                🚀 {dispatching ? 'Sending OTP...' : 'Send Email via SMTP'}
              </button>

              <div style={styles.statusIndicator}>
                <span style={{ color: '#35D0A0', fontWeight: 'bold' }}>✓</span> {isDispatched ? 'Dispatched via SMTP' : 'Ready to generate'}
              </div>
            </div>
          </section>

        </div>

        {/* METRICS ROW */}
        <section style={styles.gridFourCol} className="kpi-grid">
          <div style={styles.kpiCard} className="hover-card">
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>AI SUCCESS RATE</span>
              <span style={{ ...styles.badge, color: '#35D0A0', borderColor: 'rgba(53, 208, 160, 0.3)' }}>LIVE</span>
            </div>
            <div style={styles.kpiValue}>{stats.completionRate}</div>
            <div style={styles.kpiSub}>{stats.totalLogs} logs</div>
          </div>

          <div style={styles.kpiCard} className="hover-card">
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>SMTP QUEUE</span>
              <span style={{ ...styles.badge, color: '#D6A967', borderColor: 'rgba(214, 169, 103, 0.3)' }}>READY</span>
            </div>
            <div style={styles.kpiValue}>{stats.activeQueue}</div>
            <div style={styles.kpiSub}>0 Backlog</div>
          </div>

          <div style={styles.kpiCard} className="hover-card">
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>AVG VELOCITY</span>
              <span style={{ ...styles.badge, color: '#8B7CF6', borderColor: 'rgba(139, 124, 246, 0.3)' }}>FAST</span>
            </div>
            <div style={styles.kpiValue}>{stats.velocity}</div>
            <div style={styles.kpiSub}>Response</div>
          </div>

          <div style={styles.kpiCard} className="hover-card">
            <div style={styles.kpiHeader}>
              <span style={styles.kpiLabel}>TOTAL MAILS SENT</span>
              <span style={{ ...styles.badge, color: '#35D0A0', borderColor: 'rgba(53, 208, 160, 0.3)' }}>SYNCED</span>
            </div>
            <div style={styles.kpiValue}>{stats.sentCount || stats.totalLogs}</div>
            <div style={styles.kpiSub}>Live DB</div>
          </div>
        </section>

      </main>

      {/* SEPARATED FOOTER COMPONENT */}
      <Footer />
    </div>
  );
}

const styles = {
  appContainer: {
    backgroundColor: '#090B0F',
    color: '#F5F2EA',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  midTopAlert: {
    position: 'fixed',
    top: '72px',
    left: '50%',
    animation: 'dropDown 0.25s ease-out forwards',
    backgroundColor: '#141922',
    border: '1px solid #292E36',
    borderRadius: '14px',
    padding: '12px 18px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 9999,
    maxWidth: '380px',
    width: '90%',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(9, 11, 15, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(8px)',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 25, 34, 0.95)',
    border: '1px solid rgba(214, 169, 103, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
    animation: 'modalScale 0.25s ease-out forwards',
  },
  timerBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#D6A967',
    backgroundColor: 'rgba(214, 169, 103, 0.1)',
    border: '1px solid rgba(214, 169, 103, 0.3)',
    borderRadius: '12px',
    padding: '3px 8px',
  },
  secondaryBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #292E36',
    backgroundColor: '#10141B',
    color: '#F5F2EA',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  alertIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '13px',
    flexShrink: 0,
  },
  fullHeader: {
    width: '100%',
    borderBottom: '1px solid #292E36',
    backgroundColor: 'rgba(16, 20, 27, 0.9)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    padding: '0 20px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #D6A967, #B88A48)',
    color: '#090B0F',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    boxShadow: '0 4px 12px rgba(214, 169, 103, 0.3)',
  },
  enterprisePill: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#D6A967',
    backgroundColor: 'rgba(214, 169, 103, 0.1)',
    border: '1px solid rgba(214, 169, 103, 0.2)',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  demoModeBtn: {
    backgroundColor: 'rgba(214, 169, 103, 0.15)',
    border: '1px solid #D6A967',
    borderRadius: '20px',
    color: '#D6A967',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#141922',
    border: '1px solid #292E36',
    color: '#D6A967',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  main: {
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    padding: '24px 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  gridTwoCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'rgba(20, 25, 34, 0.85)',
    border: '1px solid #292E36',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '480px',
    backdropFilter: 'blur(12px)',
  },
  cardTitle: { fontSize: '18px', fontWeight: '700', color: '#F5F2EA' },
  cardSub: { fontSize: '12px', color: '#9CA3AF', marginTop: '2px', marginBottom: '16px' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '11px', fontWeight: '600', color: '#9CA3AF', letterSpacing: '0.5px' },
  input: {
    backgroundColor: '#10141B',
    border: '1px solid #292E36',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#F5F2EA',
    fontSize: '13px',
    width: '100%',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  textarea: {
    backgroundColor: '#10141B',
    border: '1px solid #292E36',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#F5F2EA',
    fontSize: '13px',
    width: '100%',
    resize: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  pillBtn: {
    backgroundColor: '#10141B',
    border: '1px solid #292E36',
    borderRadius: '20px',
    color: '#F5F2EA',
    padding: '5px 10px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
  },
  primaryBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(90deg, #D6A967, #F0C98A)',
    color: '#090B0F',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '16px',
  },
  previewBox: {
    backgroundColor: '#10141B',
    border: '1px solid #292E36',
    borderRadius: '10px',
    padding: '14px',
    position: 'relative',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
  },
  copyBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
  },
  previewMeta: {
    borderBottom: '1px solid #292E36',
    paddingBottom: '8px',
    marginBottom: '8px',
    fontSize: '12px',
    lineHeight: '1.5',
  },
  previewTextarea: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#F5F2EA',
    fontSize: '13px',
    lineHeight: '1.5',
    resize: 'none',
    width: '100%',
    flex: 1,
    outline: 'none',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#35D0A0',
    marginTop: '10px',
  },
  gridFourCol: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    backgroundColor: 'rgba(20, 25, 34, 0.85)',
    border: '1px solid #292E36',
    borderRadius: '16px',
    padding: '16px',
    backdropFilter: 'blur(12px)',
  },
  kpiHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  kpiLabel: { fontSize: '11px', color: '#9CA3AF', fontWeight: '600' },
  badge: {
    fontSize: '9px',
    fontWeight: 'bold',
    border: '1px solid',
    borderRadius: '10px',
    padding: '2px 6px',
  },
  kpiValue: { fontSize: '22px', fontWeight: '800', margin: '10px 0 2px 0', color: '#F5F2EA' },
  kpiSub: { fontSize: '11px', color: '#9CA3AF' },
  fullFooter: {
    width: '100%',
    borderTop: '1px solid #292E36',
    backgroundColor: 'rgba(16, 20, 27, 0.9)',
    backdropFilter: 'blur(10px)',
    marginTop: 'auto',
  },
  footerInner: {
    maxWidth: '1280px',
    width: '100%',
    margin: '0 auto',
    padding: '18px 20px',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '12px',
    color: '#9CA3AF',
  },
  footerBrandGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  footerStatusGroup: {
    color: '#35D0A0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '500',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#35D0A0',
    display: 'inline-block',
  },
};