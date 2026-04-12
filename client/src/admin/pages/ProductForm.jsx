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
        stock: '0',
        active: true
    });
    const [images, setImages] = useState([]); // File objects (new)
    const [existingImages, setExistingImages] = useState([]); // URL strings (edit)
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getHierarchy();
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
                    category: p.category?._id || p.category, // Handle populated or id
                    stock: p.stock,
                    active: p.active
                });
                // convert image objects to URL strings for backwards compatibility
                setExistingImages((p.images || []).map(img => img.url || img));
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

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        // clear related error
        setFormErrors(prev => {
            const updated = { ...prev };
            // clear direct field as well as pricing paths
            delete updated[e.target.name];
            delete updated[`pricing.${e.target.name}`];
            if (e.target.name === 'name') delete updated.slug;
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
                // show individual field errors and global toast
                setFormErrors(resp.errors);
                toast.error('Please fix the highlighted fields');
            } else {
                toast.error(resp?.message || 'Operation failed');
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Head title={isEdit ? 'Edit Product' : 'Add Product'} />
            
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="input"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {formErrors.name && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                            )}
                            {formErrors.slug && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.slug}</p>
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                className="input"
                                value={formData.description}
                                onChange={handleChange}
                            />
                            {formErrors.description && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.description}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                required
                                className="input"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                {(() => {
                                    const renderCategoryOptions = (cats, level = 0) => {
                                        return cats.reduce((acc, cat) => {
                                            acc.push(
                                                <option key={cat._id} value={cat._id}>
                                                    {'\u00A0'.repeat(level * 4)}
                                                    {level > 0 ? '↳ ' : ''}
                                                    {cat.name}
                                                </option>
                                            );
                                            if (cat.children && cat.children.length > 0) {
                                                acc.push(...renderCategoryOptions(cat.children, level + 1));
                                            }
                                            return acc;
                                        }, []);
                                    };
                                    
                                    // Categories state might be flat or tree. 
                                    // If we use getHierarchy, it's a tree. 
                                    // Let's ensure we fetch hierarchy in useEffect.
                                    return renderCategoryOptions(categories);
                                })()}
                            </select>
                            {formErrors.category && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.category}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit (e.g., 1 kg, 500g)</label>
                            <input
                                type="text"
                                name="unit"
                                required
                                className="input"
                                value={formData.unit}
                                onChange={handleChange}
                            />
                            {formErrors.unit && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.unit}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pricing & Stock</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                            <input
                                type="number"
                                name="price"
                                required
                                min="0"
                                className="input"
                                value={formData.price}
                                onChange={handleChange}
                            />
                            {(formErrors.price || formErrors['pricing.sellingPrice']) && (
                                <p className="text-red-600 text-sm mt-1">
                                    {formErrors.price || formErrors['pricing.sellingPrice']}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Compare Price (₹)</label>
                            <input
                                type="number"
                                name="comparePrice"
                                min="0"
                                className="input"
                                value={formData.comparePrice}
                                onChange={handleChange}
                            />
                            {(formErrors.comparePrice || formErrors['pricing.mrp']) && (
                                <p className="text-red-600 text-sm mt-1">
                                    {formErrors.comparePrice || formErrors['pricing.mrp']}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                className="input"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                            {formErrors.stock && (
                                <p className="text-red-600 text-sm mt-1">{formErrors.stock}</p>
                            )}
                        </div>
                        <div className="col-span-3">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="checkbox" 
                                    name="active" 
                                    checked={formData.active} 
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                                 />
                                 <span className="text-sm font-medium text-gray-700">Active (Visible in store)</span>
                             </label>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Product Images</h2>
                    {formErrors.images && (
                        <p className="text-red-600 text-sm mb-4">{formErrors.images}</p>
                    )
                    }
                    
                    {/* Existing Images */}
                    {isEdit && existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-4 mb-6">
                            {existingImages.map((img, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img 
                                        src={typeof img === 'string' 
                                            ? (img.startsWith('http') ? img : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${img.startsWith('/') ? img.substring(1) : img}`)
                                            : (img.url?.startsWith('http') ? img.url : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${img.url?.startsWith('/') ? img.url.substring(1) : img.url}`)
                                        } 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(img)}
                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Images Preview */}
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-4 mb-6">
                            {images.map((file, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img 
                                        src={URL.createObjectURL(file)} 
                                        alt="" 
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload multiple photos</span> or drag and drop</p>
                                <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 10 images)</p>
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                accept="image/*" 
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="btn btn-ghost"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary min-w-[120px]"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Product</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
