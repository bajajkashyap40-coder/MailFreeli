import React, { useState, useEffect } from 'react';

export default function App() {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  
  // Preview States
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
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
      {/* Global Style Reset & Scrollbar Control */}
      <style>{`
        * {
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background-color: #FAF7F2;
        }
        /* Sleek custom scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #FAF7F2;
        }
        ::-webkit-scrollbar-thumb {
          background: #E2D9CF;
          border-radius: 4px;
        }
        @keyframes pulseGlow {
          0% { transform: scale(1) translate(0px, 0px); opacity: 0.4; }
          50% { transform: scale(1.15) translate(30px, -20px); opacity: 0.6; }
          100% { transform: scale(1) translate(0px, 0px); opacity: 0.4; }
        }
        @keyframes floatGlow {
          0% { transform: scale(1) translate(0px, 0px); opacity: 0.3; }
          50% { transform: scale(1.2) translate(-25px, 25px); opacity: 0.5; }
          100% { transform: scale(1) translate(0px, 0px); opacity: 0.3; }
        }
      `}</style>

      {/* Ambient Animated Glows */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

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
            onChange={(e) => handleLinkChange(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>AI CONTEXT / PROMPT</label>
          <textarea
            rows="3"
            placeholder="Enter AI prompt here..."
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
            placeholder="Email Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={styles.input}
          />

          <label style={styles.label}>EMAIL PREVIEW</label>
          <div style={styles.previewContainer}>
            <div style={styles.previewMetaBox}>
              <div><strong>To:</strong> {recipient || 'recipient@domain.com'}</div>
              <div><strong>From:</strong> {sender || 'sender@domain.com'}</div>
              <div><strong>Subject:</strong> {subject || 'Email Subject'}</div>
            </div>
            <textarea
              placeholder="Your AI-generated email body will appear here..."
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
            <span style={styles.greenCheck}>✓</span> {isDispatched ? 'Dispatched via SMTP' : 'Ready to generate'}
          </div>
        </div>
      </div>

      {/* Bottom Metrics Cards */}
      <div style={styles.metricsRow}>
        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotWarm}></span>
              <span style={styles.metricLabel}>AI Success Rate</span>
            </div>
            <div style={styles.metricVal}>{stats.completionRate}</div>
            <div style={styles.metricSub}>{stats.totalLogs} total executions</div>
          </div>
          <div style={styles.metricPillWarm}>LIVE</div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotWarm}></span>
              <span style={styles.metricLabel}>SMTP Queue</span>
            </div>
            <div style={styles.metricVal}>{stats.activeQueue}</div>
            <div style={styles.metricSub}>0 Backlog</div>
          </div>
          <div style={styles.metricPillWarm}>READY</div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotWarm}></span>
              <span style={styles.metricLabel}>Avg Stream Velocity</span>
            </div>
            <div style={styles.metricVal}>{stats.velocity}</div>
            <div style={styles.metricSub}>Response time</div>
          </div>
          <div style={styles.metricPillWarm}>FAST</div>
        </div>

        <div style={styles.metricCard}>
          <div>
            <div style={styles.metricHeader}>
              <span style={styles.metricDotWarm}></span>
              <span style={styles.metricLabel}>Total Mails Sent</span>
            </div>
            <div style={styles.metricVal}>{stats.sentCount || stats.totalLogs}</div>
            <div style={styles.metricSub}>Live DB records</div>
          </div>
          <div style={styles.metricPillWarm}>SYNCED</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#FAF7F2',
    color: '#2D2825',
    minHeight: '100vh',
    width: '100%',
    padding: '28px 40px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  bgGlow1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '450px',
    height: '450px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(230, 180, 130, 0.3) 0%, rgba(250, 247, 242, 0) 70%)',
    animation: 'pulseGlow 10s infinite ease-in-out',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgGlow2: {
    position: 'absolute',
    bottom: '-80px',
    right: '-80px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(215, 160, 110, 0.25) 0%, rgba(250, 247, 242, 0) 70%)',
    animation: 'floatGlow 12s infinite ease-in-out',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '28px',
    position: 'relative',
    zIndex: 1,
  },
  logoGroup: { display: 'flex', alignItems: 'center', gap: '14px' },
  logoImg: { width: '42px', height: '42px', borderRadius: '12px', objectFit: 'cover' },
  title: { fontSize: '24px', fontWeight: '800', margin: 0, color: '#1C1917', letterSpacing: '-0.5px' },
  subTitle: { margin: '2px 0 0 0', fontSize: '13px', color: '#78716C', fontWeight: '500' },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '28px',
    position: 'relative',
    zIndex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7E0D6',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 30px rgba(180, 160, 140, 0.08)',
  },
  cardTitle: { fontSize: '17px', margin: '0 0 4px 0', fontWeight: '700', color: '#1C1917' },
  cardSub: { color: '#78716C', fontSize: '12px', margin: '0 0 18px 0' },
  label: { fontSize: '11px', color: '#57534E', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '6px', display: 'block' },
  labelSmall: { fontSize: '11px', color: '#57534E', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '10px', display: 'block' },
  input: {
    backgroundColor: '#F5F0EB',
    border: '1px solid #E2D9CF',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#1C1917',
    fontSize: '13px',
    marginBottom: '16px',
    outline: 'none',
  },
  textarea: {
    backgroundColor: '#F5F0EB',
    border: '1px solid #E2D9CF',
    borderRadius: '10px',
    padding: '11px 14px',
    color: '#1C1917',
    fontSize: '13px',
    marginBottom: '16px',
    outline: 'none',
    resize: 'none',
  },
  suggestionsGroup: { marginBottom: '20px' },
  btnGroup: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  chipBtn: {
    backgroundColor: '#F0E8DF',
    border: '1px solid #DFD5C8',
    color: '#44403C',
    padding: '7px 14px',
    borderRadius: '9px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  generateBtn: {
    backgroundColor: '#C87D55',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    color: '#FFFFFF',
    marginTop: 'auto',
    boxShadow: '0 6px 20px rgba(200, 125, 85, 0.25)',
  },
  dispatchBtn: {
    backgroundColor: '#C87D55',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    cursor: 'pointer',
    color: '#FFFFFF',
    marginTop: '18px',
    boxShadow: '0 6px 20px rgba(200, 125, 85, 0.25)',
  },
  btnContent: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  btnTitle: { fontSize: '14px', fontWeight: '700', lineHeight: '1.2' },
  btnSub: { fontSize: '11px', opacity: 0.9 },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  subjectRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: '11px', color: '#A8A29E' },
  previewContainer: {
    backgroundColor: '#F6F1EA',
    border: '1px solid #E5DBD0',
    borderRadius: '10px',
    padding: '14px',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  previewMetaBox: {
    borderBottom: '1px solid #E2D7CB',
    paddingBottom: '10px',
    marginBottom: '14px',
    fontSize: '12px',
    color: '#57534E',
    lineHeight: '1.6',
  },
  previewBodyTextarea: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#2D2825',
    fontSize: '13px',
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
    fontSize: '12px',
    color: '#16A34A',
    marginTop: '14px',
    fontWeight: '600',
  },
  greenCheck: { marginRight: '6px' },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    position: 'relative',
    zIndex: 1,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E7E0D6',
    borderTop: '3px solid #C87D55',
    borderRadius: '14px',
    padding: '20px 24px',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'flex-start',
    boxShadow: '0 6px 25px rgba(180, 160, 140, 0.08)',
  },
  metricHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  metricLabel: { fontSize: '12px', color: '#78716C', fontWeight: '600', letterSpacing: '0.3px' },
  metricVal: { fontSize: '26px', fontWeight: '800', color: '#1C1917', margin: '2px 0 6px 0' },
  metricSub: { fontSize: '11px', color: '#A8A29E' },
  metricDotWarm: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#C87D55', boxShadow: '0 0 8px rgba(200, 125, 85, 0.6)' },
  metricPillWarm: { 
    fontSize: '10px', 
    fontWeight: '800', 
    color: '#C87D55', 
    backgroundColor: '#FBF0E9', 
    padding: '5px 12px', 
    borderRadius: '12px', 
    border: '1px solid #F3D9C9',
    marginLeft: '12px'
  },
};