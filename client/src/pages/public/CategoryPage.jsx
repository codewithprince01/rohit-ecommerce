import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { categoryService, productService } from '../../services';
import ProductCard from '../../components/common/ProductCard';
import Head from '../../components/common/Head';
import { ChevronRight, Filter, Zap, LayoutGrid } from 'lucide-react';

const CategoryPage = () => {
    const { slug, subSlug } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const brandSlug = query.get('brand');

    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [subSubCategory, setSubSubCategory] = useState(null);
    
    const [subcategories, setSubcategories] = useState([]);
    const [subSubCategories, setSubSubCategories] = useState([]); // Brands
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Load Main Category
                const catRes = await categoryService.getBySlug(slug);
                const currentCat = catRes.data;
                setCategory(currentCat);

                let currentSub = null;
                let currentSSub = null;

                // 2. Load Hierarchy Data (Subcategories of Main)
                const subRes = await categoryService.getSubcategories(currentCat._id);
                setSubcategories(subRes.data);

                // 3. Handle Subcategory if subSlug exists
                if (subSlug) {
                    const subDataRes = await categoryService.getSubcategoryBySlug(subSlug);
                    currentSub = subDataRes.data;
                    setSubcategory(currentSub);

                    // Load Sub-subcategories (Brands) for this subcategory
                    const ssubRes = await categoryService.getSubSubCategories(currentSub._id);
                    setSubSubCategories(ssubRes.data);

                    // 4. Handle Sub-Subcategory (Brand) if brandSlug exists
                    if (brandSlug) {
                        const ssubDataRes = await categoryService.getSubSubCategoryBySlug(brandSlug);
                        currentSSub = ssubDataRes.data;
                        setSubSubCategory(currentSSub);
                    } else {
                        setSubSubCategory(null);
                    }
                } else {
                    setSubcategory(null);
                    setSubSubCategories([]);
                    setSubSubCategory(null);
                }

                // 5. Fetch Products based on deepest selection
                const prodParams = {
                    category: currentCat._id,
                    isActive: true,
                    limit: 20
                };
                if (currentSub) prodParams.subCategory = currentSub._id;
                if (currentSSub) prodParams.subSubCategory = currentSSub._id;

                const prodRes = await productService.getAll(prodParams);
                setProducts(prodRes.data);

            } catch (err) {
                console.error('Fetch Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, subSlug, brandSlug]);

    if (loading) return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-white">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-primary-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-6 text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] animate-pulse">Curating Luxury</p>
        </div>
    );
    
    if (!category) return <div className="text-center py-20 font-black text-gray-300 uppercase tracking-widest">Category Escape...</div>;

    const clearBrand = () => {
        const params = new URLSearchParams(location.search);
        params.delete('brand');
        navigate(`${location.pathname}?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <Head title={`${subSubCategory?.name || subcategory?.name || category.name} | Agrawal Store`} description={`Premium ${category.name} collection.`} />

            {/* Premium Category Header */}
            <div className="bg-white border-b border-gray-50 mb-8 pt-12 pb-8">
                <div className="container-custom">
                    {/* Dynamic Breadcrumbs */}
                    <nav className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                        <ChevronRight size={10} className="mx-3 text-gray-200" />
                        <Link to="/products" className="hover:text-primary-600 transition-colors">Shop</Link>
                        <ChevronRight size={10} className="mx-3 text-gray-200" />
                        <Link to={`/category/${category.slug}`} className={`${!subcategory ? 'text-primary-600' : 'hover:text-primary-600'} transition-colors`}>{category.name}</Link>
                        
                        {subcategory && (
                            <>
                                <ChevronRight size={10} className="mx-3 text-gray-200" />
                                <Link to={`/category/${category.slug}/${subcategory.slug}`} className={`${!subSubCategory ? 'text-primary-600' : 'hover:text-primary-600'} transition-colors`}>{subcategory.name}</Link>
                            </>
                        )}

                        {subSubCategory && (
                            <>
                                <ChevronRight size={10} className="mx-3 text-gray-200" />
                                <span className="text-primary-600">{subSubCategory.name}</span>
                            </>
                        )}
                    </nav>

                    <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-center justify-between">
                        <div className="flex-1 max-w-2xl">
                            <span className="inline-block bg-primary-50 text-primary-600 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6 border border-primary-100/50">
                                {subSubCategory ? 'Brand Spotlight' : subcategory ? 'Sub-Collection' : 'Master Collection'}
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black font-display text-gray-950 mb-6 leading-[0.9] tracking-tighter">
                                {subSubCategory?.name || subcategory?.name || category.name}
                            </h1>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-lg">
                                {subcategory?.description || category.description || `Discover our hand-picked collection of premium ${category.name} essentials.`}
                            </p>
                        </div>
                        
                        <div className="hidden lg:block w-48 h-48 rounded-[3rem] overflow-hidden bg-gray-50 border-4 border-white shadow-2xl relative group">
                            <img 
                                src={category.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'} 
                                className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-700" 
                                alt={category.name} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar / Filters */}
                    <div className="lg:w-72 flex-shrink-0 space-y-12">
                        {/* Subcategories Filter */}
                        <div>
                            <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <LayoutGrid size={14} className="text-primary-500" /> Categories
                            </h3>
                            <div className="flex flex-col gap-2">
                                <Link 
                                    to={`/category/${category.slug}`}
                                    className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all ${!subcategory ? 'bg-gray-950 text-white shadow-lg shadow-gray-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                >
                                    All in {category.name}
                                </Link>
                                {subcategories.map(sub => (
                                    <Link 
                                        key={sub._id} 
                                        to={`/category/${category.slug}/${sub.slug}`}
                                        className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all ${subcategory?._id === sub._id ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                    >
                                        {sub.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Brands Filter (SubSubCategories) - Only visible if subcategory is selected */}
                        {subcategory && subSubCategories.length > 0 && (
                            <div>
                                <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <Zap size={14} className="text-orange-500" fill="currentColor" /> Select Brand
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {subSubCategories.map(ssub => (
                                        <Link 
                                            key={ssub._id} 
                                            to={`${location.pathname}?brand=${ssub.slug}`}
                                            className={`px-4 py-8 rounded-2xl text-center transition-all border-2 flex flex-col items-center gap-3 ${subSubCategory?._id === ssub._id ? 'bg-white border-primary-500 shadow-xl' : 'bg-gray-50 border-transparent hover:bg-white hover:border-gray-200'}`}
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-900">{ssub.name}</div>
                                            <div className={`w-2 h-2 rounded-full ${subSubCategory?._id === ssub._id ? 'bg-primary-500 animate-pulse' : 'bg-gray-200'}`}></div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                            <div>
                                <h2 className="text-xl font-black text-gray-950 uppercase tracking-tighter">
                                    {subSubCategory ? `${subSubCategory.name} Selection` : subcategory ? `${subcategory.name} Catalogue` : 'Complete Inventory'}
                                </h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Showing {products.length} exclusive items</p>
                            </div>
                            
                            {subSubCategory && (
                                <button 
                                    onClick={clearBrand}
                                    className="text-[10px] font-black text-primary-600 hover:text-primary-800 uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-xl"
                                >
                                    Clear Brand <Filter size={12} />
                                </button>
                            )}
                        </div>

                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100">
                                <Filter size={48} className="mx-auto mb-6 text-gray-200" />
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-2">Inventory Low</h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto font-medium">We are currently restocking our {category.name} collection. Please check back shortly.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
