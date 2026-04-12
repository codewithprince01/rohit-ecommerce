import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  // Basic Information
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Type & Discount
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y', 'bundle'],
    required: true
  },
  discount: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      validate: {
        validator: function() {
          return this.type === 'percentage' ? this.percentage > 0 : true;
        },
        message: 'Percentage discount must be greater than 0 for percentage type'
      }
    },
    fixed: {
      type: Number,
      min: 0,
      validate: {
        validator: function() {
          return this.type === 'fixed' ? this.fixed > 0 : true;
        },
        message: 'Fixed discount must be greater than 0 for fixed type'
      }
    },
    maxDiscount: {
      type: Number,
      min: 0,
      default: 0 // Maximum discount amount for percentage coupons
    }
  },
  
  // Applicability
  applicability: {
    minimumAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    maximumDiscount: {
      type: Number,
      min: 0
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    brands: [String],
    excludeCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    excludeProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    firstOrderOnly: {
      type: Boolean,
      default: false
    },
    newCustomersOnly: {
      type: Boolean,
      default: false
    },
    existingCustomersOnly: {
      type: Boolean,
      default: false
    },
    customerSegments: [{
      type: String,
      enum: ['new', 'active', 'at_risk', 'churned', 'vip']
    }],
    customerTiers: [{
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum']
    }]
  },
  
  // Usage Limits
  usage: {
    totalLimit: {
      type: Number,
      min: 0,
      default: null // null = unlimited
    },
    perCustomerLimit: {
      type: Number,
      min: 0,
      default: 1
    },
    dailyLimit: {
      type: Number,
      min: 0,
      default: null
    },
    weeklyLimit: {
      type: Number,
      min: 0,
      default: null
    },
    monthlyLimit: {
      type: Number,
      min: 0,
      default: null
    }
  },
  
  // Usage Tracking
  tracking: {
    totalUsed: {
      type: Number,
      default: 0
    },
    totalSaved: {
      type: Number,
      default: 0
    },
    uniqueCustomers: [{
      customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
      },
      usedAt: Date,
      orderAmount: Number,
      discountAmount: Number
    }],
    dailyUsage: [{
      date: Date,
      count: Number,
      discountAmount: Number
    }],
    weeklyUsage: [{
      week: String, // YYYY-WW format
      count: Number,
      discountAmount: Number
    }],
    monthlyUsage: [{
      month: String, // YYYY-MM format
      count: Number,
      discountAmount: Number
    }]
  },
  
  // Validity Period
  validity: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Special Conditions
  conditions: {
    buyXGetY: {
      buyQuantity: Number,
      getYQuantity: Number,
      buyProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      getYProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
      getYCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }]
    },
    bundle: {
      products: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantity: Number,
        discount: Number
      }],
      fixedPrice: Number
    }
  },
  
  // Display & Marketing
  display: {
    banner: String,
    thumbnail: String,
    color: {
      type: String,
      default: '#3b82f6'
    },
    priority: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    showOnHomepage: {
      type: Boolean,
      default: false
    },
    showOnProductPage: {
      type: Boolean,
      default: true
    },
    showOnCheckout: {
      type: Boolean,
      default: true
    }
  },
  
  // Status & Settings
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'expired', 'disabled'],
    default: 'draft'
  },
  autoApply: {
    type: Boolean,
    default: false
  },
  stackable: {
    type: Boolean,
    default: false
  },
  combinableWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }],
  notCombinableWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }],
  
  // Admin
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

// Virtuals
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.validity.isActive &&
    now >= this.validity.startDate &&
    now <= this.validity.endDate &&
    (this.usage.totalLimit === null || this.tracking.totalUsed < this.usage.totalLimit)
  );
});

couponSchema.virtual('isExpired').get(function() {
  const now = new Date();
  return now > this.validity.endDate;
});

couponSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return now < this.validity.startDate;
});

couponSchema.virtual('usagePercentage').get(function() {
  if (this.usage.totalLimit === null) return 0;
  return Math.round((this.tracking.totalUsed / this.usage.totalLimit) * 100);
});

couponSchema.virtual('uniqueCustomerCount').get(function() {
  return this.tracking.uniqueCustomers.length;
});

couponSchema.virtual('averageDiscountPerUse').get(function() {
  return this.tracking.totalUsed > 0 ? this.tracking.totalSaved / this.tracking.totalUsed : 0;
});

// Pre-save middleware
couponSchema.pre('save', function(next) {
  // Ensure end date is after start date
  if (this.validity.endDate <= this.validity.startDate) {
    next(new Error('End date must be after start date'));
    return;
  }
  
  // Validate discount based on type
  if (this.type === 'percentage' && !this.discount.percentage) {
    next(new Error('Percentage discount is required for percentage type'));
    return;
  }
  
  if (this.type === 'fixed' && !this.discount.fixed) {
    next(new Error('Fixed discount is required for fixed type'));
    return;
  }
  
  // Validate buy X get Y conditions
  if (this.type === 'buy_x_get_y') {
    if (!this.conditions.buyXGetY.buyQuantity || !this.conditions.buyXGetY.getYQuantity) {
      next(new Error('Buy and get quantities are required for buy X get Y type'));
      return;
    }
  }
  
  next();
});

// Static methods
couponSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

couponSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    'validity.isActive': true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now }
  });
};

couponSchema.statics.findFeatured = function() {
  return this.find({
    status: 'active',
    'display.featured': true,
    'validity.isActive': true
  }).sort({ 'display.priority': -1 });
};

couponSchema.statics.getApplicableForCustomer = function(customer, orderAmount = 0) {
  const now = new Date();
  const query = {
    status: 'active',
    'validity.isActive': true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now },
    $or: [
      { 'usage.totalLimit': null },
      { $expr: { $lt: ['$tracking.totalUsed', '$usage.totalLimit'] } }
    ]
  };
  
  // Customer-specific conditions
  if (customer) {
    query.$and = [
      {
        $or: [
          { 'applicability.newCustomersOnly': false },
          { 
            'applicability.newCustomersOnly': true, 
            $expr: { $eq: [customer.loyalty?.orderCount || 0, 0] } 
          }
        ]
      },
      {
        $or: [
          { 'applicability.existingCustomersOnly': false },
          { 
            'applicability.existingCustomersOnly': true, 
            $expr: { $gt: [customer.loyalty?.orderCount || 0, 0] } 
          }
        ]
      }
    ];
    
    // Customer segments
    if (customer.segmentation?.segment) {
      query.$or.push({
        'applicability.customerSegments': customer.segmentation.segment
      });
    }
    
    // Customer tiers
    if (customer.loyalty?.tier) {
      query.$or.push({
        'applicability.customerTiers': customer.loyalty.tier
      });
    }
  }
  
  // Minimum amount
  query.$and = query.$and || [];
  query.$and.push({
    $or: [
      { 'applicability.minimumAmount': { $lte: orderAmount } },
      { 'applicability.minimumAmount': 0 }
    ]
  });
  
  return this.find(query);
};

// Instance methods
couponSchema.methods.canBeUsedByCustomer = function(customer, orderAmount = 0) {
  // Check basic validity
  if (!this.isValid) {
    return { canUse: false, reason: 'Coupon is not valid' };
  }
  
  // Check total usage limit
  if (this.usage.totalLimit && this.tracking.totalUsed >= this.usage.totalLimit) {
    return { canUse: false, reason: 'Coupon usage limit exceeded' };
  }
  
  // Check per customer limit
  if (customer) {
    const customerUsage = this.tracking.uniqueCustomers.filter(
      usage => usage.customer.toString() === customer._id.toString()
    ).length;
    
    if (customerUsage >= this.usage.perCustomerLimit) {
      return { canUse: false, reason: 'Per customer usage limit exceeded' };
    }
    
    // Check customer-specific conditions
    if (this.applicability.newCustomersOnly && customer.loyalty.orderCount > 0) {
      return { canUse: false, reason: 'Coupon is for new customers only' };
    }
    
    if (this.applicability.existingCustomersOnly && customer.loyalty.orderCount === 0) {
      return { canUse: false, reason: 'Coupon is for existing customers only' };
    }
    
    // Check customer segments
    if (this.applicability.customerSegments.length > 0 && 
        !this.applicability.customerSegments.includes(customer.segmentation.segment)) {
      return { canUse: false, reason: 'Customer segment not eligible' };
    }
    
    // Check customer tiers
    if (this.applicability.customerTiers.length > 0 && 
        !this.applicability.customerTiers.includes(customer.loyalty.tier)) {
      return { canUse: false, reason: 'Customer tier not eligible' };
    }
  }
  
  // Check minimum amount
  if (orderAmount < this.applicability.minimumAmount) {
    return { canUse: false, reason: `Minimum order amount of ${this.applicability.minimumAmount} required` };
  }
  
  return { canUse: true };
};

couponSchema.methods.calculateDiscount = function(orderAmount, orderItems = []) {
  let discountAmount = 0;
  
  switch (this.type) {
    case 'percentage':
      discountAmount = (orderAmount * this.discount.percentage) / 100;
      if (this.discount.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, this.discount.maxDiscount);
      }
      break;
      
    case 'fixed':
      discountAmount = this.discount.fixed;
      break;
      
    case 'free_shipping':
      // This would be calculated based on shipping charges
      discountAmount = 0; // Would be calculated in the order
      break;
      
    case 'buy_x_get_y':
      // Complex calculation based on buy X get Y rules
      discountAmount = 0; // Would be calculated based on cart items
      break;
      
    case 'bundle':
      // Complex calculation based on bundle rules
      discountAmount = 0; // Would be calculated based on cart items
      break;
  }
  
  return Math.max(0, discountAmount);
};

couponSchema.methods.useCoupon = function(customer, orderAmount, orderId) {
  // Update tracking
  this.tracking.totalUsed += 1;
  
  // Add to unique customers
  if (customer && !this.tracking.uniqueCustomers.some(c => c.customer.toString() === customer._id.toString())) {
    this.tracking.uniqueCustomers.push({
      customer: customer._id,
      usedAt: new Date(),
      orderAmount,
      discountAmount: this.calculateDiscount(orderAmount)
    });
  }
  
  // Update daily usage
  const today = new Date().toISOString().split('T')[0];
  const dailyIndex = this.tracking.dailyUsage.findIndex(day => day.date.toISOString().split('T')[0] === today);
  
  if (dailyIndex !== -1) {
    this.tracking.dailyUsage[dailyIndex].count++;
    this.tracking.dailyUsage[dailyIndex].discountAmount += this.calculateDiscount(orderAmount);
  } else {
    this.tracking.dailyUsage.push({
      date: new Date(),
      count: 1,
      discountAmount: this.calculateDiscount(orderAmount)
    });
  }
  
  // Update total saved
  this.tracking.totalSaved += this.calculateDiscount(orderAmount);
  
  return this.save();
};

couponSchema.index({ status: 1 });
couponSchema.index({ type: 1 });
couponSchema.index({ 'validity.startDate': 1 });
couponSchema.index({ 'validity.endDate': 1 });
couponSchema.index({ 'display.featured': 1 });
couponSchema.index({ 'display.priority': -1 });
couponSchema.index({ 'tracking.totalUsed': -1 });
couponSchema.index({ 'tracking.totalSaved': -1 });

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
