import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import SubSubCategory from '../models/SubSubCategory.js';
import imageService from './imageService.js';

class ProductService {
  /**
   * Get all products with advanced filtering, sorting, and pagination
   */
  async getAllProducts(queryParams) {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      search,
      category,
      subcategory,
      subSubCategory,
      minPrice,
      maxPrice,
      inStock,
      featured,
      isActive = true
    } = queryParams;

    // Build query
    const query = { isActive };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filters
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (subSubCategory) query.subSubCategory = subSubCategory;

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    // Featured filter
    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('subSubCategory', 'name slug')
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count
    const total = await Product.countDocuments(query);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Get product by ID or slug
   */
  async getProductBySlug(slug) {
    const product = await Product.findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('subSubCategory', 'name slug')
      .lean();

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  /**
   * Get related products based on category
   */
  async getRelatedProducts(productId, categoryId, limit = 6) {
    const products = await Product.find({
      _id: { $ne: productId },
      category: categoryId,
      isActive: true,
      inStock: true
    })
      .limit(limit)
      .select('name slug price unit images')
      .lean();

    return products;
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit = 8) {
    const products = await Product.find({
      featured: true,
      isActive: true,
      inStock: true
    })
      .limit(limit)
      .populate('category', 'name slug')
      .select('name slug price comparePrice unit images')
      .lean();

    return products;
  }

  /**
   * Create new product
   */
  async createProduct(productData, files) {
    // Upload images if provided
    let imagePaths = [];
    if (files && files.length > 0) {
      imagePaths = await imageService.saveMultipleFiles(
        files,
        'products',
        productData.name
      );
    }

    const product = await Product.create({
      ...productData,
      images: imagePaths
    });

    return await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'subcategory', select: 'name slug' },
      { path: 'subSubCategory', select: 'name slug' }
    ]);
  }

  /**
   * Update product
   */
  async updateProduct(id, productData, files) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Handle new image uploads
    if (files && files.length > 0) {
      const newImagePaths = await imageService.saveMultipleFiles(
        files,
        'products',
        productData.name || product.name
      );
      
      // Add new images to existing ones
      productData.images = [...(product.images || []), ...newImagePaths];
    }

    // Update product
    Object.assign(product, productData);
    await product.save();

    return await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'subcategory', select: 'name slug' },
      { path: 'subSubCategory', select: 'name slug' }
    ]);
  }

  /**
   * Delete product image
   */
  async deleteProductImage(productId, imagePath) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Remove image from product
    product.images = product.images.filter(img => img !== imagePath);
    await product.save();

    // Delete physical file
    await imageService.deleteFile(imagePath);

    return product;
  }

  /**
   * Delete product
   */
  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    // Delete all product images
    if (product.images && product.images.length > 0) {
      await imageService.deleteFiles(product.images);
    }

    await product.deleteOne();
    return { message: 'Product deleted successfully' };
  }

  /**
   * Toggle product active status
   */
  async toggleProductStatus(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    product.isActive = !product.isActive;
    await product.save();

    return product;
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    const stats = await Product.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { isActive: true } }, { $count: 'count' }],
          inStock: [{ $match: { inStock: true } }, { $count: 'count' }],
          featured: [{ $match: { featured: true } }, { $count: 'count' }],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $project: { name: '$category.name', count: 1 } }
          ]
        }
      }
    ]);

    return {
      total: stats[0].total[0]?.count || 0,
      active: stats[0].active[0]?.count || 0,
      inStock: stats[0].inStock[0]?.count || 0,
      featured: stats[0].featured[0]?.count || 0,
      byCategory: stats[0].byCategory
    };
  }
}

export default new ProductService();
