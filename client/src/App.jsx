import React, { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  // Mobile Menu Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Preview States
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isDispatched, setIsDispatched] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // Centered Toast Alert State (Auto-dismisses in 3 seconds)
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }

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
    }, 3000); // Pops in middle for 3 seconds
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

  const handleQuickSuggestion = (text) => {
    setPrompt(text);
  };

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
        setSubject(data.subject);
        setBody(data.body);
        showToast('AI Draft generated successfully!', 'success');
        fetchStats();
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showToast('Failed to generate draft. Check server console.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDispatchEmail = async () => {
    if (!recipient || !subject || !body) {
      showToast('Missing email content to dispatch!', 'error');
      return;
    }

    setDispatching(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/dispatch-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: sender || 'sender@domain.com',
          recipient,
          prompt,
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDispatched(true);
        showToast('Email dispatched via SMTP successfully!', 'success');
        fetchStats();
      } else {
        showToast(`Error: ${data.error}`, 'error');
      }
    } catch (error) {
      showToast('Failed to dispatch email.', 'error');
    } finally {
      setDispatching(false);
    }
  };

  const handleLinkChange = (newLink) => {
    setMeetingLink(newLink);
    if (body.includes('<YOUR_CALENDAR_LINK_HERE>') && newLink.trim() !== '') {
      setBody(body.replace('<YOUR_CALENDAR_LINK_HERE>', newLink));
    }
  };

  const copyToClipboard = () => {
    if (!body) return;
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    showToast('Copied draft to clipboard!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#090B0F] text-[#F5F2EA] flex flex-col font-sans selection:bg-[#D6A967]/20 selection:text-[#F0C98A] relative">
      <style>{`
        input:focus, textarea:focus {
          outline: none !important;
          border-color: #D6A967 !important;
          box-shadow: 0 0 0 1px #D6A967 !important;
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -40%) scale(0.9); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        .pop-alert {
          animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* CENTERED POPUP ALERT */}
      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none px-4">
          <div className={`pop-alert fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-sm w-full p-4 rounded-2xl bg-[#141922] border shadow-2xl flex items-center gap-3 border-[#292E36] ${
            toast.type === 'success' ? 'text-[#35D0A0]' : 'text-red-400'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
              toast.type === 'success' ? 'bg-[#35D0A0]/10 text-[#35D0A0]' : 'bg-red-500/10 text-red-400'
            }`}>
              {toast.type === 'success' ? '✓' : '⚠️'}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-[#F5F2EA]">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="h-16 border-b border-[#292E36] bg-[#10141B]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D6A967] to-[#B88A48] flex items-center justify-center text-[#090B0F] font-bold text-lg shadow-sm">
              M
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-[#F5F2EA] flex items-center gap-2">
                MailFreeli
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#D6A967]/10 text-[#D6A967] border border-[#D6A967]/20 hidden sm:inline-block">Enterprise</span>
              </span>
              <span className="text-[11px] sm:text-xs text-[#9CA3AF]">AI-Powered Email Dispatch</span>
            </div>
          </div>

          {/* Desktop User Info */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#141922] border border-[#292E36] flex items-center justify-center text-xs font-semibold text-[#D6A967]">
                KB
              </div>
              <span className="text-sm font-medium text-[#F5F2EA]">Hello, Bajaj</span>
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-[#9CA3AF] hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden bg-[#10141B] border-b border-[#292E36] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#141922] border border-[#292E36] flex items-center justify-center text-xs font-semibold text-[#D6A967]">
                KB
              </div>
              <span className="text-sm font-medium text-[#F5F2EA]">Hello, Bajaj</span>
            </div>
            <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-[#D6A967]/10 text-[#D6A967] border border-[#D6A967]/20">Enterprise</span>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* RESPONSIVE 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Card: AI Cockpit */}
          <section className="bg-[#141922] border border-[#292E36] rounded-[16px] p-4 sm:p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#F5F2EA]">AI Dispatch Cockpit</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Compose your email with AI assistance</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-1.5">FROM (SENDER EMAIL)</label>
                  <input
                    type="email"
                    placeholder="sender@domain.com"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full bg-[#10141B] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F2EA] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-1.5">TO (RECIPIENT EMAIL)</label>
                  <input
                    type="email"
                    placeholder="recipient@domain.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-[#10141B] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F2EA] placeholder-[#9CA3AF]/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-1.5">
                    MEETING / CALENDAR LINK <span className="text-[#9CA3AF]/50 text-[10px] font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Calendar or Google Meet URL"
                    value={meetingLink}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    className="w-full bg-[#10141B] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F2EA] placeholder-[#9CA3AF]/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-1.5">AI CONTEXT / PROMPT</label>
                  <textarea
                    rows={3}
                    placeholder="Enter AI prompt here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-[#10141B] border border-[#292E36] rounded-xl p-3.5 text-xs sm:text-sm text-[#F5F2EA] placeholder-[#9CA3AF]/50 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] uppercase tracking-wider mb-2">QUICK SUGGESTIONS</label>
                  <div className="flex flex-wrap gap-2">
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
                        className="px-2.5 py-1.5 rounded-full bg-[#10141B] border border-[#292E36] text-[11px] sm:text-xs font-medium text-[#F5F2EA] hover:border-[#D6A967]/40 hover:text-[#D6A967] transition-all"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[#292E36]/50">
              <button
                type="button"
                onClick={handleGenerateDraft}
                disabled={generating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D6A967] to-[#F0C98A] text-[#090B0F] font-semibold text-xs sm:text-sm hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>✨</span>
                {generating ? 'Generating AI Draft...' : 'Generate AI Draft'}
              </button>
            </div>
          </section>

          {/* Right Card: Preview & Dispatch */}
          <section className="bg-[#141922] border border-[#292E36] rounded-[16px] p-4 sm:p-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-5 sm:space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#F5F2EA]">Editable Draft & Preview</h2>
                <p className="text-xs text-[#9CA3AF] mt-0.5">Review and edit your AI-generated email</p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">SUBJECT</label>
                    <span className="text-[11px] text-[#9CA3AF]/60">{subject.length}/120</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Email Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#10141B] border border-[#292E36] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F2EA] transition-all"
                  />
                </div>

                <div className="relative bg-[#10141B] border border-[#292E36] rounded-xl p-4 sm:p-5 min-h-[220px] sm:min-h-[260px] flex flex-col">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    title="Copy to clipboard"
                    className="absolute top-3 right-3 p-1.5 sm:p-2 text-[#9CA3AF] hover:text-[#D6A967] rounded-lg hover:bg-[#141922] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </button>

                  <div className="border-b border-[#292E36] pb-2.5 mb-3 space-y-1 text-[11px] sm:text-xs text-[#9CA3AF]">
                    <p className="truncate"><span className="text-[#9CA3AF]/50">To:</span> {recipient || 'recipient@domain.com'}</p>
                    <p className="truncate"><span className="text-[#9CA3AF]/50">From:</span> {sender || 'sender@domain.com'}</p>
                  </div>

                  <textarea
                    placeholder="Your AI-generated email body will appear here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-transparent border-none text-xs sm:text-sm text-[#F5F2EA]/90 leading-relaxed outline-none resize-none flex-1 font-sans"
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5 border-t border-[#292E36]/50 space-y-3">
              <button
                type="button"
                onClick={handleDispatchEmail}
                disabled={dispatching || !body}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D6A967] to-[#F0C98A] text-[#090B0F] font-semibold text-xs sm:text-sm hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🚀</span>
                {dispatching ? 'Sending Email...' : 'Send Email via SMTP'}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#35D0A0] font-medium">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                {isDispatched ? 'Dispatched via SMTP' : 'Ready to generate'}
              </div>
            </div>
          </section>

        </div>

        {/* RESPONSIVE METRICS GRID (1 COL ON MOBILE, 2 ON TABLET, 4 ON DESKTOP) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#141922] border border-[#292E36] rounded-[16px] p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">AI Success Rate</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#35D0A0]/10 text-[#35D0A0] border border-[#35D0A0]/20">LIVE</span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-end justify-between">
              <div className="text-xl sm:text-2xl font-bold text-[#F5F2EA]">{stats.completionRate}</div>
              <span className="text-[10px] text-[#9CA3AF]">{stats.totalLogs} logs</span>
            </div>
          </div>

          <div className="bg-[#141922] border border-[#292E36] rounded-[16px] p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">SMTP Queue</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D6A967]/10 text-[#D6A967] border border-[#D6A967]/20">READY</span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-end justify-between">
              <div className="text-xl sm:text-2xl font-bold text-[#F5F2EA]">{stats.activeQueue}</div>
              <span className="text-[10px] text-[#9CA3AF]">0 Backlog</span>
            </div>
          </div>

          <div className="bg-[#141922] border border-[#292E36] rounded-[16px] p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Avg Stream Velocity</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B7CF6]/10 text-[#8B7CF6] border border-[#8B7CF6]/20">FAST</span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-end justify-between">
              <div className="text-xl sm:text-2xl font-bold text-[#F5F2EA]">{stats.velocity}</div>
              <span className="text-[10px] text-[#9CA3AF]">Response</span>
            </div>
          </div>

          <div className="bg-[#141922] border border-[#292E36] rounded-[16px] p-4 sm:p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Total Mails Sent</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#35D0A0]/10 text-[#35D0A0] border border-[#35D0A0]/20">SYNCED</span>
            </div>
            <div className="mt-3 sm:mt-4 flex items-end justify-between">
              <div className="text-xl sm:text-2xl font-bold text-[#F5F2EA]">{stats.sentCount || stats.totalLogs}</div>
              <span className="text-[10px] text-[#9CA3AF]">Live DB</span>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-[#292E36] bg-[#10141B] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-[#9CA3AF] text-center sm:text-left">
          <div>
            <span className="text-[#F5F2EA] font-medium">© 2025 MailFreeli</span> • Built for smarter communication • Powered by AI
          </div>
          <div className="flex items-center gap-2 text-[#35D0A0]">
            <span className="w-2 h-2 rounded-full bg-[#35D0A0]"></span> System Online
          </div>
        </div>
      </footer>
    </div>
  );
}