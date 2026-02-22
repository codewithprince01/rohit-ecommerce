import User from '../models/User.js';
import Order from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';

class CustomerService {
    /**
     * Get all customers with filters
     */
    async getCustomers(filters = {}) {
        const { 
            page = 1, 
            limit = 20, 
            search,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = filters;

        let query = { role: 'user' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (isActive === 'true') {
            query.isActive = true;
        } else if (isActive === 'false') {
            query.isActive = false;
        }

        const customers = await User.find(query)
            .select('-password')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Get order stats for each customer
        const customersWithStats = await Promise.all(
            customers.map(async (customer) => {
                const orderStats = await Order.aggregate([
                    { $match: { user: customer._id } },
                    { 
                        $group: {
                            _id: null,
                            totalOrders: { $sum: 1 },
                            totalSpent: { $sum: '$grandTotal' }
                        }
                    }
                ]);

                return {
                    ...customer,
                    totalOrders: orderStats[0]?.totalOrders || 0,
                    totalSpent: orderStats[0]?.totalSpent || 0
                };
            })
        );

        const total = await User.countDocuments(query);

        return {
            data: customersWithStats,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }

    /**
     * Get customer by ID with full details
     */
    async getCustomerById(customerId) {
        const customer = await User.findById(customerId)
            .select('-password')
            .lean();

        if (!customer) {
            throw new Error('Customer not found');
        }

        // Get order history
        const orders = await Order.find({ user: customerId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Get order statistics
        const orderStats = await Order.aggregate([
            { $match: { user: customer._id } },
            { 
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$grandTotal' },
                    avgOrderValue: { $avg: '$grandTotal' }
                }
            }
        ]);

        return {
            ...customer,
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalSpent: orderStats[0]?.totalSpent || 0,
            avgOrderValue: orderStats[0]?.avgOrderValue || 0,
            recentOrders: orders
        };
    }

    /**
     * Update customer
     */
    async updateCustomer(customerId, updateData, userId) {
        const customer = await User.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        const previousData = customer.toObject();

        // Only allow updating specific fields
        const allowedUpdates = ['name', 'phone', 'isActive', 'addresses', 'loyaltyPoints'];
        const updates = {};
        for (const field of allowedUpdates) {
            if (updateData[field] !== undefined) {
                updates[field] = updateData[field];
            }
        }

        Object.assign(customer, updates);
        await customer.save();

        await AuditLog.log({
            user: userId,
            action: 'update',
            resourceType: 'customer',
            resourceId: customerId,
            previousData,
            newData: customer.toObject(),
            description: `Updated customer: ${customer.email}`
        });

        return customer;
    }

    /**
     * Get customer orders
     */
    async getCustomerOrders(customerId, options = {}) {
        const { page = 1, limit = 10 } = options;

        const orders = await Order.find({ user: customerId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await Order.countDocuments({ user: customerId });

        return {
            data: orders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    }

    /**
     * Get customer statistics
     */
    async getStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const [total, active, newThisMonth, newLastMonth] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', isActive: true }),
            User.countDocuments({ 
                role: 'user', 
                createdAt: { $gte: startOfMonth } 
            }),
            User.countDocuments({ 
                role: 'user', 
                createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } 
            })
        ]);

        // Get top spenders
        const topSpenders = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { 
                $group: {
                    _id: '$user',
                    totalSpent: { $sum: '$grandTotal' }
                }
            },
            { $match: { totalSpent: { $gte: 10000 } } },
            { $count: 'count' }
        ]);

        return {
            total,
            active,
            newThisMonth,
            growthPercentage: newLastMonth > 0 
                ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100) 
                : 100,
            topSpenders: topSpenders[0]?.count || 0
        };
    }

    /**
     * Add loyalty points
     */
    async addLoyaltyPoints(customerId, points, reason, userId) {
        const customer = await User.findById(customerId);
        if (!customer) {
            throw new Error('Customer not found');
        }

        customer.loyaltyPoints = (customer.loyaltyPoints || 0) + points;
        await customer.save();

        await AuditLog.log({
            user: userId,
            action: 'update',
            resourceType: 'customer',
            resourceId: customerId,
            description: `Added ${points} loyalty points. Reason: ${reason}`
        });

        return customer;
    }
}

export default new CustomerService();
