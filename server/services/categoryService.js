import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import SubSubCategory from '../models/SubSubCategory.js';
import Product from '../models/Product.js';
import imageService from './imageService.js';

class CategoryService {
  /**
   * Get all main categories
   */
  async getAllCategories(includeInactive = false) {
    const query = includeInactive ? {} : { isActive: true };
    return await Category.find(query).sort({ order: 1, name: 1 }).lean();
  }

  /**
   * Get category by slug with subcategories
   */
  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug, isActive: true }).lean();
    if (!category) {
      throw new Error('Category not found');
    }

    // Get subcategories
    const subcategories = await Subcategory.find({ 
      category: category._id, 
      isActive: true 
    }).lean();

    return { ...category, subcategories };
  }

  /**
   * Create category
   */
  async createCategory(categoryData, file) {
    let imagePath = null;
    if (file) {
      imagePath = await imageService.saveFile(file, 'categories', categoryData.name);
    }

    const category = await Category.create({
      ...categoryData,
      image: imagePath
    });

    return category;
  }

  /**
   * Update category
   */
  async updateCategory(id, categoryData, file) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Handle image update
    if (file) {
      if (category.image) {
        await imageService.deleteFile(category.image);
      }
      categoryData.image = await imageService.saveFile(file, 'categories', categoryData.name || category.name);
    }

    Object.assign(category, categoryData);
    await category.save();

    return category;
  }

  /**
   * Delete category
   */
  async deleteCategory(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      throw new Error(`Cannot delete category. It has ${productCount} products.`);
    }

    // Delete subcategories
    const subcategories = await Subcategory.find({ category: id });
    for (const sub of subcategories) {
      await this.deleteSubcategory(sub._id);
    }

    // Delete image
    if (category.image) {
      await imageService.deleteFile(category.image);
    }

    await category.deleteOne();
    return { message: 'Category deleted successfully' };
  }

  // ========== SUBCATEGORY METHODS ==========

  /**
   * Get subcategories by category
   */
  async getSubcategoriesByCategory(categoryId) {
    return await Subcategory.find({ category: categoryId, isActive: true })
      .populate('category', 'name slug')
      .lean();
  }

  /**
   * Get subcategory by slug
   */
  async getSubcategoryBySlug(slug) {
    const subcategory = await Subcategory.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .lean();

    if (!subcategory) {
      throw new Error('Subcategory not found');
    }

    // Get sub-subcategories
    const subSubCategories = await SubSubCategory.find({ 
      subcategory: subcategory._id, 
      isActive: true 
    }).lean();

    return { ...subcategory, subSubCategories };
  }

  /**
   * Create subcategory
   */
  async createSubcategory(subcategoryData, file) {
    let imagePath = null;
    if (file) {
      imagePath = await imageService.saveFile(file, 'subcategories', subcategoryData.name);
    }

    const subcategory = await Subcategory.create({
      ...subcategoryData,
      image: imagePath
    });

    return await subcategory.populate('category', 'name slug');
  }

  /**
   * Update subcategory
   */
  async updateSubcategory(id, subcategoryData, file) {
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      throw new Error('Subcategory not found');
    }

    if (file) {
      if (subcategory.image) {
        await imageService.deleteFile(subcategory.image);
      }
      subcategoryData.image = await imageService.saveFile(file, 'subcategories', subcategoryData.name || subcategory.name);
    }

    Object.assign(subcategory, subcategoryData);
    await subcategory.save();

    return await subcategory.populate('category', 'name slug');
  }

  /**
   * Delete subcategory
   */
  async deleteSubcategory(id) {
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      throw new Error('Subcategory not found');
    }

    // Check if has products
    const productCount = await Product.countDocuments({ subcategory: id });
    if (productCount > 0) {
      throw new Error(`Cannot delete subcategory. It has ${productCount} products.`);
    }

    // Delete sub-subcategories
    const subSubCategories = await SubSubCategory.find({ subcategory: id });
    for (const subSub of subSubCategories) {
      await this.deleteSubSubCategory(subSub._id);
    }

    if (subcategory.image) {
      await imageService.deleteFile(subcategory.image);
    }

    await subcategory.deleteOne();
    return { message: 'Subcategory deleted successfully' };
  }

  // ========== SUB-SUBCATEGORY METHODS ==========

  /**
   * Get sub-subcategories by subcategory
   */
  async getSubSubCategoriesBySubcategory(subcategoryId) {
    return await SubSubCategory.find({ subcategory: subcategoryId, isActive: true })
      .populate('subcategory', 'name slug')
      .lean();
  }

  /**
   * Get sub-subcategory by slug
   */
  async getSubSubCategoryBySlug(slug) {
    const subSubCategory = await SubSubCategory.findOne({ slug, isActive: true })
      .populate({
        path: 'subcategory',
        select: 'name slug category',
        populate: { path: 'category', select: 'name slug' }
      })
      .lean();

    if (!subSubCategory) {
      throw new Error('Sub-subcategory not found');
    }

    return subSubCategory;
  }

  /**
   * Create sub-subcategory
   */
  async createSubSubCategory(subSubCategoryData, file) {
    let imagePath = null;
    if (file) {
      imagePath = await imageService.saveFile(file, 'subsubcategories', subSubCategoryData.name);
    }

    const subSubCategory = await SubSubCategory.create({
      ...subSubCategoryData,
      image: imagePath
    });

    return await subSubCategory.populate('subcategory', 'name slug');
  }

  /**
   * Update sub-subcategory
   */
  async updateSubSubCategory(id, subSubCategoryData, file) {
    const subSubCategory = await SubSubCategory.findById(id);
    if (!subSubCategory) {
      throw new Error('Sub-subcategory not found');
    }

    if (file) {
      if (subSubCategory.image) {
        await imageService.deleteFile(subSubCategory.image);
      }
      subSubCategoryData.image = await imageService.saveFile(file, 'subsubcategories', subSubCategoryData.name || subSubCategory.name);
    }

    Object.assign(subSubCategory, subSubCategoryData);
    await subSubCategory.save();

    return await subSubCategory.populate('subcategory', 'name slug');
  }

  /**
   * Delete sub-subcategory
   */
  async deleteSubSubCategory(id) {
    const subSubCategory = await SubSubCategory.findById(id);
    if (!subSubCategory) {
      throw new Error('Sub-subcategory not found');
    }

    // Check if has products
    const productCount = await Product.countDocuments({ subSubCategory: id });
    if (productCount > 0) {
      throw new Error(`Cannot delete sub-subcategory. It has ${productCount} products.`);
    }

    if (subSubCategory.image) {
      await imageService.deleteFile(subSubCategory.image);
    }

    await subSubCategory.deleteOne();
    return { message: 'Sub-subcategory deleted successfully' };
  }

  /**
   * Get category hierarchy
   */
  async getCategoryHierarchy() {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    
    const hierarchy = await Promise.all(categories.map(async (category) => {
      const subcategories = await Subcategory.find({ category: category._id, isActive: true }).lean();
      
      const subcategoriesWithChildren = await Promise.all(subcategories.map(async (subcategory) => {
        const subSubCategories = await SubSubCategory.find({ subcategory: subcategory._id, isActive: true }).lean();
        return { ...subcategory, subSubCategories };
      }));
      
      return { ...category, subcategories: subcategoriesWithChildren };
    }));

    return hierarchy;
  }
}

export default new CategoryService();
