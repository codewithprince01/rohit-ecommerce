import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Eye,
  RefreshCw,
  User,
  MapPin,
  ShoppingBag,
  TrendingUp,
  Star
} from "lucide-react";
import api from "../../services/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  Modal,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const CustomerDetailModal = ({ customer, isOpen, onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (customer && isOpen) {
      fetchCustomerOrders();
    }
  }, [customer, isOpen]);

  const fetchCustomerOrders = async () => {
    if (!customer) return;
    setLoadingOrders(true);
    try {
      const response = await api.get(`/customers/${customer._id}/orders?limit=5`);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Profile" size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {customer.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{customer.name}</h3>
            <div className="flex gap-4 mt-1 text-xs text-gray-500 font-bold uppercase tracking-wider">
               <span className="flex items-center gap-1"><Mail size={12} /> {customer.email}</span>
               <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone || "No Phone"}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {[
             { label: "Total Orders", value: customer.totalOrders || 0, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
             { label: "Total Spent", value: `₹${(customer.totalSpent || 0).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
             { label: "Loyalty Points", value: customer.loyaltyPoints || 0, icon: Star, color: "text-amber-600 bg-amber-50" },
           ].map((stat, i) => (
             <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center space-y-1 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}><stat.icon size={20} /></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
             </div>
           ))}
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Recent Transactions</h4>
          <div className="space-y-2">
            {loadingOrders ? (
              <div className="py-8 text-center"><LoadingSpinner size="md" /></div>
            ) : orders.length > 0 ? (
              orders.map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-primary-600">#{order.orderNumber}</span>
                    <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">₹{order.grandTotal?.toLocaleString()}</span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-gray-400">No transactions found</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, newThisMonth: 0 });

  useEffect(() => { fetchCustomers(); }, [currentPage, searchQuery, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("isActive", statusFilter === "active");

      const [customersRes, statsRes] = await Promise.all([
        api.get(`/customers?${params}`),
        api.get("/customers/stats")
      ]);

      setCustomers(customersRes.data.data || []);
      setTotalCustomers(customersRes.data.total || 0);
      setTotalPages(customersRes.data.pages || 1);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load customer registry");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Customer Name",
      render: (customer) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-primary-600">
            {customer.name?.charAt(0)}
          </div>
          <div className="min-w-0">
             <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{customer.name}</p>
             <p className="text-[10px] text-gray-400 font-medium truncate">{customer.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Phone", render: (customer) => <span className="text-xs font-semibold">{customer.phone || "—"}</span> },
    { header: "Total Orders", render: (customer) => <span className="text-sm font-bold">{customer.totalOrders || 0}</span> },
    { header: "Net Spent", render: (customer) => <span className="text-sm font-bold text-primary-600">₹{(customer.totalSpent || 0).toLocaleString()}</span> },
    { header: "Status", render: (customer) => <StatusBadge status={customer.isActive !== false ? "active" : "inactive"} /> },
    { header: "Joined On", render: (customer) => <span className="text-xs text-gray-400">{new Date(customer.createdAt).toLocaleDateString()}</span> },
    {
      header: "Actions",
      align: "right",
      render: (customer) => (
        <button onClick={() => setSelectedCustomer(customer)} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-primary-600 hover:text-white rounded-lg text-xs font-bold transition-all">
          <Eye size={14} /> Profile
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Customer Registry</h1>
          <p className="text-sm text-gray-500">View and manage your store customers</p>
        </div>
        <button onClick={fetchCustomers} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {[
           { label: "Total Registry", value: stats.total, color: "text-blue-600 bg-blue-50" },
           { label: "Active Users", value: stats.active, color: "text-emerald-600 bg-emerald-50" },
           { label: "New Leads (M)", value: stats.newThisMonth, color: "text-purple-600 bg-purple-50" },
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
              <span className={`text-xl font-black ${stat.color} px-4 py-1 rounded-lg`}>{stat.value}</span>
           </div>
         ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name, email or phone..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-medium outline-none" />
        </div>
        <div className="flex items-center gap-2">
           {["all", "active", "inactive"].map(f => (
             <button key={f} onClick={() => { setStatusFilter(f); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all ${statusFilter === f ? "bg-primary-600 border-primary-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50"}`}>
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={customers} loading={loading} onRowClick={setSelectedCustomer} emptyMessage="No customers found in your store registry." />
        {totalCustomers > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalCustomers} itemsPerPage={10} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <CustomerDetailModal customer={selectedCustomer} isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} />
    </div>
  );
};

export default Customers;
