import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    default: 'Local Grocery Store'
  },
  storeDescription: {
    type: String,
    default: ''
  },
  storeEmail: {
    type: String,
    default: ''
  },
  storePhone: {
    type: String,
    default: ''
  },
  storeAddress: {
    type: String,
    default: ''
  },
  whatsappNumber: {
    type: String,
    required: true,
    default: ''
  },
  whatsappMessage: {
    type: String,
    default: 'Hello! I would like to order the following items:'
  },
  logo: {
    type: String,
    default: null
  },
  favicon: {
    type: String,
    default: null
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  seo: {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' }
  },
  businessHours: {
    type: String,
    default: 'Mon-Sat: 9AM-9PM, Sun: 10AM-6PM'
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
