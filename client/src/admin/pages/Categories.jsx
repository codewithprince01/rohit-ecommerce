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
  Image as ImageIcon,
  MoreHorizontal
} from "lucide-react";
import api from "../../services/api";
import {
  Modal,
  ConfirmDialog,
  LoadingSpinner,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const CategoryFormModal = ({ isOpen, onClose, category, parentCategory, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parent: "",
    priority: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image || "",
        parent: category.parent?._id || category.parent || "",
        priority: category.priority || 0,
        isActive: category.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
        parent: parentCategory?._id || "",
        priority: 0,
        isActive: true,
      });
    }
  }, [category, parentCategory, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");
    setLoading(true);
    try { await onSave(formData, category?._id); onClose(); } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? "Edit Category" : "Add New Category"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm font-semibold focus:border-primary-300 outline-none" placeholder="E.G. Fresh Vegetables" />
        </div>

        <div>
           <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Parent Category</label>
           <select value={formData.parent} onChange={(e) => setFormData({ ...formData, parent: e.target.value })} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm bg-white focus:border-primary-300 outline-none">
              <option value="">None (Root Category)</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
           </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Brief Description</label>
          <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm resize-none focus:border-primary-300 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Priority Index</label>
             <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm" />
           </div>
           <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</label>
              <select value={formData.isActive.toString()} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm bg-white">
                 <option value="true">Active</option>
                 <option value="false">Hidden</option>
              </select>
           </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-50">
           <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-bold text-gray-500">Cancel</button>
           <button type="submit" disabled={loading} className="flex-2 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 px-6">
              {loading && <LoadingSpinner size="sm" />} {category ? "Update" : "Save Category"}
           </button>
        </div>
      </form>
    </Modal>
  );
};

const CategoryItem = ({ category, level = 0, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="border-b last:border-0 border-gray-50">
      <div className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-all ${level > 0 ? "bg-gray-50/30" : ""}`} style={{ paddingLeft: `${level * 24 + 16}px` }}>
        <button onClick={() => setExpanded(!expanded)} className={`p-1 rounded hover:bg-white text-gray-400 ${!hasChildren && "invisible"}`}>
           {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.isActive ? "bg-primary-50 text-primary-600" : "bg-gray-100 text-gray-400"}`}>
           {hasChildren ? <FolderOpen size={16} /> : <Folder size={16} />}
        </div>

        <div className="flex-1">
           <p className="text-sm font-bold text-gray-900">{category.name}</p>
           <p className="text-[10px] text-gray-400 font-medium">{category.productCount || 0} Products</p>
        </div>

        <div className="flex items-center gap-1">
           <button onClick={() => onAddChild(category)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Plus size={16} /></button>
           <button onClick={() => onEdit(category)} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><Edit2 size={16} /></button>
           <button onClick={() => onDelete(category)} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
        </div>
      </div>
      {expanded && hasChildren && (
        <div>{category.children.map(child => <CategoryItem key={child._id} category={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />)}</div>
      )}
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formModal, setFormModal] = useState({ isOpen: false, category: null, parent: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories?hierarchy=true");
      setCategories(res.data.data || []);
    } catch (error) { toast.error("Category sync error"); } finally { setLoading(false); }
  };

  const handleSave = async (formData, id) => {
    try {
      if (id) await api.put(`/categories/${id}`, formData);
      else await api.post("/categories", formData);
      toast.success(id ? "Category updated" : "Category created");
      fetchCategories();
    } catch (error) { toast.error("Action failed"); throw error; }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteModal.category._id}`);
      toast.success("Category purging successful");
      setDeleteModal({ isOpen: false, category: null });
      fetchCategories();
    } catch (error) { toast.error("Referential integrity check failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Taxonomy & Catalog</h1>
          <p className="text-sm text-gray-500">Manage your product organizational hierarchy</p>
        </div>
        <button onClick={() => setFormModal({ isOpen: true, category: null, parent: null })} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-medium outline-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-50"><h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Tree</h3></div>
        {loading ? <div className="p-12 text-center"><LoadingSpinner /></div> : (
          <div className="divide-y divide-gray-50">
            {categories.map(cat => <CategoryItem key={cat._id} category={cat} onEdit={(c) => setFormModal({ isOpen: true, category: c })} onDelete={(c) => setDeleteModal({ isOpen: true, category: c })} onAddChild={(p) => setFormModal({ isOpen: true, parent: p })} />)}
          </div>
        )}
      </div>

      <CategoryFormModal isOpen={formModal.isOpen} onClose={() => setFormModal({ isOpen: false, category: null, parent: null })} category={formModal.category} parentCategory={formModal.parent} onSave={handleSave} categories={categories} />
      
      <ConfirmDialog isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, category: null })} onConfirm={handleDelete} title="Purge Category" message={`Are you sure you want to delete ${deleteModal.category?.name}? All sub-references will be lost.`} variant="danger" />
    </div>
  );
};

export default Categories;
