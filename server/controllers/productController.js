import Product from '../models/Product.js';
import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';

// Helper
const removeImage = (imagePath) => {
    if(!imagePath) return;
    const fullPath = path.join(process.cwd(), imagePath);
    if(fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            price, 
            comparePrice, 
            unit, 
            category, 
            subcategory, 
            subSubCategory, 
            stock, 
            active 
        } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path.replace(/\\/g, '/'));
        }

        const product = await Product.create({
            name,
            description,
            price,
            comparePrice: comparePrice || undefined,
            unit,
            category,
            subcategory: subcategory || undefined,
            subSubCategory: subSubCategory || undefined,
            stock: stock || 0,
            images,
            active: active === 'true' || active === true
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        // Cleanup images if failure
        if (req.files) {
            req.files.forEach(file => removeImage(file.path));
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        let query;

        // Copy req.query
        const reqQuery = { ...req.query };

        // Fields to exclude
        const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
        removeFields.forEach(param => delete reqQuery[param]);

        // Create query string for logical operators ($gt, $gte, etc)
        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        const parsedQuery = JSON.parse(queryStr);

        // Basic Search 
        if (req.query.search) {
             parsedQuery.$text = { $search: req.query.search };
        }

        query = Product.find(parsedQuery).populate('category', 'name slug');

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Product.countDocuments(parsedQuery);

        query = query.skip(startIndex).limit(limit);

        const products = await query;

        // Pagination result
        const pagination = {
            page,
            limit,
            pages: Math.ceil(total / limit),
            total
        };

        if (endIndex < total) {
            pagination.next = { page: page + 1, limit };
        }
        if (startIndex > 0) {
            pagination.prev = { page: page - 1, limit };
        }

        res.json({
            success: true,
            count: products.length,
            pagination,
            data: products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single product by Slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Handle body
        const fieldsToUpdate = { ...req.body };
        
        // Handle Images
        if (req.files && req.files.length > 0) {
             const newImages = req.files.map(file => file.path.replace(/\\/g, '/'));
             // Append or Replace? Usually append or complex logic. 
             // To keep it simple: Append
             fieldsToUpdate.images = [...product.images, ...newImages];
        }

        product = await Product.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: product });
    } catch (error) {
        if (req.files) {
            req.files.forEach(file => removeImage(file.path));
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Delete images
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => removeImage(img));
        }

        await product.deleteOne();

        res.json({ success: true, message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete specific image from product
// @route   DELETE /api/products/:id/images
// @access  Private/Admin
export const deleteProductImage = async (req, res) => {
    try {
        const { imagePath } = req.body; // Expect relative path "uploads/..."
        const product = await Product.findById(req.params.id);
        
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (product.images.includes(imagePath)) {
            // Remove from array
            product.images = product.images.filter(img => img !== imagePath);
            await product.save();

            // Attempt file deletion
            removeImage(imagePath);
            
            res.json({ success: true, data: product });
        } else {
            res.status(404).json({ success: false, message: 'Image not found in product' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
    try {
        // Logic: products with high ratings? or isFeatured flag?
        // Assuming no strict flag, return random or newest 8
        const products = await Product.find({ active: true }).sort('-createdAt').limit(8);
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const related = await Product.find({ 
            category: product.category, 
            _id: { $ne: product._id },
            active: true
        }).limit(4);

        res.json({ success: true, data: related });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Status
// @route   PATCH /api/products/:id/toggle-status
// @access  Private/Admin
export const toggleProductStatus = async (req, res) => {
      try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        product.active = !product.active; // Assuming 'active' field exists or 'inStock'
        // Or if inStock:
        product.inStock = !product.inStock;
        
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// @desc    Get product stats
// @route   GET /api/products/admin/stats
// @access  Private/Admin
export const getProductStats = async (req, res) => {
    try {
        const total = await Product.countDocuments();
        const active = await Product.countDocuments({ active: true });
        const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } });

        res.json({
            success: true,
            total,
            active,
            outOfStock
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
