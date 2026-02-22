// Admin UI Components - Reusable components for the admin panel

import {
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { createPortal } from "react-dom";

// ============================================
// STATUS BADGE COMPONENT
// ============================================
export const StatusBadge = ({ status, size = "md" }) => {
  const statusConfig = {
    // Order statuses
    pending: {
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      label: "Pending",
    },
    confirmed: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Confirmed",
    },
    processing: {
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      label: "Processing",
    },
    picking: {
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      label: "Picking",
    },
    packed: {
      color: "bg-purple-100 text-purple-700 border-purple-200",
      label: "Packed",
    },
    shipped: {
      color: "bg-sky-100 text-sky-700 border-sky-200",
      label: "Shipped",
    },
    out_for_delivery: {
      color: "bg-teal-100 text-teal-700 border-teal-200",
      label: "Out for Delivery",
    },
    delivered: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Delivered",
    },
    cancelled: {
      color: "bg-red-100 text-red-700 border-red-200",
      label: "Cancelled",
    },
    returned: {
      color: "bg-orange-100 text-orange-700 border-orange-200",
      label: "Returned",
    },
    refunded: {
      color: "bg-gray-100 text-gray-700 border-gray-200",
      label: "Refunded",
    },

    // Payment statuses
    paid: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Paid",
    },
    unpaid: {
      color: "bg-red-100 text-red-700 border-red-200",
      label: "Unpaid",
    },
    partial: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Partial",
    },

    // Stock statuses
    in_stock: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "In Stock",
    },
    low_stock: {
      color: "bg-orange-100 text-orange-700 border-orange-200",
      label: "Low Stock",
    },
    out_of_stock: {
      color: "bg-red-100 text-red-700 border-red-200",
      label: "Out of Stock",
    },

    // General
    active: {
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      label: "Active",
    },
    inactive: {
      color: "bg-gray-100 text-gray-700 border-gray-200",
      label: "Inactive",
    },
    draft: {
      color: "bg-slate-100 text-slate-700 border-slate-200",
      label: "Draft",
    },

    // Default
    default: {
      color: "bg-gray-100 text-gray-700 border-gray-200",
      label: status,
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.color} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
};

// ============================================
// MODAL COMPONENT
// ============================================
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// ============================================
// CONFIRM DIALOG COMPONENT
// ============================================
export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  const variantClasses = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    success: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
  };

  const iconMap = {
    danger: <AlertCircle className="text-red-600" size={24} />,
    warning: <AlertTriangle className="text-orange-600" size={24} />,
    info: <Info className="text-blue-600" size={24} />,
    success: <CheckCircle className="text-emerald-600" size={24} />,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showClose={false}>
      <div className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          {iconMap[variant]}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses[variant]} disabled:opacity-50`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ============================================
// DATA TABLE COMPONENT
// ============================================
export const DataTable = ({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectRows,
}) => {
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectRows?.(data.map((item) => item._id || item.id));
    } else {
      onSelectRows?.([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      onSelectRows?.(selectedRows.filter((rowId) => rowId !== id));
    } else {
      onSelectRows?.([...selectedRows, id]);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            {selectable && (
              <th className="px-4 py-4 w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={
                    data.length > 0 &&
                    data.every((item) =>
                      selectedRows.includes(item._id || item.id),
                    )
                  }
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={`px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.align === "right" ? "text-right" : "text-left"}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                {selectable && (
                  <td className="px-4 py-4">
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </td>
                )}
                {columns.map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr
                key={row._id || row.id || rowIdx}
                className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td
                    className="px-4 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={selectedRows.includes(row._id || row.id)}
                      onChange={() => handleSelectRow(row._id || row.id)}
                    />
                  </td>
                )}
                {columns.map((column, colIdx) => (
                  <td
                    key={colIdx}
                    className={`px-6 py-4 ${column.align === "right" ? "text-right" : ""}`}
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-6 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// PAGINATION COMPONENT
// ============================================
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-semibold">{startItem}</span> to{" "}
        <span className="font-semibold">{endItem}</span> of{" "}
        <span className="font-semibold">{totalItems}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {getPageNumbers().map((page, idx) => (
          <button
            key={idx}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              page === currentPage
                ? "bg-indigo-600 text-white"
                : page === "..."
                  ? "text-gray-400 cursor-default"
                  : "text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ============================================
// LOADING SPINNER
// ============================================
export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
};

// ============================================
// EMPTY STATE
// ============================================
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    {Icon && (
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        <Icon size={32} className="text-gray-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
    )}
    {action}
  </div>
);

// ============================================
// CARD COMPONENT
// ============================================
export const Card = ({ children, className = "", padding = true }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${padding ? "p-6" : ""} ${className}`}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {subtitle}
        </p>
      )}
    </div>
    {action}
  </div>
);
