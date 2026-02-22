import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getInventory,
    adjustStock,
    getLowStockAlerts,
    getOutOfStock,
    getExpiringSoon,
    getInventoryStats,
    bulkUpdateStock,
    getInventoryHistory
} from '../controllers/inventoryController.js';

const router = express.Router();

// All routes require authentication and admin access
router.use(protect);

// Stats and alerts
router.get('/stats', getInventoryStats);
router.get('/alerts/low-stock', getLowStockAlerts);
router.get('/alerts/out-of-stock', getOutOfStock);
router.get('/alerts/expiring', getExpiringSoon);

// Main inventory routes
router.get('/', getInventory);
router.post('/bulk-update', bulkUpdateStock);

// Product-specific routes
router.put('/:productId/adjust', adjustStock);
router.get('/:productId/history', getInventoryHistory);

export default router;
