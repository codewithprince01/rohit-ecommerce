import Coupon from '../models/Coupon.js';
import AuditLog from '../models/AuditLog.js';

class CouponService {
    /**
     * Get all coupons with filters
     */
    async getCoupons(filters = {}) {
        const { 
            page = 1, 
            limit = 20, 
            search,
            isActive,
            expired,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = filters;

        let query = {};

        if (search) {
            query.code = { $regex: search, $options: 'i' };
        }

        if (isActive === 'true') {
            query.isActive = true;
            query.validUntil = { $gte: new Date() };
        }

        if (expired === 'true') {
            query.validUntil = { $lt: new Date() };
        }

        const coupons = await Coupon.find(query)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Coupon.countDocuments(query);

        return {
            data: coupons,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }

    /**
     * Create a new coupon
     */
    async createCoupon(couponData, userId) {
        // Check if code already exists
        const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
        if (existing) {
            throw new Error('Coupon code already exists');
        }

        const coupon = await Coupon.create({
            ...couponData,
            code: couponData.code.toUpperCase(),
            createdBy: userId
        });

        await AuditLog.log({
            user: userId,
            action: 'create',
            resourceType: 'coupon',
            resourceId: coupon._id,
            newData: coupon.toObject(),
            description: `Created coupon: ${coupon.code}`
        });

        return coupon;
    }

    /**
     * Update a coupon
     */
    async updateCoupon(couponId, updateData, userId) {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }

        const previousData = coupon.toObject();

        // If code is being updated, check for duplicates
        if (updateData.code && updateData.code.toUpperCase() !== coupon.code) {
            const existing = await Coupon.findOne({ 
                code: updateData.code.toUpperCase(),
                _id: { $ne: couponId }
            });
            if (existing) {
                throw new Error('Coupon code already exists');
            }
            updateData.code = updateData.code.toUpperCase();
        }

        Object.assign(coupon, updateData);
        await coupon.save();

        await AuditLog.log({
            user: userId,
            action: 'update',
            resourceType: 'coupon',
            resourceId: coupon._id,
            previousData,
            newData: coupon.toObject(),
            description: `Updated coupon: ${coupon.code}`
        });

        return coupon;
    }

    /**
     * Delete a coupon
     */
    async deleteCoupon(couponId, userId) {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }

        await Coupon.findByIdAndDelete(couponId);

        await AuditLog.log({
            user: userId,
            action: 'delete',
            resourceType: 'coupon',
            resourceId: couponId,
            previousData: coupon.toObject(),
            description: `Deleted coupon: ${coupon.code}`
        });

        return { message: 'Coupon deleted successfully' };
    }

    /**
     * Validate a coupon for an order
     */
    async validateCoupon(code, orderData) {
        const coupon = await Coupon.findOne({ 
            code: code.toUpperCase(),
            isActive: true
        });

        if (!coupon) {
            throw new Error('Invalid coupon code');
        }

        // Check validity dates
        const now = new Date();
        if (coupon.validFrom && now < new Date(coupon.validFrom)) {
            throw new Error('Coupon is not yet valid');
        }
        if (coupon.validUntil && now > new Date(coupon.validUntil)) {
            throw new Error('Coupon has expired');
        }

        // Check usage limits
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw new Error('Coupon usage limit reached');
        }

        // Check minimum order value
        if (coupon.minOrderValue && orderData.subtotal < coupon.minOrderValue) {
            throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required`);
        }

        // Check per-user limit
        if (orderData.userId && coupon.usageLimitPerUser) {
            const userUsageCount = coupon.usedBy?.filter(
                u => u.user?.toString() === orderData.userId.toString()
            ).length || 0;
            
            if (userUsageCount >= coupon.usageLimitPerUser) {
                throw new Error('You have already used this coupon');
            }
        }

        // Check first order only
        if (coupon.firstOrderOnly && orderData.customerOrderCount > 0) {
            throw new Error('This coupon is only valid for first orders');
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderData.subtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            discount = Math.min(coupon.discountValue, orderData.subtotal);
        }

        return {
            valid: true,
            coupon,
            discount: Math.round(discount * 100) / 100,
            freeShipping: coupon.freeShipping || false
        };
    }

    /**
     * Apply coupon to an order (increment usage)
     */
    async applyCoupon(couponId, userId) {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }

        coupon.usedCount = (coupon.usedCount || 0) + 1;
        if (userId) {
            coupon.usedBy = coupon.usedBy || [];
            coupon.usedBy.push({ user: userId, usedAt: new Date() });
        }
        await coupon.save();

        return coupon;
    }

    /**
     * Get coupon statistics
     */
    async getStats() {
        const now = new Date();
        
        const [total, active, expired, mostUsed] = await Promise.all([
            Coupon.countDocuments(),
            Coupon.countDocuments({ 
                isActive: true, 
                $or: [
                    { validUntil: { $gte: now } },
                    { validUntil: null }
                ]
            }),
            Coupon.countDocuments({ validUntil: { $lt: now } }),
            Coupon.findOne().sort({ usedCount: -1 }).lean()
        ]);

        return {
            total,
            active,
            expired,
            mostUsed: mostUsed ? { code: mostUsed.code, usedCount: mostUsed.usedCount || 0 } : null
        };
    }
}

export default new CouponService();
