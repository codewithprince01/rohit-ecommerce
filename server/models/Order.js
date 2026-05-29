import mongoose from 'mongoose';



// Order Status Flow (Grocery Enhanced):

// PENDING → CONFIRMED → PICKING → PICKED → PACKING → PACKED → DISPATCHED → OUT_FOR_DELIVERY → DELIVERED

// Partial fulfillment: Items can be split across multiple statuses

// At any point before DISPATCHED: → CANCELLED (full or partial)

// After DELIVERED: → RETURN_REQUESTED → RETURN_APPROVED → RETURNED → REFUNDED



const ORDER_STATUS = {

  PENDING: 'pending',

  CONFIRMED: 'confirmed',

  PICKING: 'picking',

  PICKED: 'picked',

  PACKING: 'packing',

  PACKED: 'packed',

  DISPATCHED: 'dispatched',

  OUT_FOR_DELIVERY: 'out_for_delivery',

  DELIVERED: 'delivered',

  CANCELLED: 'cancelled',

  PARTIALLY_CANCELLED: 'partially_cancelled',

  RETURN_REQUESTED: 'return_requested',

  RETURN_APPROVED: 'return_approved',

  RETURNED: 'returned',

  REFUNDED: 'refunded',

  PARTIALLY_REFUNDED: 'partially_refunded'

};



const PAYMENT_STATUS = {

  PENDING: 'pending',

  PAID: 'paid',

  FAILED: 'failed',

  REFUNDED: 'refunded',

  PARTIALLY_REFUNDED: 'partially_refunded'

};



const PAYMENT_METHODS = {

  COD: 'cod',

  UPI: 'upi',

  CARD: 'card',

  NET_BANKING: 'net_banking',

  WALLET: 'wallet',

  WHATSAPP: 'whatsapp', // Special for WhatsApp orders

  SUBSCRIPTION: 'subscription' // For recurring orders

};



// Order Item Schema (Enhanced for grocery)

const orderItemSchema = new mongoose.Schema({

  product: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'Product',

    required: true

  },

  variant: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'Product.variants'

  },

  name: { type: String, required: true },

  sku: { type: String, required: true },

  slug: String,

  image: String,

  

  // Quantity & Pricing

  quantity: { 

    type: Number, 

    required: true, 

    min: 1 

  },

  orderedQuantity: { type: Number, required: true }, // Original ordered quantity

  fulfilledQuantity: { type: Number, default: 0 }, // Actually fulfilled quantity

  cancelledQuantity: { type: Number, default: 0 }, // Cancelled quantity

  returnedQuantity: { type: Number, default: 0 }, // Returned quantity

  

  // Pricing (from product variant or product)

  unit: String,

  weight: Number, // in grams

  mrp: { type: Number, required: true },

  sellingPrice: { type: Number, required: true },

  discountPercent: { type: Number, default: 0 },

  taxRate: { type: Number, default: 0 },

  taxAmount: { type: Number, default: 0 },

  subtotal: { type: Number, required: true },

  

  // Batch & Expiry Information

  batch: {

    batchNumber: String,

    manufactureDate: Date,

    expiryDate: Date,

    costPrice: Number

  },

  

  // Quality & Condition

  quality: {

    type: String,

    enum: ['standard', 'premium', 'economy'],

    default: 'standard'

  },

  condition: {

    type: String,

    enum: ['fresh', 'frozen', 'packaged', 'processed'],

    default: 'fresh'

  },

  

  // Substitution

  substitution: {

    allowed: { type: Boolean, default: true },

    preferred: {

      product: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'Product'

      },

      variant: String,

      reason: String

    },

    actual: {

      product: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'Product'

      },

      variant: String,

      reason: String,

      priceDifference: Number

    }

  },

  

  // Picking Information

  picking: {

    picker: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User'

    },

    pickedAt: Date,

    location: {

      zone: String,

      rack: String,

      shelf: String,

      bin: String

    },

    notes: String,

    qualityCheck: {

      passed: Boolean,

      checkedBy: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'User'

      },

      checkedAt: Date,

      issues: [String]

    }

  },

  

  // Return Information

  return: {

    reason: String,

    condition: String,

    requestedAt: Date,

    approvedAt: Date,

    receivedAt: Date,

    refundAmount: Number

  }

}, { _id: true });



// Status History Schema (Enhanced)

const statusHistorySchema = new mongoose.Schema({

  status: { type: String, required: true },

  previousStatus: String,

  note: String,

  updatedBy: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User'

  },

  timestamp: { type: Date, default: Date.now },

  metadata: {

    items: [String], // SKUs affected

    quantity: Number,

    reason: String,

    location: String

  }

}, { _id: false });



// Address Schema (Enhanced)

const addressSchema = new mongoose.Schema({

  name: { type: String, required: true },

  phone: { type: String, required: true },

  email: String,

  addressLine1: { type: String, required: true },

  addressLine2: String,

  landmark: String,

  city: { type: String, required: true },

  state: { type: String, required: true },

  pincode: { type: String, required: true },

  country: { type: String, default: 'India' },

  coordinates: {

    latitude: Number,

    longitude: Number

  },

  deliveryInstructions: String,

  landmark: String

}, { _id: false });



// Delivery Slot Schema

const deliverySlotSchema = new mongoose.Schema({

  date: { type: Date, required: true },

  timeSlot: { 

    type: String, 

    required: true,

    enum: ['6:00 AM - 8:00 AM', '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM', '6:00 PM - 8:00 PM', '8:00 PM - 10:00 PM']

  },

  type: {

    type: String,

    enum: ['standard', 'express', 'scheduled'],

    default: 'standard'

  },

  fee: { type: Number, default: 0 },

  isAvailable: { type: Boolean, default: true }

}, {

  timestamps: true,

  toJSON: { virtuals: true },

  toObject: { virtuals: true }

});



const orderSchema = new mongoose.Schema({

  // Order Identification

  orderNumber: {

    type: String,

    required: true,

    unique: true

  },

  

  // Customer Info (Enhanced)

  customer: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User',

    default: null // Can be null for guest checkout

  },

  customerName: { type: String, required: true },

  customerEmail: String,

  customerPhone: { type: String, required: true },

  isGuestOrder: { type: Boolean, default: false },

  customerType: {

    type: String,

    enum: ['individual', 'business', 'subscription'],

    default: 'individual'

  },

  

  // Addresses (Enhanced)

  shippingAddress: addressSchema,

  billingAddress: addressSchema,

  sameAsBilling: { type: Boolean, default: true },

  

  // Order Items (Enhanced)

  items: [orderItemSchema],

  

  // Fulfillment Information

  fulfillment: {

    type: {

      type: String,

      enum: ['full', 'partial', 'split'],

      default: 'full'

    },

    warehouse: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'Warehouse'

    },

    picker: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User'

    },

    packer: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User'

    },

    dispatcher: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User'

    },

    deliveryAgent: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User'

    },

    estimatedPickTime: Number, // in minutes

    actualPickTime: Number, // in minutes

    estimatedPackTime: Number, // in minutes

    actualPackTime: Number, // in minutes

    estimatedDispatchTime: Number, // in minutes

    actualDispatchTime: Number // in minutes

  },

  

  // Pricing Breakdown (Enhanced)

  pricing: {

    subtotal: { type: Number, required: true },

    tax: {

      total: { type: Number, default: 0 },

      cgst: { type: Number, default: 0 },

      sgst: { type: Number, default: 0 },

      igst: { type: Number, default: 0 }

    },

    shipping: {

      charge: { type: Number, default: 0 },

      method: String,

      distance: Number, // in km

      weight: Number // in grams

    },

    packaging: {

      charge: { type: Number, default: 0 },

      type: {

        type: String,

        enum: ['standard', 'eco_friendly', 'premium'],

        default: 'standard'

      }

    },

    discount: {

      amount: { type: Number, default: 0 },

      type: {

        type: String,

        enum: ['coupon', 'bulk', 'promotion', 'loyalty'],

        default: 'coupon'

      },

      code: String

    },

    coupon: {

      code: String,

      discount: { type: Number, default: 0 },

      type: String

    },

    wallet: {

      used: { type: Number, default: 0 },

      cashback: { type: Number, default: 0 }

    },

    grandTotal: { type: Number, required: true },

    rounding: {

      amount: { type: Number, default: 0 },

      type: {

        type: String,

        enum: ['up', 'down'],

        default: 'up'

      }

    }

  },

  

  // Delivery Information (Enhanced)

  delivery: {

    slot: deliverySlotSchema,

    method: {

      type: String,

      enum: ['standard', 'express', 'scheduled', 'pickup'],

      default: 'standard'

    },

    partner: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'DeliveryPartner'

    },

    executive: {

      name: String,

      phone: String,

      photo: String

    },

    tracking: {

      number: String,

      url: String,

      checkpoints: [{

        location: String,

        timestamp: Date,

        status: String,

        notes: String

      }]

    },

    instructions: String,

    priority: {

      type: String,

      enum: ['normal', 'high', 'urgent'],

      default: 'normal'

    },

    estimatedDelivery: Date,

    actualDelivery: Date,

    distance: Number, // in km

    duration: Number // in minutes

  },

  

  // Subscription Information

  subscription: {

    isSubscription: { type: Boolean, default: false },

    type: {

      type: String,

      enum: ['weekly', 'biweekly', 'monthly'],

      default: 'monthly'

    },

    frequency: Number, // days between deliveries

    nextDeliveryDate: Date,

    paused: { type: Boolean, default: false },

    pausedUntil: Date,

    cancelled: { type: Boolean, default: false },

    cancelledAt: Date

  },

  

  // Currency

  currency: { type: String, default: 'INR' },

  

  // Status (Enhanced)

  status: {

    type: String,

    enum: Object.values(ORDER_STATUS),

    default: ORDER_STATUS.PENDING

  },

  statusHistory: [statusHistorySchema],

  

  // Payment (Enhanced)

  payment: {

    status: {

      type: String,

      enum: Object.values(PAYMENT_STATUS),

      default: PAYMENT_STATUS.PENDING

    },

    method: {

      type: String,

      enum: Object.values(PAYMENT_METHODS),

      default: PAYMENT_METHODS.COD

    },

    gateway: String,

    transactionId: String,

    gatewayOrderId: String,

    gatewayPaymentId: String,

    gatewaySignature: String,

    paidAt: Date,

    refundId: String,

    refundedAt: Date,

    refundAmount: Number,

    partialRefunds: [{

      amount: Number,

      reason: String,

      processedAt: Date,

      processedBy: {

        type: mongoose.Schema.Types.ObjectId,

        ref: 'User'

      }

    }]

  },

  

  // Notes & Communication

  notes: {

    customer: String,

    internal: String,

    picker: String,

    packer: String,

    delivery: String

  },

  

  // Invoice & Documentation

  invoice: {

    number: String,

    date: Date,

    url: String,

    generatedAt: Date,

    sentAt: Date

  },

  

  // Cancellation & Returns (Enhanced)

  cancellation: {

    reason: String,

    type: {

      type: String,

      enum: ['customer', 'inventory', 'payment', 'system', 'fraud'],

      default: 'customer'

    },

    refundProcessed: { type: Boolean, default: false },

    refundAmount: Number,

    initiatedAt: Date,

    processedAt: Date,

    initiatedBy: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User'

    },

    approvedBy: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'User'

    }

  },

  

  returns: [{

    item: {

      type: mongoose.Schema.Types.ObjectId,

      ref: 'Order.items'

    },

    quantity: Number,

    reason: String,

    condition: String,

    requestedAt: Date,

    approvedAt: Date,

    receivedAt: Date,

    refundAmount: Number,

    status: {

      type: String,

      enum: ['requested', 'approved', 'rejected', 'received', 'refunded'],

      default: 'requested'

    },

    notes: String

  }],

  

  // Source & Channel

  source: {

    type: String,

    enum: ['website', 'mobile_app', 'whatsapp', 'phone', 'admin', 'api'],

    default: 'website'

  },

  channel: {

    type: String,

    enum: ['online', 'offline', 'b2b', 'b2c'],

    default: 'b2c'

  },

  

  // Priority & Flags

  priority: {

    type: String,

    enum: ['low', 'normal', 'high', 'urgent'],

    default: 'normal'

  },

  flags: {

    isGift: { type: Boolean, default: false },

    isUrgent: { type: Boolean, default: false },

    isFragile: { type: Boolean, default: false },

    requiresTemperatureControl: { type: Boolean, default: false },

    containsPerishables: { type: Boolean, default: false }

  },

  

  // Gift Information

  gift: {

    isGift: { type: Boolean, default: false },

    message: String,

    wrap: {

      type: String,

      enum: ['standard', 'premium', 'none'],

      default: 'standard'

    },

    card: {

      message: String,

      from: String

    }

  },

  

  // Admin Tracking

  assignedTo: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User'

  },

  createdBy: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User',

    required: true

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



// Virtuals (Enhanced)

orderSchema.virtual('itemCount').get(function() {

  return this.items.reduce((acc, item) => acc + item.orderedQuantity, 0);

});



orderSchema.virtual('fulfilledItemCount').get(function() {

  return this.items.reduce((acc, item) => acc + item.fulfilledQuantity, 0);

});



orderSchema.virtual('cancelledItemCount').get(function() {

  return this.items.reduce((acc, item) => acc + item.cancelledQuantity, 0);

});



orderSchema.virtual('returnedItemCount').get(function() {

  return this.items.reduce((acc, item) => acc + item.returnedQuantity, 0);

});



orderSchema.virtual('isPartiallyFulfilled').get(function() {

  return this.fulfillment.type !== 'full' && this.fulfilledItemCount > 0;

});



orderSchema.virtual('isFullyFulfilled').get(function() {

  return this.fulfilledItemCount === this.itemCount;

});



orderSchema.virtual('hasReturns').get(function() {

  return this.returns.length > 0;

});



orderSchema.virtual('totalReturnAmount').get(function() {

  return this.returns.reduce((acc, ret) => acc + ret.refundAmount, 0);

});



orderSchema.virtual('canBeCancelled').get(function() {

  return !['dispatched', 'out_for_delivery', 'delivered'].includes(this.status);

});



orderSchema.virtual('canBePartiallyCancelled').get(function() {

  return this.fulfillment.type === 'full' && !['dispatched', 'out_for_delivery', 'delivered'].includes(this.status);

});



orderSchema.virtual('deliveryStatus').get(function() {

  if (this.status === 'delivered') return 'delivered';

  if (this.status === 'out_for_delivery') return 'out_for_delivery';

  if (this.status === 'dispatched') return 'dispatched';

  if (this.status === 'packed') return 'packed';

  if (this.status === 'picking') return 'picking';

  return 'pending';

});



orderSchema.virtual('paymentStatusDisplay').get(function() {

  if (this.payment.status === 'paid') return 'paid';

  if (this.payment.status === 'partially_refunded') return 'partially_refunded';

  if (this.payment.status === 'refunded') return 'refunded';

  return 'pending';

});



orderSchema.virtual('totalWeight').get(function() {

  return this.items.reduce((acc, item) => acc + (item.weight || 0), 0);

});



orderSchema.virtual('totalTax').get(function() {

  return this.pricing.tax.total;

});



orderSchema.virtual('totalDiscount').get(function() {

  return this.pricing.discount.amount + (this.pricing.coupon.discount || 0);

});



orderSchema.virtual('effectiveTotal').get(function() {

  return this.pricing.grandTotal;

});



orderSchema.virtual('orderAge').get(function() {

  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));

});



// Generate order number before saving

orderSchema.pre('save', async function(next) {

  if (this.isNew && !this.orderNumber) {

    const date = new Date();

    const year = date.getFullYear().toString().slice(-2);

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    const random = Math.random().toString(36).substr(2, 6).toUpperCase();

    this.orderNumber = `ORD${year}${month}${day}${random}`;

  }

  

  // Add initial status to history if new

  if (this.isNew) {

    this.statusHistory.push({

      status: this.status,

      note: 'Order created',

      timestamp: new Date()

    });

  }

  

  next();

});



// Method to update status with history

orderSchema.methods.updateStatus = function(newStatus, note, userId) {

  const previousStatus = this.status;

  this.status = newStatus;

  this.statusHistory.push({

    status: newStatus,

    previousStatus,

    note: note || `Status changed to ${newStatus}`,

    updatedBy: userId,

    timestamp: new Date()

  });

  

  // Set timestamps for specific statuses

  if (newStatus === ORDER_STATUS.DELIVERED) {

    this.delivery.actualDelivery = new Date();

  } else if (newStatus === ORDER_STATUS.CANCELLED) {

    this.cancellation.initiatedAt = new Date();

    this.cancellation.initiatedBy = userId;

  } else if (newStatus === ORDER_STATUS.RETURN_REQUESTED) {

    // Handle return request

  }

  

  return this.save();

};



// Method to update item fulfillment

orderSchema.methods.updateItemFulfillment = function(itemId, fulfilledQuantity, cancelledQuantity = 0) {

  const item = this.items.id(itemId);

  if (item) {

    item.fulfilledQuantity = fulfilledQuantity;

    item.cancelledQuantity = cancelledQuantity;

    

    // Update fulfillment type

    const totalFulfilled = this.items.reduce((sum, item) => sum + item.fulfilledQuantity, 0);

    const totalCancelled = this.items.reduce((sum, item) => sum + item.cancelledQuantity, 0);

    const totalOrdered = this.items.reduce((sum, item) => sum + item.orderedQuantity, 0);

    

    if (totalFulfilled === totalOrdered) {

      this.fulfillment.type = 'full';

    } else if (totalFulfilled > 0 || totalCancelled > 0) {

      this.fulfillment.type = 'partial';

    }

    

    return this.save();

  }

  throw new Error('Item not found');

};



// Method to add tracking checkpoint

orderSchema.methods.addTrackingCheckpoint = function(location, status, notes) {

  if (!this.delivery.tracking) {

    this.delivery.tracking = { checkpoints: [] };

  }

  

  this.delivery.tracking.checkpoints.push({

    location,

    status,

    notes,

    timestamp: new Date()

  });

  

  return this.save();

};



// Static methods

orderSchema.statics.findByStatus = function(status, options = {}) {

  const query = { status };

  if (options.warehouse) {

    query['fulfillment.warehouse'] = options.warehouse;

  }

  if (options.dateRange) {

    query.createdAt = {

      $gte: options.dateRange.start,

      $lte: options.dateRange.end

    };

  }

  

  return this.find(query)

    .populate('customer', 'name email phone')

    .populate('fulfillment.warehouse', 'name code')

    .sort(options.sort || { createdAt: -1 });

};



orderSchema.statics.findPendingOrders = function() {

  return this.find({

    status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PICKING] }

  }).sort({ createdAt: 1 });

};



orderSchema.statics.findOrdersForDelivery = function(date) {

  const startOfDay = new Date(date);

  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);

  endOfDay.setHours(23, 59, 59, 999);

  

  return this.find({

    'delivery.slot.date': {

      $gte: startOfDay,

      $lte: endOfDay

    },

    status: { $in: [ORDER_STATUS.PACKED, ORDER_STATUS.DISPATCHED] }

  }).populate('delivery.partner', 'name phone');

};



orderSchema.statics.getOrderStats = function(startDate, endDate) {

  return this.aggregate([

    {

      $match: {

        createdAt: {

          $gte: startDate,

          $lte: endDate

        }

      }

    },

    {

      $group: {

        _id: '$status',

        count: { $sum: 1 },

        totalValue: { $sum: '$pricing.grandTotal' }

      }

    }

  ]);

};



// Indexes

orderSchema.index({ customer: 1 });

orderSchema.index({ status: 1 });

orderSchema.index({ 'payment.status': 1 });

orderSchema.index({ createdAt: -1 });

orderSchema.index({ 'shippingAddress.pincode': 1 });

orderSchema.index({ customerPhone: 1 });

orderSchema.index({ source: 1 });

orderSchema.index({ assignedTo: 1 });

orderSchema.index({ 'delivery.slot.date': 1 });

orderSchema.index({ 'fulfillment.warehouse': 1 });

orderSchema.index({ 'items.sku': 1 });

orderSchema.index({ 'items.product': 1 });



const Order = mongoose.model('Order', orderSchema);



export { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS };

export default Order;

