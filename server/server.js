import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Groq from 'groq-sdk';
import Email from './models/Email.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory OTP Store: { "target_sender_email": { otp: "123456", expiresAt: timestamp } }
const otpStore = new Map();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// HTML TEMPLATES
const generateWelcomeOtpHtml = (otp, targetEmail) => `
  <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #090B0F; color: #F5F2EA; padding: 40px 20px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid #292E36;">
    
    <!-- HEADER LOGO -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #D6A967, #B88A48); color: #090B0F; font-weight: 800; font-size: 22px;">M</div>
      <h1 style="color: #F5F2EA; margin: 12px 0 4px 0; font-size: 22px; font-weight: 700;">Welcome to MailFreeli</h1>
      <p style="color: #9CA3AF; font-size: 13px; margin: 0;">AI-Powered Email Dispatch Platform</p>
    </div>

    <!-- MAIN BODY -->
    <div style="background-color: #141922; border: 1px solid #292E36; border-radius: 14px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #D6A967; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🔒 Verification Code Required</h2>
      <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6; margin: 0 0 20px 0;">
        Hello! You are authorizing an email dispatch from <strong>${targetEmail}</strong>. Please enter the 6-digit OTP code below to confirm your request:
      </p>

      <!-- OTP CODE DISPLAY -->
      <div style="background-color: #10141B; border: 1px dashed #D6A967; border-radius: 10px; padding: 18px; text-align: center;">
        <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #D6A967;">${otp}</span>
      </div>

      <p style="color: #EF4444; font-size: 11px; text-align: center; margin: 12px 0 0 0; font-weight: 600;">
        ⚠️ Code expires in 5 minutes
      </p>
    </div>

    <!-- FOOTER -->
    <div style="border-top: 1px solid #292E36; padding-top: 16px; text-align: center; font-size: 11px; color: #9CA3AF;">
      © 2026 MailFreeli Enterprise • Built for smarter communication
    </div>
  </div>
`;

const generateDispatchHtml = (subject, body, senderEmail) => `
  <div style="font-family: system-ui, -apple-system, sans-serif; background-color: #ffffff; color: #111827; padding: 32px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #E5E7EB;">
    <div style="border-bottom: 2px solid #F3F4F6; padding-bottom: 16px; margin-bottom: 24px;">
      <h2 style="margin: 0; font-size: 20px; color: #111827;">${subject}</h2>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #6B7280;">From: ${senderEmail}</p>
    </div>
    <div style="font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap;">
${body}
    </div>
    <div style="border-top: 1px solid #F3F4F6; margin-top: 32px; padding-top: 16px; font-size: 12px; color: #9CA3AF; text-align: center;">
      Sent via MailFreeli Enterprise Dispatcher
    </div>
  </div>
`;

// Root Health Check Endpoint (Fixes "Cannot GET /" on Render)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'Online', message: 'MailFreeli API Engine Running' });
});

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 2. Initialize Groq AI Client
const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY,
  timeout: 10000 
});

async function getValidModel() {
  const safeCandidates = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama3-70b-8192',
    'llama3-8b-8192',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
  ];

  try {
    const modelsList = await groq.models.list();
    const available = modelsList.data.map((m) => m.id);
    
    const matched = safeCandidates.find((model) => available.includes(model));
    if (matched) return matched;

    const fallbackTextModel = available.find((id) => {
      const lower = id.toLowerCase();
      const isTextModel = lower.includes('llama') || lower.includes('mixtral') || lower.includes('gemma') || lower.includes('gpt');
      const isGuardOrSpecial = lower.includes('guard') || lower.includes('whisper') || lower.includes('vision') || lower.includes('orpheus') || lower.includes('safeguard');
      return isTextModel && !isGuardOrSpecial;
    });

    return fallbackTextModel || 'llama-3.1-8b-instant';
  } catch (err) {
    console.warn('Unable to query Groq models list, defaulting to llama-3.1-8b-instant:', err.message);
    return 'llama-3.1-8b-instant';
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

// 5. STEP 2: Send Welcome + Verification OTP Email (HTML Template)
app.post('/api/send-otp', async (req, res) => {
  const { sender } = req.body;
  const targetSenderEmail = sender || process.env.EMAIL_USER;

  if (!targetSenderEmail) {
    return res.status(400).json({ error: 'Sender email configuration is missing.' });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5-minute validity

  otpStore.set(targetSenderEmail, { otp, expiresAt });

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: `"MailFreeli Security" <${process.env.EMAIL_USER}>`,
      to: targetSenderEmail,
      subject: '🔒 Welcome to MailFreeli - Your OTP Verification Code',
      html: generateWelcomeOtpHtml(otp, targetSenderEmail),
    });

    console.log(`[OTP SENT] Welcome & OTP code delivered to ${targetSenderEmail}`);
    res.status(200).json({ message: `Verification OTP sent to ${targetSenderEmail}!` });
  } catch (error) {
    console.error('SMTP OTP Dispatch Error:', error.message);
    res.status(500).json({ error: `Failed to deliver OTP to inbox: ${error.message}` });
  }
});

// 6. STEP 3: Verify OTP and Dispatch Styled Email
app.post('/api/verify-and-dispatch', async (req, res) => {
  const { otp, sender, recipient, prompt, subject, body } = req.body;

  if (!otp || !recipient || !subject || !body) {
    return res.status(400).json({ error: 'OTP, recipient, subject, and body are required.' });
  }

  const targetSenderEmail = sender || process.env.EMAIL_USER;
  const storedOTP = otpStore.get(targetSenderEmail);

  if (!storedOTP) {
    return res.status(400).json({ error: 'No active OTP found. Please click send again.' });
  }

  if (Date.now() > storedOTP.expiresAt) {
    otpStore.delete(targetSenderEmail);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (storedOTP.otp !== otp.trim()) {
    return res.status(400).json({ error: 'Invalid OTP entered. Please try again.' });
  }

  // Clear valid OTP
  otpStore.delete(targetSenderEmail);

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    await transporter.sendMail({
      from: `"${targetSenderEmail}" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      html: generateDispatchHtml(subject, body, targetSenderEmail),
      replyTo: targetSenderEmail,
    });

    try {
      await Email.create({
        sender: targetSenderEmail,
        recipient,
        prompt: prompt || 'Direct Dispatch',
        subject,
        body,
        status: 'SENT',
      });
    } catch (dbErr) {
      console.warn('Email sent, but DB logging failed:', dbErr.message);
    }

    res.status(200).json({ message: 'OTP verified and email dispatched successfully!' });
  } catch (error) {
    console.error('Dispatch error details:', error.message);
    
    try {
      await Email.create({
        sender: targetSenderEmail,
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));