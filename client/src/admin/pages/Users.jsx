import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import {
  DataTable,
  Modal,
  ConfirmDialog,
  LoadingSpinner,
  StatusBadge
} from '../components/AdminUI';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState({ isOpen: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users');
      setUsers(data.data || []);
    } catch (error) {
      toast.error('Failed to sync user ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { user } = editModal;
      await api.put(`/admin/users/${user._id}`, user);
      toast.success('User privileges synchronized');
      setEditModal({ isOpen: false, user: null });
      fetchUsers();
    } catch (error) {
      toast.error('Synchronization rejected');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${deleteModal.user._id}`);
      toast.success('User account purged');
      setDeleteModal({ isOpen: false, user: null });
      fetchUsers();
    } catch (error) {
      toast.error('Deletion restricted');
    }
  };

  const columns = [
    {
      header: 'Identity',
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200 uppercase">
            {u.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{u.name}</p>
            <p className="text-[10px] text-gray-400 font-medium truncate">{u.email}</p>
          </div>
        </div>
      )
    },
    {
       header: 'Contact',
       render: (u) => (
         <div className="flex flex-col gap-0.5">
           <div className="flex items-center gap-1.5 text-gray-500">
             <Mail size={12} /> <span className="text-[10px] font-bold">{u.email}</span>
           </div>
           <div className="flex items-center gap-1.5 text-gray-500">
             <Phone size={12} /> <span className="text-[10px] font-bold">{u.phone || 'N/A'}</span>
           </div>
         </div>
       )
    },
    {
      header: 'Access Level',
      render: (u) => {
        const roles = {
          super_admin: { color: 'bg-red-50 text-red-600 border-red-100', icon: ShieldAlert },
          admin: { color: 'bg-primary-50 text-primary-600 border-primary-100', icon: ShieldCheck },
          manager: { color: 'bg-blue-50 text-blue-600 border-blue-100', icon: Shield },
          staff: { color: 'bg-gray-50 text-gray-600 border-gray-100', icon: Users },
          user: { color: 'bg-slate-50 text-slate-500 border-slate-100', icon: Users }
        };
        const config = roles[u.role] || roles.user;
        const Icon = config.icon;
        return (
          <div className={`flex items-center w-fit gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${config.color}`}>
            <Icon size={12} /> {u.role.replace('_', ' ')}
          </div>
        );
      }
    },
    {
      header: 'System Status',
      render: (u) => (
        <div className="flex items-center gap-2">
          {u.isActive ? (
            <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase">
               <CheckCircle2 size={12} /> Online
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500 font-bold text-[10px] uppercase">
               <XCircle size={12} /> Suspended
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Activity',
      render: (u) => (
        <p className="text-[10px] font-bold text-gray-400">
          Last: {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
        </p>
      )
    },
    {
      header: 'Control',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setEditModal({ isOpen: true, user: { ...u } })} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit2 size={16} /></button>
          <button onClick={() => setDeleteModal({ isOpen: true, user: u })} className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Personnel & Users</h1>
          <p className="text-sm text-gray-500">Manage system access and roles across the organization</p>
        </div>
        <button onClick={() => toast('Registration currently limited to auth endpoints', { icon: 'ℹ️' })} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all">
          <UserPlus size={18} /> Direct Provision
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Search by name, email or access level..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-transparent text-sm font-medium outline-none" />
        </div>
        <button onClick={fetchUsers} className="p-2 text-gray-400 hover:text-primary-600 transition-colors"><RefreshCw size={18} /></button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <DataTable columns={columns} data={filteredUsers} loading={loading} emptyMessage="No users matching your database query." />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, user: null })} title="Modify Account Privileges" size="md">
        {editModal.user && (
          <form onSubmit={handleUpdate} className="space-y-4">
             <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
                <input type="text" value={editModal.user.name} onChange={(e) => setEditModal({...editModal, user: {...editModal.user, name: e.target.value}})} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm font-bold focus:border-primary-300 outline-none" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Authority Level</label>
                   <select value={editModal.user.role} onChange={(e) => setEditModal({...editModal, user: {...editModal.user, role: e.target.value}})} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm bg-white font-bold outline-none">
                      <option value="user">Regular User</option>
                      <option value="staff">Store Staff</option>
                      <option value="manager">Store Manager</option>
                      <option value="admin">Administrator</option>
                      <option value="super_admin">Head Administrator</option>
                   </select>
                </div>
                <div>
                   <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Operational Status</label>
                   <select value={editModal.user.isActive.toString()} onChange={(e) => setEditModal({...editModal, user: {...editModal.user, isActive: e.target.value === 'true'}})} className="w-full mt-1 px-4 py-2 border border-gray-100 rounded-lg text-sm bg-white font-bold outline-none">
                      <option value="true">Active (Access Granted)</option>
                      <option value="false">Suspended (Access Denied)</option>
                   </select>
                </div>
             </div>
             <div className="pt-4 border-t border-gray-50 flex gap-3">
                <button type="button" onClick={() => setEditModal({ isOpen: false, user: null })} className="flex-1 py-2 text-sm font-bold text-gray-500">Cancel</button>
                <button type="submit" disabled={saving} className="flex-2 px-6 py-2 bg-primary-600 text-white rounded-lg text-sm font-bold flex items-center gap-2">
                   {saving && <LoadingSpinner size="sm" />} Confirm Changes
                </button>
             </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, user: null })} onConfirm={handleDelete} title="Purge Account" message={`Caution: Pulsing ${deleteModal.user?.name} will permanently delete all metadata. This action is irreversible.`} variant="danger" />
    </div>
  );
};

export default AdminUsers;
