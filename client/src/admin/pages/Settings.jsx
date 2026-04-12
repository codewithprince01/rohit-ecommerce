import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../../services/api';
import {
  RefreshCw,
  Save,
  Store,
  Share2,
  Search,
  Smartphone,
  Upload,
  Image as ImageIcon,
  Type
} from 'lucide-react';
import { LoadingSpinner } from '../components/AdminUI';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: '',
    whatsappNumber: '',
    whatsappMessage: '',
    businessHours: '',
    seo: { metaTitle: '', metaDescription: '', metaKeywords: '' },
    socialMedia: { facebook: '', instagram: '', twitter: '' }
  });

  const [files, setFiles] = useState({
    logo: null,
    favicon: null
  });
  
  const [previews, setPreviews] = useState({
    logo: null,
    favicon: null
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
      setLoading(true);
      const response = await api.get('/settings');
      const data = response.data.data;
      setFormData(data);
      setPreviews({
        logo: getImageUrl(data.logo),
        favicon: getImageUrl(data.favicon)
      });
    } catch (error) {
      console.error(error);
      toast.error('Settings fetch error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [type]: file });
      setPreviews({ ...previews, [type]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      
      // Append files
      if (files.logo) data.append('logo', files.logo);
      if (files.favicon) data.append('favicon', files.favicon);
      
      // Append text fields
      Object.keys(formData).forEach(key => {
        if (key === 'socialMedia' || key === 'seo') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      const response = await api.put('/settings', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(response.data.data);
      toast.success('Settings synchronized successfully');
    } catch (error) {
      console.error(error);
      toast.error('Sync failure');
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
        [parent]: { ...formData[parent], [child]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Global Settings</h1>
            <p className="text-sm text-gray-500">Master configuration for your store</p>
         </div>
         <button onClick={fetchSettings} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400"><RefreshCw size={18} /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        {/* Branding Assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <ImageIcon size={14} className="text-primary-600" /> Branding Assets
              </h3>
              <div className="flex gap-6">
                 {/* Logo Upload */}
                 <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Store Logo</label>
                    <div onClick={() => logoInputRef.current.click()} className="relative aspect-video rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center bg-gray-50/50 cursor-pointer hover:border-primary-300 transition-colors overflow-hidden group">
                       {previews.logo ? (
                         <img src={previews.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                       ) : (
                         <Upload className="text-gray-300" size={24} />
                       )}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change Logo</span>
                       </div>
                    </div>
                    <input ref={logoInputRef} type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                 </div>
                 
                 {/* Favicon Upload */}
                 <div className="w-24 space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Favicon</label>
                    <div onClick={() => faviconInputRef.current.click()} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center bg-gray-50/50 cursor-pointer hover:border-primary-300 transition-colors overflow-hidden group">
                       {previews.favicon ? (
                         <img src={previews.favicon} alt="Favicon" className="w-full h-full object-contain p-4" />
                       ) : (
                         <Upload className="text-gray-300" size={20} />
                       )}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-center">
                          <span className="text-[8px] font-bold text-white uppercase leading-tight">Change Icon</span>
                       </div>
                    </div>
                    <input ref={faviconInputRef} type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'favicon')} />
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Smartphone size={14} className="text-emerald-600" /> Shop Communications
              </h3>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">WhatsApp Number</label>
                    <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="+91 9999999999" className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Default Order Message</label>
                    <textarea name="whatsappMessage" value={formData.whatsappMessage} onChange={handleChange} rows={2} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 resize-none focus:border-primary-300 outline-none" />
                 </div>
              </div>
           </div>
        </div>

        {/* Identity Details */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Store size={14} className="text-gray-600" /> Business Identity
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Official Business Name</label>
                 <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 focus:border-primary-300 outline-none" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Customer Support Email</label>
                 <input type="email" name="storeEmail" value={formData.storeEmail} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-300 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Support Phone</label>
                 <input type="tel" name="storePhone" value={formData.storePhone} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-300 outline-none transition-all" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Working Hours</label>
                 <input type="text" name="businessHours" value={formData.businessHours} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-300 outline-none transition-all" />
              </div>
              <div className="md:col-span-2 space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Official Terms & Store Description</label>
                 <textarea name="storeDescription" value={formData.storeDescription} onChange={handleChange} rows={3} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-primary-300 outline-none transition-all" />
              </div>
           </div>
        </div>

        {/* SEO & Search */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Search size={14} className="text-blue-600" /> Search Engine Reach (SEO)
           </h3>
           <div className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Search Browser Title</label>
                 <input type="text" name="seo.metaTitle" value={formData.seo?.metaTitle || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-900 dark:text-gray-100" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Meta Keywords (Comma separated)</label>
                 <input type="text" name="seo.metaKeywords" value={formData.seo?.metaKeywords || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Search Description</label>
                 <textarea name="seo.metaDescription" value={formData.seo?.metaDescription || ''} onChange={handleChange} rows={2} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 resize-none" />
              </div>
           </div>
        </div>

        {/* Social Presence */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Share2 size={14} className="text-purple-600" /> Social Presence
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Instagram URL</label>
                 <input type="text" name="socialMedia.instagram" value={formData.socialMedia?.instagram || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">Facebook URL</label>
                 <input type="text" name="socialMedia.facebook" value={formData.socialMedia?.facebook || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-500 uppercase">X (Twitter) URL</label>
                 <input type="text" name="socialMedia.twitter" value={formData.socialMedia?.twitter || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
              </div>
           </div>
        </div>

        <div className="fixed bottom-8 right-8 z-50">
           <button type="submit" disabled={saving} className="flex items-center gap-3 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-sm font-black shadow-2xl shadow-primary-600/40 transition-all hover:scale-110 active:scale-95">
              {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'UPDATING...' : 'SAVE ALL SETTINGS'}
           </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
