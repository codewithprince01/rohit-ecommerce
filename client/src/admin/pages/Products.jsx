import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  RefreshCw,
  X,
  ChevronRight,
  Zap,
  Tag,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { getImageUrl } from "../../services/api";
import { categoryService, productService } from "../../services";
import {
  StatusBadge,
  DataTable,
  Pagination,
  ConfirmDialog,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  
  // Data for Filters
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subSubCategories, setSubSubCategories] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  useEffect(() => { 
    fetchProducts(); 
  }, [currentPage, search, selectedCategory, selectedSubCategory, selectedSubSubCategory, selectedStatus]);

  useEffect(() => {
    const loadCategories = async () => {
       try {
          const res = await categoryService.getAll();
          setCategories(res.data);
       } catch (err) { console.error(err); }
    };
    loadCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10, all: 'true' };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedSubCategory) params.subCategory = selectedSubCategory;
      if (selectedSubSubCategory) params.subSubCategory = selectedSubSubCategory;
      if (selectedStatus === "active") params.isActive = "true";
      if (selectedStatus === "inactive") params.isActive = "false";
      
      const data = await productService.getAll(params);
      setProducts(data.data || data.products || []);
      setTotalPages(data.pages || 1);
    } catch (error) { toast.error("Asset retrieval error"); } finally { setLoading(false); }
  };

  const handleCategoryChange = async (catId) => {
    setSelectedCategory(catId);
    setSelectedSubCategory("");
    setSelectedSubSubCategory("");
    setSubcategories([]);
    setSubSubCategories([]);
    if (catId) {
       try {
          const res = await categoryService.getSubcategories(catId);
          setSubcategories(res.data);
       } catch (err) { console.error(err); }
    }
  };

  const handleSubCategoryChange = async (subId) => {
    setSelectedSubCategory(subId);
    setSelectedSubSubCategory("");
    setSubSubCategories([]);
    if (subId) {
       try {
          const res = await categoryService.getSubSubCategories(subId);
          setSubSubCategories(res.data);
       } catch (err) { console.error(err); }
    }
  };

  const handleDelete = async () => {
    try {
      await productService.delete(deleteModal.product._id);
      toast.success("Product deleted successfully");
      setDeleteModal({ isOpen: false, product: null });
      fetchProducts();
    } catch (error) { toast.error("Error deleting product"); }
  };

  const handleToggleStatus = async (id) => {
    try {
      await productService.toggleStatus(id);
      toast.success("Product status updated");
      fetchProducts();
    } catch (error) { toast.error("Error updating status"); }
  };

  const columns = [
    {
      header: "Product Detail",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700">
            {product.images?.length > 0 ? (
               <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
            ) : <Package className="text-gray-300 dark:text-gray-600" size={20} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{product.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{product.unit || 'Standard Unit'}</p>
          </div>
        </div>
      ),
    },
    { 
        header: "Category", 
        render: (p) => (
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-xs font-medium text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-md whitespace-nowrap">{p.category?.name || "N/A"}</span>
                    {p.subCategory && (
                        <>
                            <ChevronRight size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">{p.subCategory.name}</span>
                        </>
                    )}
                </div>
                {p.subSubCategory && (
                    <div className="flex items-center gap-1.5">
                         <span className="text-[11px] text-gray-500 dark:text-gray-500 whitespace-nowrap">{p.subSubCategory.name}</span>
                    </div>
                )}
            </div>
        )
    },
    { 
        header: "Price", 
        render: (p) => (
            <div className="flex flex-col">
                <span className="font-semibold text-gray-900 dark:text-gray-100">₹{p.price?.toLocaleString()}</span>
                {p.comparePrice > p.price && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-through">₹{p.comparePrice}</span>
                )}
            </div>
        )
    },
    { 
      header: "Inventory", 
      render: (p) => (
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${p.stock <= 5 ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-300"}`}>{p.stock || 0} in stock</span>
           </div>
        </div>
      )
    },
    { header: "Status", render: (p) => <StatusBadge status={p.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => handleToggleStatus(p._id)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title={p.isActive ? "Hide Product" : "Publish Product"}>
             {p.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={() => navigate(`/admin/products/edit/${p._id}`)} className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
             <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteModal({ isOpen: true, product: p })} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
             <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your store's inventory</p>
        </div>
        <button 
           onClick={() => navigate("/admin/products/new")} 
           className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" 
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary-500">
               <option value="">All Categories</option>
               {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
           </select>
           
           <select value={selectedSubCategory} disabled={!selectedCategory} onChange={(e) => handleSubCategoryChange(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50">
               <option value="">All Sub-Categories</option>
               {subcategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
           </select>

           <select value={selectedSubSubCategory} disabled={!selectedSubCategory} onChange={(e) => setSelectedSubSubCategory(e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50">
               <option value="">All Sub-Sub-Categories</option>
               {subSubCategories.map(ss => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
           </select>

           <div className="flex gap-2">
             <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
             </select>
             <button onClick={fetchProducts} className="p-2 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
             <div className="py-20 text-center">
                <Loader2 className="animate-spin text-primary-600 mx-auto" size={32} />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading products...</p>
             </div>
        ) : (
            <>
                <DataTable columns={columns} data={products} loading={loading} emptyMessage="No products found." />
                {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
                )}
            </>
        )}
      </div>

      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, product: null })} 
        onConfirm={handleDelete} 
        title="Delete Product" 
        message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`} 
        variant="danger" 
      />
    </div>
  );
};

export default Products;
