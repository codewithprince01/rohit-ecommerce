import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { Mail, Trash2, CheckCircle, RefreshCw, Filter, Search, User, Clock, MessageSquare } from 'lucide-react';
import { LoadingSpinner, StatusBadge } from '../components/AdminUI';

const AdminMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchMessages();
  }, [user, navigate, filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const url = filter !== '' ? `/contact?isRead=${filter}` : '/contact';
      const response = await api.get(url);
      setMessages(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error('Inbound communications failure');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      toast.success('Message archived as read');
      fetchMessages();
    } catch (error) { toast.error('Status sync error'); }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Permanent deletion of this record?')) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success('Record purged');
      fetchMessages();
    } catch (error) { toast.error('Deactivation restricted'); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Inquiries</h1>
          <p className="text-sm text-gray-500 font-medium">Manage your inbound contact messages</p>
        </div>
        <div className="flex items-center gap-2">
           <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold uppercase tracking-wider bg-white dark:bg-gray-800 outline-none">
              <option value="">All Threads</option>
              <option value="false">Unread Only</option>
              <option value="true">Archived</option>
           </select>
           <button onClick={fetchMessages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"><RefreshCw size={18} /></button>
        </div>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message._id} className={`bg-white dark:bg-gray-800 rounded-2xl border ${!message.isRead ? 'border-primary-600 shadow-md shadow-primary-600/5' : 'border-gray-100 dark:border-gray-700'} p-5 transition-all hover:shadow-lg`}>
            <div className="flex flex-col md:flex-row gap-6">
               <div className="md:w-64 space-y-3">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-primary-600 text-xs font-bold">
                        {message.name?.charAt(0)}
                     </div>
                     <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{message.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight truncate">{message.email}</p>
                     </div>
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><Clock size={12} /> {new Date(message.createdAt).toLocaleDateString()}</div>
                     <div className="flex items-center gap-2 text-xs text-gray-500 font-medium"><Phone size={12} /> {message.phone || 'N/A'}</div>
                  </div>
                  {!message.isRead && <span className="inline-block px-3 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full">New Message</span>}
               </div>

               <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                       <MessageSquare size={12} className="text-primary-600" /> Subject: {message.subject}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic bg-gray-50/50 p-4 rounded-xl">
                       "{message.message}"
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-4 border-t border-gray-50 pt-4">
                     {!message.isRead && (
                       <button onClick={() => markAsRead(message._id)} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
                          <CheckCircle size={14} /> Mark as Resolved
                       </button>
                     )}
                     <button onClick={() => deleteMessage(message._id)} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                        <Trash2 size={14} /> Purge
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Mail className="text-gray-300" size={32} /></div>
             <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Inbox is fully resolved</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
