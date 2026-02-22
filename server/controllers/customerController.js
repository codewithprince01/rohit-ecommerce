import customerService from '../services/customerService.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = asyncHandler(async (req, res) => {
    const result = await customerService.getCustomers(req.query);
    res.json(result);
});

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin
export const getCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.getCustomerById(req.params.id);
    res.json({ success: true, data: customer });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
export const updateCustomer = asyncHandler(async (req, res) => {
    const customer = await customerService.updateCustomer(
        req.params.id, 
        req.body, 
        req.user._id
    );
    res.json({ success: true, data: customer });
});

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
// @access  Private/Admin
export const getCustomerOrders = asyncHandler(async (req, res) => {
    const result = await customerService.getCustomerOrders(req.params.id, req.query);
    res.json(result);
});

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private/Admin
export const getCustomerStats = asyncHandler(async (req, res) => {
    const stats = await customerService.getStats();
    res.json({ success: true, ...stats });
});

// @desc    Add loyalty points
// @route   POST /api/customers/:id/loyalty
// @access  Private/Admin
export const addLoyaltyPoints = asyncHandler(async (req, res) => {
    const { points, reason } = req.body;
    if (!points) {
        res.status(400);
        throw new Error('Points are required');
    }
    const customer = await customerService.addLoyaltyPoints(
        req.params.id, 
        points, 
        reason, 
        req.user._id
    );
    res.json({ success: true, data: customer });
});
