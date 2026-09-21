import React, { useState } from 'react';
import Papa from 'papaparse';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BulkEmail() {
  const [contacts, setContacts] = useState([]);
  const [subject, setSubject] = useState('');
  const [templatePrompt, setTemplatePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [fileName, setFileName] = useState('');

  // 1. Handle CSV Upload and Parse Contacts
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Map common CSV column header variations
        const parsedContacts = results.data
          .map((row) => ({
            email: row.Email || row.email || row.EMAIL || Object.values(row)[0],
            name: row.Name || row.name || row.NAME || 'Friend',
          }))
          .filter((c) => c.email && c.email.includes('@'));

        setContacts(parsedContacts);
      },
    });
  };

  // 2. Submit Batch to Express Backend
  const handleBulkSend = async () => {
    if (contacts.length === 0) return alert('Please upload a valid CSV first!');
    if (!subject) return alert('Please enter an email subject!');

    setLoading(true);
    setLogs([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/bulk-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: contacts,
          subject,
          templatePrompt,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLogs(data.results || []);
      } else {
        alert(data.error || 'Failed to dispatch bulk emails.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div>
        <h2 style={styles.title}>🚀 Bulk Email Engine</h2>
        <p style={styles.subtitle}>Upload a CSV list to dispatch personalized AI emails with rate-limiting protection.</p>
      </div>

      {/* CSV File Upload Dropzone */}
      <div style={styles.dropzone}>
        <label style={styles.label}>UPLOAD RECIPIENT CSV FILE</label>
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileUpload} 
          style={styles.fileInput}
        />
        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
          Format: CSV with <strong>Email</strong> and <strong>Name</strong> headers.
        </p>
        {contacts.length > 0 && (
          <div style={styles.successBadge}>
            ✓ Loaded {contacts.length} valid contacts from {fileName}
          </div>
        )}
      </div>

      {/* Inputs Form */}
      <div style={styles.formGroup}>
        <label style={styles.label}>EMAIL SUBJECT</label>
        <input
          type="text"
          placeholder="e.g. Quick update regarding our partnership"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>AI PERSONALIZATION PROMPT (OPTIONAL)</label>
        <textarea
          rows={3}
          placeholder="e.g. Write a friendly 2-sentence intro to {{name}} about our software."
          value={templatePrompt}
          onChange={(e) => setTemplatePrompt(e.target.value)}
          style={styles.textarea}
        />

        <button
          onClick={handleBulkSend}
          disabled={loading || contacts.length === 0}
          className="glow-btn"
          style={{
            ...styles.primaryBtn,
            opacity: loading || contacts.length === 0 ? 0.5 : 1,
            cursor: loading || contacts.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? `Sending Batch (Rate-limited 2s delay)...` : `🚀 Dispatch to ${contacts.length} Contacts`}
        </button>
      </div>

      {/* Contact Preview & Log Table */}
      {contacts.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#F5F2EA', marginBottom: '12px' }}>
            Recipient List & Live Dispatch Status
          </h3>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => {
                  const log = logs.find((l) => l.email === c.email);
                  return (
                    <tr key={i} style={styles.tableBodyRow}>
                      <td style={styles.td}>{c.name}</td>
                      <td style={styles.td}>{c.email}</td>
                      <td style={styles.td}>
                        {log ? (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: log.status === 'SENT' ? 'rgba(53, 208, 160, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: log.status === 'SENT' ? '#35D0A0' : '#EF4444',
                            border: `1px solid ${log.status === 'SENT' ? 'rgba(53, 208, 160, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                          }}>
                            {log.status}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#F5F2EA',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '4px',
    marginBottom: '0',
  },
  dropzone: {
    backgroundColor: '#10141B',
    border: '1px dashed #292E36',
    borderRadius: '12px',
    padding: '16px',
  },
  fileInput: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#F5F2EA',
  },
  successBadge: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#35D0A0',
    fontWeight: '600',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: '0.5px',
  },
  input: {
    backgroundColor: '#10141B',
    border: '1px solid #292E36',
    borderRadius: '10px',
    padding: '10px 12px',
    color: '#F5F2EA',
    fontSize: '13px',
    width: '100%',
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
    marginTop: '8px',
  },
  tableWrapper: {
    backgroundColor: '#10141B',
    border: '1px solid #292E36',
    borderRadius: '12px',
    overflow: 'hidden',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  table: {
    width: '100%',
    textAlign: 'left',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#141922',
    borderBottom: '1px solid #292E36',
  },
  th: {
    padding: '10px 14px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tableBodyRow: {
    borderBottom: '1px solid #1C222D',
  },
  td: {
    padding: '10px 14px',
    fontSize: '12px',
    color: '#F5F2EA',
  },
};