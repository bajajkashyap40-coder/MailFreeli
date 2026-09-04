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

// 3. AI Email Generation & SMTP Dispatch Endpoint
app.post('/api/generate-email', async (req, res) => {
  const { sender, recipient, prompt } = req.body;

  if (!recipient || !prompt) {
    return res.status(400).json({ error: 'Recipient and prompt are required.' });
  }

  try {
    // Generate AI content using Groq (llama3-8b-8192)
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an elite email generator. Return ONLY a valid JSON object with two keys: "subject" and "body". Do not wrap in markdown or add extra text.',
        },
        {
          role: 'user',
          content: `Write an email based on this prompt: "${prompt}". Recipient is ${recipient}.`,
        },
      ],
      model: 'llama3-8b-8192',
      response_format: { type: 'json_object' },
    });

    const aiContent = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const subject = aiContent.subject || 'Follow-up from MailFreeli';
    const body = aiContent.body || prompt;

    // Configure Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email via SMTP
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: subject,
      text: body,
    });

    // Save record to MongoDB Atlas
    const newEmail = new Email({
      sender: sender || process.env.EMAIL_USER,
      recipient,
      prompt,
      subject,
      body,
      status: 'SENT',
    });
    await newEmail.save();

    res.status(200).json({
      message: 'Email generated, dispatched, and logged successfully!',
      subject,
      body,
    });
  } catch (error) {
    console.error('Dispatch error:', error);
    
    // Log failure attempt to DB if possible
    try {
      await Email.create({
        sender: sender || 'system',
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