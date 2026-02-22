import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Warehouse name is required'],
    trim: true,
    maxlength: [100, 'Warehouse name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Warehouse code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Warehouse code cannot exceed 20 characters']
  },
  type: {
    type: String,
    enum: ['main', 'branch', 'fulfillment', 'cold_storage', 'dry_storage', 'return_center'],
    default: 'main'
  },
  
  // Location
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact
  contact: {
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true
    },
    manager: {
      name: String,
      phone: String,
      email: String
    }
  },
  
  // Capacity & Dimensions
  dimensions: {
    totalArea: {
      type: Number, // in square feet
      required: [true, 'Total area is required']
    },
    storageArea: Number,
    officeArea: Number,
    loadingArea: Number,
    height: Number, // in feet
    zones: [{
      name: String,
      area: Number,
      type: {
        type: String,
        enum: ['general', 'cold', 'frozen', 'hazardous', 'high_value'],
        default: 'general'
      },
      temperature: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius'
        }
      },
      humidity: {
        min: Number,
        max: Number
      }
    }]
  },
  
  // Capabilities
  capabilities: {
    storageTypes: [{
      type: String,
      enum: ['dry', 'refrigerated', 'frozen', 'climate_controlled', 'hazardous']
    }],
    handlingEquipment: [{
      type: String,
      enum: ['forklift', 'pallet_jack', 'conveyor', 'crane', 'refrigerated_truck']
    }],
    certifications: [String], // ISO, FSSAI, etc.
    specialFeatures: [String] // 24/7 access, security systems, etc.
  },
  
  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'closed', 'under_construction'],
    default: 'active'
  },
  
  // Settings
  settings: {
    autoReorder: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 20 }
    },
    qualityCheck: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      }
    },
    temperatureMonitoring: {
      enabled: { type: Boolean, default: false },
      alertThreshold: {
        min: Number,
        max: Number
      }
    }
  },
  
  // Statistics
  stats: {
    totalProducts: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    totalOrdersProcessed: { type: Number, default: 0 },
    averageProcessingTime: { type: Number, default: 0 }, // in hours
    lastInventoryCheck: Date
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
warehouseSchema.virtual('isOperational').get(function() {
  return this.isActive && this.status === 'active';
});

warehouseSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.postalCode}, ${this.address.country}`;
});

warehouseSchema.virtual('storageUtilization').get(function() {
  if (!this.dimensions.storageArea || !this.dimensions.totalArea) return 0;
  return (this.dimensions.storageArea / this.dimensions.totalArea) * 100;
});

// Static methods
warehouseSchema.statics.findActive = function() {
  return this.find({ isActive: true, status: 'active' });
};

warehouseSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

warehouseSchema.statics.findWithCapacity = function(minArea) {
  return this.find({
    isActive: true,
    'dimensions.storageArea': { $gte: minArea }
  });
};

// Instance methods
warehouseSchema.methods.hasStorageType = function(storageType) {
  return this.capabilities.storageTypes.includes(storageType);
};

warehouseSchema.methods.hasEquipment = function(equipment) {
  return this.capabilities.handlingEquipment.includes(equipment);
};

warehouseSchema.methods.isWithinOperatingHours = function(date = new Date()) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];
  const dayHours = this.operatingHours[dayName];
  
  if (!dayHours || dayHours.closed) return false;
  
  const currentTime = date.getHours() * 60 + date.getMinutes();
  const openTime = parseInt(dayHours.open.split(':')[0]) * 60 + parseInt(dayHours.open.split(':')[1]);
  const closeTime = parseInt(dayHours.close.split(':')[0]) * 60 + parseInt(dayHours.close.split(':')[1]);
  
  return currentTime >= openTime && currentTime <= closeTime;
};

warehouseSchema.methods.getAvailableZones = function(storageType = null) {
  let zones = this.dimensions.zones;
  
  if (storageType) {
    zones = zones.filter(zone => zone.type === storageType);
  }
  
  return zones.filter(zone => zone.area > 0);
};

// Pre-save middleware
warehouseSchema.pre('save', function(next) {
  // Ensure only one primary warehouse
  if (this.isPrimary) {
    this.constructor.updateMany(
      { _id: { $ne: this._id }, isPrimary: true },
      { isPrimary: false }
    ).catch(err => console.error('Error updating primary warehouse:', err));
  }
  
  next();
});

// Indexes
warehouseSchema.index({ code: 1 });
warehouseSchema.index({ name: 'text' });
warehouseSchema.index({ type: 1 });
warehouseSchema.index({ isActive: 1, status: 1 });
warehouseSchema.index({ 'address.city': 1, 'address.state': 1 });
warehouseSchema.index({ 'address.coordinates': '2dsphere' });
warehouseSchema.index({ isPrimary: 1 });

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;
