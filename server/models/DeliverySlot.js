import mongoose from 'mongoose';

const deliverySlotSchema = new mongoose.Schema({
  // Basic Information
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true,
    enum: [
      '6:00 AM - 8:00 AM',
      '8:00 AM - 10:00 AM',
      '10:00 AM - 12:00 PM',
      '12:00 PM - 2:00 PM',
      '2:00 PM - 4:00 PM',
      '4:00 PM - 6:00 PM',
      '6:00 PM - 8:00 PM',
      '8:00 PM - 10:00 PM'
    ]
  },
  type: {
    type: String,
    enum: ['standard', 'express', 'scheduled', 'pickup'],
    default: 'standard'
  },
  
  // Capacity Management
  capacity: {
    maxOrders: {
      type: Number,
      required: true,
      min: 1
    },
    currentOrders: {
      type: Number,
      default: 0,
      min: 0
    },
    availableOrders: {
      type: Number,
      get: function() {
        return Math.max(0, this.capacity.maxOrders - this.capacity.currentOrders);
      }
    },
    utilizationRate: {
      type: Number,
      get: function() {
        return this.capacity.maxOrders > 0 ? (this.capacity.currentOrders / this.capacity.maxOrders) * 100 : 0;
      }
    }
  },
  
  // Pricing
  pricing: {
    baseFee: {
      type: Number,
      default: 0,
      min: 0
    },
    distanceFee: {
      type: Number,
      default: 0,
      min: 0
    },
    weightFee: {
      type: Number,
      default: 0,
      min: 0
    },
    expressFee: {
      type: Number,
      default: 0,
      min: 0
    },
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    freeShippingAbove: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Geographic Coverage
  coverage: {
    areas: [{
      pincode: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      serviceable: {
        type: Boolean,
        default: true
      },
      estimatedTime: {
        min: Number, // in minutes
        max: Number // in minutes
      },
      additionalFee: {
        type: Number,
        default: 0,
        min: 0
      }
    }],
    excludedAreas: [{
      pincode: String,
      reason: String
    }]
  },
  
  // Delivery Partner
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner',
    required: true
  },
  
  // Status & Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isHoliday: {
    type: Boolean,
    default: false
  },
  specialInstructions: String,
  
  // Time-based Settings
  cutoffTime: {
    type: String,
    default: '23:59' // HH:MM format
  },
  preparationTime: {
    type: Number,
    default: 30 // in minutes
  },
  
  // Restrictions
  restrictions: {
    maxOrderValue: {
      type: Number,
      min: 0
    },
    maxWeight: {
      type: Number,
      min: 0
    },
    maxItems: {
      type: Number,
      min: 0
    },
    restrictedCategories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    restrictedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }]
  },
  
  // Performance Tracking
  performance: {
    totalOrders: {
      type: Number,
      default: 0
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    averageDeliveryTime: {
      type: Number,
      default: 0 // in minutes
    },
    customerSatisfaction: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
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
deliverySlotSchema.virtual('isFullyBooked').get(function() {
  return this.capacity.currentOrders >= this.capacity.maxOrders;
});

deliverySlotSchema.virtual('isAlmostFull').get(function() {
  return this.capacity.currentOrders >= (this.capacity.maxOrders * 0.9);
});

deliverySlotSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  if (!this.isAvailable) return 'unavailable';
  if (this.isHoliday) return 'holiday';
  if (this.isFullyBooked) return 'fully_booked';
  if (this.isAlmostFull) return 'almost_full';
  return 'available';
});

deliverySlotSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

deliverySlotSchema.virtual('timeRange').get(function() {
  const [startTime, endTime] = this.timeSlot.split(' - ');
  return { startTime, endTime };
});

// Pre-save middleware
deliverySlotSchema.pre('save', function(next) {
  // Ensure currentOrders doesn't exceed maxOrders
  if (this.capacity.currentOrders > this.capacity.maxOrders) {
    this.capacity.currentOrders = this.capacity.maxOrders;
  }
  
  // Update performance metrics
  this.performance.lastUpdated = new Date();
  
  next();
});

// Static methods
deliverySlotSchema.statics.findAvailableSlots = function(date, pincode = null) {
  const query = {
    date: {
      $gte: new Date(date).setHours(0, 0, 0, 0),
      $lt: new Date(date).setHours(23, 59, 59, 999)
    },
    isActive: true,
    isAvailable: true,
    isHoliday: false
  };
  
  if (pincode) {
    query['coverage.areas.pincode'] = pincode;
    query['coverage.areas.serviceable'] = true;
  }
  
  return this.find(query)
    .populate('partner', 'name phone')
    .sort({ timeSlot: 1 });
};

deliverySlotSchema.statics.findSlotsByPartner = function(partnerId, date = null) {
  const query = { partner: partnerId };
  
  if (date) {
    query.date = {
      $gte: new Date(date).setHours(0, 0, 0, 0),
      $lt: new Date(date).setHours(23, 59, 59, 999)
    };
  }
  
  return this.find(query)
    .sort({ date: 1, timeSlot: 1 });
};

deliverySlotSchema.statics.getSlotUtilization = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          timeSlot: '$timeSlot'
        },
        maxOrders: { $first: '$capacity.maxOrders' },
        currentOrders: { $first: '$capacity.currentOrders' },
        utilizationRate: {
          $avg: {
            $multiply: [
              { $divide: ['$capacity.currentOrders', '$capacity.maxOrders'] },
              100
            ]
          }
        }
      }
    },
    {
      $sort: { '_id.date': 1, '_id.timeSlot': 1 }
    }
  ]);
};

deliverySlotSchema.statics.getPerformanceStats = function(partnerId = null) {
  const matchStage = {};
  if (partnerId) {
    matchStage.partner = partnerId;
  }
  
  return this.aggregate([
    {
      $match: matchStage
    },
    {
      $group: {
        _id: null,
        totalSlots: { $sum: 1 },
        totalOrders: { $sum: '$performance.totalOrders' },
        averageUtilization: { $avg: '$capacity.utilizationRate' },
        averageOnTimeRate: { $avg: '$performance.onTimeDeliveryRate' },
        averageDeliveryTime: { $avg: '$performance.averageDeliveryTime' },
        averageSatisfaction: { $avg: '$performance.customerSatisfaction' }
      }
    }
  ]);
};

// Instance methods
deliverySlotSchema.methods.canAcceptOrder = function(orderValue = 0, orderWeight = 0, itemCount = 0) {
  // Check capacity
  if (this.isFullyBooked) {
    return { canAccept: false, reason: 'Slot is fully booked' };
  }
  
  // Check order value restriction
  if (this.restrictions.maxOrderValue && orderValue > this.restrictions.maxOrderValue) {
    return { canAccept: false, reason: `Order value exceeds maximum limit of ${this.restrictions.maxOrderValue}` };
  }
  
  // Check weight restriction
  if (this.restrictions.maxWeight && orderWeight > this.restrictions.maxWeight) {
    return { canAccept: false, reason: `Order weight exceeds maximum limit of ${this.restrictions.maxWeight}g` };
  }
  
  // Check items restriction
  if (this.restrictions.maxItems && itemCount > this.restrictions.maxItems) {
    return { canAccept: false, reason: `Order items exceed maximum limit of ${this.restrictions.maxItems}` };
  }
  
  // Check minimum order amount
  if (orderValue < this.pricing.minimumOrderAmount) {
    return { canAccept: false, reason: `Minimum order amount of ${this.pricing.minimumOrderAmount} required` };
  }
  
  return { canAccept: true };
};

deliverySlotSchema.methods.calculateDeliveryFee = function(orderValue = 0, distance = 0, weight = 0, pincode = null) {
  let totalFee = this.pricing.baseFee;
  
  // Add distance fee
  if (distance > 0) {
    totalFee += this.pricing.distanceFee * distance;
  }
  
  // Add weight fee
  if (weight > 0) {
    totalFee += this.pricing.weightFee * (weight / 1000); // per kg
  }
  
  // Add express fee for express slots
  if (this.type === 'express') {
    totalFee += this.pricing.expressFee;
  }
  
  // Check for area-specific additional fee
  if (pincode) {
    const area = this.coverage.areas.find(area => area.pincode === pincode);
    if (area && area.additionalFee > 0) {
      totalFee += area.additionalFee;
    }
  }
  
  // Check for free shipping
  if (this.pricing.freeShippingAbove > 0 && orderValue >= this.pricing.freeShippingAbove) {
    totalFee = 0;
  }
  
  return Math.max(0, totalFee);
};

deliverySlotSchema.methods.bookSlot = function(orderId) {
  this.capacity.currentOrders += 1;
  this.performance.totalOrders += 1;
  
  return this.save();
};

deliverySlotSchema.methods.releaseSlot = function() {
  this.capacity.currentOrders = Math.max(0, this.capacity.currentOrders - 1);
  
  return this.save();
};

deliverySlotSchema.methods.updatePerformanceMetrics = function(metrics) {
  Object.keys(metrics).forEach(key => {
    if (this.performance[key] !== undefined) {
      this.performance[key] = metrics[key];
    }
  });
  
  return this.save();
};

deliverySlotSchema.methods.isServiceableForPincode = function(pincode) {
  const area = this.coverage.areas.find(area => area.pincode === pincode);
  return area ? area.serviceable : false;
};

deliverySlotSchema.methods.getEstimatedDeliveryTime = function(pincode = null) {
  if (pincode) {
    const area = this.coverage.areas.find(area => area.pincode === pincode);
    if (area && area.estimatedTime) {
      return area.estimatedTime;
    }
  }
  
  // Return default preparation time
  return {
    min: this.preparationTime,
    max: this.preparationTime + 30
  };
};

// Indexes
deliverySlotSchema.index({ date: 1, timeSlot: 1 });
deliverySlotSchema.index({ partner: 1 });
deliverySlotSchema.index({ isActive: 1 });
deliverySlotSchema.index({ isAvailable: 1 });
deliverySlotSchema.index({ 'coverage.areas.pincode': 1 });
deliverySlotSchema.index({ 'coverage.areas.city': 1 });
deliverySlotSchema.index({ 'coverage.areas.state': 1 });
deliverySlotSchema.index({ 'capacity.currentOrders': 1 });
deliverySlotSchema.index({ 'performance.totalOrders': -1 });

const DeliverySlot = mongoose.model('DeliverySlot', deliverySlotSchema);

export default DeliverySlot;
