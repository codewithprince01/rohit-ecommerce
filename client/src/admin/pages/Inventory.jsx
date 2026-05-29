import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Download,
  Plus
} from "lucide-react";
import api, { getImageUrl } from "../../services/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  Modal,
  LoadingSpinner,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const StockAdjustmentModal = ({ product, isOpen, onClose, onSave }) => {
  const [adjustment, setAdjustment] = useState({ type: "add", quantity: 0, reason: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (adjustment.quantity <= 0 && adjustment.type !== "set") return toast.error("Enter a valid quantity");
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

  const newStock = adjustment.type === "add" ? (product?.stock || 0) + adjustment.quantity : adjustment.type === "remove" ? Math.max(0, (product?.stock || 0) - adjustment.quantity) : adjustment.quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Stock" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded border border-gray-100 flex-shrink-0">
             <img src={getImageUrl(product?.images?.[0] || product?.thumbnail)} alt="" className="w-full h-full object-cover rounded" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate text-sm">{product?.name}</p>
            <p className="text-xs text-gray-500">Current Stock: <span className="font-bold text-gray-900 dark:text-white">{product?.stock}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["add", "remove", "set"].map(type => (
            <button key={type} type="button" onClick={() => setAdjustment({ ...adjustment, type })} className={`py-2 text-xs font-bold rounded-lg border-2 transition-all capitalize ${adjustment.type === type ? "bg-primary-50 border-primary-600 text-primary-600" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"}`}>
              {type === "add" ? "Add Stock" : type === "remove" ? "Subtract" : "Set Count"}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Quantity</label>
            <input type="number" min="0" value={adjustment.quantity} onChange={(e) => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm font-bold focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">New Level</label>
            <div className="w-full px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-bold flex items-center justify-center">
              {newStock} Units
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Reason</label>
          <select value={adjustment.reason} onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm font-medium">
            <option value="">Choose reason...</option>
            <option value="restock">New Stock</option>
            <option value="damage">Damage/Loss</option>
            <option value="return">Customer Return</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 text-gray-500 font-bold text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-2 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
            {loading && <LoadingSpinner size="sm" />} Update Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [adjustmentModal, setAdjustmentModal] = useState({ isOpen: false, product: null });
  const [stats, setStats] = useState({ totalProducts: 0, lowStock: 0, outOfStock: 0 });

  useEffect(() => { fetchInventory(); fetchStats(); }, [currentPage, searchQuery, stockFilter, itemsPerPage]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/inventory/stats");
      setStats(data);
    } catch (error) { console.error(error); }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: itemsPerPage });
      if (searchQuery) params.append("search", searchQuery);
      if (stockFilter === "low") params.append("lowStock", "true");
      if (stockFilter === "out") params.append("outOfStock", "true");

      const { data } = await api.get(`/inventory?${params}`);
      setProducts(data.data || []);
      setTotalProducts(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (error) { console.error(error); toast.error("Failed to load inventory"); } finally { setLoading(false); }
  };

  const handleStockAdjustment = async (productId, adjustment) => {
    try {
      await api.put(`/inventory/${productId}/adjust`, adjustment);
      toast.success("Stock updated");
      fetchInventory(); fetchStats();
    } catch (error) { toast.error("Failed to sync stock"); }
  };

  const columns = [
    {
      header: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border rounded bg-white overflow-hidden flex-shrink-0">
             <img src={getImageUrl(product.images?.[0] || product.image || product.thumbnail)} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
            <p className="text-[10px] font-medium text-gray-400">SKU: {product.sku || "N/A"}</p>
          </div>
        </div>
      ),
    },
    { header: "Unit Price", render: (product) => <span className="text-sm font-bold">₹{product.price?.toLocaleString()}</span> },
    {
      header: "In Stock",
      render: (product) => {
        const stock = product.stock ?? 0;
        const color = stock <= 0 ? "text-red-600 bg-red-50" : stock <= (product.lowStockThreshold || 10) ? "text-amber-600 bg-amber-50" : "text-primary-600 bg-primary-50";
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>{stock} Units</span>;
      },
    },
    { header: "Status", render: (product) => <StatusBadge status={product.stock <= 0 ? "out_of_stock" : product.stock <= (product.lowStockThreshold || 10) ? "low_stock" : "in_stock"} size="sm" /> },
    {
      header: "Action",
      align: "right",
      render: (product) => (
        <button onClick={() => setAdjustmentModal({ isOpen: true, product })} className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all">
          Adjust Stock
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
          <p className="text-sm text-gray-500">Track and manage product stock levels</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={fetchInventory} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: stats.totalProducts, color: "text-primary-600 bg-primary-50" },
          { label: "Low Stock Items", value: stats.lowStock, color: "text-amber-600 bg-amber-50" },
          { label: "Out of Stock", value: stats.outOfStock, color: "text-red-600 bg-red-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-tight">{stat.label}</span>
            <span className={`text-2xl font-black ${stat.color} px-4 py-1 rounded-xl`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name or SKU..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400" />
        </div>
        <div className="flex items-center gap-2">
           {["all", "low", "out"].map(filt => (
             <button key={filt} onClick={() => { setStockFilter(filt); setCurrentPage(1); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all ${stockFilter === filt ? "bg-primary-600 border-primary-600 text-white" : "bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50"}`}>
               {filt === "out" ? "Out of Stock" : filt === "low" ? "Low Stock" : "All Items"}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={products} loading={loading} emptyMessage="No products found in inventory." />
        {totalProducts > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
             <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</label>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm px-2 py-1 outline-none focus:border-primary-500"
                >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={totalProducts} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <StockAdjustmentModal product={adjustmentModal.product} isOpen={adjustmentModal.isOpen} onClose={() => setAdjustmentModal({ isOpen: false, product: null })} onSave={handleStockAdjustment} />
    </div>
  );
};

export default Inventory;
