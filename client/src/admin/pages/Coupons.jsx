import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Percent,
  RefreshCw,
  Gift,
  Copy,
  Tag
} from "lucide-react";
import api from "../../services/api";
import {
  StatusBadge,
  DataTable,
  Pagination,
  Modal,
  ConfirmDialog,
  LoadingSpinner,
} from "../components/AdminUI";
import toast from "react-hot-toast";

const CouponFormModal = ({ isOpen, onClose, coupon, onSave }) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    minOrderValue: 0,
    validUntil: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue || 0,
        validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : "",
        isActive: coupon.isActive,
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 0,
        validUntil: "",
        isActive: true,
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code) return toast.error("Code is required");
    setLoading(true);
    try {
      await onSave(formData, coupon?._id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={coupon ? "Edit Coupon" : "Create New Coupon"} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Coupon Code</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold uppercase tracking-wider"
              placeholder="E.G. SAVE20"
            />
            <button
              type="button"
              onClick={() => setFormData({ ...formData, code: "SAVE" + Math.random().toString(36).substring(2, 7).toUpperCase() })}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw size={18} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="E.G. 20% off on all products"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Discount Type</label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Discount Value</label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
              className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-primary-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Min Order</label>
            <input
              type="number"
              value={formData.minOrderValue}
              onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) || 0 })}
              className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Valid Until</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 pt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-bold text-gray-700">Coupon is Active</span>
        </label>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
           <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-bold text-gray-500">Cancel</button>
           <button type="submit" disabled={loading} className="flex-2 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 px-6">
              {loading && <LoadingSpinner size="sm" />} {coupon ? "Update" : "Save Coupon"}
           </button>
        </div>
      </form>
    </Modal>
  );
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formModal, setFormModal] = useState({ isOpen: false, coupon: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, coupon: null });

  useEffect(() => { fetchCoupons(); }, [currentPage, searchQuery]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (searchQuery) params.append("search", searchQuery);
      const { data } = await api.get(`/coupons?${params}`);
      setCoupons(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData, id) => {
    try {
      if (id) await api.put(`/coupons/${id}`, formData);
      else await api.post("/coupons", formData);
      toast.success(id ? "Coupon updated" : "Coupon created");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to save coupon");
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/coupons/${deleteModal.coupon._id}`);
      toast.success("Coupon deleted");
      setDeleteModal({ isOpen: false, coupon: null });
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const columns = [
    {
      header: "Code",
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded border border-primary-100">{coupon.code}</span>
          <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast.success("Copied!"); }} className="p-1 hover:bg-gray-100 rounded">
            <Copy size={12} className="text-gray-400" />
          </button>
        </div>
      ),
    },
    {
      header: "Discount",
      render: (coupon) => (
        <span className="font-bold text-gray-900">
          {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
        </span>
      ),
    },
    { header: "Min Order", render: (coupon) => <span className="text-xs">₹{coupon.minOrderValue || 0}</span> },
    { header: "Usage", render: (coupon) => <span className="text-xs font-bold text-gray-500">{coupon.usedCount || 0} Uses</span> },
    { header: "Expiry", render: (coupon) => <span className="text-xs">{coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString() : "Never"}</span> },
    { header: "Status", render: (coupon) => <StatusBadge status={coupon.isActive ? "active" : "inactive"} /> },
    {
      header: "Actions",
      align: "right",
      render: (coupon) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setFormModal({ isOpen: true, coupon })} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={16} /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, coupon })} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons & Promo</h1>
          <p className="text-sm text-gray-500">Create discount codes for your customers</p>
        </div>
        <button onClick={() => setFormModal({ isOpen: true, coupon: null })} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all">
          <Plus size={18} /> New Coupon
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by code..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-medium outline-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={coupons} loading={loading} emptyMessage="No coupons found." />
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={10} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <CouponFormModal isOpen={formModal.isOpen} onClose={() => setFormModal({ isOpen: false, coupon: null })} coupon={formModal.coupon} onSave={handleSave} />
      
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, coupon: null })} 
        onConfirm={handleDelete} 
        title="Delete Coupon" 
        message={`Are you sure you want to delete ${deleteModal.coupon?.code}?`} 
        variant="danger" 
      />
    </div>
  );
};

export default Coupons;
