import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Store,
  Loader2,
  RefreshCw,
  Tag
} from "lucide-react";
import api from "../../services/api";
import {
  Modal,
  ConfirmDialog,
  DataTable,
  StatusBadge,
  Pagination
} from "../components/AdminUI";
import toast from "react-hot-toast";

const BrandFormModal = ({ isOpen, onClose, brand, subcategories, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
    subcategory: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        isActive: brand.isActive ?? true,
        subcategory: brand.subcategory?._id || brand.subcategory || ""
      });
    } else {
      setFormData({
        name: "",
        isActive: true,
        subcategory: ""
      });
    }
  }, [brand, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Brand name is required");
    if (!formData.subcategory) return toast.error("Parent subcategory is required");
    
    setLoading(true);
    try { 
      await onSave(formData, brand?._id); 
      onClose(); 
    } catch (error) { 
      toast.error(error.response?.data?.message || "Operation failed");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={brand ? "Edit Brand" : "Add New Brand"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Brand Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all" 
            placeholder="e.g. Amul, Nestle" 
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Parent Subcategory <span className="text-red-500">*</span></label>
          <select
             value={formData.subcategory}
             onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
             className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg text-sm outline-none transition-all text-gray-900 dark:text-white"
          >
             <option value="">Select Subcategory</option>
             {subcategories.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
             ))}
          </select>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
           <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Status</span>
           <button 
             type="button"
             onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
             className={`w-10 h-5 rounded-full transition-all relative ${formData.isActive ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
           >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'right-0.5' : 'left-0.5'}`} />
           </button>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
           <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all">Cancel</button>
           <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (brand ? "Save Changes" : "Create Brand")}
           </button>
        </div>
      </form>
    </Modal>
  );
};

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState({ isOpen: false, item: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => { 
    fetchBrands(); 
    fetchSubcategories();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await api.get("/subsubcategories");
      setBrands(res.data.data || []);
      setCurrentPage(1); // Reset to first page on fetch
    } catch (error) { 
      toast.error("Failed to load brands"); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get("/subcategories");
      setSubcategories(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (formData, id) => {
    try {
      if (id) await api.put(`/subsubcategories/${id}`, formData);
      else await api.post("/subsubcategories", formData);
      
      toast.success(id ? "Brand updated successfully" : "Brand created successfully");
      fetchBrands();
    } catch (error) { 
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/subsubcategories/${deleteModal.item._id}`);
      toast.success("Brand deleted successfully");
      setDeleteModal({ isOpen: false, item: null });
      fetchBrands();
    } catch (error) { 
      toast.error(error.response?.data?.message || "Failed to delete brand"); 
    }
  };

  // 1. Filter
  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) || 
    (b.subcategory?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  // 2. Paginate
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = filteredBrands.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page if search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const columns = [
    {
      header: "Brand Name",
      render: (b) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700">
            <Store className="text-gray-400 dark:text-gray-500" size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{b.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">Slug: {b.slug}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Parent Subcategory",
      render: (b) => (
         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-md text-xs font-medium">
             <Tag size={12} />
             {b.subcategory?.name || "N/A"}
         </div>
      )
    },
    { header: "Status", render: (b) => <StatusBadge status={b.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      align: "right",
      render: (b) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setFormModal({ isOpen: true, item: b })} className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors">
             <Edit2 size={16} />
          </button>
          <button onClick={() => setDeleteModal({ isOpen: true, item: b })} className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
             <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands (Sub-SubCategories)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your brand collections and filtering tags</p>
        </div>
        <button 
          onClick={() => setFormModal({ isOpen: true, item: null })} 
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Brand
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search brands..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 outline-none transition-all" 
          />
        </div>
        <button onClick={fetchBrands} className="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
           <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
             <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary-600" size={32} />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading brands...</p>
             </div>
        ) : (
            <>
                <DataTable columns={columns} data={currentBrands} loading={loading} emptyMessage="No brands found matching your search." />
                {filteredBrands.length > 0 && (
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
                    {totalPages > 1 && (
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalItems={filteredBrands.length} itemsPerPage={itemsPerPage} />
                    )}
                </div>
                )}
            </>
        )}
      </div>

      <BrandFormModal 
        isOpen={formModal.isOpen} 
        onClose={() => setFormModal({ isOpen: false, item: null })} 
        brand={formModal.item} 
        subcategories={subcategories}
        onSave={handleSave} 
      />
      
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, item: null })} 
        onConfirm={handleDelete} 
        title="Delete Brand" 
        message={`Are you sure you want to delete the brand "${deleteModal.item?.name}"? Products attached to this brand may lose their association.`} 
        variant="danger" 
      />
    </div>
  );
};

export default Brands;
