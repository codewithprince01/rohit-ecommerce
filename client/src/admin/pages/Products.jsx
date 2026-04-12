import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Eye,
  Package,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  X,
} from "lucide-react";
import api from "../../utils/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  Modal,
  ConfirmDialog,
  Card,
  CardHeader,
  EmptyState,
  LoadingSpinner,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [currentPage, searchQuery, selectedCategory, selectedStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedStatus === "active") params.append("isActive", "true");
      if (selectedStatus === "inactive") params.append("isActive", "false");
      if (selectedStatus === "low_stock") params.append("lowStock", "true");

      const response = await api.get(`/products?${params}`);
      const data = response.data;

      setProducts(data.data || data.products || []);
      setTotalProducts(data.total || data.data?.length || 0);
      setTotalPages(
        Math.ceil((data.total || data.data?.length || 0) / itemsPerPage),
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      setDeleting(true);
      await api.delete(`/products/${deleteModal.product._id}`);
      toast.success("Product deleted successfully");
      setDeleteModal({ isOpen: false, product: null });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;

    try {
      await Promise.all(
        selectedProducts.map((id) => api.delete(`/products/${id}`)),
      );
      toast.success(`${selectedProducts.length} products deleted`);
      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete some products");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStatus("");
    setCurrentPage(1);
  };

  const columns = [
    {
      header: "Product",
      render: (product) => (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden flex-shrink-0">
            {product.images?.[0]?.url ||
            product.thumbnail ||
            product.images?.[0] ? (
              <img
                src={(() => {
                  const img = product.images?.[0]?.url || product.thumbnail || product.images?.[0];
                  if (!img) return '';
                  if (typeof img === 'string' && img.startsWith('http')) return img;
                  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/${typeof img === 'string' ? img : img.url}`;
                })()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package size={24} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
              {product.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              SKU: {product.sku || "N/A"}
            </p>
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
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            ₹{product.price?.toLocaleString()}
          </p>
          {product.comparePrice && product.comparePrice > product.price && (
            <p className="text-xs text-gray-400 line-through">
              ₹{product.comparePrice?.toLocaleString()}
            </p>
          )}
        </div>
      ),
    },
    {
      header: "Stock",
      render: (product) => {
        const stock = product.stock ?? 0;
        const threshold = product.lowStockThreshold ?? 10;
        let status = "in_stock";
        if (stock <= 0) status = "out_of_stock";
        else if (stock <= threshold) status = "low_stock";

        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {stock}
            </span>
            <StatusBadge status={status} size="sm" />
          </div>
        );
      },
    },
    {
      header: "Status",
      render: (product) => (
        <StatusBadge status={product.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      align: "right",
      render: (product) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${product._id}`);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="View"
          >
            <Eye size={16} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/edit/${product._id}`);
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ isOpen: true, product });
            }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your product inventory
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Upload size={18} />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download size={18} />
            <span className="hidden sm:inline">Export</span>
          </button>
          <Link
            to="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 min-w-[150px]"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 min-w-[130px]"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="low_stock">Low Stock</option>
            </select>

            <button
              onClick={fetchProducts}
              className="p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-gray-500" />
            </button>

            {(searchQuery || selectedCategory || selectedStatus) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              >
                <X size={16} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <strong>{selectedProducts.length}</strong> products selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear Selection
            </button>
          </div>
        )}
      </Card>

      {/* Products Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={products}
          loading={loading}
          selectable={true}
          selectedRows={selectedProducts}
          onSelectRows={setSelectedProducts}
          emptyMessage="No products found. Add your first product to get started."
        />

        {/* Pagination */}
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

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Products;
