import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getCustomers,
    getCustomer,
    updateCustomer,
    getCustomerOrders,
    getCustomerStats,
    addLoyaltyPoints
} from '../controllers/customerController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/stats', getCustomerStats);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.get('/:id/orders', getCustomerOrders);
router.post('/:id/loyalty', addLoyaltyPoints);

export default router;
