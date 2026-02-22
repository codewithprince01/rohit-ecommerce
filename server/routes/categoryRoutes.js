import express from 'express';
import { 
    createCategory, 
    getCategories, 
    getCategory, 
    getCategoryBySlug,
    updateCategory, 
    deleteCategory,
    getSubcategories,
    getHierarchy
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getCategories)
    .post(protect, admin, upload.single('image'), createCategory);

router.get('/hierarchy', getHierarchy);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id/subcategories', getSubcategories);

router.route('/:id')
    .get(getCategory)
    .put(protect, admin, upload.single('image'), updateCategory)
    .delete(protect, admin, deleteCategory);

export default router;
