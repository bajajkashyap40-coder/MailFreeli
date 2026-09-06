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

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// 2. Initialize Groq AI Client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to safely get whichever Groq model is currently ACTIVE on your key
async function getValidModel() {
  try {
    const modelsList = await groq.models.list();
    const available = modelsList.data.map((m) => m.id);

    // List of reliable Groq model IDs ordered by priority
    const candidates = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama3-70b-8192',
      'llama3-8b-8192',
      'mixtral-8x7b-32768',
      'gemma2-9b-it'
    ];

    const matched = candidates.find((model) => available.includes(model));
    return matched || available[0] || 'llama3-8b-8192';
  } catch (err) {
    console.warn('Unable to query Groq models list, defaulting to llama3-8b-8192:', err.message);
    return 'llama3-8b-8192';
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

  try {
    const selectedModel = await getValidModel();
    console.log(`Using Active Groq Model: ${selectedModel}`);

    const linkInstruction = meetingLink 
      ? `Use this exact meeting link in the email: "${meetingLink}".` 
      : 'If a meeting or calendar link is needed, use the exact placeholder tag: "<YOUR_CALENDAR_LINK_HERE>". NEVER invent fake URLs.';

    let rawContent = '';

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an elite email generator. Return ONLY a valid JSON object with two keys: "subject" and "body". Do not wrap in markdown.
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
    } catch (modelErr) {
      console.warn(`Primary model ${selectedModel} JSON request failed. Attempting standard text prompt...`);
      const fallbackCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an email generator. Return ONLY a JSON object with "subject" and "body" keys.`,
          },
          {
            role: 'user',
            content: `Write an email based on this prompt: "${prompt}". Recipient is ${recipient}.`,
          },
        ],
        model: selectedModel,
      });
      rawContent = fallbackCompletion.choices[0]?.message?.content || '{}';
    }

    let subject = 'Follow-up from MailFreeli';
    let body = prompt;

    try {
      const aiContent = JSON.parse(rawContent);
      subject = aiContent.subject || subject;
      body = aiContent.body || body;
    } catch (parseErr) {
      console.warn('JSON parsing failed, assigning raw output to body.');
      body = rawContent;
    }

    if (meetingLink && body.includes('<YOUR_CALENDAR_LINK_HERE>')) {
      body = body.replace(/<YOUR_CALENDAR_LINK_HERE>/g, meetingLink);
    }

    res.status(200).json({ subject, body });
  } catch (error) {
    console.error('AI Draft Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate AI draft.' });
  }
});

// 5. STEP 2: Dispatch Edited Email via Nodemailer & Log to DB
app.post('/api/dispatch-email', async (req, res) => {
  const { sender, recipient, prompt, subject, body } = req.body;

  if (!recipient || !subject || !body) {
    return res.status(400).json({ error: 'Recipient, subject, and body are required.' });
  }

  const senderEmail = sender || process.env.EMAIL_USER;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"${senderEmail}" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      text: body,
      replyTo: senderEmail,
    });

    const newEmail = new Email({
      sender: senderEmail,
      recipient,
      prompt,
      subject,
      body,
      status: 'SENT',
    });
    await newEmail.save();

    res.status(200).json({ message: 'Email dispatched and logged successfully!' });
  } catch (error) {
    console.error('Dispatch error:', error);
    
    try {
      await Email.create({
        sender: senderEmail,
        recipient,
        prompt,
        status: 'FAILED',
      });
    } catch (dbErr) {
      console.error('Failed to log error to DB:', dbErr);
    }

    res.status(500).json({ error: error.message || 'Failed to dispatch email.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));