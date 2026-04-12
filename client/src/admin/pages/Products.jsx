import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  Package,
  Download,
  RefreshCw,
  MoreVertical,
  X
} from "lucide-react";
import api, { getImageUrl } from "../../services/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  ConfirmDialog,
  LoadingSpinner,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  useEffect(() => { fetchProducts(); fetchCategories(); }, [currentPage, search, selectedCategory, selectedStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedStatus === "active") params.append("isActive", "true");
      if (selectedStatus === "inactive") params.append("isActive", "false");
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.data || data.products || []);
      setTotalPages(data.pages || Math.ceil((data.total || 0) / 10) || 1);
    } catch (error) { toast.error("Asset retrieval error"); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data || data || []);
    } catch (error) { console.error(error); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteModal.product._id}`);
      toast.success("Product purged");
      setDeleteModal({ isOpen: false, product: null });
      fetchProducts();
    } catch (error) { toast.error("Deactivation restricted"); }
  };

  const columns = [
    {
      header: "Product Detail",
      render: (product) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
            {product.images?.length > 0 ? (
               <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
            ) : <Package className="text-gray-300" size={20} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{product.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{product.sku || 'NO-SKU'}</p>
          </div>
        </div>
      ),
    },
    { header: "Department", render: (p) => <span className="text-xs font-bold text-gray-500 uppercase">{p.category?.name || "Unclassified"}</span> },
    { header: "Pricing", render: (p) => <span className="font-black text-gray-900 dark:text-gray-100">₹{p.price?.toLocaleString()}</span> },
    { 
      header: "Availability", 
      render: (p) => (
        <div className="flex items-center gap-2">
           <span className={`text-xs font-black ${p.stock <= 5 ? "text-red-500" : "text-emerald-600"}`}>{p.stock || 0}</span>
           <StatusBadge status={p.stock <= 0 ? "out_of_stock" : p.stock <= 5 ? "low_stock" : "in_stock"} size="sm" />
        </div>
      )
    },
    { header: "Display", render: (p) => <StatusBadge status={p.isActive ? "active" : "inactive"} /> },
    {
      header: "Action",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/admin/products/edit/${p._id}`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={16} /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, product: p })} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Inventory</h1>
          <p className="text-sm text-gray-500">Manage your store's commercial offerings</p>
        </div>
        <Link to="/admin/products/new" className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size={18} /> Add New Entry
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name, SKU or tags..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-bold text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400" />
        </div>
        <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-2 lg:pt-0">
           <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 lg:min-w-[160px] px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider outline-none">
               <option value="" className="bg-white dark:bg-gray-800">All Regions</option>
               {categories.map(c => <option key={c._id} value={c._id} className="bg-white dark:bg-gray-800">{c.name}</option>)}
           </select>
           <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="flex-1 lg:min-w-[120px] px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider outline-none">
              <option value="">Status</option>
              <option value="active">Visible</option>
              <option value="inactive">Hidden</option>
           </select>
           <button onClick={fetchProducts} className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:text-primary-600"><RefreshCw size={18} /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={products} loading={loading} emptyMessage="Inventory is currently empty." />
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <ConfirmDialog isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, product: null })} onConfirm={handleDelete} title="Deactivate Item" message={`Are you sure you want to remove ${deleteModal.product?.name}? This will hide it from the storefront.`} variant="danger" />
    </div>
  );
};

export default Products;
