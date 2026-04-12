import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Upload,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye,
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
} from "../components/AdminUI";
import toast from "react-hot-toast";

// Stock Adjustment Modal
const StockAdjustmentModal = ({ product, isOpen, onClose, onSave }) => {
  const [adjustment, setAdjustment] = useState({
    type: "add", // add, remove, set
    quantity: 0,
    reason: "",
    batchNumber: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (adjustment.quantity <= 0 && adjustment.type !== "set") {
      toast.error("Quantity must be greater than 0");
      return;
    }

    setLoading(true);
    try {
      await onSave(product._id, adjustment);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const newStock =
    adjustment.type === "add"
      ? (product?.stock || 0) + adjustment.quantity
      : adjustment.type === "remove"
        ? Math.max(0, (product?.stock || 0) - adjustment.quantity)
        : adjustment.quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adjust Stock" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Product Info */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg overflow-hidden">
            {product?.images?.[0]?.url || product?.thumbnail ? (
              <img
                src={product?.images?.[0]?.url || product?.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-full h-full p-4 text-gray-400" />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {product?.name}
            </h4>
            <p className="text-sm text-gray-500">
              SKU: {product?.sku || "N/A"}
            </p>
            <p className="text-sm text-gray-500">
              Current Stock:{" "}
              <span className="font-semibold">{product?.stock || 0}</span>
            </p>
          </div>
        </div>

        {/* Adjustment Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Adjustment Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                value: "add",
                label: "Add Stock",
                icon: TrendingUp,
                color: "text-emerald-600 bg-emerald-50 border-emerald-200",
              },
              {
                value: "remove",
                label: "Remove",
                icon: TrendingDown,
                color: "text-red-600 bg-red-50 border-red-200",
              },
              {
                value: "set",
                label: "Set Count",
                icon: Package,
                color: "text-indigo-600 bg-indigo-50 border-indigo-200",
              },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setAdjustment({ ...adjustment, type: type.value })
                }
                className={`p-3 rounded-xl border-2 transition-all ${
                  adjustment.type === type.value
                    ? type.color
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <type.icon size={20} className="mx-auto mb-1" />
                <span className="text-xs font-medium">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {adjustment.type === "set" ? "New Stock Count" : "Quantity"}
          </label>
          <input
            type="number"
            min="0"
            value={adjustment.quantity}
            onChange={(e) =>
              setAdjustment({
                ...adjustment,
                quantity: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
          />
        </div>

        {/* New Stock Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between">
          <span className="text-sm text-gray-500">New Stock Level:</span>
          <span
            className={`text-2xl font-bold ${newStock <= 0 ? "text-red-600" : newStock <= 10 ? "text-orange-600" : "text-emerald-600"}`}
          >
            {newStock}
          </span>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Reason / Notes
          </label>
          <select
            value={adjustment.reason}
            onChange={(e) =>
              setAdjustment({ ...adjustment, reason: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
          >
            <option value="">Select reason</option>
            <option value="purchase">New Purchase / Restocking</option>
            <option value="return">Customer Return</option>
            <option value="damaged">Damaged / Expired</option>
            <option value="correction">Inventory Correction</option>
            <option value="transfer">Warehouse Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Batch & Expiry (for Add) */}
        {adjustment.type === "add" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                value={adjustment.batchNumber}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, batchNumber: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                value={adjustment.expiryDate}
                onChange={(e) =>
                  setAdjustment({ ...adjustment, expiryDate: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            Update Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Inventory Stats Cards
const InventoryStats = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[
      {
        label: "Total Products",
        value: stats.totalProducts,
        icon: Package,
        color: "bg-blue-500",
      },
      {
        label: "Low Stock",
        value: stats.lowStock,
        icon: AlertTriangle,
        color: "bg-orange-500",
      },
      {
        label: "Out of Stock",
        value: stats.outOfStock,
        icon: AlertTriangle,
        color: "bg-red-500",
      },
      {
        label: "Expiring Soon",
        value: stats.expiringSoon,
        icon: Clock,
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

// Main Inventory Component
const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all, low, out
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [adjustmentModal, setAdjustmentModal] = useState({
    isOpen: false,
    product: null,
  });
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
  });
  const itemsPerPage = 15;

  useEffect(() => {
    fetchInventory();
  }, [currentPage, searchQuery, stockFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (stockFilter === "low") params.append("lowStock", "true");
      if (stockFilter === "out") params.append("outOfStock", "true");

      const response = await api.get(`/products?${params}`);
      const data = response.data;

      const productsList = data.data || data.products || [];
      setProducts(productsList);
      setTotalProducts(data.total || productsList.length);
      setTotalPages(
        Math.ceil((data.total || productsList.length) / itemsPerPage),
      );

      // Calculate stats
      setStats({
        totalProducts: data.total || productsList.length,
        lowStock: productsList.filter(
          (p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10),
        ).length,
        outOfStock: productsList.filter((p) => p.stock <= 0).length,
        expiringSoon: productsList.filter((p) => {
          if (!p.expiryDate) return false;
          const daysUntilExpiry = Math.ceil(
            (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
          );
          return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length,
      });
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (productId, adjustment) => {
    try {
      // Use the inventory endpoint for proper stock adjustment with logging
      await api.put(`/inventory/${productId}/adjust`, adjustment);
      toast.success("Stock updated successfully");
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stock");
      throw error;
    }
  };

  const columns = [
    {
      header: "Product",
      render: (product) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
            {product.images?.[0]?.url || product.thumbnail ? (
              <img
                src={product.images?.[0]?.url || product.thumbnail}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Package size={24} className="text-gray-400 m-auto mt-3" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
              {product.name}
            </p>
            <p className="text-xs text-gray-500">SKU: {product.sku || "N/A"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      render: (product) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {product.category?.name || "Uncategorized"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (product) => (
        <span className="font-medium text-gray-900 dark:text-white">
          ₹{product.price?.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Stock",
      render: (product) => {
        const stock = product.stock ?? 0;
        const threshold = product.lowStockThreshold ?? 10;
        let colorClass = "text-emerald-600 bg-emerald-50";
        if (stock <= 0) colorClass = "text-red-600 bg-red-50";
        else if (stock <= threshold)
          colorClass = "text-orange-600 bg-orange-50";

        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full font-semibold text-sm ${colorClass}`}
          >
            {stock} units
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (product) => {
        const stock = product.stock ?? 0;
        const threshold = product.lowStockThreshold ?? 10;
        let status = "in_stock";
        if (stock <= 0) status = "out_of_stock";
        else if (stock <= threshold) status = "low_stock";

        return <StatusBadge status={status} />;
      },
    },
    {
      header: "Expiry",
      render: (product) => {
        if (!product.expiryDate)
          return <span className="text-gray-400">—</span>;

        const daysUntilExpiry = Math.ceil(
          (new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24),
        );
        let colorClass = "text-gray-600";
        if (daysUntilExpiry <= 0) colorClass = "text-red-600";
        else if (daysUntilExpiry <= 30) colorClass = "text-orange-600";

        return (
          <span className={`text-sm ${colorClass}`}>
            {daysUntilExpiry <= 0 ? "Expired" : `${daysUntilExpiry} days`}
          </span>
        );
      },
    },
    {
      header: "Action",
      align: "right",
      render: (product) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAdjustmentModal({ isOpen: true, product });
          }}
          className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
        >
          Adjust
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
            Inventory Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your product stock levels
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Upload size={18} />
            <span className="hidden sm:inline">Bulk Update</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <InventoryStats stats={stats} />

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
              placeholder="Search by product name or SKU..."
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
              { key: "all", label: "All Products" },
              { key: "low", label: "Low Stock" },
              { key: "out", label: "Out of Stock" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setStockFilter(filter.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  stockFilter === filter.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {filter.label}
              </button>
            ))}

            <button
              onClick={fetchInventory}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          emptyMessage="No products found"
        />

        {totalProducts > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        product={adjustmentModal.product}
        isOpen={adjustmentModal.isOpen}
        onClose={() => setAdjustmentModal({ isOpen: false, product: null })}
        onSave={handleStockAdjustment}
      />
    </div>
  );
};

export default Inventory;
