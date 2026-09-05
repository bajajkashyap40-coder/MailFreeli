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
      {/* Top Header */}
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

      {/* Uniform Cyan Neon Metrics Section */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotCyan}></span>
              <span style={styles.metricLabel}>AI Success Rate</span>
            </div>
            <div style={styles.metricVal}>{stats.completionRate}</div>
            <div style={styles.metricSub}>{stats.totalLogs} total executions</div>
          </div>
          <div style={styles.metricPillCyan}>LIVE</div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotCyan}></span>
              <span style={styles.metricLabel}>SMTP Queue</span>
            </div>
            <div style={styles.metricVal}>{stats.activeQueue}</div>
            <div style={styles.metricSub}>0 Backlog</div>
          </div>
          <div style={styles.metricPillCyan}>READY</div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotCyan}></span>
              <span style={styles.metricLabel}>Avg Stream Velocity</span>
            </div>
            <div style={styles.metricVal}>{stats.velocity}</div>
            <div style={styles.metricSub}>Response time</div>
          </div>
          <div style={styles.metricPillCyan}>FAST</div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotCyan}></span>
              <span style={styles.metricLabel}>Total Mails Sent</span>
            </div>
            <div style={styles.metricVal}>{stats.sentCount || stats.totalLogs}</div>
            <div style={styles.metricSub}>Live DB records</div>
          </div>
          <div style={styles.metricPillCyan}>SYNCED</div>
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

  // Uniform Bottom Metrics Styling
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  metricCard: {
    backgroundColor: '#0b0f17',
    border: '1px solid #1e293b',
    borderTop: '2px solid #38bdf8',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'flex-start',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  },
  metricHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  metricLabel: { fontSize: '11px', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.3px' },
  metricVal: { fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: '2px 0 4px 0' },
  metricSub: { fontSize: '10px', color: '#64748b' },

  metricDotCyan: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8', boxShadow: '0 0 8px #38bdf8' },
  metricPillCyan: { fontSize: '9px', fontWeight: '800', color: '#38bdf8', backgroundColor: '#0c2233', padding: '3px 8px', borderRadius: '10px', border: '1px solid #38bdf844' },
};