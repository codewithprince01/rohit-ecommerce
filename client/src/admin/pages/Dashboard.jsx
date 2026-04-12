import { useEffect, useState, useMemo } from "react";
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
  CheckCircle2,
  Clock,
  UserPlus,
  RefreshCcw,
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import api from "../../services/api"; // Using the synchronized service

// --- Sub-components ---

const StatCard = ({ title, value, change, changeType, icon: Icon, color, loading }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/30",
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/30",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/30",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 font-display">
            {loading ? <div className="h-9 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" /> : value}
          </h3>
          {change && (
            <div className={`flex items-center gap-1 mt-3 px-2 py-0.5 rounded-full w-fit text-[11px] font-bold ${
              changeType === "positive" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            }`}>
              {changeType === "positive" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg text-white`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const icons = {
    order: { icon: ShoppingCart, color: "bg-blue-100 text-blue-600 border-blue-200" },
    customer: { icon: UserPlus, color: "bg-purple-100 text-purple-600 border-purple-200" },
    product: { icon: Package, color: "bg-emerald-100 text-emerald-600 border-emerald-200" },
  };
  const { icon: Icon, color } = icons[activity.type] || icons.order;

  return (
    <div className="flex gap-4 p-4 hover:bg-gray-50/50 rounded-2xl transition-colors">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {activity.message}
          </p>
          <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap uppercase tracking-tighter">
            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
          {activity.email || activity.sku || (activity.amount ? `₹${activity.amount.toLocaleString()}` : "")}
        </p>
      </div>
    </div>
  );
};

const TopProductCard = ({ product }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-700/30 rounded-2xl border border-transparent hover:border-gray-200 transition-all group">
    <div className="w-12 h-12 rounded-xl bg-white p-2 shadow-sm flex items-center justify-center overflow-hidden border border-gray-100">
      <img 
        src={getImageUrl(product.thumbnail || (product.images && product.images[0])) || "https://dummyimage.com/100x100/f3f4f6/9ca3af.png&text=P"} 
        alt={product.name}
        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs font-medium text-gray-500">{product.totalSold} Sold</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span className="text-xs font-bold text-primary-600">₹{product.price}</span>
      </div>
    </div>
    <div className="text-right">
      <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
        {Math.round((product.totalSold * product.price) / 1000)}k
      </span>
    </div>
  </div>
);

// --- Main Pages ---

const Dashboard = () => {
  const [data, setData] = useState({
    stats: {
      revenue: { total: 0 },
      orders: { total: 0, today: 0, pending: 0 },
      products: { total: 0, lowStock: 0 },
      customers: { total: 0 }
    },
    recentOrders: [],
    topProducts: [],
    activities: [],
    salesHistory: []
  });
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("7days");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, activityRes, salesRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/dashboard/activity"),
        api.get(`/admin/dashboard/analytics/sales?period=${activePeriod}`)
      ]);

      setData({
        stats: overviewRes.data.data.stats,
        recentOrders: overviewRes.data.data.recentOrders,
        topProducts: overviewRes.data.data.topProducts,
        activities: activityRes.data.data,
        salesHistory: salesRes.data.data.salesData
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = useMemo(() => {
    return data.salesHistory.map(item => ({
      name: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      revenue: item.revenue,
      orders: item.orders
    }));
  }, [data.salesHistory]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white font-display tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <Clock size={16} /> Data updated every 15 minutes
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <button 
            onClick={fetchDashboardData}
            className="p-2.5 hover:bg-gray-50 text-gray-400 hover:text-primary-600 transition-all active:scale-95"
          >
            <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="w-px h-6 bg-gray-100 dark:bg-gray-700 mx-1" />
          <div className="flex gap-1">
            {["7days", "30days"].map(p => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-4 py-2 text-xs font-black rounded-xl transition-all ${
                  activePeriod === p 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {p === "7days" ? "Last Week" : "Last Month"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Gross Revenue"
          value={`₹${data.stats.revenue.total.toLocaleString()}`}
          change="+14.2%"
          changeType="positive"
          icon={DollarSign}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={data.stats.orders.total}
          change="+8.4%"
          changeType="positive"
          icon={ShoppingCart}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="New Pending"
          value={data.stats.orders.pending}
          change="-2.1%"
          changeType="negative"
          icon={AlertTriangle}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="New Growth"
          value={`+${data.stats.customers.total}`}
          change="+100%"
          changeType="positive"
          icon={Users}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Main Stats Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white font-display">Revenue Analytics</h3>
              <p className="text-sm text-gray-500">Daily financial performance</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
                  cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4f46e5" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-display">Hot Sales</h3>
            <Link to="/admin/products" className="text-primary-600 p-2 hover:bg-primary-50 rounded-xl transition-colors">
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="space-y-4">
            {data.topProducts.map((product, idx) => (
              <TopProductCard key={product._id} product={product} />
            ))}
            {data.topProducts.length === 0 && Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Activity & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-display">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-black text-primary-600 uppercase tracking-widest hover:underline">
              Manage All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 border-transparent">
                      <span className="text-sm font-black text-gray-900">#{order.orderNumber}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500 border border-gray-200">
                          {order.customerName?.charAt(0) || "U"}
                        </div>
                        <span className="text-sm font-bold text-gray-700">{order.customerName || "Customer"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-gray-900">₹{order.grandTotal.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                        order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" :
                        order.status === 'pending' ? "bg-amber-50 text-amber-600" :
                        "bg-blue-50 text-blue-600"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link to={`/admin/orders/${order._id}`} className="p-2 hover:bg-gray-100 rounded-lg inline-block transition-colors">
                        <ArrowRight size={16} className="text-gray-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-white font-display">Activity</h3>
            <span className="bg-primary-50 text-primary-600 text-[10px] font-black px-2 py-1 rounded-lg">LIVE</span>
          </div>
          <div className="space-y-2">
            {data.activities.map((activity, idx) => (
              <ActivityItem key={idx} activity={activity} />
            ))}
            {data.activities.length === 0 && (
              <div className="text-center py-12">
                <Clock className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-400 text-sm font-medium">No recent activity</p>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-4 text-xs font-black text-gray-500 hover:text-gray-900 border-2 border-dashed border-gray-100 rounded-3xl hover:border-gray-200 transition-all">
            View System Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
