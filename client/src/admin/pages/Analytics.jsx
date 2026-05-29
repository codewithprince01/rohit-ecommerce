import { useState, useEffect, useMemo } from "react";
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, DollarSign, ShoppingBag, Users, Activity, Target, Download, RefreshCw
} from "lucide-react";
import api from "../../services/api";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7days");
  const [data, setData] = useState({
    salesData: [],
    categorySales: [],
    summary: { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalCustomers: 0 },
    paymentMethodDistribution: []
  });

  const COLORS = ['#2fab73', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => { fetchAnalytics(); }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, overviewRes] = await Promise.all([
        api.get(`/admin/dashboard/analytics/sales?period=${period}`),
        api.get("/admin/dashboard")
      ]);
      const analytics = analyticsRes.data.data;
      const overview = overviewRes.data.data;

      setData({
        salesData: analytics.salesData || [],
        categorySales: analytics.categorySales || [],
        summary: {
          totalRevenue: overview.stats.revenue.total,
          totalOrders: overview.stats.orders.total,
          avgOrderValue: overview.stats.revenue.avgOrderValue,
          totalCustomers: overview.stats.customers.total
        },
        paymentMethodDistribution: analytics.paymentMethodDistribution || []
      });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const salesChartData = useMemo(() => data.salesData.map(item => ({
    name: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    revenue: item.revenue
  })), [data.salesData]);

  const categoryChartData = useMemo(() => data.categorySales.map(item => ({
    name: item.name || 'Others',
    value: item.revenue
  })), [data.categorySales]);

  const paymentChartData = useMemo(() => data.paymentMethodDistribution.map(item => ({
    name: item._id === 'cod' ? 'Cash on Delivery' : item._id === 'online' ? 'Online Payment' : item._id,
    value: item.count
  })), [data.paymentMethodDistribution]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Store Analytics</h1>
          <p className="text-sm text-gray-500">Overview of your store performance</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700">
           {["7days", "30days", "1year"].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${period === p ? "bg-primary-600 text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}`}>
                {p === "7days" ? "7 Days" : p === "30days" ? "30 Days" : "1 Year"}
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: "Total Revenue", value: `₹${data.summary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400" },
           { label: "Total Orders", value: data.summary.totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" },
           { label: "Avg Order Value", value: `₹${data.summary.avgOrderValue.toLocaleString()}`, icon: Target, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" },
           { label: "Active Customers", value: data.summary.totalCustomers, icon: Users, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" },
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm">
              <div className={`p-3 rounded-lg ${stat.color}`}><stat.icon size={20} /></div>
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase">{stat.label}</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Revenue Over Time</h3>
        <div className="h-72 w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                 <Tooltip />
                 <Area type="monotone" dataKey="revenue" stroke="#2fab73" strokeWidth={3} fillOpacity={0.1} fill="#2fab73" />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Category Revenue</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={categoryChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {categoryChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider">Payment Methods</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={paymentChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {paymentChartData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                     </Pie>
                     <Tooltip />
                     <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Analytics;
