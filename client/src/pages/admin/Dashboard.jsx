import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  MoreHorizontal,
  Calendar,
  Filter,
} from "lucide-react";
import api from "../../utils/api";

// Stat Card Component
const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color,
  loading,
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/30",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/30",
    pink: "from-pink-500 to-pink-600 shadow-pink-500/30",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {loading ? (
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              value
            )}
          </h3>
          {change && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                changeType === "positive" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {changeType === "positive" ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span>{change}</span>
              <span className="text-gray-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}
        >
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
};

// Alert Card Component
const AlertCard = ({ title, items, icon: Icon, color, link }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon size={20} />
        </div>
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <Link
        to={link}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
      >
        View All <ArrowRight size={14} />
      </Link>
    </div>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
        >
          <div className="flex items-center gap-3">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-gray-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">{item.subtitle}</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${item.badgeColor || "bg-red-100 text-red-600"}`}
          >
            {item.badge}
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No items to display
        </p>
      )}
    </div>
  </div>
);

// Recent Orders Table
const RecentOrdersTable = ({ orders, loading }) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    packed: "bg-purple-100 text-purple-700",
    shipped: "bg-cyan-100 text-cyan-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
          Recent Orders
        </h3>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Filter size={18} className="text-gray-500" />
          </button>
          <Link
            to="/admin/orders"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View All <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order._id || order.orderNumber}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-indigo-600">
                      #{order.orderNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {order.customerName?.charAt(0)?.toUpperCase() || "G"}
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {order.customerName || "Guest"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      ₹
                      {order.grandTotal?.toLocaleString() ||
                        order.totalAmount?.toLocaleString() ||
                        "0"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                      <MoreHorizontal size={18} className="text-gray-500" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Quick Actions Grid
const QuickActions = () => {
  const actions = [
    {
      label: "Add Product",
      icon: Package,
      color: "bg-blue-500",
      link: "/admin/products/new",
    },
    {
      label: "Add Category",
      icon: Package,
      color: "bg-green-500",
      link: "/admin/categories",
    },
    {
      label: "View Orders",
      icon: ShoppingCart,
      color: "bg-purple-500",
      link: "/admin/orders",
    },
    {
      label: "Manage Stock",
      icon: AlertTriangle,
      color: "bg-orange-500",
      link: "/admin/inventory",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => (
          <Link
            key={idx}
            to={action.link}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className={`p-2 rounded-lg ${action.color}`}>
              <action.icon size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch data from multiple endpoints in parallel
      const [
        productsRes,
        ordersRes,
        inventoryStatsRes,
        lowStockRes,
        customerStatsRes,
        orderStatsRes,
      ] = await Promise.all([
        api.get("/products?limit=1").catch(() => ({ data: { total: 0 } })),
        api
          .get("/orders?limit=10")
          .catch(() => ({ data: { data: [], total: 0 } })),
        api.get("/inventory/stats").catch(() => ({ data: {} })),
        api.get("/inventory/alerts/low-stock").catch(() => ({ data: [] })),
        api.get("/customers/stats").catch(() => ({ data: {} })),
        api.get("/orders/stats").catch(() => ({ data: {} })),
      ]);

      // Extract data safely
      const productCount =
        productsRes.data?.total || productsRes.data?.data?.length || 0;
      const orders = ordersRes.data?.data || [];
      const orderCount = ordersRes.data?.total || orders.length;
      const inventoryStats = inventoryStatsRes.data || {};
      const lowStockItems = lowStockRes.data || [];
      const customerStats = customerStatsRes.data || {};
      const orderStats = orderStatsRes.data || {};

      setStats({
        totalProducts: productCount,
        totalOrders: orderStats.totalOrders || orderCount,
        totalCustomers: customerStats.total || 0,
        totalRevenue:
          orderStats.revenue ||
          orders.reduce(
            (sum, o) => sum + (o.grandTotal || o.totalAmount || 0),
            0,
          ),
        lowStockCount: inventoryStats.lowStock || 0,
        pendingOrders:
          orderStats.pending ||
          orders.filter((o) => o.status === "pending").length,
      });

      setRecentOrders(orders.slice(0, 5));

      // Format low stock products for display
      const formattedLowStock = lowStockItems.slice(0, 5).map((item) => ({
        name: item.name,
        subtitle: `SKU: ${item.sku || "N/A"}`,
        badge: `${item.stock} left`,
        badgeColor:
          item.stock <= 0
            ? "bg-red-100 text-red-600"
            : item.stock <= 5
              ? "bg-orange-100 text-orange-600"
              : "bg-yellow-100 text-yellow-700",
        image: item.images?.[0]?.url || item.thumbnail,
      }));

      setLowStockProducts(
        formattedLowStock.length > 0
          ? formattedLowStock
          : [
              {
                name: "No low stock items",
                subtitle: "All products are well stocked",
                badge: "✓",
                badgeColor: "bg-green-100 text-green-600",
              },
            ],
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Calendar size={18} />
            <span>Last 30 Days</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          change="+12.5%"
          changeType="positive"
          icon={DollarSign}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          change="+8.2%"
          changeType="positive"
          icon={ShoppingCart}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          color="purple"
          loading={loading}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={AlertTriangle}
          color="orange"
          loading={loading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} loading={loading} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Low Stock Alert */}
          <AlertCard
            title="Low Stock Alert"
            items={lowStockProducts}
            icon={AlertTriangle}
            color="bg-orange-100 text-orange-600"
            link="/admin/inventory"
          />
        </div>
      </div>

      {/* Sales Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
            Sales Overview
          </h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
              Weekly
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg">
              Monthly
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg">
              Yearly
            </button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-xl">
          <p className="text-gray-500 dark:text-gray-400">
            📊 Sales chart will appear here once you have order data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
