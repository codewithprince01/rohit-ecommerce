import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getSalesReport,
    getProductReport,
    getCustomerReport
} from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/sales', getSalesReport);
router.get('/products', getProductReport);
router.get('/customers', getCustomerReport);

export default router;
