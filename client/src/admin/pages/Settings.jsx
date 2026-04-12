import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    whatsappNumber: '',
    whatsappMessage: '',
    businessHours: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    },
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/settings', formData);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="storeEmail"
                value={formData.storeEmail}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="storePhone"
                value={formData.storePhone}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours
              </label>
              <input
                type="text"
                name="businessHours"
                value={formData.businessHours}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleChange}
                rows={3}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="storeAddress"
                value={formData.storeAddress}
                onChange={handleChange}
                rows={2}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Integration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number (with country code)
              </label>
              <input
                type="text"
                name="whatsappNumber"
                value={formData.whatsappNumber}
                onChange={handleChange}
                placeholder="+1234567890"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default WhatsApp Message
              </label>
              <textarea
                name="whatsappMessage"
                value={formData.whatsappMessage}
                onChange={handleChange}
                rows={3}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="text"
                name="socialMedia.facebook"
                value={formData.socialMedia?.facebook || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia?.instagram || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="text"
                name="socialMedia.twitter"
                value={formData.socialMedia?.twitter || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Title
              </label>
              <input
                type="text"
                name="seo.metaTitle"
                value={formData.seo?.metaTitle || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                name="seo.metaDescription"
                value={formData.seo?.metaDescription || ''}
                onChange={handleChange}
                rows={2}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                name="seo.metaKeywords"
                value={formData.seo?.metaKeywords || ''}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
