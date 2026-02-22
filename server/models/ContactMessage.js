import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  repliedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for searching messages
contactMessageSchema.index({ name: 'text', email: 'text', subject: 'text', message: 'text' });
contactMessageSchema.index({ isRead: 1, createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
