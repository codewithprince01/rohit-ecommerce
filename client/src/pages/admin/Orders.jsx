import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Eye,
  MoreHorizontal,
  Calendar,
  Download,
  RefreshCw,
  ChevronDown,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import api from "../../utils/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  Modal,
  Card,
  CardHeader,
  LoadingSpinner,
} from "../../components/admin/AdminUI";
import toast from "react-hot-toast";

// Order Status Tabs
const ORDER_TABS = [
  { key: "all", label: "All Orders", count: null },
  { key: "pending", label: "Pending", count: null, color: "bg-yellow-500" },
  { key: "confirmed", label: "Confirmed", count: null, color: "bg-blue-500" },
  {
    key: "processing",
    label: "Processing",
    count: null,
    color: "bg-indigo-500",
  },
  { key: "shipped", label: "Shipped", count: null, color: "bg-cyan-500" },
  {
    key: "delivered",
    label: "Delivered",
    count: null,
    color: "bg-emerald-500",
  },
  { key: "cancelled", label: "Cancelled", count: null, color: "bg-red-500" },
];

// Order Timeline Component
const OrderTimeline = ({ order }) => {
  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "packed",
    "shipped",
    "delivered",
  ];
  const currentIndex = statuses.indexOf(order.status);

  if (order.status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle size={18} />
        <span className="text-sm font-medium">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {statuses.map((status, idx) => (
        <div key={status} className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full ${idx <= currentIndex ? "bg-emerald-500" : "bg-gray-300"}`}
          />
          {idx < statuses.length - 1 && (
            <div
              className={`w-6 h-0.5 ${idx < currentIndex ? "bg-emerald-500" : "bg-gray-300"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Order Detail Modal
const OrderDetailModal = ({ order, isOpen, onClose, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const nextStatuses = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["packed", "cancelled"],
    packed: ["shipped", "cancelled"],
    shipped: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await onUpdateStatus(order._id, newStatus);
      setNewStatus("");
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${order.orderNumber}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Order Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Status</p>
            <StatusBadge status={order.status} size="lg" />
          </div>
          <OrderTimeline order={order} />
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Customer Details
            </h4>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Name:</span>{" "}
                <span className="font-medium">{order.customerName}</span>
              </p>
              <p>
                <span className="text-gray-500">Phone:</span>{" "}
                <span className="font-medium">{order.customerPhone}</span>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{" "}
                <span className="font-medium">
                  {order.customerEmail || "N/A"}
                </span>
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Shipping Address
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.shippingAddress?.addressLine1}
              <br />
              {order.shippingAddress?.addressLine2 && (
                <>
                  {order.shippingAddress.addressLine2}
                  <br />
                </>
              )}
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
              <br />
              {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Order Items
          </h4>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Item
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package
                              size={20}
                              className="text-gray-400 m-auto mt-2"
                            />
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      ₹{item.price?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      ₹{item.subtotal?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">
                ₹{order.subtotal?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="font-medium">₹{order.shippingCharge || 0}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                ₹{order.grandTotal?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Update Status */}
        {nextStatuses[order.status]?.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">Update Status:</span>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select new status</option>
              {nextStatuses[order.status].map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={!newStatus || updating}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {updating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <ArrowRight size={16} />
              )}
              Update
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Main Orders Component
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tabCounts, setTabCounts] = useState({});
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, activeTab, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (activeTab !== "all") params.append("status", activeTab);
      if (searchQuery) params.append("search", searchQuery);

      const response = await api.get(`/orders?${params}`);
      const data = response.data;

      setOrders(data.data || []);
      setTotalOrders(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));

      // Update tab counts if provided
      if (data.counts) {
        setTabCounts(data.counts);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update order status");
      throw error;
    }
  };

  const columns = [
    {
      header: "Order",
      render: (order) => (
        <div>
          <p className="font-semibold text-indigo-600">#{order.orderNumber}</p>
          <p className="text-xs text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (order) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {order.customerName?.charAt(0)?.toUpperCase() || "G"}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {order.customerName || "Guest"}
            </p>
            <p className="text-xs text-gray-500">{order.customerPhone}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Items",
      render: (order) => (
        <span className="text-sm text-gray-600">
          {order.items?.length || 0} items
        </span>
      ),
    },
    {
      header: "Amount",
      render: (order) => (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            ₹{order.grandTotal?.toLocaleString()}
          </p>
          <StatusBadge status={order.paymentStatus || "pending"} size="sm" />
        </div>
      ),
    },
    {
      header: "Status",
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      header: "Source",
      render: (order) => (
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
          {order.source || "website"}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (order) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(order);
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
            Orders
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and track your orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {ORDER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {tab.color && (
              <div className={`w-2 h-2 rounded-full ${tab.color}`} />
            )}
            {tab.label}
            {tabCounts[tab.key] !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? "bg-white/20"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Calendar size={18} className="text-gray-500" />
              <span>Date Range</span>
            </button>
            <button
              onClick={fetchOrders}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          onRowClick={(order) => setSelectedOrder(order)}
          emptyMessage="No orders found"
        />

        {totalOrders > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalOrders}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Orders;
