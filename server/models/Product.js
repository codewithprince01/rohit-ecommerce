import mongoose from 'mongoose';

// Variant Schema for product variations (weight, size, pack)
const variantSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "500g", "1kg", "Pack of 6"
  sku: { type: String, required: true },
  barcode: String,
  pricing: {
    mrp: { type: Number, required: true, min: 0 }, // Maximum Retail Price
    sellingPrice: { type: Number, required: true, min: 0 }, // Current selling price
    costPrice: { type: Number, min: 0, default: null },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    bulkPricing: [{
      minQuantity: { type: Number, required: true },
      price: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 }
    }]
  },
  inventory: {
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 }, // Reserved for orders
    available: { type: Number, default: 0 }, // Virtual: stock - reserved
    lowStockThreshold: { type: Number, default: 10 }
  },
  physical: {
    weight: { type: Number, default: 0 }, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    volume: Number // in ml/L for liquids
  },
  batch: {
    batchNumber: String,
    manufactureDate: Date,
    expiryDate: Date,
    shelfLife: String, // e.g., "6 months", "1 year"
    storageCondition: String // e.g., "Refrigerate", "Cool dry place"
  },
  supplier: {
    name: String,
    code: String, // Supplier product code
    costPrice: Number,
    leadTime: Number // Days to procure
  },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const productSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Pricing (Enhanced for grocery)
  pricing: {
    mrp: { type: Number, required: true, min: 0 }, // Maximum Retail Price
    sellingPrice: { type: Number, required: true, min: 0 }, // Current selling price
    costPrice: { type: Number, min: 0, default: null },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    margin: { type: Number, default: 0 }, // Auto-calculated
    taxRate: { type: Number, min: 0, max: 100, default: 0 }, // GST percentage
    taxInclusive: { type: Boolean, default: true }, // Price includes tax
    bulkPricing: [{
      minQuantity: { type: Number, required: true },
      maxQuantity: Number,
      price: { type: Number, required: true },
      discountPercent: { type: Number, default: 0 }
    }],
    dynamicPricing: {
      enabled: { type: Boolean, default: false },
      rules: [{
        condition: String, // e.g., "stock < 10", "expiry < 7 days"
        action: String, // "increase_price", "apply_discount"
        value: Number
      }]
    }
  },
  
  // Identifiers
  sku: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  hsn: { // HSN code for GST
    type: String,
    trim: true
  },
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    default: null
  },
  subSubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubSubCategory',
    default: null
  },
  brand: {
    type: String,
    trim: true
  },
  
  // Inventory
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    default: 10
  },
  trackInventory: {
    type: Boolean,
    default: true
  },
  allowBackorder: {
    type: Boolean,
    default: false
  },
  
  // Grocery Specific
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    default: 'piece' // kg, g, L, ml, pack, piece, dozen
  },
  weightValue: {
    type: Number,
    default: null // Numeric weight
  },
  weightUnit: {
    type: String,
    enum: ['g', 'kg', 'ml', 'L', 'piece', 'pack', 'dozen'],
    default: 'piece'
  },
  expiryDate: {
    type: Date,
    default: null
  },
  manufacturingDate: {
    type: Date,
    default: null
  },
  batchNumber: {
    type: String,
    trim: true
  },
  shelfLife: {
    type: String, // e.g., "6 months", "1 year"
    trim: true
  },
  storageInstructions: {
    type: String,
    trim: true
  },
  
  // Variants
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: [variantSchema],
  
  // Media
  images: [{
    url: { type: String, required: true },
    alt: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false }
  }],
  thumbnail: {
    type: String,
    default: null
  },
  
  // Attributes (flexible key-value pairs)
  attributes: [{
    name: { type: String, required: true },
    value: { type: String, required: true }
  }],
  
  // SEO
  metaTitle: {
    type: String,
    maxlength: 70
  },
  metaDescription: {
    type: String,
    maxlength: 160
  },
  metaKeywords: [String],
  
  // Flags
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  isVegetarian: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Tags & Sorting
  tags: [{
    type: String,
    trim: true
  }],
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Statistics (denormalized for performance)
  totalSold: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Supplier & Procurement (Enhanced)
  suppliers: [{
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    supplierCode: String, // Supplier's product code
    costPrice: Number,
    leadTime: Number, // Days to procure
    minOrderQuantity: Number,
    packaging: String, // e.g., "Box of 12", "Carton of 24"
    qualityRating: { type: Number, min: 1, max: 5, default: 3 },
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Combo & Bundle Products
  combo: {
    isCombo: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['combo', 'bundle', 'kit'], // combo = fixed price, bundle = discounted, kit = assembled
      default: 'combo'
    },
    items: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      variant: String, // Variant SKU if applicable
      quantity: { type: Number, required: true, min: 1 },
      isOptional: { type: Boolean, default: false }
    }],
    savings: { type: Number, default: 0 }, // Total savings percentage
    customisable: { type: Boolean, default: false }
  },
  
  // Substitute Products
  substitutes: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    reason: String, // e.g., "Out of stock", "Better price", "Premium quality"
    priority: { type: Number, default: 1 } // 1 = highest priority
  }],
  
  // Related Products
  related: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    type: {
      type: String,
      enum: ['similar', 'complementary', 'accessory'],
      default: 'similar'
    }
  }],
  
  // Admin tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function() {
  if (this.pricing && this.pricing.mrp && this.pricing.mrp > this.pricing.sellingPrice) {
    return Math.round(((this.pricing.mrp - this.pricing.sellingPrice) / this.pricing.mrp) * 100);
  }
  return 0;
});

// Virtual for margin percentage
productSchema.virtual('marginPercent').get(function() {
  if (this.pricing && this.pricing.sellingPrice && this.pricing.costPrice) {
    return Math.round(((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.sellingPrice) * 100);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (!this.trackInventory) return 'available';
  if (this.hasVariants) {
    // Check if any variant has stock
    const hasStock = this.variants.some(v => v.inventory.stock > v.inventory.reserved);
    return hasStock ? 'in_stock' : 'out_of_stock';
  }
  if (this.stock <= this.lowStockThreshold) return 'low_stock';
  return this.stock > 0 ? 'in_stock' : 'out_of_stock';
});

// Virtual for total stock (sum of all variants)
productSchema.virtual('totalStock').get(function() {
  if (this.hasVariants) {
    return this.variants.reduce((total, variant) => total + variant.inventory.stock, 0);
  }
  return this.stock || 0;
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary);
  return primary ? primary.url : (this.images[0]?.url || this.thumbnail);
});

// Virtual for cheapest variant
productSchema.virtual('cheapestVariant').get(function() {
  if (!this.hasVariants || !this.variants.length) return null;
  return this.variants.reduce((cheapest, variant) => 
    variant.pricing.sellingPrice < cheapest.pricing.sellingPrice ? variant : cheapest
  );
});

// Virtual for most expensive variant
productSchema.virtual('mostExpensiveVariant').get(function() {
  if (!this.hasVariants || !this.variants.length) return null;
  return this.variants.reduce((expensive, variant) => 
    variant.pricing.sellingPrice > expensive.pricing.sellingPrice ? variant : expensive
  );
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  
  // Auto-generate SKU if not provided
  if (!this.sku && this.isNew) {
    this.sku = 'SKU-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  
  // Calculate margin if pricing data is available
  if (this.pricing && this.pricing.sellingPrice && this.pricing.costPrice) {
    this.pricing.margin = Math.round(((this.pricing.sellingPrice - this.pricing.costPrice) / this.pricing.sellingPrice) * 100);
  }
  
  // Update inStock based on stock quantity
  if (this.trackInventory) {
    if (this.hasVariants) {
      // Check if any variant has stock
      this.inStock = this.variants.some(v => v.inventory.stock > v.inventory.reserved);
    } else {
      this.inStock = this.stock > 0 || this.allowBackorder;
    }
  }
  
  // Update variant available stock
  if (this.hasVariants) {
    this.variants.forEach(variant => {
      variant.inventory.available = variant.inventory.stock - variant.inventory.reserved;
    });
  }
  
  // Apply dynamic pricing rules if enabled
  if (this.pricing && this.pricing.dynamicPricing && this.pricing.dynamicPricing.enabled) {
    this.pricing.dynamicPricing.rules.forEach(rule => {
      // Simple rule evaluation (can be enhanced with a rule engine)
      if (rule.condition.includes('stock <') && this.stock <= parseInt(rule.condition.split('<')[1])) {
        if (rule.action === 'apply_discount') {
          this.pricing.discountPercent = Math.max(this.pricing.discountPercent, rule.value);
        }
      }
    });
  }
  
  // Set default variant if none exists
  if (this.hasVariants && this.variants.length > 0) {
    const hasDefault = this.variants.some(v => v.isDefault);
    if (!hasDefault) {
      this.variants[0].isDefault = true;
    }
  }
  
  next();
});

// Indexes for performance
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, subcategory: 1, subSubCategory: 1 });
productSchema.index({ featured: 1, isActive: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ 'pricing.sellingPrice': 1 });
productSchema.index({ stock: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ 'variants.pricing.sellingPrice': 1 });
productSchema.index({ 'suppliers.supplier': 1 });
productSchema.index({ 'combo.isCombo': 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ 'variants.batch.expiryDate': 1 });

// Static methods for advanced queries
productSchema.statics.findByCategory = function(categoryId, options = {}) {
  const query = { 
    category: categoryId, 
    isActive: true 
  };
  
  if (options.includeSubcategories) {
    query.$or = [
      { category: categoryId },
      { subcategory: categoryId },
      { subSubCategory: categoryId }
    ];
  }
  
  return this.find(query)
    .populate('category', 'name slug')
    .sort(options.sort || { sortOrder: 1, name: 1 });
};

productSchema.statics.findLowStock = function(threshold = 10) {
  return this.find({
    $or: [
      { stock: { $lte: threshold }, trackInventory: true },
      { 'variants.inventory.stock': { $lte: threshold } }
    ],
    isActive: true
  }).populate('category', 'name slug');
};

productSchema.statics.findExpiringSoon = function(days = 7) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  
  return this.find({
    $or: [
      { expiryDate: { $lte: expiryDate } },
      { 'variants.batch.expiryDate': { $lte: expiryDate } }
    ],
    isActive: true
  }).populate('category', 'name slug');
};

productSchema.statics.findComboProducts = function() {
  return this.find({ 
    'combo.isCombo': true, 
    isActive: true 
  }).populate('combo.items.product', 'name sku primaryImage');
};

productSchema.statics.findSubstitutes = function(productId) {
  return this.findById(productId)
    .populate('substitutes.product', 'name sku pricing.sellingPrice primaryImage');
};

productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  const query = {
    isActive: true,
    $text: { $search: searchTerm }
  };
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.minPrice || filters.maxPrice) {
    query['pricing.sellingPrice'] = {};
    if (filters.minPrice) query['pricing.sellingPrice'].$gte = filters.minPrice;
    if (filters.maxPrice) query['pricing.sellingPrice'].$lte = filters.maxPrice;
  }
  
  if (filters.inStock) {
    query.inStock = true;
  }
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .populate('category', 'name slug');
};

// Instance methods
productSchema.methods.getAvailableVariants = function() {
  if (!this.hasVariants) return [];
  return this.variants.filter(v => v.isActive && v.inventory.stock > v.inventory.reserved);
};

productSchema.methods.getLowestPrice = function() {
  if (!this.hasVariants) return this.pricing.sellingPrice;
  const prices = this.variants.map(v => v.pricing.sellingPrice);
  return Math.min(...prices);
};

productSchema.methods.getHighestPrice = function() {
  if (!this.hasVariants) return this.pricing.sellingPrice;
  const prices = this.variants.map(v => v.pricing.sellingPrice);
  return Math.max(...prices);
};

productSchema.methods.reserveStock = function(variantSku, quantity) {
  if (!this.hasVariants) {
    if (this.stock >= quantity) {
      this.stock -= quantity;
      return true;
    }
    return false;
  }
  
  const variant = this.variants.find(v => v.sku === variantSku);
  if (variant && variant.inventory.stock >= quantity) {
    variant.inventory.stock -= quantity;
    variant.inventory.reserved += quantity;
    return true;
  }
  return false;
};

productSchema.methods.releaseReservedStock = function(variantSku, quantity) {
  if (!this.hasVariants) {
    this.stock += quantity;
    return true;
  }
  
  const variant = this.variants.find(v => v.sku === variantSku);
  if (variant && variant.inventory.reserved >= quantity) {
    variant.inventory.reserved -= quantity;
    return true;
  }
  return false;
};

const Product = mongoose.model('Product', productSchema);

export default Product;
