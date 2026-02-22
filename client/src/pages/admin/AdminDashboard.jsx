import { useEffect, useState } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminMessages from './AdminMessages';
import AdminSettings from './AdminSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/admin" className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              View Store
            </Link>
            <span className="text-gray-700">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="btn btn-secondary text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/admin"
              className="py-4 px-1 border-b-2 border-transparent hover:border-primary-600 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/categories"
              className="py-4 px-1 border-b-2 border-transparent hover:border-primary-600 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Categories
            </Link>
            <Link
              to="/admin/products"
              className="py-4 px-1 border-b-2 border-transparent hover:border-primary-600 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Products
            </Link>
            <Link
              to="/admin/orders"
              className="py-4 px-1 border-b-2 border-transparent hover:border-primary-600 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Orders
            </Link>
            <Link
              to="/admin/messages"
              className="py-4 px-1 border-b-2 border-transparent hover:border-primary-600 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Messages
            </Link>
            <Link
              to="/admin/settings"
              className="py-4 px-1 border-b-2 border-transparent hover:border-primary-600 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardHome = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes, messagesRes] = await Promise.all([
        api.get('/products?limit=1'),
        api.get('/categories'),
        api.get('/orders?limit=1'),
        api.get('/contact-messages?limit=1')
      ]);

      setStats({
        products: productsRes.data.total || productsRes.data.data?.length || 0,
        categories: categoriesRes.data.data?.length || 0,
        orders: ordersRes.data.total || ordersRes.data.data?.length || 0,
        messages: messagesRes.data.total || messagesRes.data.data?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set default values on error
      setStats({ products: 0, categories: 0, orders: 0, messages: 0 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.products}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Categories</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.categories}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Orders</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.orders}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm font-medium">Messages</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {loading ? '...' : stats.messages}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link 
            to="/admin/categories" 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center mb-2">
              <div className="bg-primary-100 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Manage Categories</h3>
            </div>
            <p className="text-sm text-gray-600">Add, edit, or delete product categories</p>
          </Link>

          <Link 
            to="/admin/products" 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center mb-2">
              <div className="bg-blue-100 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Manage Products</h3>
            </div>
            <p className="text-sm text-gray-600">Add, edit, or delete products from inventory</p>
          </Link>

          <Link 
            to="/admin/orders" 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center mb-2">
              <div className="bg-yellow-100 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">View Orders</h3>
            </div>
            <p className="text-sm text-gray-600">Manage and track customer orders</p>
          </Link>

          <Link 
            to="/admin/messages" 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center mb-2">
              <div className="bg-purple-100 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Contact Messages</h3>
            </div>
            <p className="text-sm text-gray-600">View and respond to customer inquiries</p>
          </Link>

          <Link 
            to="/admin/settings" 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center mb-2">
              <div className="bg-gray-100 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Settings</h3>
            </div>
            <p className="text-sm text-gray-600">Configure store settings and preferences</p>
          </Link>

          <Link 
            to="/" 
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center mb-2">
              <div className="bg-green-100 rounded-lg p-2 mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">View Store</h3>
            </div>
            <p className="text-sm text-gray-600">Visit the public-facing store</p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Admin Access</h3>
            <p className="text-sm text-gray-600">You have full administrative privileges</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Dashboard Version</h3>
            <p className="text-sm text-gray-600">v1.0.0 - Ecommerce Admin Panel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
