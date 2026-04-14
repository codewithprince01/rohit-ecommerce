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

    if (initialLoading) return <div className="p-8 text-center text-primary-600 font-bold">Initializing Hierarchy Data...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Head title={isEdit ? 'Edit Product' : 'Add Product'} />
            
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-200 rounded-full transition-colors font-black">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-black text-gray-950 tracking-tight">{isEdit ? 'Update Product' : 'Create Luxury Item'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-950 mb-6 font-display">Identity & Context</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                placeholder="e.g. Aloo Bhujia Namkeen"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold transition-all"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {formErrors.name && <p className="text-red-600 text-[10px] font-bold mt-2 uppercase">{formErrors.name}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Detailed Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                placeholder="Describe the essence of this product..."
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold transition-all"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        {/* 3-Level Hierarchy Grid */}
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold cursor-pointer"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Main Category</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Subcategory</label>
                                <select
                                    name="subCategory"
                                    disabled={!formData.category}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold cursor-pointer disabled:opacity-50"
                                    value={formData.subCategory}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Sub-Level</option>
                                    {subcategories.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sub-Sub / Brand</label>
                                <select
                                    name="subSubCategory"
                                    disabled={!formData.subCategory}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold cursor-pointer disabled:opacity-50"
                                    value={formData.subSubCategory}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Brand/Sub</option>
                                    {subSubCategories.map(ssub => <option key={ssub._id} value={ssub._id}>{ssub.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Unit (e.g. 500g, 1L)</label>
                            <input
                                type="text"
                                name="unit"
                                required
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold transition-all"
                                value={formData.unit}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-950 mb-6 font-display text-primary-600">Inventory & Commerce</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Selling Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-black text-lg transition-all"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">MRP / Compare (₹)</label>
                            <input
                                type="number"
                                name="comparePrice"
                                min="0"
                                placeholder="Optional"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold transition-all"
                                value={formData.comparePrice}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Level</label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-primary-500 rounded-2xl outline-none font-bold transition-all"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="col-span-3">
                             <label className="flex items-center gap-3 cursor-pointer group">
                                 <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.active ? 'bg-primary-600 border-primary-600' : 'border-gray-200 group-hover:border-primary-400'}`}>
                                     <input 
                                        type="checkbox" 
                                        name="active" 
                                        checked={formData.active} 
                                        onChange={handleChange}
                                        className="hidden"
                                     />
                                     {formData.active && <X size={16} className="text-white rotate-45" />}
                                 </div>
                                 <span className="text-sm font-black text-gray-700 uppercase tracking-tighter">Publish to Storefront</span>
                             </label>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-950 mb-6 font-display">Visual Assets</h2>
                    
                    {/* Image Preview Grid */}
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-6 mb-8">
                        {isEdit && existingImages.map((img, idx) => (
                            <div key={`existing-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-lg">
                                <img src={img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${img}`} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeExistingImage(img)} className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all font-black uppercase text-[8px]">Remove</button>
                            </div>
                        ))}
                        {images.map((file, idx) => (
                            <div key={`new-${idx}`} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-primary-100 group shadow-lg">
                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-xl"><X size={12} /></button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                            <Upload className="text-gray-400 group-hover:text-primary-500" size={24} />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest group-hover:text-primary-500">Pick Art</span>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-6 pt-6">
                    <button type="button" onClick={() => navigate('/admin/products')} className="px-10 py-4 rounded-2xl font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all">Discard</button>
                    <button type="submit" disabled={loading} className="px-12 py-4 bg-gray-950 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-primary-600 hover:shadow-2xl transition-all flex items-center gap-3 disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Confirm Luxury Product</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
