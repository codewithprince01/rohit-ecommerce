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
  ArrowRight,
  RefreshCcw,
  LayoutGrid,
  Zap,
  Target,
  UserPlus
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import api, { getImageUrl } from "../../services/api";
import toast from "react-hot-toast";
import { DataTable, StatusBadge } from "../components/AdminUI";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const StatCard = ({ title, value, change, changeType, icon: Icon, loading }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {loading ? <div className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" /> : value}
          </h3>
          {change && (
            <div className={`flex items-center gap-1 mt-3 text-sm font-medium ${
              changeType === "positive" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
            }`}>
              {changeType === "positive" ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{change} vs last period</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const icons = {
    order: { icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
    customer: { icon: UserPlus, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" },
    product: { icon: Package, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" },
  };
  const { icon: Icon, color } = icons[activity.type] || icons.order;

  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {activity.message}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {activity.email || activity.sku || (activity.amount ? `₹${activity.amount.toLocaleString()}` : "System Event")}
        </p>
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap pt-1">
        {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
};

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("30days");

  useEffect(() => {
    fetchDashboardData();
  }, [activePeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, activityRes, analyticRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/dashboard/activity"),
        api.get(`/admin/dashboard/analytics/sales?period=${activePeriod}`)
      ]);

      setOverview(overviewRes.data.data);
      setActivities(activityRes.data.data);
      setAnalytics(analyticRes.data.data);
    } catch (error) {
      toast.error("Analytics synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  const salesData = useMemo(() => {
    if (!analytics?.salesData) return [];
    return analytics.salesData.map(item => ({
      name: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      revenue: item.revenue
    }));
  }, [analytics]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor your store's performance and recent activity.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 flex gap-1 shadow-sm">
              {[
                { id: "7days", label: "7 Days" },
                { id: "30days", label: "30 Days" },
                { id: "90days", label: "3 Months" }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePeriod(p.id)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    activePeriod === p.id 
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white" 
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
           </div>
           <button onClick={fetchDashboardData} className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors">
              <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`₹${(overview?.stats?.revenue?.total || 0).toLocaleString()}`}
          change="+12.5%"
          changeType="positive"
          icon={DollarSign}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={overview?.stats?.orders?.total || 0}
          change="+5.2%"
          changeType="positive"
          icon={ShoppingCart}
          loading={loading}
        />
        <StatCard
          title="Low Stock Items"
          value={overview?.stats?.products?.lowStock || 0}
          change="-2.1%"
          changeType="positive"
          icon={AlertTriangle}
          loading={loading}
        />
        <StatCard
          title="Active Customers"
          value={overview?.stats?.customers?.total || 0}
          change="+18.4%"
          changeType="positive"
          icon={Users}
          loading={loading}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Daily revenue across the selected period</p>
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer>
                 <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#revGradient)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
           <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Top Products</h3>
              <Link to="/admin/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">View All <ArrowRight size={16}/></Link>
           </div>
           <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
              {overview?.topProducts?.map((p, i) => (
                 <div key={p._id} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-xl p-2 border border-gray-100 dark:border-gray-600 flex shrink-0 items-center justify-center overflow-hidden">
                       <img src={getImageUrl(p.thumbnail || p.images?.[0])} alt={p.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{p.name}</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">₹{p.price}</p>
                    </div>
                    <div className="text-right shrink-0">
                       <p className="text-sm font-bold text-gray-900 dark:text-white">{p.totalSold}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400">Sold</p>
                    </div>
                 </div>
              ))}
              {(!overview?.topProducts || overview.topProducts.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <Package size={32} className="mb-2 text-gray-300" />
                  <p className="text-sm">No sales data available yet.</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Category Revenue Pie */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="mb-6 flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sales by Category</h3>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer>
                   <PieChart>
                      <Pie 
                         data={analytics?.categorySales || []} 
                         dataKey="revenue" 
                         nameKey="name" 
                         cx="50%" cy="50%" 
                         outerRadius={90} 
                         innerRadius={60} 
                         paddingAngle={2}
                      >
                         {(analytics?.categorySales || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        formatter={(value) => `₹${value.toLocaleString()}`}
                      />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                   </PieChart>
                </ResponsiveContainer>
             </div>
         </div>

         {/* Recent Activity */}
         <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-100 dark:border-emerald-800/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Status
               </span>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
               {activities.map((act, i) => (
                  <ActivityItem key={i} activity={act} />
               ))}
               {activities.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 pt-10">
                   <Zap size={32} className="mb-2 text-gray-300" />
                   <p className="text-sm">No recent activity found.</p>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
           <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h3>
           <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">View All <ArrowRight size={16}/></Link>
        </div>
        <div className="w-full overflow-x-auto custom-scrollbar">
           <table className="w-full text-left border-collapse min-w-[600px]">
             <thead>
               <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                 <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Order ID</th>
                 <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Customer</th>
                 <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date</th>
                 <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Total</th>
                 <th className="px-6 py-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
               {overview?.recentOrders?.map((order) => (
                 <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                   <td className="px-6 py-4 text-sm font-semibold text-primary-600 dark:text-primary-400">
                      <Link to={`/admin/orders/${order._id}`}>#{order.orderNumber}</Link>
                   </td>
                   <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-200">{order.customerName || "Guest"}</td>
                   <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                     {new Date(order.createdAt).toLocaleDateString()}
                   </td>
                   <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                     ₹{order.grandTotal?.toLocaleString()}
                   </td>
                   <td className="px-6 py-4">
                     <StatusBadge status={order.status} />
                   </td>
                 </tr>
               ))}
               {(!overview?.recentOrders || overview.recentOrders.length === 0) && (
                 <tr>
                   <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                     <Package size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                     No orders have been placed yet.
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
