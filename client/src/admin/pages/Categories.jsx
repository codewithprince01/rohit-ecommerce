import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Search,
  Zap,
  Tag,
  Loader2,
  AlertCircle
} from "lucide-react";
import api from "../../services/api";
import {
  Modal,
  ConfirmDialog,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const API_ENDPOINTS = {
  0: "/categories",
  1: "/subcategories",
  2: "/subsubcategories"
};

const CategoryFormModal = ({ isOpen, onClose, category, parentItem, level, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
    category: "", // For Subcategories
    subcategory: "", // For Sub-subcategories
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        isActive: category.isActive ?? true,
        category: category.category || "",
        subcategory: category.subcategory || ""
      });
    } else {
      setFormData({
        name: "",
        isActive: true,
        category: level === 1 ? parentItem?._id : "",
        subcategory: level === 2 ? parentItem?._id : ""
      });
    }
  }, [category, parentItem, level, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");
    
    setLoading(true);
    try { 
      await onSave(formData, category?._id, level); 
      onClose(); 
    } catch (error) { 
      console.error(error); 
      toast.error(error.response?.data?.message || "Operation failed");
    } finally { 
      setLoading(false); 
    }
  };

  const getTitle = () => {
    if (category) return `Edit ${level === 2 ? 'Sub-Sub Category' : level === 1 ? 'Sub Category' : 'Category'}`;
    return `Add ${level === 2 ? 'Sub-Sub Category' : level === 1 ? 'Sub Category' : 'Category'}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all" 
            placeholder="Enter name" 
          />
        </div>

        {parentItem && !category && (
           <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-3 rounded-lg flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center font-medium text-xs">P</div>
              <div>
                 <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Parent Category</p>
                 <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{parentItem.name}</p>
              </div>
           </div>
        )}

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
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
           <button type="submit" disabled={loading} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (category ? "Save Changes" : "Create")}
           </button>
        </div>
      </form>
    </Modal>
  );
};

const CategoryItem = ({ item, level = 0, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(false);
  
  const children = level === 0 ? item.subcategories : (level === 1 ? item.subSubCategories : []);
  const hasChildren = children && children.length > 0;

  const getIcon = () => {
    if (level === 0) return <Folder className={item.isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-gray-600"} size={18} />;
    if (level === 1) return <FolderOpen className={item.isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-gray-600"} size={16} />;
    return <Tag className={item.isActive ? "text-orange-500 dark:text-orange-400" : "text-gray-400 dark:text-gray-600"} size={14} />;
  };

  return (
    <div className={`border-l-2 transition-all ${level > 0 ? 'border-gray-100 dark:border-gray-700 ml-4' : 'border-transparent'}`}>
      <div className={`flex items-center gap-3 px-4 py-3 group transition-all ${level === 0 ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}`}>
        <button 
          onClick={() => setExpanded(!expanded)} 
          className={`p-1 rounded transition-colors ${!hasChildren ? "invisible" : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"}`}
        >
           {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.isActive ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm" : "bg-gray-50 dark:bg-gray-900 border border-transparent opacity-50"}`}>
           {getIcon()}
        </div>

        <div className="flex-1">
           <p className={`text-sm font-medium ${item.isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 italic'}`}>
              {item.name}
           </p>
           <p className="text-xs text-gray-500 dark:text-gray-400">
              {level === 0 ? 'Category' : level === 1 ? 'Sub Category' : 'Sub-Sub Category'}
           </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           {level < 2 && (
             <button onClick={() => onAddChild(item, level + 1)} className="p-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-md transition-colors" title="Add Sub Category">
                <Plus size={16} />
             </button>
           )}
           <button onClick={() => onEdit(item, level)} className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors" title="Edit">
              <Edit2 size={16} />
           </button>
           <button onClick={() => onDelete(item, level)} className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Delete">
              <Trash2 size={16} />
           </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="pb-2">
           {children.map(child => (
             <CategoryItem 
                key={child._id} 
                item={child} 
                level={level + 1} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onAddChild={onAddChild} 
             />
           ))}
        </div>
      )}
    </div>
  );
};

const Categories = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState({ isOpen: false, item: null, parent: null, level: 0 });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, level: 0 });

  useEffect(() => { fetchHierarchy(); }, []);

  const fetchHierarchy = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories/hierarchy");
      setHierarchy(res.data.data || []);
    } catch (error) { 
      toast.error("Failed to load categories"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (formData, id, level) => {
    const endpoint = API_ENDPOINTS[level];
    try {
      if (id) await api.put(`${endpoint}/${id}`, formData);
      else await api.post(endpoint, formData);
      
      toast.success(id ? "Category updated" : "Category created");
      fetchHierarchy();
    } catch (error) { 
      throw error;
    }
  };

  const handleDelete = async () => {
    const { item, level } = deleteModal;
    const endpoint = API_ENDPOINTS[level];
    try {
      await api.delete(`${endpoint}/${item._id}`);
      toast.success("Category deleted successfully");
      setDeleteModal({ isOpen: false, item: null, level: 0 });
      fetchHierarchy();
    } catch (error) { 
      toast.error(error.response?.data?.message || "Failed to delete category"); 
    }
  };

  const filteredHierarchy = hierarchy.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase()) || 
    cat.subcategories?.some(sub => sub.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your product categories</p>
        </div>
        <button 
          onClick={() => setFormModal({ isOpen: true, item: null, parent: null, level: 0 })} 
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Global Search Interface */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center group transition-all">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" 
          />
        </div>
      </div>

      {/* Modern Hierarchy Canvas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
           <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category Structure</h3>
           <div className="flex items-center gap-4 hidden sm:flex">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary-600" />
                 <span className="text-xs text-gray-500 dark:text-gray-400">Category</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-600" />
                 <span className="text-xs text-gray-500 dark:text-gray-400">Sub Category</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-orange-500" />
                 <span className="text-xs text-gray-500 dark:text-gray-400">Sub-Sub Category</span>
              </div>
           </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-primary-600" size={32} />
             <p className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
          </div>
        ) : hierarchy.length > 0 ? (
          <div className="p-4">
            {filteredHierarchy.map(cat => (
              <CategoryItem 
                key={cat._id} 
                item={cat} 
                onEdit={(item, level) => setFormModal({ isOpen: true, item, level })} 
                onDelete={(item, level) => setDeleteModal({ isOpen: true, item, level })} 
                onAddChild={(p, level) => setFormModal({ isOpen: true, parent: p, level })} 
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
             <FolderOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
             <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No categories found</p>
             <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Get started by creating a new master category.</p>
          </div>
        )}
      </div>

      <CategoryFormModal 
        isOpen={formModal.isOpen} 
        onClose={() => setFormModal({ isOpen: false, item: null, parent: null, level: 0 })} 
        category={formModal.item} 
        parentItem={formModal.parent} 
        level={formModal.level}
        onSave={handleSave} 
      />
      
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, item: null, level: 0 })} 
        onConfirm={handleDelete} 
        title="Delete Category" 
        message={`Are you sure you want to delete "${deleteModal.item?.name}"? This action cannot be undone.`} 
        variant="danger" 
      />
    </div>
  );
};

export default Categories;
