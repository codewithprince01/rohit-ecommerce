import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize, isStaff, isManager, isAdmin, PERMISSIONS } from '../middleware/authorize.js';
import {
  getDashboardOverview,
  getSalesAnalytics,
  getLowStockAlerts,
  getRecentActivity
} from '../controllers/adminDashboardController.js';

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// Dashboard routes - require at least staff level
router.get('/dashboard', isStaff, authorize(PERMISSIONS.VIEW_DASHBOARD), getDashboardOverview);
router.get('/dashboard/analytics/sales', isStaff, authorize(PERMISSIONS.VIEW_ANALYTICS), getSalesAnalytics);
router.get('/dashboard/alerts/low-stock', isStaff, authorize(PERMISSIONS.VIEW_STOCK_ALERTS), getLowStockAlerts);
router.get('/dashboard/activity', isStaff, authorize(PERMISSIONS.VIEW_DASHBOARD), getRecentActivity);

export default router;
