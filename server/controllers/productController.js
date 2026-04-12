import Product from '../models/Product.js';
import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';
import { productSchema } from '../validators/productValidator.js';

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
        // perform Joi validation to catch missing/invalid fields early
        const payload = {
            ...req.body,
            price: req.body.price !== undefined && req.body.price !== '' ? Number(req.body.price) : undefined,
            comparePrice: req.body.comparePrice !== undefined && req.body.comparePrice !== '' ? Number(req.body.comparePrice) : undefined
        };
        const { error, value } = productSchema.validate(payload, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(d => {
                const key = Array.isArray(d.path) ? d.path.join('.') : d.path;
                errors[key] = d.message;
            });
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        const {
            name,
            description,
            price,
            comparePrice,
            unit,
            category,
            stock,
            active
        } = value;

        // Build pricing object expected by schema
        const pricing = {
            sellingPrice: price !== undefined ? Number(price) : undefined,
            mrp: comparePrice !== undefined ? Number(comparePrice) : undefined
        };
        // default mrp to sellingPrice if not provided
        if (pricing.mrp == null && pricing.sellingPrice != null) {
            pricing.mrp = pricing.sellingPrice;
        }

        // Convert uploaded files into image objects
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => ({ url: file.path.replace(/\\/g, '/') }));
        }
        // also accept image URLs passed in body (strings)
        if (req.body.images && Array.isArray(req.body.images)) {
            const bodyImgs = req.body.images.map(img => {
                if (typeof img === 'string') return { url: img };
                return img;
            });
            images = [...images, ...bodyImgs];
        }

        // Generate slug from name in case pre-save doesn't run or for updates later
        let slug;
        if (name) {
            slug = name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        }
        // fallback slug if generation results empty
        if (!slug) {
            slug = `prod-${Date.now().toString(36)}`;
        }

        const product = await Product.create({
            name,
            slug,
            description,
            pricing,
            unit,
            category,
            stock: stock || 0,
            images,
            isActive: active === 'true' || active === true
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        // Cleanup images if failure
        if (req.files) {
            req.files.forEach(file => removeImage(file.path));
        }
        // Format mongoose validation errors for client
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.values(error.errors).forEach(err => {
                // err.path may be like 'pricing.sellingPrice' or 'images'
                errors[err.path] = err.message;
            });
            return res.status(400).json({ success: false, message: error.message, errors });
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

        // Handle Recursive Category Search
        if (req.query.category) {
            const categoryId = req.query.category;
            const category = await Category.findById(categoryId);
            if (category) {
                const descendants = await category.getDescendants();
                const categoryIds = [categoryId, ...descendants.map(d => d._id)];
                parsedQuery.category = { $in: categoryIds };
            }
        }

        query = Product.find(parsedQuery).populate('category', 'name slug path');

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
            .populate('category', 'name slug path');
        
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
            .populate('category', 'name slug path');

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

        // Validate provided fields
        const payload = {
            ...req.body,
            price: req.body.price !== undefined && req.body.price !== '' ? Number(req.body.price) : undefined,
            comparePrice: req.body.comparePrice !== undefined && req.body.comparePrice !== '' ? Number(req.body.comparePrice) : undefined
        };

        const { error, value } = productSchema.validate(payload, { abortEarly: false });
        if (error) {
            const errors = {};
            error.details.forEach(d => {
                const key = Array.isArray(d.path) ? d.path.join('.') : d.path;
                errors[key] = d.message;
            });
            return res.status(400).json({ success: false, message: 'Validation failed', errors });
        }

        // apply validated payload fields
        const fieldsToUpdate = { ...value };
        
        // Handle active status mapping
        if (req.body.active !== undefined) {
            fieldsToUpdate.isActive = req.body.active === 'true' || req.body.active === true;
            delete fieldsToUpdate.active;
        }

        // If pricing fields are provided at root, move them inside pricing
        if (fieldsToUpdate.price !== undefined || fieldsToUpdate.comparePrice !== undefined) {
            fieldsToUpdate.pricing = fieldsToUpdate.pricing || {};
            if (fieldsToUpdate.price !== undefined) fieldsToUpdate.pricing.sellingPrice = Number(fieldsToUpdate.price);
            if (fieldsToUpdate.comparePrice !== undefined) fieldsToUpdate.pricing.mrp = Number(fieldsToUpdate.comparePrice);
            delete fieldsToUpdate.price;
            delete fieldsToUpdate.comparePrice;
        }
        // default mrp to sellingPrice when updating if missing
        if (fieldsToUpdate.pricing) {
            if (fieldsToUpdate.pricing.mrp == null && fieldsToUpdate.pricing.sellingPrice != null) {
                fieldsToUpdate.pricing.mrp = fieldsToUpdate.pricing.sellingPrice;
            }
        }

        // Handle slug regeneration when name changes
        if (fieldsToUpdate.name) {
            let generated = fieldsToUpdate.name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            if (!generated) {
                generated = `prod-${Date.now().toString(36)}`;
            }
            fieldsToUpdate.slug = generated;
        }
        // if document somehow lacked slug, ensure one exists
        if (!fieldsToUpdate.slug && !product.slug && product.name) {
            let generated = product.name.toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
            if (!generated) {
                generated = `prod-${Date.now().toString(36)}`;
            }
            fieldsToUpdate.slug = generated;
        }
        
        // Normalize any string images passed in body
        if (fieldsToUpdate.images && Array.isArray(fieldsToUpdate.images)) {
            fieldsToUpdate.images = fieldsToUpdate.images.map(img => (typeof img === 'string' ? { url: img } : img));
        }

        // Handle Images from file uploads
        if (req.files && req.files.length > 0) {
             const newImages = req.files.map(file => ({ url: file.path.replace(/\\/g, '/') }));
             const currentImages = fieldsToUpdate.images || (product.images ? product.images.map(img => (img.toObject ? img.toObject() : img)) : []);
             fieldsToUpdate.images = [...currentImages, ...newImages];
        }

        product = await Product.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, data: product });
    } catch (error) {
        console.error('Update Product Error:', error);
        if (req.files) {
            req.files.forEach(file => removeImage(file.path));
        }
        if (error.name === 'ValidationError') {
            const errors = {};
            Object.values(error.errors).forEach(err => {
                errors[err.path] = err.message;
            });
            return res.status(400).json({ success: false, message: error.message, errors });
        }
        res.status(500).json({ success: false, message: error.message || 'Internal server error' });
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
            product.images.forEach(imgObj => removeImage(imgObj.url || imgObj));
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

        // find index by url property
        const idx = product.images.findIndex(img => img.url === imagePath || img === imagePath);
        if (idx !== -1) {
            // Remove from array
            product.images.splice(idx, 1);
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
