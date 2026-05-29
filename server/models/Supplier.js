import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true,
    maxlength: [100, 'Supplier name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Supplier code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Supplier code cannot exceed 20 characters']
  },
  type: {
    type: String,
    enum: ['manufacturer', 'distributor', 'wholesaler', 'farmer', 'producer', 'importer'],
    default: 'distributor'
  },
  
  // Contact Information
  contact: {
    primary: {
      name: {
        type: String,
        required: [true, 'Primary contact name is required']
      },
      phone: {
        type: String,
        required: [true, 'Primary contact phone is required']
      },
      email: {
        type: String,
        required: [true, 'Primary contact email is required'],
        lowercase: true
      },
      designation: String
    },
    secondary: {
      name: String,
      phone: String,
      email: String,
      designation: String
    },
    billing: {
      name: String,
      phone: String,
      email: String,
      address: String
    }
  },
  
  // Address
  address: {
    billing: {
      street: {
        type: String,
        required: [true, 'Billing street is required']
      },
      city: {
        type: String,
        required: [true, 'Billing city is required']
      },
      state: {
        type: String,
        required: [true, 'Billing state is required']
      },
      postalCode: {
        type: String,
        required: [true, 'Billing postal code is required']
      },
      country: {
        type: String,
        default: 'India'
      }
    },
    shipping: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: {
        type: String,
        default: 'India'
      },
      isSameAsBilling: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Business Details
  business: {
    registrationNumber: String,
    gstNumber: String,
    panNumber: String,
    licenseNumber: String,
    fssaiLicense: String,
    isoCertifications: [String],
    establishedYear: Number,
    annualRevenue: Number,
    employeeCount: Number
  },
  
  // Banking Information
  banking: {
    bankName: String,
    accountNumber: String,
    accountType: {
      type: String,
      enum: ['savings', 'current', 'overdraft'],
      default: 'current'
    },
    ifscCode: String,
    branchName: String,
    micrCode: String
  },
  
  // Supply Chain
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    supplierCode: String,
    unitPrice: Number,
    minOrderQuantity: Number,
    leadTime: Number, // in days
    packaging: String,
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    reliabilityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  }],
  
  // Performance Metrics
  performance: {
    onTimeDeliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    qualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    priceCompetitiveness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    orderAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    responseTime: {
      type: Number,
      default: 0 // in hours
    }
  },
  
  // Terms & Conditions
  terms: {
    paymentTerms: {
      type: String,
      enum: ['cod', 'net_15', 'net_30', 'net_45', 'net_60'],
      default: 'net_30'
    },
    creditLimit: {
      type: Number,
      default: 0
    },
    creditPeriod: {
      type: Number,
      default: 30 // in days
    },
    deliveryTerms: String,
    returnPolicy: String,
    warrantyPolicy: String
  },
  
  // Status & Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isPreferred: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'blacklisted'],
    default: 'active'
  },
  priority: {
    type: Number,
    default: 0 // Higher number = higher priority
  },
  
  // Notes & Documents
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  documents: [{
    type: {
      type: String,
      enum: ['pan', 'gst', 'fssai', 'license', 'agreement', 'other'],
      required: true
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiryDate: Date
  }],
  
  // Communication Preferences
  communication: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    preferredLanguage: {
      type: String,
      enum: ['english', 'hindi', 'gujarati', 'marathi', 'tamil', 'telugu'],
      default: 'english'
    }
  },
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastOrderDate: Date,
  totalOrders: {
    type: Number,
    default: 0
  },
  totalValue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
supplierSchema.virtual('fullAddress').get(function() {
  const billing = this.address.billing;
  return `${billing.street}, ${billing.city}, ${billing.state} ${billing.postalCode}, ${billing.country}`;
});

supplierSchema.virtual('primaryContact').get(function() {
  return this.contact.primary;
});

supplierSchema.virtual('overallRating').get(function() {
  const weights = {
    onTimeDeliveryRate: 0.3,
    qualityScore: 0.3,
    priceCompetitiveness: 0.2,
    orderAccuracy: 0.2
  };
  
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.keys(weights).forEach(key => {
    if (this.performance[key] !== undefined) {
      totalScore += this.performance[key] * weights[key];
      totalWeight += weights[key];
    }
  });
  
  return totalWeight > 0 ? totalScore / totalWeight : 0;
});

supplierSchema.virtual('isHighPerformer').get(function() {
  return this.overallRating >= 80 && this.performance.onTimeDeliveryRate >= 90;
});

// Static methods
supplierSchema.statics.findActive = function() {
  return this.find({ isActive: true, status: 'active' });
};

supplierSchema.statics.findPreferred = function() {
  return this.find({ isPreferred: true, isActive: true, status: 'active' });
};

supplierSchema.statics.findByCategory = function(categoryId) {
  return this.find({
    categories: categoryId,
    isActive: true,
    status: 'active'
  });
};

supplierSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ isActive: true, status: 'active' })
    .sort({ 'performance.qualityScore': -1, 'performance.onTimeDeliveryRate': -1 })
    .limit(limit);
};

supplierSchema.statics.searchSuppliers = function(searchTerm, filters = {}) {
  const query = {
    isActive: true,
    status: 'active',
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { code: { $regex: searchTerm, $options: 'i' } },
      { 'contact.primary.email': { $regex: searchTerm, $options: 'i' } },
      { 'business.gstNumber': { $regex: searchTerm, $options: 'i' } }
    ]
  };
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.categories && filters.categories.length > 0) {
    query.categories = { $in: filters.categories };
  }
  
  if (filters.minRating) {
    query['performance.qualityScore'] = { $gte: filters.minRating };
  }
  
  return this.find(query)
    .populate('categories', 'name slug')
    .sort({ priority: -1, name: 1 });
};

// Instance methods
supplierSchema.methods.canSupplyCategory = function(categoryId) {
  return this.categories.some(cat => cat.toString() === categoryId.toString());
};

supplierSchema.methods.getProductInfo = function(productId) {
  return this.products.find(prod => 
    prod.product.toString() === productId.toString()
  );
};

supplierSchema.methods.updatePerformanceMetrics = function(metrics) {
  Object.keys(metrics).forEach(key => {
    if (this.performance[key] !== undefined) {
      this.performance[key] = metrics[key];
    }
  });
  return this.save();
};

supplierSchema.methods.addProduct = function(productData) {
  const existingIndex = this.products.findIndex(
    prod => prod.product.toString() === productData.product.toString()
  );
  
  if (existingIndex !== -1) {
    // Update existing product
    Object.assign(this.products[existingIndex], productData);
  } else {
    // Add new product
    this.products.push(productData);
  }
  
  return this.save();
};

supplierSchema.methods.removeProduct = function(productId) {
  this.products = this.products.filter(
    prod => prod.product.toString() !== productId.toString()
  );
  return this.save();
};

// Pre-save middleware
supplierSchema.pre('save', function(next) {
  // Copy shipping address from billing if same
  if (this.address.shipping.isSameAsBilling) {
    this.address.shipping = { ...this.address.billing, isSameAsBilling: true };
  } else {
    this.address.shipping.isSameAsBilling = false;
  }
  
  next();
});

// Indexes
supplierSchema.index({ name: 'text' });
supplierSchema.index({ type: 1 });
supplierSchema.index({ isActive: 1, status: 1 });
supplierSchema.index({ isPreferred: 1 });
supplierSchema.index({ priority: -1 });
supplierSchema.index({ 'contact.primary.email': 1 });
supplierSchema.index({ 'business.gstNumber': 1 });
supplierSchema.index({ categories: 1 });
supplierSchema.index({ 'performance.qualityScore': -1 });
supplierSchema.index({ 'performance.onTimeDeliveryRate': -1 });

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
