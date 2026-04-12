import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { 
  Mail, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  Search, 
  Clock, 
  MessageSquare,
  User,
  Phone,
  ChevronRight,
  Inbox,
  Archive,
  Star,
  MoreVertical,
  ArrowLeft,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { LoadingSpinner, StatusBadge } from '../components/AdminUI';

const AdminMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchMessages();
  }, [user, navigate]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contact');
      const data = response.data.data || [];
      setMessages(data);
      if (data.length > 0 && !selectedMessage && !isMobileView) {
        setSelectedMessage(data[0]);
      }
    } catch (error) {
      toast.error('Inbound communications failure');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      toast.success('Message archived');
      setMessages(messages.map(m => m._id === id ? { ...m, isRead: true } : m));
      if (selectedMessage?._id === id) {
        setSelectedMessage({ ...selectedMessage, isRead: true });
      }
    } catch (error) { toast.error('Status sync error'); }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Permanent deletion of this record?')) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success('Record purged');
      const updatedMessages = messages.filter(m => m._id !== id);
      setMessages(updatedMessages);
      if (selectedMessage?._id === id) {
        setSelectedMessage(updatedMessages[0] || null);
      }
    } catch (error) { toast.error('Deactivation restricted'); }
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name?.toLowerCase().includes(search.toLowerCase()) || 
      m.subject?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'unread') return matchesSearch && !m.isRead;
    if (filter === 'archived') return matchesSearch && m.isRead;
    return matchesSearch;
  });

  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    archived: messages.filter(m => m.isRead).length
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <LoadingSpinner size="lg" />
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Support Inquiry Center</h1>
          <p className="text-sm text-gray-500 font-medium">Manage and resolve customer communications in real-time</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex bg-white dark:bg-gray-800 rounded-xl p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
              <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter === 'all' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>All</button>
              <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter === 'unread' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Unread ({stats.unread})</button>
              <button onClick={() => setFilter('archived')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${filter === 'archived' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Resolved</button>
           </div>
           <button onClick={fetchMessages} className="p-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all text-gray-500 shadow-sm"><RefreshCw size={18} /></button>
        </div>
      </div>

      {/* Main Inbox View */}
      <div className="flex-1 flex bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden min-h-0">
        
        {/* Sidebar List */}
        <div className={`${selectedMessage && isMobileView ? 'hidden' : 'w-full md:w-80 lg:w-96'} flex flex-col border-r border-gray-100 dark:border-gray-700 min-h-0`}>
          <div className="p-4 border-b border-gray-50 dark:border-gray-700/50">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter inquiries..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500"
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg) => (
                <div 
                  key={msg._id} 
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 cursor-pointer transition-all border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 relative ${selectedMessage?._id === msg._id ? 'bg-primary-50/30 border-l-4 border-l-primary-600' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isRead ? 'text-gray-400' : 'text-primary-600 font-bold'}`}>
                      {msg.isRead ? 'Archived' : 'New Priority'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">{new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h4 className={`text-sm truncate pr-4 ${!msg.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>{msg.subject}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-500 uppercase">{msg.name?.charAt(0)}</div>
                    <p className="text-[11px] text-gray-400 font-medium truncate">{msg.name}</p>
                  </div>
                  {!msg.isRead && (
                    <div className="absolute right-4 bottom-4 w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Inbox size={32} className="text-gray-300" /></div>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Inbox Resolved</p>
              </div>
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className={`${!selectedMessage && isMobileView ? 'hidden' : 'flex-1'} flex flex-col bg-gray-50/30 dark:bg-gray-900/10 min-h-0`}>
          {selectedMessage ? (
             <>
               {/* Detail Header */}
               <div className="p-4 md:p-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     {isMobileView && (
                       <button onClick={() => setSelectedMessage(null)} className="p-2 -ml-2 text-gray-500"><ArrowLeft size={20} /></button>
                     )}
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-600/20 uppercase">
                        {selectedMessage.name?.charAt(0)}
                     </div>
                     <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedMessage.name}</h2>
                        <p className="text-xs text-primary-600 font-bold uppercase tracking-tight">{selectedMessage.email}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => deleteMessage(selectedMessage._id)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Inquiry"><Trash2 size={20} /></button>
                     {!selectedMessage.isRead && (
                       <button onClick={() => markAsRead(selectedMessage._id)} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95">
                          <CheckCircle2 size={16} /> Resolve
                       </button>
                     )}
                  </div>
               </div>

               {/* Detail Content */}
               <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar">
                  <div className="space-y-6">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black text-primary-600/80 uppercase tracking-widest">Subject Reference</span>
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{selectedMessage.subject}</h3>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-800 rounded-3xl border border-primary-100/50 dark:border-gray-700 shadow-sm relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><MessageSquare size={80} className="text-primary-600" /></div>
                       <blockquote className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed italic relative z-10 font-medium">
                          "{selectedMessage.message}"
                       </blockquote>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Mail size={20} /></div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Communication Channel</p>
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedMessage.email}</p>
                          </div>
                       </div>
                       <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Phone size={20} /></div>
                          <div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Direct Contact</p>
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedMessage.phone || 'Registry Unavailable'}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-gray-400">
                     <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest ">
                        <Clock size={14} /> Received on {new Date(selectedMessage.createdAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                     </div>
                     <StatusBadge status={selectedMessage.isRead ? 'archived' : 'unread'} />
                  </div>
               </div>
             </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6"><MessageSquare size={48} className="text-gray-300" /></div>
               <h3 className="text-xl font-bold text-gray-600 mb-2 font-display">Communication Hub Ready</h3>
               <p className="text-sm text-gray-400 max-w-xs">Select an inquiry from the inbox to review communication details and commercial requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
