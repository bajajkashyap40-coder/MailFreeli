import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  prompt: { type: String, required: true },
  subject: { type: String },
  body: { type: String },
  status: { type: String, enum: ['SENT', 'FAILED'], default: 'SENT' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Email', emailSchema);