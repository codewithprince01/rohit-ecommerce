import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  type: {
    type: String,
    enum: ['IN', 'OUT', 'ADJUSTMENT', 'SALE', 'RETURN', 'DAMAGE'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    trim: true,
  },
  reference: {
    type: String,
    trim: true,
  },
  note: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  batchNumber: String,
  expiryDate: Date,
}, {
  timestamps: true,
});

inventorySchema.index({ product: 1 });
inventorySchema.index({ createdAt: -1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
