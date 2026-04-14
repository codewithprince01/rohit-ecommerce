import express from 'express';
import { 
    getSubcategories, 
    getSubcategoryBySlug, 
    getSubSubCategoriesBySub, 
    createSubcategory,
    updateSubcategory,
    deleteSubcategory
} from '../controllers/subcategoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getSubcategories)
    .post(protect, admin, createSubcategory);

router.get('/slug/:slug', getSubcategoryBySlug);
router.get('/:id/subsubcategories', getSubSubCategoriesBySub);

router.route('/:id')
    .put(protect, admin, updateSubcategory)
    .delete(protect, admin, deleteSubcategory);

export default router;
