import SubSubCategory from '../models/SubSubCategory.js';
import Product from '../models/Product.js';
import slugify from 'slugify';

// @desc    Get all sub-subcategories (Brands)
export const getSubSubCategories = async (req, res) => {
    try {
        const subSubCategories = await SubSubCategory.find().populate('subcategory', 'name').sort('name');
        res.json({ success: true, count: subSubCategories.length, data: subSubCategories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single sub-subcategory by Slug
export const getSubSubCategoryBySlug = async (req, res) => {
    try {
        const subSubCategory = await SubSubCategory.findOne({ slug: req.params.slug }).populate('subcategory', 'name slug');
        if (!subSubCategory) return res.status(404).json({ success: false, message: 'Sub-subcategory not found' });
        res.json({ success: true, data: subSubCategory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create sub-subcategory
export const createSubSubCategory = async (req, res) => {
    try {
        const { name, subcategory, isActive } = req.body;
        const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
        const subSubCategory = await SubSubCategory.create({ 
            name, 
            slug,
            subcategory, 
            isActive: isActive !== undefined ? isActive : true 
        });
        res.status(201).json({ success: true, data: subSubCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update sub-subcategory
export const updateSubSubCategory = async (req, res) => {
    try {
        let subSubCategory = await SubSubCategory.findById(req.params.id);
        if (!subSubCategory) return res.status(404).json({ success: false, message: 'Sub-subcategory not found' });

        const { name, subcategory, isActive } = req.body;
        if (name && name !== subSubCategory.name) {
            subSubCategory.name = name;
            subSubCategory.slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
        }
        subSubCategory.subcategory = subcategory || subSubCategory.subcategory;
        if (isActive !== undefined) subSubCategory.isActive = isActive;

        await subSubCategory.save();
        res.json({ success: true, data: subSubCategory });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete sub-subcategory
export const deleteSubSubCategory = async (req, res) => {
    try {
        const subSubCategory = await SubSubCategory.findById(req.params.id);
        if (!subSubCategory) return res.status(404).json({ success: false, message: 'Sub-subcategory not found' });

        // Cleanup: remove this brand reference from products
        await Product.updateMany({ subSubCategory: subSubCategory._id }, { $unset: { subSubCategory: "" } });

        await subSubCategory.deleteOne();
        res.json({ success: true, message: 'Sub-subcategory removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
