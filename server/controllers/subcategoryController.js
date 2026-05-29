import Subcategory from '../models/Subcategory.js';
import SubSubCategory from '../models/SubSubCategory.js';
import Product from '../models/Product.js';
import slugify from 'slugify';

// @desc    Get all subcategories
// @route   GET /api/subcategories
export const getSubcategories = async (req, res) => {
    try {
        const subcategories = await Subcategory.find().populate('category', 'name').sort('name');
        res.json({ success: true, count: subcategories.length, data: subcategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single subcategory by Slug
export const getSubcategoryBySlug = async (req, res) => {
    try {
        const subcategory = await Subcategory.findOne({ slug: req.params.slug }).populate('category', 'name slug');
        if (!subcategory) return res.status(404).json({ success: false, message: 'Subcategory not found' });
        res.json({ success: true, data: subcategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get sub-subcategories of a subcategory
export const getSubSubCategoriesBySub = async (req, res) => {
    try {
        const subSubCategories = await SubSubCategory.find({ subcategory: req.params.id }).sort('name');
        res.json({ success: true, count: subSubCategories.length, data: subSubCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create subcategory
export const createSubcategory = async (req, res) => {
    try {
        const { name, category, isActive } = req.body;
        const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
        const subcategory = await Subcategory.create({ name, slug, category, isActive: isActive !== undefined ? isActive : true });
        res.status(201).json({ success: true, data: subcategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update subcategory
export const updateSubcategory = async (req, res) => {
    try {
        let subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) return res.status(404).json({ success: false, message: 'Subcategory not found' });

        const { name, category, isActive } = req.body;
        if (name && name !== subcategory.name) {
            subcategory.name = name;
            subcategory.slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
        }
        subcategory.category = category || subcategory.category;
        if (isActive !== undefined) subcategory.isActive = isActive;

        await subcategory.save();
        res.json({ success: true, data: subcategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete subcategory
export const deleteSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id);
        if (!subcategory) return res.status(404).json({ success: false, message: 'Subcategory not found' });

        // Cleanup: Remove child sub-subcategories
        await SubSubCategory.deleteMany({ subcategory: subcategory._id });
        
        // Cleanup: Update products to remove this subcategory reference
        await Product.updateMany({ subCategory: subcategory._id }, { $unset: { subCategory: "", subSubCategory: "" } });

        await subcategory.deleteOne();
        res.json({ success: true, message: 'Subcategory and its nested levels removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
