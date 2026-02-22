import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Search,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";
import api from "../../utils/api";
import {
  Modal,
  ConfirmDialog,
  Card,
  CardHeader,
  LoadingSpinner,
  EmptyState,
} from "../../components/admin/AdminUI";
import toast from "react-hot-toast";

// Category Form Modal
const CategoryFormModal = ({
  isOpen,
  onClose,
  category,
  parentCategory,
  onSave,
  categories,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    parent: "",
    priority: 0,
    isActive: true,
    metaTitle: "",
    metaDescription: "",
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
        metaTitle: category.metaTitle || "",
        metaDescription: category.metaDescription || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
        parent: parentCategory?._id || "",
        priority: 0,
        isActive: true,
        metaTitle: "",
        metaDescription: "",
      });
    }
  }, [category, parentCategory, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData, category?._id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700"
            placeholder="Enter category name"
          />
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Parent Category
          </label>
          <select
            value={formData.parent}
            onChange={(e) =>
              setFormData({ ...formData, parent: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
          >
            <option value="">None (Top Level)</option>
            {categories
              .filter((cat) => cat._id !== category?._id)
              .map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.parent ? `— ${cat.name}` : cat.name}
                </option>
              ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
            placeholder="Category description"
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Image URL
          </label>
          <input
            type="text"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
            placeholder="https://..."
          />
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Priority (Sort Order)
            </label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Status
            </label>
            <select
              value={formData.isActive.toString()}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isActive: e.target.value === "true",
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {/* SEO Fields */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            SEO Settings
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) =>
                  setFormData({ ...formData, metaTitle: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                placeholder="SEO title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                placeholder="SEO description"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            {category ? "Update Category" : "Create Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Category Tree Item
const CategoryTreeItem = ({
  category,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={`group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
          level > 0
            ? "border-l-2 border-gray-200 dark:border-gray-700 ml-6"
            : ""
        }`}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${!hasChildren && "invisible"}`}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Icon */}
        <div
          className={`p-2 rounded-lg ${category.isActive ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}
        >
          {isExpanded && hasChildren ? (
            <FolderOpen size={18} />
          ) : (
            <Folder size={18} />
          )}
        </div>

        {/* Image */}
        {category.image && (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {category.name}
            </span>
            {!category.isActive && (
              <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full">
                Inactive
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {category.description || "No description"}
          </p>
        </div>

        {/* Product Count */}
        <span className="text-sm text-gray-500">
          {category.productCount || 0} products
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(category)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-500 hover:text-indigo-600"
            title="Add Subcategory"
          >
            <Plus size={16} />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-500 hover:text-indigo-600"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(category)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-gray-500 hover:text-red-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div>
          {category.children.map((child) => (
            <CategoryTreeItem
              key={child._id}
              category={child}
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

// Main Categories Component
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formModal, setFormModal] = useState({
    isOpen: false,
    category: null,
    parent: null,
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/categories");
      const data = response.data.data || response.data || [];

      // Store flat list for dropdown
      setFlatCategories(data);

      // Build tree structure
      const tree = buildCategoryTree(data);
      setCategories(tree);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const buildCategoryTree = (categories) => {
    const map = {};
    const roots = [];

    // Create map of all categories
    categories.forEach((cat) => {
      map[cat._id] = { ...cat, children: [] };
    });

    // Build tree
    categories.forEach((cat) => {
      if (cat.parent && map[cat.parent]) {
        map[cat.parent].children.push(map[cat._id]);
      } else if (cat.parent?._id && map[cat.parent._id]) {
        map[cat.parent._id].children.push(map[cat._id]);
      } else {
        roots.push(map[cat._id]);
      }
    });

    return roots;
  };

  const handleSave = async (formData, categoryId) => {
    try {
      if (categoryId) {
        await api.put(`/categories/${categoryId}`, formData);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", formData);
        toast.success("Category created successfully");
      }
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save category");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.category) return;

    try {
      setDeleting(true);
      await api.delete(`/categories/${deleteModal.category._id}`);
      toast.success("Category deleted successfully");
      setDeleteModal({ isOpen: false, category: null });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const filteredCategories = searchQuery
    ? flatCategories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : categories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize your products with nested categories
          </p>
        </div>
        <button
          onClick={() =>
            setFormModal({ isOpen: true, category: null, parent: null })
          }
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
        >
          <Plus size={18} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </Card>

      {/* Categories Tree */}
      <Card padding={false}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Category Tree
          </h3>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {(searchQuery ? filteredCategories : categories).map((category) => (
              <CategoryTreeItem
                key={category._id}
                category={category}
                onEdit={(cat) =>
                  setFormModal({ isOpen: true, category: cat, parent: null })
                }
                onDelete={(cat) =>
                  setDeleteModal({ isOpen: true, category: cat })
                }
                onAddChild={(parent) =>
                  setFormModal({ isOpen: true, category: null, parent })
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Folder}
            title="No categories yet"
            description="Create your first category to organize products"
            action={
              <button
                onClick={() =>
                  setFormModal({ isOpen: true, category: null, parent: null })
                }
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
              >
                Add Category
              </button>
            }
          />
        )}
      </Card>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={formModal.isOpen}
        onClose={() =>
          setFormModal({ isOpen: false, category: null, parent: null })
        }
        category={formModal.category}
        parentCategory={formModal.parent}
        onSave={handleSave}
        categories={flatCategories}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteModal.category?.name}"? This will also delete all subcategories.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Categories;
