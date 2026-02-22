import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [user, navigate, filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = filter ? `/orders?status=${filter}` : '/orders';
      const response = await api.get(url);
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
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
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-48"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
                <p className="text-sm text-gray-600">{order.customerPhone}</p>
                {order.customerEmail && (
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                <p className="text-lg font-bold text-primary-600 mt-1">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
              <ul className="space-y-1">
                {order.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600">
                    {item.productName} - {item.quantity} x ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            {order.deliveryAddress && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Delivery Address:</h4>
                <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
              </div>
            )}

            {order.notes && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700">Notes:</h4>
                <p className="text-sm text-gray-600">{order.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status:</span>
                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {order.whatsappSent && (
                <span className="text-xs text-green-600">
                  ✓ WhatsApp sent
                </span>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
