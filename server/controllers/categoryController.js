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
        const { name, description, parent, priority, isActive } = req.body;
        const image = req.file ? req.file.path.replace(/\\/g, '/') : null;

        const category = await Category.create({
            name,
            description,
            image,
            parent: parent || null,
            priority: priority || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ success: true, data: category });
    } catch (error) {
         if (req.file) removeImage(req.file.path);
         res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all categories (Main level or all depending on query)
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
    try {
        // If the frontend fetches the tree, it expects the hierarchy
        let query = {};
        if (req.query.includeInactive === 'false') {
            query.isActive = true;
        }

        // We fetch flat categories if requested
        const categories = await Category.find(query).sort('order priority name');
        res.json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get full hierarchy (Infinite Nesting)
// @route   GET /api/categories/hierarchy
// @access  Public
export const getHierarchy = async (req, res) => {
    try {
        // Retrieve the deeply nested hierarchy using the existing static method in Category.js
        const tree = await Category.getTree();
        res.json({ success: true, data: tree });
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

        const { name, description, parent, isActive, priority } = req.body;
        let image = category.image;

        if (req.file) {
            removeImage(category.image);
            image = req.file.path.replace(/\\/g, '/');
        }

        category.name = name || category.name;
        category.description = description || category.description;
        category.image = image;
        if (parent !== undefined) category.parent = parent || null;
        if(isActive !== undefined) category.isActive = isActive;
        if(priority !== undefined) category.priority = priority;

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
        const subcategories = await Category.find({ parent: req.params.id }).sort('name');
        res.json({ success: true, count: subcategories.length, data: subcategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
