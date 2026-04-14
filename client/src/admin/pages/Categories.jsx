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
        // If we have a parentItem, we pre-fill the reference field
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
    if (category) return `Edit ${level === 2 ? 'Brand' : level === 1 ? 'Subcategory' : 'Category'}`;
    return `New ${level === 2 ? 'Brand' : level === 1 ? 'Subcategory' : 'Category'}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="md">
      <form onSubmit={handleSubmit} className="space-y-6 p-2">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Identity Name</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl text-sm font-bold text-gray-900 outline-none transition-all" 
            placeholder={level === 2 ? "e.g. Haldiram's" : "e.g. Namkeen"} 
          />
        </div>

        {parentItem && !category && (
           <div className="bg-primary-50 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center font-black text-xs">P</div>
              <div>
                 <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Parent Resource</p>
                 <p className="text-sm font-bold text-gray-900">{parentItem.name}</p>
              </div>
           </div>
        )}

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
           <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Storefront Status</span>
           <button 
             type="button"
             onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
             className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-primary-600' : 'bg-gray-200'}`}
           >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'right-1' : 'left-1'}`} />
           </button>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-100">
           <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all">Discard</button>
           <button type="submit" disabled={loading} className="flex-[2] py-4 bg-gray-950 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary-600 transition-all shadow-xl shadow-gray-200">
              {loading ? <Loader2 size={16} className="animate-spin" /> : (category ? "Update Record" : "Confirm Entry")}
           </button>
        </div>
      </form>
    </Modal>
  );
};

const CategoryItem = ({ item, level = 0, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(false);
  
  // New keys support
  const children = level === 0 ? item.subcategories : (level === 1 ? item.subSubCategories : []);
  const hasChildren = children && children.length > 0;

  const getIcon = () => {
    if (level === 0) return <Folder className={item.isActive ? "text-primary-600" : "text-gray-300"} size={18} />;
    if (level === 1) return <Tag className={item.isActive ? "text-indigo-600" : "text-gray-300"} size={16} />;
    return <Zap className={item.isActive ? "text-orange-500" : "text-gray-300"} size={14} fill={item.isActive ? "currentColor" : "none"} />;
  };

  return (
    <div className={`border-l-2 transition-all ${level > 0 ? 'border-gray-50 ml-4' : 'border-transparent'}`}>
      <div className={`flex items-center gap-4 px-6 py-4 group transition-all ${level === 0 ? 'hover:bg-gray-50' : 'hover:bg-gray-50/50'}`}>
        <button 
          onClick={() => setExpanded(!expanded)} 
          className={`p-1 rounded-lg transition-all ${!hasChildren ? "invisible" : "hover:bg-white text-gray-400"}`}
        >
           {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${item.isActive ? "bg-white border border-gray-100" : "bg-gray-50 border border-transparent opacity-50"}`}>
           {getIcon()}
        </div>

        <div className="flex-1">
           <p className={`text-sm tracking-tight ${item.isActive ? 'font-black text-gray-900' : 'font-bold text-gray-400 italic'}`}>
              {item.name}
              {level === 2 && <span className="ml-2 text-[8px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 uppercase font-black">Brand</span>}
           </p>
           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              {level === 0 ? 'Master Category' : level === 1 ? 'Sub-Collection' : 'Brand Identity'}
           </p>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
           {level < 2 && (
             <button onClick={() => onAddChild(item, level + 1)} className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-600 hover:text-white transition-all">
                <Plus size={14} strokeWidth={3} />
             </button>
           )}
           <button onClick={() => onEdit(item, level)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-950 hover:text-white transition-all">
              <Edit2 size={14} strokeWidth={3} />
           </button>
           <button onClick={() => onDelete(item, level)} className="p-2 bg-red-50 text-red-300 rounded-lg hover:bg-red-500 hover:text-white transition-all">
              <Trash2 size={14} strokeWidth={3} />
           </button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div className="pb-4">
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
      toast.error("Network synchronization failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (formData, id, level) => {
    const endpoint = API_ENDPOINTS[level];
    try {
      if (id) await api.put(`${endpoint}/${id}`, formData);
      else await api.post(endpoint, formData);
      
      toast.success(id ? "Record Updated" : "Resource Deployed");
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
      toast.success("Memory Purged Successfully");
      setDeleteModal({ isOpen: false, item: null, level: 0 });
      fetchHierarchy();
    } catch (error) { 
      toast.error(error.response?.data?.message || "Internal Integrity Error"); 
    }
  };

  const filteredHierarchy = hierarchy.filter(cat => 
    cat.name.toLowerCase().includes(search.toLowerCase()) || 
    cat.subcategories?.some(sub => sub.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header Deck */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div>
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-4 block">Storefront Intelligence</span>
          <h1 className="text-5xl font-black text-gray-950 tracking-tighter font-display leading-none">Taxonomy <br/><span className="text-gray-300">Architecture.</span></h1>
        </div>
        <button 
          onClick={() => setFormModal({ isOpen: true, item: null, parent: null, level: 0 })} 
          className="group flex items-center gap-4 px-8 py-5 bg-gray-950 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-2xl hover:bg-primary-600 transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> New Master Category
        </button>
      </div>

      {/* Global Search Interface */}
      <div className="bg-white p-2 rounded-[2.5rem] border-2 border-gray-50 shadow-sm flex items-center group focus-within:border-primary-500 transition-all">
        <div className="relative flex-1 flex items-center">
          <Search className="ml-6 text-gray-300 group-focus-within:text-primary-600 transition-colors" size={24} />
          <input 
            type="text" 
            placeholder="Query taxonomy tree..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full px-6 py-4 bg-transparent text-lg font-black text-gray-900 outline-none placeholder:text-gray-200" 
          />
        </div>
      </div>

      {/* Modern Hierarchy Canvas */}
      <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
           <h3 className="text-xs font-black text-gray-950 uppercase tracking-[0.2em]">Active Distribution Tree</h3>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-primary-600" />
                 <span className="text-[9px] font-black uppercase text-gray-400">Master</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-600" />
                 <span className="text-[9px] font-black uppercase text-gray-400">Sub</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-orange-500" />
                 <span className="text-[9px] font-black uppercase text-gray-400">Brand</span>
              </div>
           </div>
        </div>

        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-6">
             <div className="relative">
                <Loader2 className="animate-spin text-primary-600" size={64} strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] text-primary-600">Sync</div>
             </div>
             <p className="text-xs font-black text-gray-300 uppercase tracking-widest animate-pulse">Rebuilding logical tree...</p>
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
          <div className="p-32 text-center">
             <AlertCircle size={48} className="mx-auto text-gray-100 mb-6" />
             <p className="text-2xl font-black text-gray-200 font-display italic">Empty Architecture</p>
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
        title="Purge Intelligence" 
        message={`Are you sure you want to permanently remove ${deleteModal.item?.name}? This action results in total data loss for this branch.`} 
        variant="danger" 
      />
    </div>
  );
};

export default Categories;
