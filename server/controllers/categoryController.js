import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import SubSubCategory from '../models/SubSubCategory.js';
import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';

// Helper to delete image
const removeImage = (imagePath) => {
    if (!imagePath) return;
    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        let query = {};
        if (req.query.includeInactive === 'false') {
            query.isActive = true;
        }
        const categories = await Category.find(query).sort('name');
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get full hierarchy (Category -> Subcategory -> SubSubCategory)
// @route   GET /api/categories/hierarchy
// @access  Public
export const getHierarchy = async (req, res) => {
    try {
        // Fetch all categories and populate subcategories
        const categories = await Category.find({ isActive: true }).lean();
        
        const hierarchy = await Promise.all(categories.map(async (cat) => {
            const subcategories = await Subcategory.find({ category: cat._id, isActive: true }).lean();
            
            const nestedSubcategories = await Promise.all(subcategories.map(async (sub) => {
                const subSubCategories = await SubSubCategory.find({ subcategory: sub._id, isActive: true }).lean();
                
                const nestedSubSubCategories = await Promise.all(subSubCategories.map(async (ssub) => {
                    const products = await Product.find({ subSubCategory: ssub._id, isActive: true }).limit(10).lean();
                    return { ...ssub, products };
                }));

                return { ...sub, subSubCategories: nestedSubSubCategories };
            }));

            return { ...cat, subcategories: nestedSubSubCategories };
        }));

        res.json({ success: true, data: hierarchy });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single category by Slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get subcategories of a category
// @route   GET /api/categories/:id/subcategories
// @access  Public
export const getSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find({ category: req.params.id }).sort('name');
        res.json({ success: true, count: subcategories.length, data: subcategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin: Create a category
export const createCategory = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const image = req.file ? req.file.path.replace(/\\/g, '/') : null;
        const category = await Category.create({ name, image, isActive: isActive !== undefined ? isActive : true });
        res.status(201).json({ success: true, data: category });
    } catch (error) {
        if (req.file) removeImage(req.file.path);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Admin: Update category
export const updateCategory = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        const { name, isActive } = req.body;
        if (req.file) {
            removeImage(category.image);
            category.image = req.file.path.replace(/\\/g, '/');
        }
        category.name = name || category.name;
        if (isActive !== undefined) category.isActive = isActive;
        await category.save();
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Admin: Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        removeImage(category.image);
        await category.deleteOne();
        res.json({ success: true, message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
