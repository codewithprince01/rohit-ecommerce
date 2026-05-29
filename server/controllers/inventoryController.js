import inventoryService from '../services/inventoryService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get inventory list
// @route   GET /api/inventory
// @access  Private/Admin
export const getInventory = asyncHandler(async (req, res) => {
    const result = await inventoryService.getInventory(req.query);
    res.json(result);
});

// @desc    Adjust stock for a product
// @route   PUT /api/inventory/:productId/adjust
// @access  Private/Admin
export const adjustStock = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const result = await inventoryService.adjustStock(productId, req.body, req.user);
    res.json({
        success: true,
        message: 'Stock updated successfully',
        ...result
    });
});

// @desc    Get low stock alerts
// @route   GET /api/inventory/alerts/low-stock
// @access  Private/Admin
export const getLowStockAlerts = asyncHandler(async (req, res) => {
    const threshold = req.query.threshold || 10;
    const products = await inventoryService.getLowStockAlerts(threshold);
    res.json({ success: true, data: products, count: products.length });
});

// @desc    Get out of stock products
// @route   GET /api/inventory/alerts/out-of-stock
// @access  Private/Admin
export const getOutOfStock = asyncHandler(async (req, res) => {
    const products = await inventoryService.getOutOfStock();
    res.json({ success: true, data: products, count: products.length });
});

// @desc    Get expiring soon products
// @route   GET /api/inventory/alerts/expiring
// @access  Private/Admin
export const getExpiringSoon = asyncHandler(async (req, res) => {
    const days = req.query.days || 30;
    const products = await inventoryService.getExpiringSoon(days);
    res.json({ success: true, data: products, count: products.length });
});

// @desc    Get inventory statistics
// @route   GET /api/inventory/stats
// @access  Private/Admin
export const getInventoryStats = asyncHandler(async (req, res) => {
    const stats = await inventoryService.getStats();
    res.json({ success: true, ...stats });
});

// @desc    Bulk update stock
// @route   POST /api/inventory/bulk-update
// @access  Private/Admin
export const bulkUpdateStock = asyncHandler(async (req, res) => {
    const { updates } = req.body;
    if (!updates || !Array.isArray(updates)) {
        res.status(400);
        throw new Error('Updates array is required');
    }
    const results = await inventoryService.bulkUpdate(updates, req.user);
    res.json({ success: true, results });
});

// @desc    Get inventory history for a product
// @route   GET /api/inventory/:productId/history
// @access  Private/Admin
export const getInventoryHistory = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const result = await inventoryService.getHistory(productId, req.query);
    res.json(result);
});
