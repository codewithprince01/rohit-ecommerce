import couponService from '../services/couponService.js';
import Coupon from '../models/Coupon.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
    const result = await couponService.getCoupons(req.query);
    res.json(result);
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
export const getCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
        res.status(404);
        throw new Error('Coupon not found');
    }
    res.json({ success: true, data: coupon });
});

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body, req.user._id);
    res.status(201).json({ success: true, data: coupon });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body, req.user._id);
    res.json({ success: true, data: coupon });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
    await couponService.deleteCoupon(req.params.id, req.user._id);
    res.json({ success: true, message: 'Coupon deleted' });
});

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = asyncHandler(async (req, res) => {
    const { code, subtotal, userId, customerOrderCount = 0 } = req.body;
    
    if (!code || subtotal === undefined) {
        res.status(400);
        throw new Error('Coupon code and subtotal are required');
    }

    const result = await couponService.validateCoupon(code, {
        subtotal,
        userId: userId || req.user?._id,
        customerOrderCount
    });

    res.json({ success: true, ...result });
});

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
export const getCouponStats = asyncHandler(async (req, res) => {
    const stats = await couponService.getStats();
    res.json({ success: true, ...stats });
});
