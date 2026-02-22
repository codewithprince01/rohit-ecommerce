import express from 'express';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    getOrderStats,
    getSalesAnalytics,
    cancelOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Public/optional auth routes
router.post('/', optionalAuth, createOrder);

// Protected routes
router.use(protect);

router.get('/stats', getOrderStats);
router.get('/analytics', getSalesAnalytics);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
