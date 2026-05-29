import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0 // 0 = root, 1 = main, 2 = sub, 3 = sub-sub, etc.
  },
  path: {
    type: String,
    default: '' // Full path: "Groceries > Vegetables > Leafy Greens"
  },
  
  // Display & Ordering
  image: {
    type: String,
    default: null
  },
  icon: {
    type: String,
    default: null // Icon name or URL
  },
  banner: {
    type: String,
    default: null // Banner image for category page
  },
  color: {
    type: String,
    default: '#3b82f6' // Theme color for category
  },
  priority: {
    type: Number,
    default: 0 // Higher number = higher priority in display
  },
  sortOrder: {
    type: Number,
    default: 0 // Manual sorting order
  },
  
  // Business Logic
  commission: {
    type: Number,
    default: 0, // Commission percentage for sellers
    min: 0,
    max: 100
  },
  margin: {
    type: Number,
    default: 0, // Default margin percentage for products
    min: 0,
    max: 100
  },
  taxRate: {
    type: Number,
    default: 0, // Default tax rate for products in this category
    min: 0,
    max: 100
  },
  
  // Grocery Specific
  isPerishable: {
    type: Boolean,
    default: false // Products in this category are perishable
  },
  requiresTemperatureControl: {
    type: Boolean,
    default: false // Needs refrigeration
  },
  storageInstructions: {
    type: String,
    trim: true
  },
  shelfLife: {
    type: String, // e.g., "3-5 days", "2-3 weeks"
    trim: true
  },
  
  // SEO
  seo: {
    title: {
      type: String,
      maxlength: 70
    },
    description: {
      type: String,
      maxlength: 160
    },
    keywords: [String],
    canonical: String
  },
  
  // Settings
  isActive: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true // Visible in frontend
  },
  allowProducts: {
    type: Boolean,
    default: true // Can add products directly to this category
  },
  
  // Attributes (for product filtering)
  attributes: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'boolean', 'select', 'multiselect', 'range'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    },
    options: [String], // For select/multiselect types
    validation: {
      min: Number,
      max: Number,
      pattern: String
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  }],
  
  // Statistics
  productCount: {
    type: Number,
    default: 0 // Denormalized count of active products
  },
  totalSales: {
    type: Number,
    default: 0 // Total sales value
  },
  
  // Admin
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

// Virtuals
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

categorySchema.virtual('fullPath').get(function() {
  return this.path || this.name;
});

categorySchema.virtual('depth').get(function() {
  return this.level;
});

categorySchema.virtual('hasChildren').get(function() {
  return this.level < 3; // Maximum 3 levels deep
});

// Pre-save middleware
categorySchema.pre('save', async function(next) {
  // Generate slug
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  
  // Calculate level and path
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    if (parent) {
      this.level = parent.level + 1;
      this.path = parent.path ? `${parent.path} > ${this.name}` : this.name;
    }
  } else {
    this.level = 0;
    this.path = this.name;
  }
  
  next();
});

// Pre-remove middleware
categorySchema.pre('remove', async function(next) {
  // Move subcategories to parent or root
  await this.constructor.updateMany(
    { parent: this._id },
    { parent: this.parent || null }
  );
  
  // Update products to remove category reference
  await mongoose.model('Product').updateMany(
    { category: this._id },
    { $unset: { category: 1 } }
  );
  
  next();
});

// Static methods
categorySchema.statics.getTree = async function() {
  const categories = await this.find({ isActive: true })
    .sort({ priority: -1, sortOrder: 1, name: 1 })
    .populate('parent', 'name slug');
  
  const buildTree = (parentId = null, level = 0) => {
    return categories
      .filter(cat => {
        const catParentId = cat.parent?._id?.toString() || cat.parent?.toString();
        return catParentId === parentId?.toString();
      })
      .map(cat => ({
        ...cat.toObject(),
        level,
        children: buildTree(cat._id, level + 1)
      }));
  };
  
  return buildTree();
};

categorySchema.statics.getBreadcrumbs = async function(categoryId) {
  const breadcrumbs = [];
  let current = await this.findById(categoryId);
  
  while (current) {
    breadcrumbs.unshift({
      _id: current._id,
      name: current.name,
      slug: current.slug,
      level: current.level
    });
    
    if (current.parent) {
      current = await this.findById(current.parent);
    } else {
      break;
    }
  }
  
  return breadcrumbs;
};

categorySchema.statics.getCategoryPath = async function(categoryId) {
  const category = await this.findById(categoryId);
  if (!category) return [];
  
  const path = [];
  let current = category;
  
  while (current) {
    path.unshift({
      _id: current._id,
      name: current.name,
      slug: current.slug,
      level: current.level
    });
    
    if (current.parent) {
      current = await this.findById(current.parent);
    } else {
      break;
    }
  }
  
  return path;
};

categorySchema.statics.updateProductCount = async function(categoryId) {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: categoryId, 
    isActive: true 
  });
  
  await this.findByIdAndUpdate(categoryId, { productCount: count });
  
  // Update parent counts recursively
  const category = await this.findById(categoryId);
  if (category && category.parent) {
    await this.updateProductCount(category.parent);
  }
};

// Instance methods
categorySchema.methods.getAncestors = async function() {
  const ancestors = [];
  let current = this;
  
  while (current.parent) {
    const parent = await this.constructor.findById(current.parent);
    if (parent) {
      ancestors.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  
  return ancestors;
};

categorySchema.methods.getDescendants = async function(maxLevel = 3) {
  const descendants = [];
  
  const collectDescendants = async (parentId, currentLevel = 1) => {
    if (currentLevel > maxLevel) return;
    
    const children = await this.constructor.find({ 
      parent: parentId, 
      isActive: true 
    });
    
    for (const child of children) {
      descendants.push(child);
      await collectDescendants(child._id, currentLevel + 1);
    }
  };
  
  await collectDescendants(this._id);
  return descendants;
};

// Indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ priority: -1, sortOrder: 1 });
categorySchema.index({ isActive: 1, isVisible: 1 });
categorySchema.index({ name: 'text', description: 'text' });
categorySchema.index({ productCount: -1 });
categorySchema.index({ totalSales: -1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;
