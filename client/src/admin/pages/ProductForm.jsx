import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService } from '../../services';
import { Upload, X, Save, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from '../../components/common/Head';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        comparePrice: '',
        unit: '',
        category: '',
        subCategory: '',
        subSubCategory: '',
        stock: '0',
        active: true
    });
    const [images, setImages] = useState([]); // File objects (new)
    const [existingImages, setExistingImages] = useState([]); // URL strings (edit)
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [subSubCategories, setSubSubCategories] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getAll();
                setCategories(res.data);
            } catch (error) {
                toast.error('Failed to load categories');
            }
        };

        const fetchProduct = async () => {
            try {
                const res = await productService.getById(id);
                const p = res.data;
                setFormData({
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    comparePrice: p.comparePrice || '',
                    unit: p.unit,
                    category: p.category?._id || p.category || '',
                    subCategory: p.subCategory?._id || p.subCategory || '',
                    subSubCategory: p.subSubCategory?._id || p.subSubCategory || '',
                    stock: p.stock,
                    active: p.isActive !== undefined ? p.isActive : true
                });
                setExistingImages((p.images || []).map(img => img.url || img));
                
                // If editing, load dependent categories
                if (p.category) {
                    const subRes = await categoryService.getSubcategories(p.category?._id || p.category);
                    setSubcategories(subRes.data);
                }
                if (p.subCategory) {
                    const ssubRes = await categoryService.getSubSubCategories(p.subCategory?._id || p.subCategory);
                    setSubSubCategories(ssubRes.data);
                }
            } catch (error) {
                toast.error('Failed to load product details');
                navigate('/admin/products');
            } finally {
                setInitialLoading(false);
            }
        };

        fetchCategories();
        if (isEdit) fetchProduct();
    }, [id, isEdit, navigate]);

    // Handle Category Change -> Load Subcategories
    const handleCategoryChange = async (categoryId) => {
        setFormData(prev => ({ ...prev, category: categoryId, subCategory: '', subSubCategory: '' }));
        setSubcategories([]);
        setSubSubCategories([]);
        if (categoryId) {
            try {
                const res = await categoryService.getSubcategories(categoryId);
                setSubcategories(res.data);
            } catch (error) {
                toast.error('Failed to load subcategories');
            }
        }
    };

    // Handle Subcategory Change -> Load SubSubCategories
    const handleSubcategoryChange = async (subcategoryId) => {
        setFormData(prev => ({ ...prev, subCategory: subcategoryId, subSubCategory: '' }));
        setSubSubCategories([]);
        if (subcategoryId) {
            try {
                const res = await categoryService.getSubSubCategories(subcategoryId);
                setSubSubCategories(res.data);
            } catch (error) {
                toast.error('Failed to load sub-subcategories');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        if (name === 'category') {
            handleCategoryChange(value);
        } else if (name === 'subCategory') {
            handleSubcategoryChange(value);
        } else {
            setFormData({ ...formData, [name]: val });
        }
        
        setFormErrors(prev => {
            const updated = { ...prev };
            delete updated[name];
            return updated;
        });
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files)]);
        }
    };

    const removeNewImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = async (imagePath) => {
        if (!confirm('Are you sure you want to remove this image?')) return;
        try {
            await productService.deleteImage(id, imagePath);
            setExistingImages(prev => prev.filter(img => img !== imagePath));
            toast.success('Image removed');
        } catch (error) {
            toast.error('Failed to remove image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });
        
        images.forEach(image => {
            data.append('images', image);
        });

        try {
            if (isEdit) {
                await productService.update(id, data);
                toast.success('Product updated successfully');
            } else {
                await productService.create(data);
                toast.success('Product created successfully');
            }
            navigate('/admin/products');
        } catch (error) {
            const resp = error.response?.data;
            if (resp?.errors) {
                setFormErrors(resp.errors);
                toast.error('Please fix the highlighted fields');
            } else {
                toast.error(resp?.message || 'Operation failed');
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center text-primary-600 dark:text-primary-400 font-medium">Initializing product data...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Head title={isEdit ? 'Edit Product' : 'Add Product'} />
            
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/products')} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEdit ? 'Update Product' : 'Add New Product'}</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isEdit ? 'Modify existing product details' : 'Create a new product for your store'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Fresh Organic Apples"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg outline-none text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                placeholder="Detailed product description..."
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-lg outline-none text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 3-Level Hierarchy Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category <span className="text-red-500">*</span></label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg outline-none text-sm cursor-pointer text-gray-900 dark:text-white"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategory</label>
                                <select
                                    name="subCategory"
                                    disabled={!formData.category}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg outline-none text-sm cursor-pointer disabled:opacity-50 text-gray-900 dark:text-white"
                                    value={formData.subCategory}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Subcategory</option>
                                    {subcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand / Sub-Sub</label>
                                <select
                                    name="subSubCategory"
                                    disabled={!formData.subCategory}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg outline-none text-sm cursor-pointer disabled:opacity-50 text-gray-900 dark:text-white"
                                    value={formData.subSubCategory}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Brand</option>
                                    {subSubCategories.map(ssub => <option key={ssub._id} value={ssub._id}>{ssub.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unit (e.g. 500g, 1L) <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="unit"
                                required
                                placeholder="1 kg"
                                className="w-full md:w-1/3 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg outline-none text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                value={formData.unit}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Inventory & Pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selling Price (₹) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg outline-none text-sm transition-all text-gray-900 dark:text-white"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">MRP / Compare (₹)</label>
                            <input
                                type="number"
                                name="comparePrice"
                                min="0"
                                placeholder="Optional"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg outline-none text-sm transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                value={formData.comparePrice}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock Level <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-lg outline-none text-sm transition-all text-gray-900 dark:text-white"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-span-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                             <label className="flex items-center gap-3 cursor-pointer group w-max">
                                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.active ? 'bg-primary-600 border-primary-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400'}`}>
                                     <input 
                                        type="checkbox" 
                                        name="active" 
                                        checked={formData.active} 
                                        onChange={handleChange}
                                        className="hidden"
                                     />
                                     {formData.active && <X size={14} className="text-white rotate-45" />}
                                 </div>
                                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Publish product to storefront</span>
                             </label>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Product Images</h2>
                    
                    {/* Image Preview Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {isEdit && existingImages.map((img, idx) => (
                            <div key={`existing-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                                <img src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${img}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(img)} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs font-medium">Remove</button>
                            </div>
                        ))}
                        {images.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-primary-200 dark:border-primary-900/50 group">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 shadow-sm hover:bg-red-600"><X size={14} /></button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                            <Upload className="text-gray-400 group-hover:text-primary-500" size={20} />
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary-500">Upload Image</span>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-6 py-2 rounded-lg font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">Cancel</button>
                    <button type="submit" disabled={loading} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> {isEdit ? 'Save Changes' : 'Create Product'}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
