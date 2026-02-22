import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

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
    setLoading(true);
    try {
      const url = filter !== '' ? `/contact?isRead=${filter}` : '/contact';
      const response = await api.get(url);
      setMessages(response.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      toast.success('Marked as read');
      fetchMessages();
    } catch (error) {
      console.error('Error marking message:', error);
      toast.error('Failed to update message');
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await api.delete(`/contact/${id}`);
      toast.success('Message deleted');
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">All Messages</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`bg-white rounded-lg shadow p-6 ${
              !message.isRead ? 'border-l-4 border-primary-600' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{message.name}</h3>
                <p className="text-sm text-gray-600">{message.email}</p>
                {message.phone && (
                  <p className="text-sm text-gray-600">{message.phone}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{formatDate(message.createdAt)}</p>
                {!message.isRead && (
                  <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                    Unread
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Subject:</h4>
              <p className="text-sm text-gray-900">{message.subject}</p>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Message:</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{message.message}</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              {!message.isRead && (
                <button
                  onClick={() => markAsRead(message._id)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Mark as Read
                </button>
              )}
              <button
                onClick={() => deleteMessage(message._id)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No messages found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
