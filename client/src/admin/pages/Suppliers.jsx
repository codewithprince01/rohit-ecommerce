import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Building,
  User,
  Star,
  Download,
  Filter,
  ArrowRight,
  Truck
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

const SupplierFormModal = ({ isOpen, onClose, supplier, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "distributor",
    contact: {
      primary: { name: "", phone: "", email: "", designation: "" }
    },
    address: {
      billing: { street: "", city: "", state: "", postalCode: "", country: "India" }
    },
    isActive: true,
    status: "active"
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        code: supplier.code || "",
        type: supplier.type || "distributor",
        contact: {
          primary: {
            name: supplier.contact?.primary?.name || "",
            phone: supplier.contact?.primary?.phone || "",
            email: supplier.contact?.primary?.email || "",
            designation: supplier.contact?.primary?.designation || ""
          }
        },
        address: {
          billing: {
            street: supplier.address?.billing?.street || "",
            city: supplier.address?.billing?.city || "",
            state: supplier.address?.billing?.state || "",
            postalCode: supplier.address?.billing?.postalCode || "",
            country: supplier.address?.billing?.country || "India"
          }
        },
        isActive: supplier.isActive ?? true,
        status: supplier.status || "active"
      });
    } else {
      setFormData({
        name: "",
        code: "",
        type: "distributor",
        contact: {
          primary: { name: "", phone: "", email: "", designation: "" }
        },
        address: {
          billing: { street: "", city: "", state: "", postalCode: "", country: "India" }
        },
        isActive: true,
        status: "active"
      });
    }
  }, [supplier, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Supplier name is required");
    setLoading(true);
    try {
      await onSave(formData, supplier?._id);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={supplier ? "Edit Supplier" : "Register New Supplier"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="space-y-4">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Business Identity</h4>
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Company Name</label>
               <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-primary-300" placeholder="E.G. Green Valley Farms" />
             </div>
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Vendor Type</label>
               <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none bg-white">
                 <option value="distributor">Distributor</option>
                 <option value="wholesaler">Wholesaler</option>
                 <option value="manufacturer">Manufacturer</option>
                 <option value="farmer">Farmer/Producer</option>
               </select>
             </div>
          </div>

          {/* Primary Contact */}
          <div className="space-y-4">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Key Account Manager</h4>
             <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Contact Name</label>
               <input type="text" value={formData.contact.primary.name} onChange={(e) => setFormData({...formData, contact: { primary: { ...formData.contact.primary, name: e.target.value }}})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-primary-300" placeholder="E.G. Rajesh Kumar" />
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                  <input type="text" value={formData.contact.primary.phone} onChange={(e) => setFormData({...formData, contact: { primary: { ...formData.contact.primary, phone: e.target.value }}})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" placeholder="9876543210" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                  <input type="email" value={formData.contact.primary.email} onChange={(e) => setFormData({...formData, contact: { primary: { ...formData.contact.primary, email: e.target.value }}})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" placeholder="vendor@email.com" />
                </div>
             </div>
          </div>

          {/* Location */}
          <div className="md:col-span-2 space-y-4">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Operational Hub</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Street Address</label>
                  <input type="text" value={formData.address.billing.street} onChange={(e) => setFormData({...formData, address: { billing: { ...formData.address.billing, street: e.target.value }}})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                  <input type="text" value={formData.address.billing.city} onChange={(e) => setFormData({...formData, address: { billing: { ...formData.address.billing, city: e.target.value }}})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">State</label>
                  <input type="text" value={formData.address.billing.state} onChange={(e) => setFormData({...formData, address: { billing: { ...formData.address.billing, state: e.target.value }}})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Pincode</label>
                  <input type="text" value={formData.address.billing.postalCode} onChange={(e) => setFormData({...formData, address: { billing: { ...formData.address.billing, postalCode: e.target.value }}})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value, isActive: e.target.value === 'active'})} className="w-full mt-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
             </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
           <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-bold text-gray-500">Discard</button>
           <button type="submit" disabled={loading} className="flex-2 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 px-6">
              {loading && <LoadingSpinner size="sm" />} {supplier ? "Update Supplier" : "Register Supplier"}
           </button>
        </div>
      </form>
    </Modal>
  );
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, active: 0, preferred: 0 });
  const [formModal, setFormModal] = useState({ isOpen: false, supplier: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, supplier: null });

  useEffect(() => { fetchSuppliers(); fetchStats(); }, [currentPage, searchQuery]);

  const fetchStats = async () => {
    try {
      const { data } = await api.get("/suppliers/stats");
      setStats(data);
    } catch (error) { console.error(error); }
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage, limit: 10 });
      if (searchQuery) params.append("search", searchQuery);
      const { data } = await api.get(`/suppliers?${params}`);
      setSuppliers(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (error) {
      console.error(error);
      toast.error("Suppliers communication error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData, id) => {
    try {
      if (id) await api.put(`/suppliers/${id}`, formData);
      else await api.post("/suppliers", formData);
      toast.success(id ? "Record updated" : "Supplier registered");
      fetchSuppliers(); fetchStats();
    } catch (error) {
      toast.error("Failed to sync record");
      throw error;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/suppliers/${deleteModal.supplier._id}`);
      toast.success("Supplier deactivated");
      setDeleteModal({ isOpen: false, supplier: null });
      fetchSuppliers(); fetchStats();
    } catch (error) {
      toast.error("Action restricted");
    }
  };

  const columns = [
    {
      header: "Business Name",
      render: (supplier) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-gray-100 rounded-lg bg-white flex items-center justify-center text-primary-600">
             <Building size={20} />
          </div>
          <div className="min-w-0">
             <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{supplier.name}</p>
             <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tight">{supplier.code}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Key Contact",
      render: (supplier) => (
        <div className="space-y-0.5">
           <p className="text-xs font-bold flex items-center gap-1.5"><User size={12} className="text-gray-400" /> {supplier.contact?.primary?.name}</p>
           <p className="text-[10px] text-gray-500 font-medium">{supplier.contact?.primary?.phone}</p>
        </div>
      ),
    },
    {
      header: "Service Type",
      render: (supplier) => <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-1 bg-gray-50 rounded-lg">{supplier.type}</span>,
    },
    {
      header: "Operational Area",
      render: (supplier) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
           <MapPin size={12} /> {supplier.address?.billing?.city}, {supplier.address?.billing?.state}
        </div>
      ),
    },
    { header: "Status", render: (supplier) => <StatusBadge status={supplier.status} /> },
    {
      header: "Action",
      align: "right",
      render: (supplier) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setFormModal({ isOpen: true, supplier })} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={16} /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, supplier })} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Supply Chain Network</h1>
          <p className="text-sm text-gray-500">Manage your warehouse partners and vendors</p>
        </div>
        <button onClick={() => setFormModal({ isOpen: true, supplier: null })} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size={18} /> Partner Registration
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {[
           { label: "Partner Network", value: stats.total, color: "text-blue-600 bg-blue-50" },
           { label: "Active Channels", value: stats.active, color: "text-emerald-600 bg-emerald-50" },
           { label: "Preferred Vendors", value: stats.preferred, color: "text-amber-600 bg-amber-50" },
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
              <span className={`text-xl font-black ${stat.color} px-4 py-1 rounded-xl`}>{stat.value}</span>
           </div>
         ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search partners by name, code or city..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-black text-gray-900 dark:text-gray-100 outline-none placeholder:text-gray-400" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={suppliers} loading={loading} emptyMessage="No distribution partners registered yet." />
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      <SupplierFormModal isOpen={formModal.isOpen} onClose={() => setFormModal({ isOpen: false, supplier: null })} supplier={formModal.supplier} onSave={handleSave} />
      
      <ConfirmDialog 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, supplier: null })} 
        onConfirm={handleDelete} 
        title="Deactivate Partner" 
        message={`Are you sure you want to suspend commerce with ${deleteModal.supplier?.name}?`} 
        variant="danger" 
      />
    </div>
  );
};

export default Suppliers;
