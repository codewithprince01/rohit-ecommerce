import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Copy,
  CheckCircle,
  XCircle,
  RefreshCw,
  Gift,
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
  LoadingSpinner,
  EmptyState,
} from "../components/AdminUI";
import toast from "react-hot-toast";

// Coupon Form Modal
const CouponFormModal = ({ isOpen, onClose, coupon, categories, onSave }) => {
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage", // percentage, fixed
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: null,
    usageLimit: null,
    usageLimitPerUser: 1,
    validFrom: "",
    validUntil: "",
    isActive: true,
    applicableCategories: [],
    applicableProducts: [],
    excludedProducts: [],
    firstOrderOnly: false,
    freeShipping: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "percentage",
        discountValue: coupon.discountValue || 0,
        minOrderValue: coupon.minOrderValue || 0,
        maxDiscount: coupon.maxDiscount || null,
        usageLimit: coupon.usageLimit || null,
        usageLimitPerUser: coupon.usageLimitPerUser || 1,
        validFrom: coupon.validFrom
          ? new Date(coupon.validFrom).toISOString().split("T")[0]
          : "",
        validUntil: coupon.validUntil
          ? new Date(coupon.validUntil).toISOString().split("T")[0]
          : "",
        isActive: coupon.isActive ?? true,
        applicableCategories: coupon.applicableCategories || [],
        firstOrderOnly: coupon.firstOrderOnly || false,
        freeShipping: coupon.freeShipping || false,
      });
    } else {
      // Generate random code
      const randomCode =
        "SAVE" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setFormData({
        code: randomCode,
        description: "",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 0,
        maxDiscount: null,
        usageLimit: null,
        usageLimitPerUser: 1,
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: "",
        isActive: true,
        applicableCategories: [],
        firstOrderOnly: false,
        freeShipping: false,
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (formData.discountValue <= 0) {
      toast.error("Discount value must be greater than 0");
      return;
    }

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

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={coupon ? "Edit Coupon" : "Create Coupon"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Coupon Code */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Coupon Code <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 uppercase font-mono tracking-wider"
                placeholder="SUMMER2025"
              />
              <button
                type="button"
                onClick={generateCode}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              placeholder="Get 10% off on your first order"
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Discount Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "percentage", label: "Percentage", icon: Percent },
                { value: "fixed", label: "Fixed Amount", icon: DollarSign },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, discountType: type.value })
                  }
                  className={`p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                    formData.discountType === type.value
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <type.icon size={18} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Discount Value <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                {formData.discountType === "percentage" ? "%" : "₹"}
              </span>
              <input
                type="number"
                min="0"
                max={formData.discountType === "percentage" ? 100 : undefined}
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountValue: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Min Order Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Minimum Order Value
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                min="0"
                value={formData.minOrderValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minOrderValue: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              />
            </div>
          </div>

          {/* Max Discount (for percentage) */}
          {formData.discountType === "percentage" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Maximum Discount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  value={formData.maxDiscount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxDiscount: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                  placeholder="No limit"
                />
              </div>
            </div>
          )}

          {/* Valid From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Valid From
            </label>
            <input
              type="date"
              value={formData.validFrom}
              onChange={(e) =>
                setFormData({ ...formData, validFrom: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Valid Until
            </label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) =>
                setFormData({ ...formData, validUntil: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Usage Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Total Usage Limit
            </label>
            <input
              type="number"
              min="0"
              value={formData.usageLimit || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usageLimit: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
              placeholder="Unlimited"
            />
          </div>

          {/* Per User Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Usage Limit Per User
            </label>
            <input
              type="number"
              min="1"
              value={formData.usageLimitPerUser}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  usageLimitPerUser: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
            />
          </div>

          {/* Options */}
          <div className="md:col-span-2 space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.firstOrderOnly}
                onChange={(e) =>
                  setFormData({ ...formData, firstOrderOnly: e.target.checked })
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  First Order Only
                </span>
                <p className="text-xs text-gray-500">
                  Only applicable for customer's first order
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.freeShipping}
                onChange={(e) =>
                  setFormData({ ...formData, freeShipping: e.target.checked })
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Free Shipping
                </span>
                <p className="text-xs text-gray-500">
                  Also provide free shipping with this coupon
                </p>
              </div>
            </label>
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Coupon is active
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            {coupon ? "Update Coupon" : "Create Coupon"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Main Coupons Component
const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [formModal, setFormModal] = useState({ isOpen: false, coupon: null });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    coupon: null,
  });
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
  }, [currentPage, searchQuery, statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter === "active") params.append("isActive", "true");
      if (statusFilter === "expired") params.append("expired", "true");

      const response = await api
        .get(`/coupons?${params}`)
        .catch(() => ({ data: { data: [] } }));
      const data = response.data;

      setCoupons(data.data || data.coupons || []);
      setTotalCoupons(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / itemsPerPage));
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSave = async (formData, couponId) => {
    try {
      if (couponId) {
        await api.put(`/coupons/${couponId}`, formData);
        toast.success("Coupon updated successfully");
      } else {
        await api.post("/coupons", formData);
        toast.success("Coupon created successfully");
      }
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save coupon");
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.coupon) return;

    try {
      setDeleting(true);
      await api.delete(`/coupons/${deleteModal.coupon._id}`);
      toast.success("Coupon deleted successfully");
      setDeleteModal({ isOpen: false, coupon: null });
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    } finally {
      setDeleting(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const isExpired = (coupon) => {
    if (!coupon.validUntil) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  const columns = [
    {
      header: "Code",
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
            {coupon.code}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyCode(coupon.code);
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Copy size={14} className="text-gray-400" />
          </button>
        </div>
      ),
    },
    {
      header: "Discount",
      render: (coupon) => (
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg ${coupon.discountType === "percentage" ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}
          >
            {coupon.discountType === "percentage" ? (
              <Percent size={16} />
            ) : (
              <DollarSign size={16} />
            )}
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">
            {coupon.discountType === "percentage"
              ? `${coupon.discountValue}%`
              : `₹${coupon.discountValue}`}
          </span>
        </div>
      ),
    },
    {
      header: "Min Order",
      render: (coupon) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          ₹{coupon.minOrderValue || 0}
        </span>
      ),
    },
    {
      header: "Usage",
      render: (coupon) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
        </span>
      ),
    },
    {
      header: "Valid Until",
      render: (coupon) => {
        if (!coupon.validUntil)
          return <span className="text-gray-400">No expiry</span>;
        const expired = isExpired(coupon);
        return (
          <span
            className={`text-sm ${expired ? "text-red-600" : "text-gray-600 dark:text-gray-300"}`}
          >
            {new Date(coupon.validUntil).toLocaleDateString()}
            {expired && " (Expired)"}
          </span>
        );
      },
    },
    {
      header: "Status",
      render: (coupon) => {
        if (isExpired(coupon)) return <StatusBadge status="inactive" />;
        return <StatusBadge status={coupon.isActive ? "active" : "inactive"} />;
      },
    },
    {
      header: "Actions",
      align: "right",
      render: (coupon) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFormModal({ isOpen: true, coupon });
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Edit2 size={16} className="text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ isOpen: true, coupon });
            }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
            Coupons & Offers
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage discount coupons
          </p>
        </div>
        <button
          onClick={() => setFormModal({ isOpen: true, coupon: null })}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
        >
          <Plus size={18} />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by coupon code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            {[
              { key: "all", label: "All" },
              { key: "active", label: "Active" },
              { key: "expired", label: "Expired" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setStatusFilter(filter.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  statusFilter === filter.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Coupons Table */}
      <Card padding={false}>
        <DataTable
          columns={columns}
          data={coupons}
          loading={loading}
          emptyMessage={
            <EmptyState
              icon={Gift}
              title="No coupons yet"
              description="Create your first coupon to offer discounts to customers"
              action={
                <button
                  onClick={() => setFormModal({ isOpen: true, coupon: null })}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
                >
                  Create Coupon
                </button>
              }
            />
          }
        />

        {totalCoupons > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCoupons}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* Coupon Form Modal */}
      <CouponFormModal
        isOpen={formModal.isOpen}
        onClose={() => setFormModal({ isOpen: false, coupon: null })}
        coupon={formModal.coupon}
        categories={categories}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, coupon: null })}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete coupon "${deleteModal.coupon?.code}"?`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

export default Coupons;
