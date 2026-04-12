import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Package,
  Truck,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  History
} from "lucide-react";
import api, { getImageUrl } from "../../services/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  Modal,
  Card,
  LoadingSpinner,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const ORDER_TABS = [
  { key: "all", label: "All Orders" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

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
    <Modal isOpen={isOpen} onClose={onClose} title={`Order Details #${order.orderNumber}`} size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Current Status</p>
            <div className="mt-1"><StatusBadge status={order.status} /></div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Order Date</p>
            <p className="text-sm font-semibold">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <User size={16} className="text-primary-500" /> Customer Info
            </h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p><span className="font-semibold text-gray-900 dark:text-white">Name:</span> {order.customerName}</p>
              <p><span className="font-semibold text-gray-900 dark:text-white">Phone:</span> {order.customerPhone}</p>
              <p><span className="font-semibold text-gray-900 dark:text-white">Email:</span> {order.customerEmail}</p>
            </div>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary-500" /> Shipping Address
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
              <br />
              {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>
        </div>

        <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase text-[10px]">Item</th>
                <th className="px-4 py-3 text-center font-bold text-gray-500 uppercase text-[10px]">Qty</th>
                <th className="px-4 py-3 text-right font-bold text-gray-500 uppercase text-[10px]">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-semibold">{item.name}</td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-bold">₹{item.price?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="w-48 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold">₹{order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-bold">₹{order.shippingCharge || 0}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary-600 text-lg">₹{order.grandTotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {nextStatuses[order.status]?.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-gray-100">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full sm:flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white dark:bg-gray-800"
            >
              <option value="">Update Order Status</option>
              {nextStatuses[order.status].map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={!newStatus || updating}
              className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              {updating ? <LoadingSpinner size="sm" /> : "Update Status"}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

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
      const params = new URLSearchParams({ page: currentPage, limit: itemsPerPage });
      if (activeTab !== "all") params.append("status", activeTab);
      if (searchQuery) params.append("search", searchQuery);

      const response = await api.get(`/orders?${params}`);
      setOrders(response.data.data || []);
      setTotalOrders(response.data.total || 0);
      setTotalPages(response.data.pages || 1);
      if (response.data.counts) setTabCounts(response.data.counts);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");
      fetchOrders();
    } catch (error) {
      toast.error("Failed to update status");
      throw error;
    }
  };

  const columns = [
    {
      header: "Order ID",
      render: (order) => (
        <div>
          <p className="font-bold text-primary-600">#{order.orderNumber}</p>
          <p className="text-[10px] text-gray-500 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (order) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-primary-600">
            {order.customerName?.charAt(0)}
          </div>
          <span className="text-sm font-semibold">{order.customerName}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (order) => <span className="font-bold">₹{order.grandTotal?.toLocaleString()}</span>,
    },
    {
      header: "Status",
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      header: "Actions",
      align: "right",
      render: (order) => (
        <button
          onClick={() => setSelectedOrder(order)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-primary-600 hover:text-white rounded-lg text-xs font-bold transition-all"
        >
          <Eye size={14} /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500">Manage all store orders from here</p>
        </div>
        <button onClick={fetchOrders} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {ORDER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
              activeTab === tab.key
                ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {tab.label} {tabCounts[tab.key] !== undefined && `(${tabCounts[tab.key]})`}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-medium focus:ring-0 outline-none"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={orders} loading={loading} onRowClick={setSelectedOrder} emptyMessage="No orders found." />
        {totalOrders > 0 && (
          <div className="px-6 py-4 border-t border-gray-50">
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalOrders} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <OrderDetailModal order={selectedOrder} isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
};

export default Orders;
