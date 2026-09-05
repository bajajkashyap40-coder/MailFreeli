import React, { useState, useEffect } from 'react';

export default function App() {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  
  // Editable Preview States
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isDispatched, setIsDispatched] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [tokenCount, setTokenCount] = useState(0);

  const [stats, setStats] = useState({
    completionRate: '100.0%',
    activeQueue: '0',
    velocity: '0.24s',
    totalLogs: '0',
    sentCount: '0',
  });

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

  // Real-Time Auto Polling Every 3 Seconds
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
      alert('Please fill in both recipient email and prompt!');
      return;
    }

    setGenerating(true);
    setIsDispatched(false);

    try {
      const response = await fetch('http://localhost:5000/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, prompt, meetingLink }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubject(data.subject);
        setBody(data.body);
        setTokenCount(Math.floor(Math.random() * 50) + 250);
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to generate draft. Check server console.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDispatchEmail = async () => {
    if (!recipient || !subject || !body) {
      alert('Missing email content to dispatch!');
      return;
    }

    setDispatching(true);

    try {
      const response = await fetch('http://localhost:5000/api/dispatch-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: sender || 'you@yourcompany.com',
          recipient,
          prompt,
          subject,
          body,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsDispatched(true);
        alert('Email dispatched successfully via SMTP!');
        fetchStats();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to dispatch email.');
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

  return (
    <div style={styles.container}>
      {/* Top Header with Logo */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <img 
            src="/logo.png" 
            alt="MailFreeli Logo" 
            style={styles.logoImg} 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
          <h1 style={styles.title}>MailFreeli</h1>
          <span style={styles.tag}>AI DISPATCH V2.0</span>
        </div>
        <div style={styles.apiStatus}>
          <span style={styles.statusDot}>●</span> LIVE API STATUS: OPERATIONAL
        </div>
      </header>

      {/* Main Cockpit Layout */}
      <div style={styles.mainGrid}>
        {/* Left Inputs */}
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

          <label style={styles.label}>OPTIONAL MEETING / CALENDAR LINK</label>
          <input
            type="text"
            placeholder="https://cal.com/your-name or Google Meet URL"
            value={meetingLink}
            onChange={(e) => handleLinkChange(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>AI CONTEXT / PROMPT</label>
          <textarea
            rows="3"
            placeholder="Draft a follow-up email proposing a quick meeting..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={styles.textarea}
          />

          <div style={styles.suggestionsGroup}>
            <span style={styles.labelSmall}>QUICK SUGGESTIONS</span>
            <div style={styles.btnGroup}>
              <button type="button" onClick={() => handleQuickSuggestion('Draft a follow-up email after meeting.')} style={styles.chipBtn}>
                Follow-up email
              </button>
              <button type="button" onClick={() => handleQuickSuggestion('Request a 15-minute quick alignment meeting.')} style={styles.chipBtn}>
                Meeting request
              </button>
              <button type="button" onClick={() => handleQuickSuggestion('Provide a quick weekly project progress update.')} style={styles.chipBtn}>
                Project update
              </button>
            </div>
          </div>

          <button onClick={handleGenerateDraft} disabled={generating} style={styles.generateBtn}>
            {generating ? '⚡ Generating AI Draft...' : '✨ Generate AI Draft'}
          </button>
        </div>

        {/* Right Preview Panel */}
        <div style={styles.card}>
          <div style={styles.previewHeader}>
            <h2 style={styles.cardTitle}>Editable Draft & Preview</h2>
            <span style={isDispatched ? styles.dispatchedBadge : styles.draftBadge}>
              {isDispatched ? 'Dispatched via SMTP' : 'Editable Draft Mode'}
            </span>
          </div>

          <div style={styles.metaPreview}>
            <label style={styles.labelSmall}>EDITABLE SUBJECT LINE</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="AI generated subject will appear here..."
              style={styles.subjectInput}
            />
            <div style={{ color: '#00d2ff', marginTop: '6px', fontSize: '12px' }}>
              <strong>From:</strong> {sender || 'you@yourcompany.com'}
            </div>
          </div>

          <label style={styles.labelSmall}>EDITABLE EMAIL BODY</label>
          <textarea
            rows="8"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="AI generated body will appear here..."
            style={styles.bodyTextarea}
          />

          <button
            onClick={handleDispatchEmail}
            disabled={dispatching || !body}
            style={{
              ...styles.dispatchBtn,
              opacity: !body ? 0.5 : 1,
              cursor: !body ? 'not-allowed' : 'pointer',
            }}
          >
            {dispatching ? '🚀 Dispatching Email...' : '🚀 Dispatch Email via SMTP'}
          </button>

          <div style={styles.logBar}>
            <div>Status: <span style={{ color: isDispatched ? '#00ff88' : '#00d2ff' }}>{isDispatched ? 'DISPATCHED' : 'READY TO EDIT'}</span></div>
            <div>Token Count: {tokenCount} Out</div>
          </div>
        </div>
      </div>

      {/* Real-Time Dashboard Metrics Row */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>AI Completion Rate</div>
          <div style={styles.metricVal}>{stats.completionRate}</div>
          <div style={styles.metricSub}>{stats.totalLogs} total executions</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>SMTP Queue</div>
          <div style={styles.metricVal}>{stats.activeQueue} Active</div>
          <div style={styles.metricSub}>0 backlogs</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Velocity</div>
          <div style={styles.metricVal}>{stats.velocity}</div>
          <div style={styles.metricSub}>Avg stream speed</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricLabel}>Mail Stream</div>
          <div style={styles.metricVal}>{stats.sentCount || stats.totalLogs} Dispatched</div>
          <div style={styles.metricSub}>Live DB records</div>
        </div>
      </div>
    </div>
  );
}

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
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #1a2333',
    paddingBottom: '16px',
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg: { width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' },
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
  labelSmall: { fontSize: '10px', color: '#64748b', fontWeight: 'bold', marginBottom: '4px', display: 'block' },
  input: {
    backgroundColor: '#0a0e17',
    border: '1px solid #232f45',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#fff',
    marginBottom: '14px',
    outline: 'none',
  },
  textarea: {
    backgroundColor: '#0a0e17',
    border: '1px solid #232f45',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#fff',
    marginBottom: '14px',
    outline: 'none',
    resize: 'vertical',
  },
  suggestionsGroup: { marginBottom: '16px' },
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
  generateBtn: {
    backgroundColor: '#1e293b',
    color: '#00d2ff',
    border: '1px solid #00d2ff',
    borderRadius: '6px',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: 'auto',
  },
  dispatchBtn: {
    backgroundColor: '#00d2ff',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '14px',
    marginTop: '12px',
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
  draftBadge: {
    backgroundColor: '#1c2536',
    color: '#00d2ff',
    border: '1px solid #00d2ff44',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  metaPreview: {
    backgroundColor: '#0a0e17',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #1a2333',
    margin: '12px 0',
  },
  subjectInput: {
    backgroundColor: '#121824',
    border: '1px solid #232f45',
    borderRadius: '4px',
    padding: '8px 10px',
    color: '#fff',
    width: '95%',
    fontSize: '13px',
    fontWeight: 'bold',
    outline: 'none',
  },
  bodyTextarea: {
    backgroundColor: '#0a0e17',
    border: '1px solid #1a2333',
    borderRadius: '6px',
    padding: '12px',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#e2e8f0',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    flexGrow: 1,
  },
  logBar: {
    display: 'flex',
    justify: 'space-between',
    backgroundColor: '#070a10',
    padding: '8px 12px',
    borderRadius: '6px',
    marginTop: '10px',
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