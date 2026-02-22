import mongoose from 'mongoose';

const orderLogSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryAddress: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  whatsappSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for searching orders
orderLogSchema.index({ customerName: 'text', customerPhone: 'text', customerEmail: 'text' });
orderLogSchema.index({ status: 1, createdAt: -1 });

const OrderLog = mongoose.model('OrderLog', orderLogSchema);

export default OrderLog;
