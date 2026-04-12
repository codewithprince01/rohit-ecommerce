import { useState, useEffect, useMemo } from "react";
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  Users, CreditCard, Calendar, Filter, Download,
  ArrowRight, ArrowUpRight, PieChart as PieIcon,
  BarChart3, Activity, Target
} from "lucide-react";
import api from "../../services/api";

const AnalyticsCard = ({ title, value, subValue, icon: Icon, color, children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700">
    <div className="flex items-start justify-between mb-8">
      <div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white mt-2 font-display">{value}</h3>
        {subValue && (
          <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1">
            <TrendingUp size={12} /> {subValue}
          </p>
        )}
      </div>
      <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="h-48 w-full mt-4">
      {children}
    </div>
  </div>
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7days");
  const [data, setData] = useState({
    salesData: [],
    categorySales: [],
    orderStatusDistribution: [],
    paymentMethodDistribution: [],
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      conversionRate: "3.2%"
    }
  });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

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
        orderStatusDistribution: analytics.orderStatusDistribution || [],
        paymentMethodDistribution: analytics.paymentMethodDistribution || [],
        summary: {
          totalRevenue: overview.stats.revenue.total,
          totalOrders: overview.stats.orders.total,
          avgOrderValue: overview.stats.revenue.avgOrderValue,
          conversionRate: "4.8%" // Derived or hardcoded for now
        }
      });
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formattedSalesData = useMemo(() => {
    return data.salesData.map(item => ({
      name: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      revenue: item.revenue,
      orders: item.orders,
      aov: item.avgOrderValue
    }));
  }, [data.salesData]);

  const pieData = useMemo(() => {
    return data.categorySales.map(item => ({
      name: item.categoryName || 'Others',
      value: item.revenue
    }));
  }, [data.categorySales]);

  if (loading && !data.salesData.length) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
          <p className="font-black text-gray-400 uppercase tracking-widest animate-pulse">Analyzing Store Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white font-display tracking-tight">Financial Intelligence</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> Deep dive into your store's commercial performance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-gray-800 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex">
            {["7days", "30days", "1year"].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all ${
                  period === p 
                    ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20" 
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {p === "7days" ? "7D" : p === "30days" ? "30D" : "1Y"}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-600/30 hover:scale-105 active:scale-95 transition-all">
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <DollarSign size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Revenue</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-display">₹{data.summary.totalRevenue.toLocaleString()}</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> +12.5% <span className="text-gray-400 font-medium">vs prev. period</span>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Target size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Avg. Order Value</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-display">₹{data.summary.avgOrderValue.toLocaleString()}</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
              <TrendingUp size={14} /> +4.2% <span className="text-gray-400 font-medium">more profitable</span>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <ShoppingBag size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Orders</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-display">{data.summary.totalOrders} Units</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600">
              <Activity size={14} /> Peak <span className="text-gray-400 font-medium">@ 8:00 PM</span>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Users size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Store Conversion</p>
            <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-1 font-display">{data.summary.conversionRate}</h4>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-gray-400">
              High <span className="font-medium">Organic Traffic</span>
            </div>
         </div>
      </div>

      {/* Main Revenue Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white font-display tracking-tight">Revenue Dynamics</h3>
            <p className="text-gray-500 mt-1">Comparing total sales and order frequency over time</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-600" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Orders</span>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedSalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '24px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                  background: '#fff',
                  padding: '16px'
                }}
                itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4f46e5" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                animationDuration={2000}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#10b981" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorOrd)" 
                animationDuration={2500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categorized and Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Share */}
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white font-display">Department Share</h3>
               <p className="text-sm text-gray-500">Revenue split by product category</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <PieIcon size={20} />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-10 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div>
               <h3 className="text-xl font-black text-gray-900 dark:text-white font-display">Payment Intelligence</h3>
               <p className="text-sm text-gray-500">Most preferred transaction methods</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.paymentMethodDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="_id" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                />
                <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10b981" 
                  radius={[10, 10, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
            <BarChart3 size={32} className="text-indigo-300" />
          </div>
          <div>
            <h3 className="text-xl font-black font-display">Automated Insights</h3>
            <p className="text-indigo-200 text-sm mt-1 max-w-sm">Our AI engine detects that most customers buy <strong>Fruits</strong> after 6 PM. Consider running flash deals then.</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white text-indigo-900 font-black rounded-2xl text-sm flex items-center gap-2 hover:bg-indigo-50 transition-all">
          View Detail Reports <ArrowUpRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Analytics;
