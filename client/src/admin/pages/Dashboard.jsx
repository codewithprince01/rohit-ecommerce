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
  Clock,
  UserPlus,
  RefreshCcw,
  LayoutGrid,
  Zap,
  Target
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from "recharts";
import api, { getImageUrl } from "../../services/api";
import toast from "react-hot-toast";

const COLORS = ['#2fab73', '#4f46e5', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

// --- Sub-components ---

const StatCard = ({ title, value, change, changeType, icon: Icon, color, loading }) => {
  const colorClasses = {
    green: "from-emerald-500 to-emerald-600 shadow-emerald-500/30",
    blue: "from-primary-500 to-primary-600 shadow-primary-500/30",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/30",
    purple: "from-violet-600 to-violet-700 shadow-violet-600/30",
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
            {title}
          </p>
          <h3 className="text-4xl font-black text-gray-950 tracking-tighter leading-none">
            {loading ? <div className="h-10 w-24 bg-gray-50 rounded-lg animate-pulse" /> : value}
          </h3>
          {change && (
            <div className={`flex items-center gap-1 mt-4 px-3 py-1 rounded-full w-fit text-[10px] font-black uppercase tracking-tight ${
              changeType === "positive" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
            }`}>
              {changeType === "positive" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${colorClasses[color]} shadow-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-500`}>
          <Icon size={28} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }) => {
  const icons = {
    order: { icon: ShoppingCart, color: "bg-primary-50 text-primary-600" },
    customer: { icon: UserPlus, color: "bg-indigo-50 text-indigo-600" },
    product: { icon: Package, color: "bg-orange-50 text-orange-600" },
  };
  const { icon: Icon, color } = icons[activity.type] || icons.order;

  return (
    <div className="flex gap-5 p-5 hover:bg-gray-50 rounded-[1.5rem] transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${color} group-hover:scale-110 transition-transform`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-black text-gray-900 truncate tracking-tight">
            {activity.message}
          </p>
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest italic">
          {activity.email || activity.sku || (activity.amount ? `₹${activity.amount.toLocaleString()}` : "System Event")}
        </p>
      </div>
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
    <div className="space-y-12 pb-20">
      {/* Dynamic Header Deck */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div>
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4rem] mb-4 block">Engine Core v3.0</span>
          <h1 className="text-5xl font-black text-gray-950 tracking-tighter font-display leading-none">Command <br/><span className="text-gray-300">Center.</span></h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white p-1.5 rounded-[1.5rem] border-2 border-gray-50 flex gap-1">
              {["7days", "30days", "90days"].map(p => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                    activePeriod === p ? "bg-gray-950 text-white shadow-xl" : "text-gray-400 hover:text-gray-950"
                  }`}
                >
                  {p.replace('days', 'D')}
                </button>
              ))}
           </div>
           <button onClick={fetchDashboardData} className="p-4 bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all">
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard
          title="Global Revenue"
          value={`₹${(overview?.stats?.revenue?.total || 0).toLocaleString()}`}
          change="+18.4%"
          changeType="positive"
          icon={DollarSign}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Market Orders"
          value={overview?.stats?.orders?.total || 0}
          change="+4.2%"
          changeType="positive"
          icon={ShoppingCart}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Stock Alerts"
          value={overview?.stats?.products?.lowStock || 0}
          change="-2"
          changeType="positive" // Less low stock is good
          icon={AlertTriangle}
          color="orange"
          loading={loading}
        />
        <StatCard
          title="User Base"
          value={overview?.stats?.customers?.total || 0}
          change="+100%"
          changeType="positive"
          icon={UserPlus}
          color="purple"
          loading={loading}
        />
      </div>

      {/* Main Analytics Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Performance */}
        <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
           <div className="mb-10 flex items-center justify-between">
              <div>
                  <h3 className="text-xl font-black text-gray-950 tracking-tight font-display italic">Revenue Performance.</h3>
                  <p className="text-xs font-black text-gray-300 uppercase tracking-widest mt-1">Transaction growth metrics</p>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Orders</span>
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer>
                 <AreaChart data={salesData}>
                    <defs>
                       <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2fab73" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2fab73" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px 24px' }} 
                       labelStyle={{ fontWeight: 900, color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2fab73" strokeWidth={5} fill="url(#revGradient)" />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Hot Sellers */}
        <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
           <div className="mb-10 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-950 tracking-tight font-display italic">Leaderboard.</h3>
              <Link to="/admin/products" className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-950 hover:text-white transition-all"><ArrowRight size={18} /></Link>
           </div>
           <div className="space-y-4">
              {overview?.topProducts?.map((p, i) => (
                 <div key={p._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-[1.5rem] group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50">
                    <div className="w-14 h-14 bg-white rounded-2xl p-2 border border-gray-100 flex items-center justify-center overflow-hidden">
                       <img src={getImageUrl(p.thumbnail || p.images?.[0])} alt={p.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-black text-gray-900 truncate tracking-tight uppercase leading-none">{p.name}</p>
                       <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1.5 italic">₹{p.price}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-black text-gray-950">{p.totalSold}</span>
                       <span className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">Velocity</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* NEW: Hierarchy Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Category Distribution */}
         <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
             <div className="mb-10 flex items-center gap-3">
                <LayoutGrid size={24} className="text-indigo-600" />
                <div>
                   <h3 className="text-xl font-black text-gray-950 tracking-tight font-display italic">Category Distribution.</h3>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Revenue by Master Department</p>
                </div>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer>
                   <PieChart>
                      <Pie 
                         data={analytics?.categorySales || []} 
                         dataKey="revenue" 
                         nameKey="name" 
                         cx="50%" cy="50%" 
                         outerRadius={80} 
                         innerRadius={60} 
                         paddingAngle={5}
                      >
                         {(analytics?.categorySales || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                      />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                   </PieChart>
                </ResponsiveContainer>
             </div>
         </div>

         {/* Subcategory Insights */}
         <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
             <div className="mb-10 flex items-center gap-3">
                <Target size={24} className="text-orange-500" />
                <div>
                   <h3 className="text-xl font-black text-gray-950 tracking-tight font-display italic">Sub-Collection Velocity.</h3>
                   <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Performance by Level 2 Taxonomy</p>
                </div>
             </div>
             <div className="space-y-6">
                {(analytics?.subcategorySales || []).slice(0, 4).map((sub, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub.name}</span>
                         <span className="text-xs font-black text-gray-950 italic">₹{sub.revenue.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                         <div 
                            className="h-full bg-orange-500 rounded-full transition-all duration-1000" 
                            style={{ width: `${(sub.revenue / (analytics.subcategorySales[0]?.revenue || 1)) * 100}%` }} 
                         />
                      </div>
                   </div>
                ))}
             </div>
         </div>
      </div>

      {/* Activity Feed and Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white rounded-[3.5rem] p-10 shadow-2xl shadow-gray-200/50 border border-gray-100">
            <div className="flex items-center justify-between mb-10 px-2">
               <div>
                  <h3 className="text-xl font-black text-gray-950 tracking-tight font-display italic">Recent Pulses.</h3>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Latest system interactions</p>
               </div>
               <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-widest animate-pulse">SYSTEM LIVE</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {activities.map((act, i) => (
                  <ActivityItem key={i} activity={act} />
               ))}
            </div>
         </div>
         
         <div className="bg-gray-950 rounded-[3.5rem] p-10 shadow-2xl shadow-gray-200/50 flex flex-col justify-between text-white relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-600/20 blur-[80px] rounded-full group-hover:bg-primary-600/40 transition-all duration-1000" />
            <div className="relative z-10">
               <Zap size={40} className="text-primary-500 mb-8" fill="currentColor" />
               <h3 className="text-3xl font-black tracking-tighter mb-4 leading-none">System <br/>Integrity.</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Hierarchy Depth</span>
                     <span className="text-xs font-black text-primary-500 uppercase">3 Levels</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Indexing Speed</span>
                     <span className="text-xs font-black text-primary-500 uppercase">Real-time</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Search Engine</span>
                     <span className="text-xs font-black text-primary-500 uppercase">Elastic Filter</span>
                  </div>
               </div>
            </div>
            <div className="relative z-10 pt-10">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">System backbone is currently optimized for deep taxonomy traversal and rapid commercial fulfillment.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
