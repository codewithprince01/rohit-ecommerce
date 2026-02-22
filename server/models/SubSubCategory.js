import mongoose from 'mongoose';

const subSubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sub-subcategory name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Parent category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
    required: [true, 'Parent subcategory is required']
  },
  image: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from name before saving
subSubCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  }
  next();
});

// Compound index for unique sub-subcategory per subcategory
subSubCategorySchema.index({ name: 1, subcategory: 1 }, { unique: true });
subSubCategorySchema.index({ name: 'text', description: 'text' });

const SubSubCategory = mongoose.model('SubSubCategory', subSubCategorySchema);

export default SubSubCategory;
