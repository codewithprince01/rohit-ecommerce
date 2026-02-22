import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  // Basic Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  customerCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Profile Information
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    fullName: {
      type: String,
      get: function() {
        return `${this.firstName} ${this.lastName}`;
      }
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    avatar: String,
    language: {
      type: String,
      enum: ['english', 'hindi', 'gujarati', 'marathi', 'tamil', 'telugu'],
      default: 'english'
    }
  },
  
  // Addresses
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      required: true
    },
    phone: String,
    addressLine1: {
      type: String,
      required: true
    },
    addressLine2: String,
    landmark: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    deliveryInstructions: String
  }],
  
  // Preferences
  preferences: {
    communication: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      whatsapp: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    delivery: {
      preferredTimeSlot: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
      },
      preferredPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner'
      },
      instructions: String
    },
    notifications: {
      orderUpdates: {
        type: Boolean,
        default: true
      },
      promotions: {
        type: Boolean,
        default: true
      },
      recommendations: {
        type: Boolean,
        default: true
      },
      priceDrops: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Loyalty & Rewards
  loyalty: {
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    points: {
      type: Number,
      default: 0
    },
    pointsEarned: {
      type: Number,
      default: 0
    },
    pointsRedeemed: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    orderCount: {
      type: Number,
      default: 0
    },
    membershipDate: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  
  // Wallet
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit', 'refund', 'cashback'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: String,
      reference: String, // Order ID, etc.
      balance: {
        type: Number,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Shopping Behavior
  behavior: {
    categories: [{
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      },
      frequency: Number,
      lastPurchased: Date,
      totalSpent: Number
    }],
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      purchaseCount: Number,
      lastPurchased: Date,
      averageRating: Number
    }],
    averageOrderValue: {
      type: Number,
      default: 0
    },
    preferredPaymentMethod: {
      type: String,
      enum: ['cod', 'upi', 'card', 'net_banking', 'wallet']
    },
    shoppingFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'occasional']
    }
  },
  
  // Subscriptions
  subscriptions: [{
    type: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      required: true
    },
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      variant: String,
      quantity: Number
    }],
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      required: true
    },
    nextDeliveryDate: Date,
    pausedUntil: Date,
    cancelledAt: Date,
    deliveryAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer.addresses'
    }
  }],
  
  // Marketing & Segmentation
  segmentation: {
    segment: {
      type: String,
      enum: ['new', 'active', 'at_risk', 'churned', 'vip'],
      default: 'new'
    },
    source: {
      type: String,
      enum: ['website', 'mobile_app', 'whatsapp', 'referral', 'social_media', 'offline']
    },
    acquisitionCost: Number,
    lifetimeValue: {
      type: Number,
      default: 0
    },
    churnScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Status & Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlacklisted: {
    type: Boolean,
    default: false
  },
  blacklistReason: String,
  
  // Notes & Tags
  notes: String,
  tags: [String],
  
  // Admin tracking
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
customerSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName} ${this.profile.lastName}`;
});

customerSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault);
});

customerSchema.virtual('totalAddresses').get(function() {
  return this.addresses.length;
});

customerSchema.virtual('activeSubscriptions').get(function() {
  return this.subscriptions.filter(sub => sub.status === 'active');
});

customerSchema.virtual('loyaltyProgress').get(function() {
  const tierThresholds = {
    bronze: { min: 0, max: 999 },
    silver: { min: 1000, max: 4999 },
    gold: { min: 5000, max: 9999 },
    platinum: { min: 10000, max: Infinity }
  };
  
  const currentTier = tierThresholds[this.loyalty.tier];
  const nextTier = Object.keys(tierThresholds).find(tier => 
    tierThresholds[tier].min > currentTier.min
  );
  
  return {
    current: this.loyalty.tier,
    points: this.loyalty.points,
    currentMin: currentTier.min,
    currentMax: currentTier.max,
    nextTier: nextTier,
    nextMin: nextTier ? tierThresholds[nextTier].min : null,
    progress: currentTier.max > 0 ? (this.loyalty.points - currentTier.min) / (currentTier.max - currentTier.min) * 100 : 0
  };
});

// Pre-save middleware
customerSchema.pre('save', function(next) {
  // Generate customer code if not provided
  if (this.isNew && !this.customerCode) {
    this.customerCode = 'CUST' + Date.now().toString(36).toUpperCase();
  }
  
  // Ensure only one default address
  const defaultAddresses = this.addresses.filter(addr => addr.isDefault);
  if (defaultAddresses.length > 1) {
    // Keep the first one as default
    this.addresses.forEach((addr, index) => {
      if (index > 0 && addr.isDefault) {
        addr.isDefault = false;
      }
    });
  }
  
  // Update loyalty tier based on points
  if (this.loyalty.points >= 10000) {
    this.loyalty.tier = 'platinum';
  } else if (this.loyalty.points >= 5000) {
    this.loyalty.tier = 'gold';
  } else if (this.loyalty.points >= 1000) {
    this.loyalty.tier = 'silver';
  } else {
    this.loyalty.tier = 'bronze';
  }
  
  next();
});

// Static methods
customerSchema.statics.findByEmail = function(email) {
  return this.findOne({ 'profile.email': email.toLowerCase() });
};

customerSchema.statics.findByPhone = function(phone) {
  return this.findOne({ 'profile.phone': phone });
};

customerSchema.statics.findByLoyaltyTier = function(tier) {
  return this.find({ 'loyalty.tier': tier, isActive: true });
};

customerSchema.statics.getVipCustomers = function() {
  return this.find({
    'loyalty.tier': { $in: ['gold', 'platinum'] },
    isActive: true
  }).sort({ 'loyalty.totalSpent': -1 });
};

customerSchema.statics.getAtRiskCustomers = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({
    'loyalty.lastActivity': { $lt: thirtyDaysAgo },
    isActive: true,
    'loyalty.orderCount': { $gt: 0 }
  });
};

// Instance methods
customerSchema.methods.addAddress = function(addressData) {
  // If this is the default address, remove default from others
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }
  
  this.addresses.push(addressData);
  return this.save();
};

customerSchema.methods.updateAddress = function(addressId, updateData) {
  const address = this.addresses.id(addressId);
  if (address) {
    // If updating to default, remove default from others
    if (updateData.isDefault) {
      this.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }
    
    Object.assign(address, updateData);
    return this.save();
  }
  throw new Error('Address not found');
};

customerSchema.methods.removeAddress = function(addressId) {
  this.addresses = this.addresses.filter(addr => !addr._id.equals(addressId));
  return this.save();
};

customerSchema.methods.addLoyaltyPoints = function(points, reason, reference) {
  this.loyalty.points += points;
  this.loyalty.pointsEarned += points;
  this.loyalty.lastActivity = new Date();
  
  return this.save();
};

customerSchema.methods.redeemLoyaltyPoints = function(points, reason, reference) {
  if (this.loyalty.points < points) {
    throw new Error('Insufficient loyalty points');
  }
  
  this.loyalty.points -= points;
  this.loyalty.pointsRedeemed += points;
  this.loyalty.lastActivity = new Date();
  
  return this.save();
};

customerSchema.methods.addToWallet = function(amount, description, reference) {
  this.wallet.balance += amount;
  this.wallet.transactions.push({
    type: 'credit',
    amount,
    description,
    reference,
    balance: this.wallet.balance
  });
  
  return this.save();
};

customerSchema.methods.deductFromWallet = function(amount, description, reference) {
  if (this.wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }
  
  this.wallet.balance -= amount;
  this.wallet.transactions.push({
    type: 'debit',
    amount,
    description,
    reference,
    balance: this.wallet.balance
  });
  
  return this.save();
};

customerSchema.methods.updateShoppingBehavior = function(order) {
  // Update total spent and order count
  this.loyalty.totalSpent += order.pricing.grandTotal;
  this.loyalty.orderCount += 1;
  this.loyalty.lastActivity = new Date();
  
  // Update average order value
  this.behavior.averageOrderValue = this.loyalty.totalSpent / this.loyalty.orderCount;
  
  // Update categories
  order.items.forEach(item => {
    const categoryIndex = this.behavior.categories.findIndex(
      cat => cat.category.toString() === item.product.category.toString()
    );
    
    if (categoryIndex !== -1) {
      this.behavior.categories[categoryIndex].frequency++;
      this.behavior.categories[categoryIndex].totalSpent += item.subtotal;
      this.behavior.categories[categoryIndex].lastPurchased = new Date();
    } else {
      this.behavior.categories.push({
        category: item.product.category,
        frequency: 1,
        lastPurchased: new Date(),
        totalSpent: item.subtotal
      });
    }
  });
  
  // Update preferred payment method
  this.behavior.preferredPaymentMethod = order.payment.method;
  
  return this.save();
};

// Indexes
customerSchema.index({ user: 1 });
customerSchema.index({ customerCode: 1 });
customerSchema.index({ 'profile.email': 1 });
customerSchema.index({ 'profile.phone': 1 });
customerSchema.index({ 'loyalty.tier': 1 });
customerSchema.index({ 'loyalty.points': -1 });
customerSchema.index({ isActive: 1 });
customerSchema.index({ isBlacklisted: 1 });
customerSchema.index({ 'loyalty.lastActivity': -1 });
customerSchema.index({ 'behavior.averageOrderValue': -1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
