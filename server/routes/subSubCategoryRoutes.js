import express from 'express';
import { 
    getSubSubCategories, 
    getSubSubCategoryBySlug, 
    createSubSubCategory,
    updateSubSubCategory,
    deleteSubSubCategory
} from '../controllers/subSubCategoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getSubSubCategories)
    .post(protect, admin, createSubSubCategory);

router.get('/slug/:slug', getSubSubCategoryBySlug);

router.route('/:id')
    .put(protect, admin, updateSubSubCategory)
    .delete(protect, admin, deleteSubSubCategory);

export default router;
