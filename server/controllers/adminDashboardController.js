import Order, { ORDER_STATUS, PAYMENT_STATUS } from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import asyncHandler from '../middleware/asyncHandler.js';

/**
 * @desc    Get dashboard overview with KPIs
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Parallel queries for performance
  const [
    totalProducts,
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    totalOrders,
    todayOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers,
    newCustomersToday,
    totalCategories,
    revenueStats,
    recentOrders,
    topProducts
  ] = await Promise.all([
    // Products stats
    Product.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ 
      trackInventory: true, 
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      stock: { $gt: 0 }
    }),
    Product.countDocuments({ trackInventory: true, stock: 0 }),
    
    // Orders stats
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.countDocuments({ status: ORDER_STATUS.PENDING }),
    Order.countDocuments({ status: { $in: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.PACKED] } }),
    Order.countDocuments({ status: ORDER_STATUS.DELIVERED }),
    Order.countDocuments({ status: ORDER_STATUS.CANCELLED }),
    
    // Customers stats
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfToday } }),
    
    // Categories
    Category.countDocuments(),
    
    // Revenue aggregation
    Order.aggregate([
      {
        $match: {
          paymentStatus: PAYMENT_STATUS.PAID,
          status: { $ne: ORDER_STATUS.CANCELLED }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$grandTotal' },
          avgOrderValue: { $avg: '$grandTotal' },
          totalOrders: { $sum: 1 }
        }
      }
    ]),
    
    // Recent orders (last 10)
    Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber customerName status grandTotal createdAt source')
      .lean(),
    
    // Top selling products (last 30 days)
    Product.find()
      .sort({ totalSold: -1 })
      .limit(5)
      .select('name slug thumbnail price totalSold stock')
      .lean()
  ]);

  // Calculate revenue stats with fallback
  const revenue = revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0, totalOrders: 0 };

  res.json({
    success: true,
    data: {
      stats: {
        products: {
          total: totalProducts,
          active: activeProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        orders: {
          total: totalOrders,
          today: todayOrders,
          pending: pendingOrders,
          processing: processingOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        customers: {
          total: totalCustomers,
          newToday: newCustomersToday
        },
        categories: {
          total: totalCategories
        },
        revenue: {
          total: revenue.totalRevenue,
          avgOrderValue: Math.round(revenue.avgOrderValue || 0),
          paidOrders: revenue.totalOrders
        }
      },
      recentOrders,
      topProducts,
      timestamp: new Date()
    }
  });
});

/**
 * @desc    Get sales analytics
 * @route   GET /api/admin/dashboard/analytics/sales
 * @access  Private/Admin
 */
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = '7days' } = req.query;
  
  let startDate;
  const endDate = new Date();
  
  switch (period) {
    case '24hours':
      startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      break;
    case '7days':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90days':
      startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1year':
      startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  // Daily sales data
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: ORDER_STATUS.CANCELLED }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$grandTotal' },
        avgOrderValue: { $avg: '$grandTotal' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        orders: 1,
        revenue: { $round: ['$revenue', 2] },
        avgOrderValue: { $round: ['$avgOrderValue', 2] }
      }
    }
  ]);

  // Category-wise sales
  const categorySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: ORDER_STATUS.CANCELLED }
      }
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productDetails.category',
        foreignField: '_id',
        as: 'categoryDetails'
      }
    },
    { $unwind: { path: '$categoryDetails', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$productDetails.category',
        categoryName: { $first: '$categoryDetails.name' },
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.subtotal' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);

  // Order status distribution
  const orderStatusDistribution = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Payment method distribution
  const paymentMethodDistribution = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        revenue: { $sum: '$grandTotal' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      period,
      startDate,
      endDate,
      salesData,
      categorySales,
      orderStatusDistribution,
      paymentMethodDistribution
    }
  });
});

/**
 * @desc    Get low stock alerts
 * @route   GET /api/admin/dashboard/alerts/low-stock
 * @access  Private/Admin
 */
export const getLowStockAlerts = asyncHandler(async (req, res) => {
  const lowStockProducts = await Product.find({
    trackInventory: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  })
    .sort({ stock: 1 })
    .limit(50)
    .select('name sku stock lowStockThreshold thumbnail category')
    .populate('category', 'name')
    .lean();

  res.json({
    success: true,
    count: lowStockProducts.length,
    data: lowStockProducts
  });
});

/**
 * @desc    Get recent activity feed
 * @route   GET /api/admin/dashboard/activity
 * @access  Private/Admin
 */
export const getRecentActivity = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  // Combine recent orders, new customers, and product updates
  const [recentOrders, recentCustomers, recentProducts] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('orderNumber customerName status grandTotal createdAt')
      .lean(),
    
    User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name email createdAt')
      .lean(),
    
    Product.find()
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('name sku updatedAt')
      .lean()
  ]);

  // Format and combine activities
  const activities = [
    ...recentOrders.map(o => ({
      type: 'order',
      message: `New order #${o.orderNumber} from ${o.customerName}`,
      amount: o.grandTotal,
      status: o.status,
      timestamp: o.createdAt
    })),
    ...recentCustomers.map(c => ({
      type: 'customer',
      message: `New customer: ${c.name}`,
      email: c.email,
      timestamp: c.createdAt
    })),
    ...recentProducts.map(p => ({
      type: 'product',
      message: `Product updated: ${p.name}`,
      sku: p.sku,
      timestamp: p.updatedAt
    }))
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));

  res.json({
    success: true,
    data: activities
  });
});
