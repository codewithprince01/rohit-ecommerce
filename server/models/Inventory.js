import mongoose from 'mongoose';

const inventoryTransactionSchema = new mongoose.Schema({
  // Transaction Details
  type: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'return', 'damage', 'transfer', 'expiry', 'correction'],
    required: true
  },
  reference: {
    type: String, // Order ID, Purchase Order ID, etc.
    trim: true
  },
  referenceType: {
    type: String,
    enum: ['order', 'purchase', 'manual', 'system', 'return'],
    default: 'manual'
  },
  
  // Product Details
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product.variants'
  },
  sku: {
    type: String,
    required: true
  },
  
  // Quantity Changes
  quantity: {
    type: Number,
    required: true // Positive for stock in, negative for stock out
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  
  // Batch Information
  batch: {
    batchNumber: String,
    manufactureDate: Date,
    expiryDate: Date,
    costPrice: Number,
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    }
  },
  
  // Location
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  zone: String,
  rack: String,
  shelf: String,
  bin: String,
  
  // Financial
  unitCost: {
    type: Number,
    min: 0
  },
  totalCost: {
    type: Number,
    min: 0
  },
  
  // Quality & Condition
  quality: {
    type: String,
    enum: ['good', 'damaged', 'expired', 'returned', 'defective'],
    default: 'good'
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'poor'],
    default: 'good'
  },
  
  // Reason & Notes
  reason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String]
}, {
  timestamps: true
});

const inventoryAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'expiry_warning', 'expired', 'damage', 'discrepancy'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  
  // Product Reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product.variants'
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  
  // Alert Details
  currentStock: Number,
  threshold: Number,
  expiryDate: Date,
  daysToExpiry: Number,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'resolved'],
    default: 'active'
  },
  
  // Resolution
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: String,
  
  // Notifications
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'system']
    },
    sentAt: Date,
    recipient: String,
    status: {
      type: String,
      enum: ['pending', 'sent', 'delivered', 'failed'],
      default: 'pending'
    }
  }],
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const stockCountSchema = new mongoose.Schema({
  // Count Details
  countType: {
    type: String,
    enum: ['full', 'partial', 'cycle'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'failed'],
    default: 'scheduled'
  },
  
  // Warehouse & Scope
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  zones: [String],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // Schedule
  scheduledDate: Date,
  startedAt: Date,
  completedAt: Date,
  estimatedDuration: Number, // in hours
  
  // Count Details
  countedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['counter', 'supervisor', 'auditor'],
      required: true
    },
    startedAt: Date,
    completedAt: Date
  }],
  
  // Results
  totalItems: { type: Number, default: 0 },
  countedItems: { type: Number, default: 0 },
  discrepancies: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product.variants'
    },
    systemStock: Number,
    countedStock: Number,
    difference: Number,
    variance: Number, // percentage
    reason: String,
    action: String
  }],
  
  // Summary
  totalDiscrepancies: { type: Number, default: 0 },
  totalValue: { type: Number, default: 0 },
  accuracyRate: { type: Number, default: 100 },
  
  // Notes
  notes: String,
  recommendations: String,
  
  // Approval
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const inventorySchema = new mongoose.Schema({
  // Product Reference
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product.variants',
    unique: true,
    sparse: true
  },
  sku: {
    type: String,
    required: true,
    unique: true
  },
  
  // Warehouse Location
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  location: {
    zone: String,
    rack: String,
    shelf: String,
    bin: String,
    notes: String
  },
  
  // Stock Levels
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative']
  },
  reserved: {
    type: Number,
    default: 0,
    min: [0, 'Reserved stock cannot be negative']
  },
  available: {
    type: Number,
    get: function() {
      return Math.max(0, this.stock - this.reserved);
    }
  },
  
  // Thresholds
  minStock: {
    type: Number,
    default: 0,
    min: [0, 'Minimum stock cannot be negative']
  },
  maxStock: {
    type: Number,
    min: [0, 'Maximum stock cannot be negative']
  },
  reorderPoint: {
    type: Number,
    default: 0,
    min: [0, 'Reorder point cannot be negative']
  },
  reorderQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Reorder quantity must be positive']
  },
  
  // Batch Management
  batches: [{
    batchNumber: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Batch quantity cannot be negative']
    },
    manufactureDate: Date,
    expiryDate: Date,
    costPrice: {
      type: Number,
      min: [0, 'Cost price cannot be negative']
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier'
    },
    location: {
      zone: String,
      rack: String,
      shelf: String,
      bin: String
    },
    receivedAt: {
      type: Date,
      default: Date.now
    },
    quality: {
      type: String,
      enum: ['good', 'damaged', 'expired'],
      default: 'good'
    },
    notes: String
  }],
  
  // Financial
  averageCost: {
    type: Number,
    default: 0,
    min: [0, 'Average cost cannot be negative']
  },
  totalValue: {
    type: Number,
    get: function() {
      return this.stock * this.averageCost;
    }
  },
  
  // Status & Settings
  isActive: {
    type: Boolean,
    default: true
  },
  trackExpiry: {
    type: Boolean,
    default: false
  },
  requiresTemperatureControl: {
    type: Boolean,
    default: false
  },
  lastCounted: Date,
  nextCountDate: Date,
  
  // Alerts
  alerts: [inventoryAlertSchema],
  
  // Transactions History
  transactions: [inventoryTransactionSchema],
  
  // Stock Counts
  stockCounts: [stockCountSchema],
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastSync: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
inventorySchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minStock;
});

inventorySchema.virtual('needsReorder').get(function() {
  return this.stock <= this.reorderPoint;
});

inventorySchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock';
  if (this.stock <= this.minStock) return 'low_stock';
  if (this.stock >= this.maxStock) return 'overstock';
  return 'in_stock';
});

inventorySchema.virtual('utilizationRate').get(function() {
  if (!this.maxStock) return 0;
  return (this.stock / this.maxStock) * 100;
});

inventorySchema.virtual('expiringSoon').get(function() {
  if (!this.trackExpiry || !this.batches.length) return false;
  
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return this.batches.some(batch => 
    batch.expiryDate && batch.expiryDate <= thirtyDaysFromNow
  );
});

// Pre-save middleware
inventorySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Update available stock
  this.available = Math.max(0, this.stock - this.reserved);
  
  // Check for low stock alert
  if (this.isLowStock && !this.alerts.some(alert => 
    alert.type === 'low_stock' && alert.status === 'active'
  )) {
    this.alerts.push({
      type: 'low_stock',
      severity: this.stock === 0 ? 'critical' : 'medium',
      currentStock: this.stock,
      threshold: this.minStock
    });
  }
  
  next();
});

// Static methods
inventorySchema.statics.findLowStock = function(warehouseId = null) {
  const query = {
    $expr: { $lte: ['$stock', '$minStock'] },
    isActive: true
  };
  
  if (warehouseId) {
    query.warehouse = warehouseId;
  }
  
  return this.find(query)
    .populate('product', 'name sku primaryImage')
    .populate('variant', 'name sku')
    .populate('warehouse', 'name code');
};

inventorySchema.statics.findExpiringSoon = function(days = 30, warehouseId = null) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  const query = {
    trackExpiry: true,
    'batches.expiryDate': { $lte: expiryDate },
    isActive: true
  };
  
  if (warehouseId) {
    query.warehouse = warehouseId;
  }
  
  return this.find(query)
    .populate('product', 'name sku primaryImage')
    .populate('warehouse', 'name code');
};

inventorySchema.statics.getStockValue = function(warehouseId = null) {
  const matchStage = { isActive: true };
  if (warehouseId) {
    matchStage.warehouse = warehouseId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$stock', '$averageCost'] } },
        totalStock: { $sum: '$stock' },
        totalProducts: { $sum: 1 }
      }
    }
  ]);
};

// Instance methods
inventorySchema.methods.adjustStock = function(quantity, type, reason, userId, additionalData = {}) {
  const previousStock = this.stock;
  this.stock += quantity;
  
  const transaction = {
    type,
    quantity,
    previousStock,
    newStock: this.stock,
    reason,
    createdBy: userId,
    ...additionalData
  };
  
  if (additionalData.unitCost) {
    transaction.unitCost = additionalData.unitCost;
    transaction.totalCost = Math.abs(quantity) * additionalData.unitCost;
  }
  
  this.transactions.push(transaction);
  
  // Update average cost if this is a purchase
  if (type === 'purchase' && additionalData.unitCost) {
    const totalCost = this.stock * this.averageCost + quantity * additionalData.unitCost;
    this.averageCost = totalCost / this.stock;
  }
  
  // Check for low stock alert
  if (this.stock <= this.minStock && !this.alerts.some(alert => 
    alert.type === 'low_stock' && alert.status === 'active'
  )) {
    this.alerts.push({
      type: 'low_stock',
      severity: this.stock === 0 ? 'critical' : 'medium',
      currentStock: this.stock,
      threshold: this.minStock
    });
  }
  
  return this.save();
};

inventorySchema.methods.reserveStock = function(quantity) {
  if (this.available >= quantity) {
    this.reserved += quantity;
    return this.save();
  }
  throw new Error('Insufficient available stock');
};

inventorySchema.methods.releaseReservedStock = function(quantity) {
  if (this.reserved >= quantity) {
    this.reserved -= quantity;
    return this.save();
  }
  throw new Error('Cannot release more than reserved stock');
};

inventorySchema.methods.getBatchInfo = function() {
  return this.batches.map(batch => ({
    batchNumber: batch.batchNumber,
    quantity: batch.quantity,
    expiryDate: batch.expiryDate,
    daysToExpiry: batch.expiryDate ? Math.ceil((batch.expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null,
    isExpired: batch.expiryDate ? batch.expiryDate < new Date() : false,
    costPrice: batch.costPrice,
    supplier: batch.supplier
  }));
};

// Indexes
inventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ variant: 1, warehouse: 1 }, { unique: true, sparse: true });
inventorySchema.index({ sku: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ warehouse: 1 });
inventorySchema.index({ stock: 1 });
inventorySchema.index({ minStock: 1 });
inventorySchema.index({ reorderPoint: 1 });
inventorySchema.index({ 'batches.expiryDate': 1 });
inventorySchema.index({ isActive: 1 });
inventorySchema.index({ lastUpdated: -1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export { Inventory, inventoryTransactionSchema, inventoryAlertSchema, stockCountSchema };
