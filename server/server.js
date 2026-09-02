import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Track MongoDB Connection Status
let isMongoConnected = false;

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    isMongoConnected = true;
    console.log('🍃 MongoDB Atlas Connected Successfully!');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

// Root Endpoint - Health Check
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; background: #0A0A0C; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <h1 style="color: #6366F1;">🚀 MailFreeli Backend is Live!</h1>
      <p style="font-size: 1.2rem;">
        Database Status: 
        <strong style="color: ${isMongoConnected ? '#22c55e' : '#ef4444'};">
          ${isMongoConnected ? '🍃 MongoDB Connected' : '❌ MongoDB Disconnected'}
        </strong>
      </p>
    </div>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MailFreeli server running at http://localhost:${PORT}`);
});