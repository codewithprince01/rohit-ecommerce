import Category from '../models/Category.js';
import Subcategory from '../models/Subcategory.js';
import SubSubCategory from '../models/SubSubCategory.js';
import fs from 'fs';
import path from 'path';

// Helper to delete image
const removeImage = (imagePath) => {
    if(!imagePath) return;
    const fullPath = path.join(process.cwd(), imagePath);
    if(fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

// @desc    Create a category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const image = req.file ? req.file.path.replace(/\\/g, '/') : null;

        const category = await Category.create({
            name,
            description,
            image
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
         if (req.file) removeImage(req.file.path);
         res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all categories (Main level)
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort('order name');
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: category });
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

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
    try {
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        const { name, description, isActive } = req.body;
        let image = category.image;

        if (req.file) {
            removeImage(category.image);
            image = req.file.path.replace(/\\/g, '/');
        }

        category.name = name || category.name;
        category.description = description || category.description;
        category.image = image;
        if(isActive !== undefined) category.isActive = isActive;

        await category.save();

        res.json({ success: true, data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        removeImage(category.image);
        await category.deleteOne();

        res.json({ success: true, message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get subcategories of a category
// @route   GET /api/categories/:id/subcategories
// @access  Public
export const getSubcategories = async (req, res) => {
    try {
        // This assumes we want Level 2 categories for a Level 1 parent
        const subcategories = await Subcategory.find({ category: req.params.id }).sort('name');
        res.json({ success: true, count: subcategories.length, data: subcategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get full hierarchy (Demo purpose)
// @route   GET /api/categories/hierarchy
// @access  Public
export const getHierarchy = async (req, res) => {
    try {
        // Fetch specific fields to be lightweight? For now full fetch.
        const categories = await Category.find({ isActive: true }).lean();
        const subcategories = await Subcategory.find({ isActive: true }).lean();
        const subSubcategories = await SubSubCategory.find({ isActive: true }).lean();

        // Build Tree
        const tree = categories.map(cat => {
            const subs = subcategories.filter(sub => String(sub.category) === String(cat._id)).map(sub => {
                const subSubs = subSubcategories.filter(ss => String(ss.subcategory) === String(sub._id));
                return { ...sub, subSubCategories: subSubs };
            });
            return { ...cat, subCategories: subs };
        });

        res.json({ success: true, data: tree });
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
};
