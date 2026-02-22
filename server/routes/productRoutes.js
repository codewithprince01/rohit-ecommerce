import express from 'express';
import { 
    createProduct, 
    getProducts, 
    getProduct, 
    getProductBySlug, 
    updateProduct, 
    deleteProduct,
    deleteProductImage,
    getFeaturedProducts,
    getRelatedProducts,
    getProductStats,
    toggleProductStatus
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.array('images', 5), createProduct);

router.get('/featured', getFeaturedProducts);
router.get('/admin/stats', protect, admin, getProductStats);

router.get('/slug/:slug', getProductBySlug);
router.get('/:id/related', getRelatedProducts);

router.route('/:id')
    .get(getProduct)
    .put(protect, admin, upload.array('images', 5), updateProduct)
    .delete(protect, admin, deleteProduct);

router.delete('/:id/images', protect, admin, deleteProductImage);
router.patch('/:id/toggle-status', protect, admin, toggleProductStatus);

export default router;
