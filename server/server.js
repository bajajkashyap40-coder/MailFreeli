import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';
import Email from './models/Email.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 2. Initialize Groq AI Client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY,
  timeout: 10000 
});

// Helper to safely get active Groq text generation models only
async function getValidModel() {
  const safeCandidates = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ];

  try {
    const modelsList = await groq.models.list();
    const available = modelsList.data.map((m) => m.id);
    
    // 1. Check if any verified text candidate is active
    const matched = safeCandidates.find((model) => available.includes(model));
    if (matched) return matched;

    // 2. Fallback: Find a text model while explicitly excluding guard/safety/whisper/vision models
    const fallbackTextModel = available.find((id) => {
      const lower = id.toLowerCase();
      const isTextModel = lower.includes('llama') || lower.includes('mixtral') || lower.includes('gemma');
      const isGuardOrSpecial = lower.includes('guard') || lower.includes('whisper') || lower.includes('vision') || lower.includes('orpheus');
      return isTextModel && !isGuardOrSpecial;
    });

    return fallbackTextModel || 'llama-3.3-70b-versatile';
  } catch (err) {
    console.warn('Unable to query Groq models list, defaulting to llama-3.3-70b-versatile:', err.message);
    return 'llama-3.3-70b-versatile';
  }
}

// 3. Dynamic Dashboard Stats Endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const totalEmails = await Email.countDocuments();
    const sentEmails = await Email.countDocuments({ status: 'SENT' });
    const failedEmails = await Email.countDocuments({ status: 'FAILED' });

    const successRate = totalEmails > 0 
      ? ((sentEmails / totalEmails) * 100).toFixed(1) 
      : '100.0';

    res.status(200).json({
      completionRate: `${successRate}%`,
      activeQueue: 0,
      velocity: totalEmails > 0 ? '0.18s' : '0.00s',
      totalLogs: totalEmails,
      sentCount: sentEmails,
      failedCount: failedEmails,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// 4. STEP 1: AI Email Draft Generation
app.post('/api/generate-draft', async (req, res) => {
  const { recipient, prompt, meetingLink } = req.body;

  if (!recipient || !prompt) {
    return res.status(400).json({ error: 'Recipient and prompt are required.' });
  }

  const linkInstruction = meetingLink 
    ? `Use this exact meeting link in the email: "${meetingLink}".` 
    : 'If a meeting or calendar link is needed, use the exact placeholder tag: "<YOUR_CALENDAR_LINK_HERE>". NEVER invent fake URLs.';

  let rawContent = '';
  let selectedModel = '';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      selectedModel = await getValidModel();
      console.log(`[Attempt ${attempt}] Using Active Groq Model: ${selectedModel}`);

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an elite email generator. Return ONLY a valid JSON object with two keys: "subject" and "body".
Rules:
1. Do not invent fake links, URLs, or domains.
2. ${linkInstruction}`,
          },
          {
            role: 'user',
            content: `Write an email based on this prompt: "${prompt}". Recipient is ${recipient}.`,
          },
        ],
        model: selectedModel,
        response_format: { type: 'json_object' },
      });

      rawContent = completion.choices[0]?.message?.content || '{}';
      if (rawContent && rawContent !== '{}') break;
    } catch (err) {
      console.warn(`Generation attempt ${attempt} failed on model (${selectedModel}):`, err.message);
      if (attempt === 2) {
        return res.status(500).json({ error: 'AI generation timed out or model error. Please try again.' });
      }
    }
  }

  let subject = 'Follow-up from MailFreeli';
  let body = prompt;

  try {
    const aiContent = JSON.parse(rawContent);
    subject = aiContent.subject || subject;
    body = aiContent.body || body;
  } catch (parseErr) {
    body = rawContent;
  }

  if (meetingLink && body.includes('<YOUR_CALENDAR_LINK_HERE>')) {
    body = body.replace(/<YOUR_CALENDAR_LINK_HERE>/g, meetingLink);
  }

  res.status(200).json({ subject, body });
});

// 5. STEP 2: Dispatch Edited Email via Nodemailer
app.post('/api/dispatch-email', async (req, res) => {
  const { sender, recipient, prompt, subject, body } = req.body;

  if (!recipient || !subject || !body) {
    return res.status(400).json({ error: 'Recipient, subject, and body are required.' });
  }

  const senderEmail = sender || process.env.EMAIL_USER;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      logger: true,
      debug: true, 
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: `"${senderEmail}" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      text: body,
      replyTo: senderEmail,
    });

    try {
      await Email.create({
        sender: senderEmail,
        recipient,
        prompt: prompt || 'Direct Dispatch',
        subject,
        body,
        status: 'SENT',
      });
    } catch (dbErr) {
      console.warn('Email sent, but DB logging failed:', dbErr.message);
    }

    res.status(200).json({ message: 'Email dispatched successfully!' });
  } catch (error) {
    console.error('Dispatch error details:', error.message);
    
    try {
      await Email.create({
        sender: senderEmail,
        recipient,
        prompt: prompt || 'Direct Dispatch',
        subject,
        body,
        status: 'FAILED',
      });
    } catch (dbErr) {
      console.error('Failed to log error to DB:', dbErr.message);
    }

    res.status(500).json({ error: error.message || 'Failed to dispatch email.' });
  }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));