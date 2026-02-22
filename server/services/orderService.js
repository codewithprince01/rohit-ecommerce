import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import AuditLog from '../models/AuditLog.js';
import couponService from './couponService.js';

class OrderService {
    /**
     * Get orders with filters
     */
    async getOrders(filters = {}) {
        const { 
            page = 1, 
            limit = 20, 
            status,
            paymentStatus,
            search,
            customer,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = filters;

        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (customer) {
            query.user = customer;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.phone': { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await Order.find(query)
            .populate('user', 'name email phone')
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Transform orders for frontend
        const transformedOrders = orders.map(order => ({
            ...order,
            customerName: order.customer?.name || order.user?.name || 'Guest',
            customerPhone: order.customer?.phone || order.user?.phone || 'N/A',
            customerEmail: order.customer?.email || order.user?.email || 'N/A'
        }));

        const total = await Order.countDocuments(query);

        // Get counts by status
        const counts = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const statusCounts = {};
        counts.forEach(c => { statusCounts[c._id] = c.count; });

        return {
            data: transformedOrders,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            counts: statusCounts
        };
    }

    /**
     * Get order by ID
     */
    async getOrderById(orderId) {
        const order = await Order.findById(orderId)
            .populate('user', 'name email phone')
            .populate('items.product', 'name images')
            .lean();

        if (!order) {
            throw new Error('Order not found');
        }

        return {
            ...order,
            customerName: order.customer?.name || order.user?.name || 'Guest',
            customerPhone: order.customer?.phone || order.user?.phone || 'N/A',
            customerEmail: order.customer?.email || order.user?.email || 'N/A'
        };
    }

    /**
     * Create a new order
     */
    async createOrder(orderData, userId) {
        const { items, shippingAddress, paymentMethod, couponCode } = orderData;

        // Validate and prepare items
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                throw new Error(`Product not found: ${item.product}`);
            }
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.name}`);
            }

            const itemPrice = product.price;
            const itemSubtotal = itemPrice * item.quantity;
            subtotal += itemSubtotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                quantity: item.quantity,
                price: itemPrice,
                image: product.images?.[0]?.url || product.thumbnail,
                subtotal: itemSubtotal
            });

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Apply coupon if provided
        let discount = 0;
        let couponId = null;
        let freeShipping = false;

        if (couponCode) {
            try {
                const couponResult = await couponService.validateCoupon(couponCode, {
                    subtotal,
                    userId
                });
                discount = couponResult.discount;
                freeShipping = couponResult.freeShipping;
                couponId = couponResult.coupon._id;
            } catch (error) {
                // Coupon invalid, continue without discount
                console.log('Coupon error:', error.message);
            }
        }

        // Calculate totals
        const shippingCharge = freeShipping ? 0 : (subtotal >= 500 ? 0 : 40);
        const taxAmount = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
        const grandTotal = subtotal - discount + shippingCharge + taxAmount;

        // Generate order number
        const orderNumber = `ORD${Date.now().toString().slice(-8)}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

        // Get customer info
        let customerInfo = {};
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                customerInfo = {
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                };
            }
        }

        const order = await Order.create({
            orderNumber,
            user: userId,
            customer: customerInfo,
            items: orderItems,
            shippingAddress,
            subtotal,
            discount,
            coupon: couponId,
            shippingCharge,
            taxAmount,
            grandTotal,
            paymentMethod,
            status: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            statusHistory: [{
                status: 'pending',
                note: 'Order placed',
                timestamp: new Date()
            }]
        });

        // Apply coupon usage
        if (couponId) {
            await couponService.applyCoupon(couponId, userId);
        }

        // Audit log
        await AuditLog.log({
            user: userId,
            action: 'create',
            resourceType: 'order',
            resourceId: order._id,
            newData: order.toObject(),
            description: `New order placed: ${orderNumber}`
        });

        return order;
    }

    /**
     * Update order status
     */
    async updateStatus(orderId, newStatus, note, userId) {
        const order = await Order.findById(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        const previousStatus = order.status;

        // Validate status transition
        const validTransitions = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['processing', 'cancelled'],
            processing: ['packed', 'cancelled'],
            packed: ['shipped', 'cancelled'],
            shipped: ['out_for_delivery', 'cancelled'],
            out_for_delivery: ['delivered'],
            delivered: ['return_requested'],
            return_requested: ['returned', 'delivered'],
            returned: ['refunded'],
            cancelled: [],
            refunded: []
        };

        if (!validTransitions[previousStatus]?.includes(newStatus)) {
            throw new Error(`Cannot transition from ${previousStatus} to ${newStatus}`);
        }

        // Update order
        order.status = newStatus;
        order.statusHistory.push({
            status: newStatus,
            note: note || `Status changed to ${newStatus}`,
            updatedBy: userId,
            timestamp: new Date()
        });

        // Set specific timestamps
        if (newStatus === 'confirmed') order.confirmedAt = new Date();
        if (newStatus === 'shipped') order.shippedAt = new Date();
        if (newStatus === 'delivered') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'paid';
        }
        if (newStatus === 'cancelled') {
            order.cancelledAt = new Date();
            // Restore stock
            for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }
        }

        await order.save();

        // Audit log
        await AuditLog.log({
            user: userId,
            action: 'update',
            resourceType: 'order',
            resourceId: orderId,
            previousData: { status: previousStatus },
            newData: { status: newStatus },
            description: `Order ${order.orderNumber} status: ${previousStatus} → ${newStatus}`
        });

        return order;
    }

    /**
     * Get order statistics
     */
    async getStats(period = 'today') {
        const now = new Date();
        let startDate;

        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(0);
        }

        const [totalOrders, revenue, statusCounts] = await Promise.all([
            Order.countDocuments({ createdAt: { $gte: startDate } }),
            Order.aggregate([
                { 
                    $match: { 
                        createdAt: { $gte: startDate },
                        status: { $nin: ['cancelled', 'refunded'] }
                    } 
                },
                { $group: { _id: null, total: { $sum: '$grandTotal' } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: startDate } } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const statusMap = {};
        statusCounts.forEach(s => { statusMap[s._id] = s.count; });

        return {
            totalOrders,
            revenue: revenue[0]?.total || 0,
            pending: statusMap.pending || 0,
            processing: (statusMap.processing || 0) + (statusMap.confirmed || 0),
            shipped: (statusMap.shipped || 0) + (statusMap.out_for_delivery || 0),
            delivered: statusMap.delivered || 0,
            cancelled: statusMap.cancelled || 0
        };
    }

    /**
     * Get sales analytics
     */
    async getSalesAnalytics(days = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const dailySales = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: startDate },
                    status: { $nin: ['cancelled', 'refunded'] }
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$grandTotal' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return dailySales;
    }
}

export default new OrderService();
