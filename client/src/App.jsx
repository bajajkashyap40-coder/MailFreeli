import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Activity, 
  TrendingUp 
} from 'lucide-react';

export default function App() {
  const [sender, setSender] = useState('you@yourcompany.com');
  const [recipient, setRecipient] = useState('');
  const [prompt, setPrompt] = useState(
    'Draft a quarterly follow-up update to our leads from the tech summit. Thank them for attending, highlight our new AI automatic routing integration that cut dispatch costs by 40%, and propose a calendar invite link for next Tuesday afternoon. Keep the tone ambitious, sleek, and highly professional.'
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [generatedEmail, setGeneratedEmail] = useState({
    subject: 'Accelerating operations at VenturePulse - automatic...',
    from: 'ai-agent-07@dispatch.mailfreeli.io',
    body: `Hello team at VenturePulse,

It was fantastic connecting with you all at the recent tech summit. Our conversations sparked multiple pathways regarding how automation can streamline your developer communication stack.

As an immediate update: We just launched our AI Automatic Routing Integration! This setup has already proven to slash dispatch costs by an average of 40% for our key enterprise pilot clients.

I'd love to drop a calendar invite link so we can dig into your technical specs next Tuesday afternoon. Let me know if that aligns!

Best regards,
MailFreeli Autonomous Agent`
  });

  const suggestions = [
    'Follow-up email',
    'Meeting request',
    'Project update',
    'Investor Pitch',
    'Re-engagement'
  ];

  const handleSuggestionClick = (tag) => {
    setPrompt(`Draft a ${tag.toLowerCase()} regarding...`);
  };

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
          subject: data.subject || 'Generated Email Subject',
          from: sender,
          body: data.body || 'Generated Email Body Text...'
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
    <div className="min-h-screen bg-[#07090E] text-gray-200 font-sans p-4 sm:p-8 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between pb-6 mb-8 border-b border-gray-800/80 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg tracking-wider text-white">MailFreeli</h1>
              <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800/50">
                AI DISPATCH V2.0
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-gray-300">
              LIVE API STATUS: OPERATIONAL
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 font-mono text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800/60">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>12.4 ms avg</span>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: AI Dispatch Cockpit */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0D111A] border border-gray-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white tracking-tight">AI Dispatch Cockpit</h2>
              <p className="text-xs text-gray-400 mt-1">
                Compose emails using natural language prompts. Our engine auto-routes, refines, and dispatches.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Sender Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Sender Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="email"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#090C14] border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-cyan-500/60 transition-colors"
                  />
                </div>
              </div>

              {/* Recipient Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Recipient Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#090C14] border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-cyan-500/60 transition-colors placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* AI Context Prompt */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  AI Context / Prompt
                </label>
                <textarea
                  required
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full p-4 bg-[#090C14] border border-gray-800 rounded-xl text-sm text-gray-200 focus:outline-none focus:border-cyan-500/60 transition-colors leading-relaxed placeholder:text-gray-600"
                />
                <div className="flex justify-between items-center mt-2 text-[11px] text-gray-400 font-mono">
                  <span className="text-emerald-400 flex items-center gap-1">
                    Context Analysis: <strong className="font-semibold text-emerald-300">Excellent (94%)</strong>
                  </span>
                  <span>{prompt.length} characters</span>
                </div>
              </div>

              {/* Quick Suggestions */}
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Quick Suggestions
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSuggestionClick(tag)}
                      className="text-xs bg-[#131926] hover:bg-cyan-950/40 text-cyan-300/80 hover:text-cyan-200 px-3 py-1.5 rounded-lg border border-cyan-900/30 transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-gray-950 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer font-sans"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-gray-950" />
                    Generating & Sending...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gray-950 fill-gray-950" />
                    Generate & Send Email
                  </>
                )}
              </button>
            </form>

            {/* Status Messages */}
            {status && (
              <div
                className={`mt-4 p-3 rounded-xl flex items-center gap-3 text-xs ${
                  status.type === 'success'
                    ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border border-rose-800/60 text-rose-300'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{status.message}</span>
              </div>
            )}
          </div>

          {/* Bottom Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#0D111A] border border-gray-800/80 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 block mb-1">AI Completion Rate</span>
              <p className="text-base font-bold text-white font-mono">99.2%</p>
              <span className="text-[10px] text-gray-500 font-mono">1,240 successful runs</span>
            </div>

            <div className="bg-[#0D111A] border border-gray-800/80 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 block mb-1">SMTP Queue</span>
              <p className="text-base font-bold text-white font-mono">0 Active</p>
              <span className="text-[10px] text-gray-500 font-mono">No backlogs in pipeline</span>
            </div>

            <div className="bg-[#0D111A] border border-gray-800/80 rounded-xl p-4">
              <span className="text-[10px] text-gray-400 block mb-1">Dispatch Velocity</span>
              <p className="text-base font-bold text-cyan-400 font-mono">0.24s</p>
              <span className="text-[10px] text-gray-500 font-mono">Real-time stream speed</span>
            </div>

            <div className="bg-[#0D111A] border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-gray-400 block mb-1">Live Mail Stream</span>
                <p className="text-base font-bold text-white font-mono">94,204/mo</p>
              </div>
              <div className="mt-2 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Generation Preview */}
        <div className="lg:col-span-5">
          <div className="bg-[#0D111A] border border-gray-800/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between h-full min-h-[580px]">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <h3 className="text-sm font-bold text-white">Live Generation Preview</h3>
                </div>
                <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-2.5 py-1 rounded-full border border-cyan-800/40">
                  Dispatched via SMTP
                </span>
              </div>

              {/* Email Content Details */}
              <div className="space-y-3 mb-6 font-mono text-xs">
                <div className="flex">
                  <span className="text-gray-500 w-16 shrink-0">Subject:</span>
                  <span className="text-gray-200 font-semibold truncate">{generatedEmail.subject}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-16 shrink-0">From:</span>
                  <span className="text-cyan-400 truncate">{generatedEmail.from}</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="bg-[#07090E] border border-gray-800/60 rounded-xl p-4 text-xs text-gray-300 leading-relaxed font-sans whitespace-pre-line space-y-3">
                {generatedEmail.body}
              </div>
            </div>

            {/* Terminal Telemetry Footer */}
            <div className="mt-6 pt-4 border-t border-gray-800/80 font-mono text-[11px] text-gray-500 space-y-1 bg-[#07090E]/80 p-3 rounded-lg border border-gray-800/40">
              <div className="flex justify-between">
                <span>[20:14:12] SMTP Handshake</span>
                <span className="text-emerald-400">SUCCESS</span>
              </div>
              <div className="flex justify-between">
                <span>[20:14:13] Token Count Estimate</span>
                <span className="text-gray-300">294 Out</span>
              </div>
              <div className="flex justify-between">
                <span>[20:14:14] Queue Delivery Code</span>
                <span className="text-cyan-400">SEC-0044</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}