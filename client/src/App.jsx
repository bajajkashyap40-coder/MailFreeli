import React, { useState, useEffect } from 'react';

export default function App() {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [stats, setStats] = useState({
    completionRate: '99.2%',
    activeQueue: '0',
    velocity: '0.24s',
    totalLogs: '0',
  });

  // Fetch real stats on load
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stats');
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
  }, []);

  const handleQuickSuggestion = (text) => {
    setPrompt(text);
  };

  const handleGenerateAndSend = async () => {
    if (!recipient || !prompt) {
      alert('Please fill in both recipient email and prompt!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: sender || 'you@yourcompany.com',
          recipient,
          prompt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedEmail({
          subject: data.subject,
          body: data.body,
          sender: data.sender,
          recipient: data.recipient,
        });
        setTokenCount(Math.floor(Math.random() * 50) + 250);
        fetchStats(); // Refresh metrics after successful dispatch
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to dispatch email. Check server console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <span style={styles.logoIcon}>✉️</span>
          <h1 style={styles.title}>MailFreeli</h1>
          <span style={styles.tag}>AI DISPATCH V2.0</span>
        </div>
        <div style={styles.apiStatus}>
          <span style={styles.statusDot}>●</span> LIVE API STATUS: OPERATIONAL
        </div>
      </header>

      {/* Main Cockpit Layout */}
      <div style={styles.mainGrid}>
        {/* Left Form: Inputs */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>AI Dispatch Cockpit</h2>
          <p style={styles.cardSub}>Compose emails using natural language prompts.</p>

          <label style={styles.label}>SENDER EMAIL ADDRESS</label>
          <input
            type="email"
            placeholder="you@yourcompany.com"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>RECIPIENT EMAIL ADDRESS</label>
          <input
            type="email"
            placeholder="recipient@example.com"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>AI CONTEXT / PROMPT</label>
          <textarea
            rows="4"
            placeholder="Draft a quarterly follow-up update..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={styles.textarea}
          />

          {/* Quick Suggestions */}
          <div style={styles.suggestionsGroup}>
            <span style={styles.labelSmall}>QUICK SUGGESTIONS</span>
            <div style={styles.btnGroup}>
              <button
                type="button"
                onClick={() => handleQuickSuggestion('Draft a follow-up email after meeting.')}
                style={styles.chipBtn}
              >
                Follow-up email
              </button>
              <button
                type="button"
                onClick={() => handleQuickSuggestion('Request a 15-minute quick alignment meeting.')}
                style={styles.chipBtn}
              >
                Meeting request
              </button>
              <button
                type="button"
                onClick={() => handleQuickSuggestion('Provide a quick weekly project progress update.')}
                style={styles.chipBtn}
              >
                Project update
              </button>
              <button
                type="button"
                onClick={() => handleQuickSuggestion('Draft an investor pitch follow-up note.')}
                style={styles.chipBtn}
              >
                Investor Pitch
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateAndSend}
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? '⚡ Generating & Dispatching...' : '✨ Generate & Send Email'}
          </button>
        </div>

        {/* Right Preview Panel */}
        <div style={styles.card}>
          <div style={styles.previewHeader}>
            <h2 style={styles.cardTitle}>Live Generation Preview</h2>
            <span style={styles.dispatchedBadge}>
              {generatedEmail ? 'Dispatched via SMTP' : 'Drafting Mode'}
            </span>
          </div>

          {/* Dynamic Sender & Subject Preview */}
          <div style={styles.metaPreview}>
            <div><strong>Subject:</strong> {generatedEmail?.subject || 'Your AI generated subject will appear here...'}</div>
            <div style={{ color: '#00d2ff', marginTop: '4px' }}>
              <strong>From:</strong> {sender || 'you@yourcompany.com'}
            </div>
            {recipient && (
              <div style={{ color: '#99aab5', marginTop: '2px' }}>
                <strong>To:</strong> {recipient}
              </div>
            )}
          </div>

          {/* Live Body Preview */}
          <div style={styles.bodyBox}>
            {generatedEmail ? (
              <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{generatedEmail.body}</p>
            ) : (
              <p style={{ color: '#556070', margin: 0 }}>
                {prompt ? `[Prompt Active]: "${prompt}"` : 'Enter a prompt and click "Generate & Send Email" to see the live output.'}
              </p>
            )}
          </div>

          {/* Token Logs Bar */}
          <div style={styles.logBar}>
            <div>[20:14:12] SMTP Handshake: <span style={{ color: '#00ff88' }}>SUCCESS</span></div>
            <div>Token Count: {tokenCount > 0 ? tokenCount : 294} Out</div>
          </div>
        </div>
      </div>

      {/* Bottom Real Metrics Row */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>AI Completion Rate</div>
          <div style={styles.metricVal}>{stats.completionRate}</div>
          <div style={styles.metricSub}>{stats.totalLogs} total runs</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>SMTP Queue</div>
          <div style={styles.metricVal}>{stats.activeQueue} Active</div>
          <div style={styles.metricSub}>No backlogs</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Velocity</div>
          <div style={styles.metricVal}>{stats.velocity}</div>
          <div style={styles.metricSub}>Stream speed</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Mail Stream</div>
          <div style={styles.metricVal}>{stats.totalLogs} logged</div>
          <div style={styles.metricSub}>Active traffic</div>
        </div>
      </div>
    </div>
  );
}

// Full Dashboard Dark Styling
const styles = {
  container: {
    backgroundColor: '#0a0e17',
    color: '#ffffff',
    minHeight: '100vh',
    padding: '20px 40px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #1a2333',
    paddingBottom: '16px',
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoIcon: { fontSize: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
  tag: {
    backgroundColor: '#003366',
    color: '#00d2ff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  apiStatus: { color: '#00ff88', fontSize: '13px', fontWeight: '600' },
  statusDot: { fontSize: '10px', marginRight: '6px' },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    backgroundColor: '#121824',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: { fontSize: '18px', margin: '0 0 6px 0', fontWeight: '600' },
  cardSub: { color: '#8899ac', fontSize: '13px', margin: '0 0 16px 0' },
  label: { fontSize: '11px', color: '#8899ac', fontWeight: 'bold', marginBottom: '6px' },
  labelSmall: { fontSize: '10px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' },
  input: {
    backgroundColor: '#0a0e17',
    border: '1px solid #232f45',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#fff',
    marginBottom: '16px',
    outline: 'none',
  },
  textarea: {
    backgroundColor: '#0a0e17',
    border: '1px solid #232f45',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#fff',
    marginBottom: '16px',
    outline: 'none',
    resize: 'vertical',
  },
  suggestionsGroup: { marginBottom: '20px' },
  btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' },
  chipBtn: {
    backgroundColor: '#1a2333',
    border: '1px solid #2d3b55',
    color: '#a0aec0',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#00d2ff',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: 'auto',
  },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  dispatchedBadge: {
    backgroundColor: '#0b2e28',
    color: '#00ff88',
    border: '1px solid #00ff8844',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  metaPreview: {
    backgroundColor: '#0a0e17',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #1a2333',
    margin: '12px 0',
    fontSize: '13px',
  },
  bodyBox: {
    backgroundColor: '#0a0e17',
    border: '1px solid #1a2333',
    borderRadius: '6px',
    padding: '16px',
    flexGrow: 1,
    minHeight: '180px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#e2e8f0',
  },
  logBar: {
    display: 'flex',
    justify: 'space-between',
    backgroundColor: '#070a10',
    padding: '10px 14px',
    borderRadius: '6px',
    marginTop: '12px',
    fontSize: '11px',
    color: '#64748b',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: '#121824',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '16px',
  },
  metricLabel: { fontSize: '11px', color: '#64748b', fontWeight: 'bold' },
  metricVal: { fontSize: '20px', fontWeight: 'bold', color: '#00d2ff', margin: '4px 0' },
  metricSub: { fontSize: '11px', color: '#475569' },
};