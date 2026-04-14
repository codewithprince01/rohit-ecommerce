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
  Loader2
} from "lucide-react";
import api, { getImageUrl } from "../../services/api";
import { categoryService } from "../../services";
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
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedSubCategory) params.append("subCategory", selectedSubCategory);
      if (selectedSubSubCategory) params.append("subSubCategory", selectedSubSubCategory);
      if (selectedStatus === "active") params.append("isActive", "true");
      if (selectedStatus === "inactive") params.append("isActive", "false");
      
      const { data } = await api.get(`/products?${params}`);
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
          <div className="w-14 h-14 bg-gray-50 border-2 border-white rounded-[1.25rem] overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
            {product.images?.length > 0 ? (
               <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover" />
            ) : <Package className="text-gray-300" size={20} />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate max-w-[200px] tracking-tight">{product.name}</p>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{product.unit || 'Standard Unit'}</p>
          </div>
        </div>
      ),
    },
    { 
        header: "Taxonomy", 
        render: (p) => (
            <div className="space-y-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[10px] font-black text-primary-600 uppercase bg-primary-50 px-2 py-0.5 rounded-lg whitespace-nowrap">{p.category?.name || "???"}</span>
                    {p.subCategory && (
                        <>
                            <ChevronRight size={10} className="text-gray-300 flex-shrink-0" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase whitespace-nowrap">{p.subCategory.name}</span>
                        </>
                    )}
                </div>
                {p.subSubCategory && (
                    <div className="flex items-center gap-1.5 opacity-60">
                         <Tag size={10} className="text-orange-500" />
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{p.subSubCategory.name}</span>
                    </div>
                )}
            </div>
        )
    },
    { 
        header: "Commerce", 
        render: (p) => (
            <div className="flex flex-col">
                <span className="font-black text-gray-950 text-base tracking-tighter italic">₹{p.price?.toLocaleString()}</span>
                {p.comparePrice > p.price && (
                    <span className="text-[10px] text-gray-400 line-through font-bold">₹{p.comparePrice}</span>
                )}
            </div>
        )
    },
    { 
      header: "Inventory", 
      render: (p) => (
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2">
                <span className={`text-xs font-black ${p.stock <= 5 ? "text-red-500" : "text-emerald-600"}`}>{p.stock || 0}</span>
                <div className={`w-2 h-2 rounded-full ${p.stock <= 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
           </div>
           <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{p.stock <= 0 ? 'Out of Sync' : 'In Circulation'}</span>
        </div>
      )
    },
    { header: "Visibility", render: (p) => <StatusBadge status={p.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => navigate(`/admin/products/edit/${p._id}`)} className="p-2.5 bg-gray-50 hover:bg-gray-950 hover:text-white rounded-xl text-gray-400 transition-all group scale-95 hover:scale-100">
             <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteModal({ isOpen: true, product: p })} className="p-2.5 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl text-red-300 transition-all scale-95 hover:scale-100">
             <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div>
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 block">Store Fulfillment</span>
          <h1 className="text-5xl font-black text-gray-950 tracking-tighter font-display leading-none">Catalog <br/><span className="text-gray-300">Inventory.</span></h1>
        </div>
        <button 
           onClick={() => navigate("/admin/products/new")} 
           className="group flex items-center gap-4 px-10 py-5 bg-gray-950 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-primary-600 transition-all active:scale-95"
        >
          <Plus size={22} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> Add Premium Item
        </button>
      </div>

      {/* Advanced Filter Deck */}
      <div className="bg-white p-6 rounded-[3rem] border-2 border-gray-50 shadow-sm space-y-6">
        <div className="flex items-center bg-gray-50 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <Search className="ml-5 text-gray-300" size={20} />
          <input 
            type="text" 
            placeholder="Query assets by name, SKU, or identity tags..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
            className="w-full px-6 py-4 bg-transparent text-sm font-black text-gray-900 outline-none placeholder:text-gray-200" 
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Hierarchy Filters */}
           <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="px-5 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border-2 border-transparent focus:border-primary-200">
               <option value="">Master Category</option>
               {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
           </select>
           
           <select value={selectedSubCategory} disabled={!selectedCategory} onChange={(e) => handleSubCategoryChange(e.target.value)} className="px-5 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border-2 border-transparent focus:border-primary-200 disabled:opacity-30">
               <option value="">Sub-Collection</option>
               {subcategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
           </select>

           <select value={selectedSubSubCategory} disabled={!selectedSubCategory} onChange={(e) => setSelectedSubSubCategory(e.target.value)} className="px-5 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border-2 border-transparent focus:border-primary-200 disabled:opacity-30">
               <option value="">Brand Spotlight</option>
               {subSubCategories.map(ss => <option key={ss._id} value={ss._id}>{ss.name}</option>)}
           </select>

           <div className="flex gap-2">
             <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="flex-1 px-5 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none">
                <option value="">Market Status</option>
                <option value="active">Visible</option>
                <option value="inactive">Redacted</option>
             </select>
             <button onClick={fetchProducts} className="w-14 flex items-center justify-center bg-primary-50 text-primary-600 rounded-2xl hover:bg-primary-600 hover:text-white transition-all">
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
             </button>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {loading ? (
             <div className="p-40 text-center">
                <Loader2 className="animate-spin text-gray-100 mx-auto" size={64} strokeWidth={1} />
                <p className="mt-6 text-xs font-black text-gray-200 uppercase tracking-widest">Hydrating Catalog State...</p>
             </div>
        ) : (
            <>
                <DataTable columns={columns} data={products} loading={loading} emptyMessage="Inventory synchronization required." />
                {totalPages > 1 && (
                <div className="px-10 py-8 bg-gray-50/30 flex justify-center">
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
        title="Purge Commercial Asset" 
        message={`Confirm deactivation of ${deleteModal.product?.name}? This identity will be hidden from the active codebase.`} 
        variant="danger" 
      />
    </div>
  );
};

export default Products;
