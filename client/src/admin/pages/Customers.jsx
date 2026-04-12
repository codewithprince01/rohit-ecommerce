import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Users,
  ShoppingCart,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Eye,
  MoreHorizontal,
  Download,
  RefreshCw,
  Star,
  Wallet,
  Package,
} from "lucide-react";
import api from "../../utils/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  Modal,
  Card,
  CardHeader,
  EmptyState,
} from "../components/AdminUI";
import toast from "react-hot-toast";

// Customer Detail Modal
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
      const response = await api.get(
        `/orders?customer=${customer._id}&limit=5`,
      );
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!customer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Details" size="lg">
      <div className="space-y-6">
        {/* Customer Header */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {customer.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {customer.name}
            </h3>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail size={14} />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={14} />
                  {customer.phone}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={customer.isActive ? "active" : "inactive"} />
              {customer.isVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Star size={12} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
            <ShoppingCart className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.totalOrders || 0}
            </p>
            <p className="text-xs text-gray-500">Total Orders</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
            <Wallet className="mx-auto mb-2 text-emerald-600" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₹{customer.totalSpent?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-gray-500">Total Spent</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
            <Star className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {customer.loyaltyPoints || 0}
            </p>
            <p className="text-xs text-gray-500">Loyalty Points</p>
          </div>
        </div>

        {/* Addresses */}
        {customer.addresses && customer.addresses.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Saved Addresses
            </h4>
            <div className="space-y-3">
              {customer.addresses.map((address, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <MapPin size={18} className="text-gray-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {address.label || `Address ${idx + 1}`}
                    </p>
                    <p className="text-gray-500">
                      {address.addressLine1}, {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </p>
                  </div>
                  {address.isDefault && (
                    <span className="ml-auto text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Recent Orders
          </h4>
          {loadingOrders ? (
            <div className="text-center py-4 text-gray-500">
              Loading orders...
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-2">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                      <Package size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-600">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{order.grandTotal?.toLocaleString()}
                    </p>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No orders yet
            </p>
          )}
        </div>

        {/* Member Since */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={14} />
          <span>
            Member since {new Date(customer.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Modal>
  );
};

// Customer Stats
const CustomerStats = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      {
        label: "Total Customers",
        value: stats.total,
        icon: Users,
        color: "bg-blue-500",
      },
      {
        label: "Active Customers",
        value: stats.active,
        icon: Users,
        color: "bg-emerald-500",
      },
      {
        label: "New This Month",
        value: stats.newThisMonth,
        icon: Users,
        color: "bg-indigo-500",
      },
      {
        label: "Top Spenders",
        value: stats.topSpenders,
        icon: Star,
        color: "bg-amber-500",
      },
    ].map((stat, idx) => (
      <div
        key={idx}
        className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${stat.color}`}>
            <stat.icon size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Main Customers Component
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    topSpenders: 0,
  });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter === "active") params.append("isActive", "true");
      if (statusFilter === "inactive") params.append("isActive", "false");

      // Use the customers endpoint for proper customer data with order stats
      const [customersResponse, statsResponse] = await Promise.all([
        api.get(`/customers?${params}`).catch(() => ({ data: { data: [] } })),
        api.get("/customers/stats").catch(() => ({ data: {} })),
      ]);

      const data = customersResponse.data;
      const customersList = data.data || [];

      setCustomers(customersList);
      setTotalCustomers(data.total || customersList.length);
      setTotalPages(
        Math.ceil((data.total || customersList.length) / itemsPerPage),
      );

      // Use stats from backend
      const backendStats = statsResponse.data;
      setStats({
        total: backendStats.total || data.total || customersList.length,
        active:
          backendStats.active ||
          customersList.filter((c) => c.isActive !== false).length,
        newThisMonth: backendStats.newThisMonth || 0,
        topSpenders: backendStats.topSpenders || 0,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomers([]);
      setStats({ total: 0, active: 0, newThisMonth: 0, topSpenders: 0 });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: "Customer",
      render: (customer) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {customer.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white">
              {customer.name}
            </p>
            <p className="text-sm text-gray-500 truncate">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Phone",
      render: (customer) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {customer.phone || "—"}
        </span>
      ),
    },
    {
      header: "Orders",
      render: (customer) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {customer.totalOrders || 0}
        </span>
      ),
    },
    {
      header: "Total Spent",
      render: (customer) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          ₹{(customer.totalSpent || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Points",
      render: (customer) => (
        <span className="text-sm text-amber-600 font-medium">
          {customer.loyaltyPoints || 0} pts
        </span>
      ),
    },
    {
      header: "Status",
      render: (customer) => (
        <StatusBadge
          status={customer.isActive !== false ? "active" : "inactive"}
        />
      ),
    },
    {
      header: "Joined",
      render: (customer) => (
        <span className="text-sm text-gray-500">
          {new Date(customer.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (customer) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCustomer(customer);
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <Eye size={16} className="text-gray-500" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Customers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer base and view their activity
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      {/* Stats */}
      <CustomerStats stats={stats} />

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setStatusFilter(filter.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === filter.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {filter.label}
              </button>
            ))}

            <button
              onClick={fetchCustomers}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      </Card>

      {/* Customers Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={customers}
          loading={loading}
          onRowClick={(customer) => setSelectedCustomer(customer)}
          emptyMessage="No customers found. Customers will appear here once they sign up."
        />

        {totalCustomers > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCustomers}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </div>
  );
};

export default Customers;
