import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import {
    getCoupons,
    getCoupon,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    getCouponStats
} from '../controllers/couponController.js';

const router = express.Router();

// Public routes
router.post('/validate', optionalAuth, validateCoupon);

// Protected routes
router.use(protect);
router.get('/stats', getCouponStats);
router.route('/')
    .get(getCoupons)
    .post(createCoupon);

router.route('/:id')
    .get(getCoupon)
    .put(updateCoupon)
    .delete(deleteCoupon);

export default router;
