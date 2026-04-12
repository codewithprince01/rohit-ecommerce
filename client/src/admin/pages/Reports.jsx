import { useState, useEffect } from "react";
import {
  FileText,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  Download,
  Calendar,
  RefreshCw,
  ShoppingBag,
  Users,
  DollarSign
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import api from "../../services/api";
import { DataTable, Card } from "../components/AdminUI";
import toast from "react-hot-toast";

const Reports = () => {
  const [activeReport, setActiveReport] = useState("sales");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const COLORS = ['#2fab73', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchReport();
  }, [activeReport, dateRange]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      let endpoint = `/reports/${activeReport}`;
      if (dateRange.start || dateRange.end) {
        endpoint += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
      }
      const response = await api.get(endpoint);
      setData(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const salesChartData = activeReport === "sales" ? data.map(item => ({
    name: item._id,
    revenue: item.revenue,
    orders: item.orders
  })) : [];

  const productColumns = [
    { header: "Product Name", render: (p) => <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{p.name}</span> },
    { header: "Units Sold", render: (p) => <span className="font-bold text-gray-700 dark:text-gray-300">{p.soldCount}</span> },
    { header: "Total Revenue", render: (p) => <span className="font-bold text-primary-600">₹{p.revenue?.toLocaleString()}</span> },
  ];

  const customerColumns = [
    { header: "Customer", render: (c) => <div className="flex flex-col"><span className="text-sm font-bold text-gray-900 dark:text-gray-100">{c.name}</span><span className="text-[10px] text-gray-400 dark:text-gray-500">{c.email}</span></div> },
    { header: "Orders", render: (c) => <span className="font-bold text-gray-700 dark:text-gray-300">{c.orderCount}</span> },
    { header: "Total Spent", render: (c) => <span className="font-bold text-primary-600">₹{c.totalSpent?.toLocaleString()}</span> },
    { header: "Last Activity", render: (c) => <span className="text-xs text-gray-500 dark:text-gray-400">{c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "Never"}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Reports</h1>
          <p className="text-sm text-gray-500">Analyze your store's commercial performance</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={fetchReport} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
           <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold"><Download size={16} /> Export CSV</button>
        </div>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
         {[
           { id: "sales", label: "Sales Review", icon: DollarSign },
           { id: "products", label: "Inventory Performance", icon: ShoppingBag },
           { id: "customers", label: "User Engagement", icon: Users },
         ].map(tab => (
           <button
             key={tab.id}
             onClick={() => setActiveReport(tab.id)}
             className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
               activeReport === tab.id
               ? "bg-gray-900 dark:bg-primary-600 text-white border-gray-900 dark:border-primary-600 shadow-lg"
               : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
             }`}
           >
             <tab.icon size={16} /> {tab.label}
           </button>
         ))}
      </div>

      {activeReport === "sales" && (
        <div className="grid grid-cols-1 gap-6">
           <Card className="p-6">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Revenue & Orders Trend</h3>
                 <div className="flex items-center gap-2">
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold" />
                    <span className="text-gray-400">to</span>
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="px-3 py-1.5 border border-gray-100 rounded-lg text-[10px] font-bold" />
                 </div>
              </div>
              <div className="h-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesChartData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                       <Tooltip />
                       <Bar dataKey="revenue" fill="#2fab73" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </Card>
        </div>
      )}

      {activeReport === "products" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
           <div className="p-6 border-b border-gray-50"><h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Best Selling Products</h3></div>
           <DataTable columns={productColumns} data={data} loading={loading} emptyMessage="No product sales data available." />
        </div>
      )}

      {activeReport === "customers" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
           <div className="p-6 border-b border-gray-50"><h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Top Store Customers</h3></div>
           <DataTable columns={customerColumns} data={data} loading={loading} emptyMessage="No customer engagement data available." />
        </div>
      )}
    </div>
  );
};

export default Reports;
