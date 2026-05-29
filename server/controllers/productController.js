import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import SubSubCategory from '../models/SubSubCategory.js';
import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

// Helper to delete image
const removeImage = (imagePath) => {
    if (!imagePath) return;
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const { category, subCategory, subSubCategory, search, sort, page = 1, limit = 10, isActive, all } = req.query;
        
        let query = {};
        
        // Handle Active/Inactive filter
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        } else if (all !== 'true') {
            query.isActive = true; // Storefront default
        }

        if (category) query.category = category;
        if (subCategory) query.subCategory = subCategory;
        if (subSubCategory) query.subSubCategory = subSubCategory;

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        let sortQuery = '-createdAt';
        if (sort === 'price-low') sortQuery = 'price';
        if (sort === 'price-high') sortQuery = '-price';

        const skip = (page - 1) * limit;
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .populate('subCategory', 'name slug')
            .populate('subSubCategory', 'name slug')
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit),
                total
            },
            data: products
        });
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
            .populate('subCategory', 'name slug')
            .populate('subSubCategory', 'name slug');

        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get featured products
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .limit(8)
            .populate('category', 'name');
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin: Create product
export const createProduct = async (req, res) => {
    try {
        const { name, price, comparePrice, description, category, subCategory, subSubCategory, stock, unit, sku, lowStockThreshold, isActive } = req.body;
        
        let productImages = [];
        if (req.files && req.files.length > 0) {
            productImages = req.files.map(file => file.path.replace(/\\/g, '/'));
        } else if (req.file) {
            productImages = [req.file.path.replace(/\\/g, '/')];
        }

        const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();

        const product = await Product.create({
            name,
            slug,
            sku,
            price,
            comparePrice,
            description,
            unit,
            category,
            subCategory,
            subSubCategory,
            images: productImages,
            stock: stock || 0,
            lowStockThreshold: lowStockThreshold || 10,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        if (req.files && req.files.length > 0) req.files.forEach(f => removeImage(f.path));
        else if (req.file) removeImage(req.file.path);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Admin: Update product
export const updateProduct = async (req, res) => {
    try {
        let product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const { name, price, comparePrice, description, category, subCategory, subSubCategory, stock, unit, sku, lowStockThreshold, isActive } = req.body;

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path.replace(/\\/g, '/'));
            product.images = [...(product.images || []), ...newImages];
        } else if (req.file) {
            const newImage = req.file.path.replace(/\\/g, '/');
            product.images = [...(product.images || []), newImage];
        }

        if (name && name !== product.name) {
            product.name = name;
            product.slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
        }

        product.price = price !== undefined ? price : product.price;
        product.comparePrice = comparePrice !== undefined ? comparePrice : product.comparePrice;
        product.description = description !== undefined ? description : product.description;
        product.unit = unit !== undefined ? unit : product.unit;
        product.sku = sku !== undefined ? sku : product.sku;
        product.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : product.lowStockThreshold;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.subSubCategory = subSubCategory || product.subSubCategory;
        product.stock = stock !== undefined ? stock : product.stock;
        product.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : product.isActive;

        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Admin: Delete product
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => removeImage(img));
        }
        
        await product.deleteOne();
        res.json({ success: true, message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('subSubCategory', 'name');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRelatedProducts = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const related = await Product.find({ 
            category: product.category, 
            _id: { $ne: product._id },
            isActive: true
        }).limit(4);
        res.json({ success: true, data: related });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProductStats = async (req, res) => {
    try {
        const total = await Product.countDocuments();
        const active = await Product.countDocuments({ isActive: true });
        const outOfStock = await Product.countDocuments({ stock: { $lte: 0 } });
        res.json({ success: true, total, active, outOfStock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleProductStatus = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        product.isActive = !product.isActive;
        await product.save();
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProductImage = async (req, res) => {
    try {
        const { imagePath } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        
        // Remove image from array
        product.images = (product.images || []).filter(img => img !== imagePath);
        await product.save();
        
        removeImage(imagePath);
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
