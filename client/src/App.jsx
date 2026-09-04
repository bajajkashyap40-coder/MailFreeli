import React, { useState } from 'react';
import { Mail, Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [sender, setSender] = useState('you@yourcompany.com');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState(
    'Draft a quarterly follow-up update to our leads from the tech summit. Thank them for attending, highlight our new AI automatic routing integration that cut dispatch costs by 40%, and propose a calendar invite link for next Tuesday afternoon.'
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: 'Accelerating operations at VenturePulse',
    from: 'ai-agent-07@dispatch.mailfreeli.io',
    body: `Hello team at VenturePulse,\n\nIt was fantastic connecting with you all at the recent tech summit. Our conversations sparked multiple pathways regarding how automation can streamline your developer communication stack.\n\nAs an immediate update: We just launched our AI Automatic Routing Integration! This setup has already proven to slash dispatch costs by an average of 40% for our key enterprise pilot clients.\n\nI'd love to drop a calendar invite link so we can dig into your technical specs next Tuesday afternoon.\n\nBest regards,\nMailFreeli Autonomous Agent`
  });

  const suggestions = ['Follow-up email', 'Meeting request', 'Project update', 'Investor Pitch'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipient || !prompt) return;

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('http://localhost:5000/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, recipient, prompt }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Dispatched via SMTP successfully!' });
        setGeneratedEmail({
          subject: data.subject || 'Generated Subject',
          from: sender,
          body: data.body || 'Generated Body Text...'
        });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to dispatch email.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Server error. Is your backend running on port 5000?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <Mail size={20} />
          </div>
          <div className="title-badge">
            <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>MailFreeli</h1>
            <span className="badge">AI DISPATCH V2.0</span>
          </div>
        </div>
        <div className="status-badge">
          <span className="dot"></span>
          <span>LIVE API STATUS: OPERATIONAL</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid">
        {/* Left Column */}
        <div>
          <div className="card">
            <h2 className="card-title">AI Dispatch Cockpit</h2>
            <p className="card-subtitle">Compose emails using natural language prompts.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Sender Email Address</label>
                <input
                  type="email"
                  className="input-box"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Recipient Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  className="input-box"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">AI Context / Prompt</label>
                <textarea
                  required
                  rows={4}
                  className="textarea-box"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quick Suggestions</label>
                <div className="pill-group">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="pill"
                      onClick={() => setPrompt(`Draft a ${item.toLowerCase()} regarding...`)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {loading ? 'Generating & Sending...' : 'Generate & Send Email'}
              </button>
            </form>

            {status && (
              <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: status.type === 'success' ? '#10b981' : '#f43f5e' }}>
                {status.message}
              </p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="stats-grid">
            <div className="stat-box">
              <span className="stat-label">AI Completion Rate</span>
              <p className="stat-value">99.2%</p>
              <span className="stat-sub">1,240 runs</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">SMTP Queue</span>
              <p className="stat-value">0 Active</p>
              <span className="stat-sub">No backlogs</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Velocity</span>
              <p className="stat-value" style={{ color: '#00f2fe' }}>0.24s</p>
              <span className="stat-sub">Stream speed</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Mail Stream</span>
              <p className="stat-value">94.2k/mo</p>
              <span className="stat-sub">Active traffic</span>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div>
          <div className="card" style={{ height: '100%' }}>
            <div className="preview-header">
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Live Generation Preview</span>
              <span className="badge">Dispatched via SMTP</span>
            </div>

            <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '1rem' }}>
              <div><span style={{ color: '#6b7280' }}>Subject:</span> {generatedEmail.subject}</div>
              <div><span style={{ color: '#6b7280' }}>From:</span> <span style={{ color: '#00f2fe' }}>{generatedEmail.from}</span></div>
            </div>

            <div className="preview-box">
              {generatedEmail.body}
            </div>

            <div className="terminal-log">
              <div className="terminal-row">
                <span>[20:14:12] SMTP Handshake</span>
                <span style={{ color: '#10b981' }}>SUCCESS</span>
              </div>
              <div className="terminal-row">
                <span>[20:14:13] Token Count</span>
                <span>294 Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}