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
    lowercase: true,
    trim: true
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
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
subSubCategorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }
  next();
});

// Compound index for unique sub-subcategory per subcategory
subSubCategorySchema.index({ name: 1, subcategory: 1 }, { unique: true });

const SubSubCategory = mongoose.model('SubSubCategory', subSubCategorySchema);

export default SubSubCategory;
