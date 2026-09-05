import React, { useState, useEffect } from 'react';

export default function App() {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState('Draft a follow-up email proposing a quick meeting.');
  const [meetingLink, setMeetingLink] = useState('');
  
  // Preview States
  const [subject, setSubject] = useState('Quick Meeting to Discuss Our Project');
  const [body, setBody] = useState(
    "Hi there,\n\nI hope you're doing well.\n\nI wanted to follow up and see if you'd be available for a quick meeting to discuss our project and next steps.\n\nPlease let me know a time that works for you.\n\nLooking forward to it!\n\nBest regards,\nYour Name"
  );
  const [isDispatched, setIsDispatched] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  const [stats, setStats] = useState({
    completionRate: '100.0%',
    activeQueue: '0',
    velocity: '0.18s',
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
      {/* Cleaned Top Header: Title & Tagline Only */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <img 
            src="/logo.png" 
            alt="MailFreeli Logo" 
            style={styles.logoImg} 
            onError={(e) => { e.target.style.display = 'none'; }} 
          />
          <div>
            <h1 style={styles.title}>MailFreeli</h1>
            <p style={styles.subTitle}>AI-Powered Email Dispatch</p>
          </div>
        </div>
      </header>

      {/* Main Grid Cockpit */}
      <div style={styles.mainGrid}>
        {/* Left Form: AI Dispatch Cockpit */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>AI Dispatch Cockpit</h2>
          <p style={styles.cardSub}>Compose your email with AI assistance</p>

          <label style={styles.label}>FROM (SENDER EMAIL)</label>
          <input
            type="email"
            placeholder="you@yourcompany.com"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>TO (RECIPIENT EMAIL)</label>
          <input
            type="email"
            placeholder="recipient@example.com"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>MEETING / CALENDAR LINK (OPTIONAL)</label>
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
            placeholder="Draft a follow-up email proposing a quick meeting."
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
              <button type="button" onClick={() => handleQuickSuggestion('Introduction email to new client.')} style={styles.chipBtn}>
                Introduction
              </button>
            </div>
          </div>

          <button onClick={handleGenerateDraft} disabled={generating} style={styles.generateBtn}>
            <div style={styles.btnContent}>
              <span>✨</span>
              <div>
                <div style={styles.btnTitle}>{generating ? 'Generating AI Draft...' : 'Generate AI Draft'}</div>
                <div style={styles.btnSub}>AI will create a personalized email draft</div>
              </div>
            </div>
          </button>
        </div>

        {/* Right Panel: Editable Draft & Preview */}
        <div style={styles.card}>
          <div style={styles.previewHeader}>
            <div>
              <h2 style={styles.cardTitle}>Editable Draft & Preview</h2>
              <p style={styles.cardSub}>Review and edit your AI-generated email</p>
            </div>
          </div>

          <div style={styles.subjectRow}>
            <label style={styles.label}>SUBJECT</label>
            <span style={styles.charCount}>{subject.length}/120</span>
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>EMAIL PREVIEW</label>
          <div style={styles.previewContainer}>
            <div style={styles.previewMetaBox}>
              <div><strong>To:</strong> {recipient || 'recipient@example.com'}</div>
              <div><strong>From:</strong> {sender || 'you@yourcompany.com'}</div>
              <div><strong>Subject:</strong> {subject || 'Quick Meeting to Discuss Our Project'}</div>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={styles.previewBodyTextarea}
            />
          </div>

          <button
            onClick={handleDispatchEmail}
            disabled={dispatching || !body}
            style={{
              ...styles.dispatchBtn,
              opacity: !body ? 0.6 : 1,
            }}
          >
            <div style={styles.btnContent}>
              <span>🚀</span>
              <div>
                <div style={styles.btnTitle}>{dispatching ? 'Sending Email...' : 'Send Email via SMTP'}</div>
                <div style={styles.btnSub}>Email will be sent securely</div>
              </div>
            </div>
          </button>

          <div style={styles.statusIndicator}>
            <span style={styles.greenCheck}>✓</span> {isDispatched ? 'Dispatched via SMTP' : 'Draft ready • Ready to send'}
          </div>
        </div>
      </div>

      {/* Bottom Metrics Cards with Styled SVG Badges */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricLabel}>AI Success Rate</div>
            <div style={styles.metricVal}>{stats.completionRate}</div>
            <div style={styles.metricSub}>{stats.totalLogs} total executions</div>
          </div>
          <div style={styles.metricIconBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricLabel}>SMTP Queue</div>
            <div style={styles.metricVal}>{stats.activeQueue}</div>
            <div style={styles.metricSub}>No emails queued</div>
          </div>
          <div style={styles.metricIconBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricLabel}>Avg. Generation Time</div>
            <div style={styles.metricVal}>{stats.velocity}</div>
            <div style={styles.metricSub}>Average response time</div>
          </div>
          <div style={styles.metricIconBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricLabel}>Emails Sent</div>
            <div style={styles.metricVal}>{stats.sentCount || stats.totalLogs}</div>
            <div style={styles.metricSub}>Live dispatch count</div>
          </div>
          <div style={styles.metricIconBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#07090e',
    color: '#e2e8f0',
    minHeight: '100vh',
    padding: '24px 36px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '12px' },
  logoImg: { width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' },
  title: { fontSize: '22px', fontWeight: '700', margin: 0, color: '#f8fafc' },
  subTitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    backgroundColor: '#0b0f17',
    border: '1px solid #161e2e',
    borderRadius: '14px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: { fontSize: '16px', margin: '0 0 2px 0', fontWeight: '600', color: '#f8fafc' },
  cardSub: { color: '#64748b', fontSize: '12px', margin: '0 0 16px 0' },
  label: { fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' },
  labelSmall: { fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '8px', display: 'block' },
  input: {
    backgroundColor: '#0f141f',
    border: '1px solid #1a2333',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: '13px',
    marginBottom: '14px',
    outline: 'none',
  },
  textarea: {
    backgroundColor: '#0f141f',
    border: '1px solid #1a2333',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#f8fafc',
    fontSize: '13px',
    marginBottom: '14px',
    outline: 'none',
    resize: 'none',
  },
  suggestionsGroup: { marginBottom: '16px' },
  btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  chipBtn: {
    backgroundColor: '#0f141f',
    border: '1px solid #1a2333',
    color: '#94a3b8',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  generateBtn: {
    backgroundColor: '#0284c7',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    cursor: 'pointer',
    color: '#ffffff',
    marginTop: 'auto',
    boxShadow: '0 0 20px rgba(2, 132, 199, 0.3)',
  },
  dispatchBtn: {
    backgroundColor: '#0284c7',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    cursor: 'pointer',
    color: '#ffffff',
    marginTop: '16px',
    boxShadow: '0 0 20px rgba(2, 132, 199, 0.3)',
  },
  btnContent: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  btnTitle: { fontSize: '13px', fontWeight: '700', lineHeight: '1.2' },
  btnSub: { fontSize: '10px', opacity: 0.8 },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  subjectRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: '10px', color: '#64748b' },
  previewContainer: {
    backgroundColor: '#0d121c',
    border: '1px solid #1a2333',
    borderRadius: '8px',
    padding: '12px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  previewMetaBox: {
    borderBottom: '1px solid #161e2e',
    paddingBottom: '8px',
    marginBottom: '12px',
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  previewBodyTextarea: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#cbd5e1',
    fontSize: '12px',
    lineHeight: '1.6',
    outline: 'none',
    resize: 'none',
    width: '100%',
    flexGrow: 1,
    fontFamily: 'inherit',
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#22c55e',
    marginTop: '12px',
  },
  greenCheck: { marginRight: '6px' },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: '#0b0f17',
    border: '1px solid #161e2e',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center',
  },
  metricLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' },
  metricVal: { fontSize: '22px', fontWeight: '700', color: '#f8fafc', margin: '4px 0' },
  metricSub: { fontSize: '10px', color: '#64748b' },
  metricIconBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: '#0f141f',
    border: '1px solid #1a2333',
    display: 'flex',
    alignItems: 'center',
    justify: 'center',
  },
};