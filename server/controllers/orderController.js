import orderService from '../services/orderService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getOrders(req.query);
    res.json(result);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrder = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id);
    res.json({ success: true, data: order });
});

// @desc    Create new order
// @route   POST /api/orders
// @access  Public/Private
export const createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.body, req.user?._id);
    res.status(201).json({ success: true, data: order });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    if (!status) {
        res.status(400);
        throw new Error('Status is required');
    }
    const order = await orderService.updateStatus(req.params.id, status, note, req.user._id);
    res.json({ success: true, data: order });
});

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getOrderStats = asyncHandler(async (req, res) => {
    const period = req.query.period || 'today';
    const stats = await orderService.getStats(period);
    res.json({ success: true, ...stats });
});

// @desc    Get sales analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
export const getSalesAnalytics = asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days) || 7;
    const analytics = await orderService.getSalesAnalytics(days);
    res.json({ success: true, data: analytics });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const order = await orderService.updateStatus(
        req.params.id, 
        'cancelled', 
        reason || 'Order cancelled by user', 
        req.user._id
    );
    res.json({ success: true, data: order, message: 'Order cancelled successfully' });
});
