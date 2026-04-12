import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierStats
} from '../controllers/supplierController.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(admin);

router.get('/stats', getSupplierStats);
router.get('/', getSuppliers);
router.post('/', createSupplier);

router.route('/:id')
    .get(getSupplier)
    .put(updateSupplier)
    .delete(deleteSupplier);

export default router;
