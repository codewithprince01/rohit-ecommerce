import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get Sales Report
// @route   GET /api/reports/sales
export const getSalesReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    let query = { status: { $nin: ['cancelled', 'refunded'] } };
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const sales = await Order.aggregate([
        { $match: query },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$grandTotal' },
                orders: { $sum: 1 },
                items: { $sum: { $size: '$items' } }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: sales });
});

// @desc    Get Product Performance Report
// @route   GET /api/reports/products
export const getProductReport = asyncHandler(async (req, res) => {
    const products = await Order.aggregate([
        { $match: { status: 'delivered' } },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                name: { $first: '$items.name' },
                soldCount: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.subtotal' }
            }
        },
        { $sort: { soldCount: -1 } },
        { $limit: 20 }
    ]);

    res.json({ success: true, data: products });
});

// @desc    Get Customer Activity Report
// @route   GET /api/reports/customers
export const getCustomerReport = asyncHandler(async (req, res) => {
    const customers = await User.aggregate([
        { $match: { role: 'user' } },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'user',
                as: 'orders'
            }
        },
        {
            $project: {
                name: 1,
                email: 1,
                orderCount: { $size: '$orders' },
                totalSpent: { $sum: '$orders.grandTotal' },
                lastOrderDate: { $max: '$orders.createdAt' }
            }
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 20 }
    ]);

    res.json({ success: true, data: customers });
});
