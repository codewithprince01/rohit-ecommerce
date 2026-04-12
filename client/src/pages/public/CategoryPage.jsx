import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { categoryService, productService } from '../../services';
import ProductCard from '../../components/common/ProductCard';
import Head from '../../components/common/Head';
import { ChevronRight, Filter } from 'lucide-react';

const CategoryPage = () => {
    const { slug } = useParams();
    const [category, setCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get Category Details
                const catRes = await categoryService.getBySlug(slug);
                setCategory(catRes.data);

                if (catRes.data?._id) {
                    // Get Subcategories
                    const subRes = await categoryService.getSubcategories(catRes.data._id);
                    setSubcategories(subRes.data);

                    // Get Products
                    const prodRes = await productService.getAll({ category: catRes.data._id, limit: 12 });
                    setProducts(prodRes.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchData();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div></div>;
    
    if (!category) return <div className="text-center py-20">Category Not Found</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <Head title={category.name} description={`Buy ${category.name} online at best prices.`} />

            {/* Premium Category Hero */}
            <div className="bg-white border-b border-gray-100 mb-8 pt-8">
                <div className="container-custom">
                    {/* Breadcrumb */}
                    <nav className="flex items-center text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                        <ChevronRight size={12} className="mx-3 text-gray-300" />
                        <Link to="/products" className="hover:text-primary-600 transition-colors">Shop</Link>
                        <ChevronRight size={12} className="mx-3 text-gray-300" />
                        <span className="text-primary-600">{category.name}</span>
                    </nav>

                    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-600 to-indigo-900 min-h-[300px] mb-8 group">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-white/15 transition-all duration-700"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>

                        <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-12 h-full">
                            <div className="flex-1 text-center md:text-left">
                                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6 border border-white/10">
                                    Premium Selection
                                </span>
                                <h1 className="text-4xl md:text-6xl font-black font-display text-white mb-6 leading-[1.1]">
                                    {category.name}
                                </h1>
                                <p className="text-primary-100 text-lg md:text-xl max-w-xl font-medium leading-relaxed opacity-90">
                                    {category.description || `Discover our hand-picked collection of top-tier ${category.name} products delivered straight to your door.`}
                                </p>
                            </div>

                            {category.image && (
                                <div className="w-full md:w-[400px] aspect-square relative group-hover:scale-105 transition-transform duration-700">
                                    <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-75 group-hover:scale-100 transition-transform duration-500"></div>
                                    <img 
                                        src={category.image
                                            ? (category.image.startsWith('http') 
                                                ? category.image 
                                                : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${category.image.startsWith('/') ? category.image.substring(1) : category.image}`)
                                            : `https://dummyimage.com/1200x600/f3f4f6/9ca3af.png&text=${encodeURIComponent(category.name)}`
                                        } 
                                        alt={category.name}
                                        className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Filters / Subcategories */}
                    {subcategories.length > 0 && (
                        <div className="flex items-center gap-4 py-6 border-t border-gray-50 overflow-x-auto no-scrollbar">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest flex-shrink-0">
                                Quick Filter:
                            </span>
                            {subcategories.map(sub => (
                                <Link 
                                    key={sub._id} 
                                    to={`/category/${category.slug}/${sub.slug}`}
                                    className="px-6 py-2.5 bg-gray-50 hover:bg-white rounded-full border border-gray-100 hover:border-primary-500 hover:text-primary-600 transition-all text-sm font-bold whitespace-nowrap shadow-sm hover:shadow-primary-100/50"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="container-custom">
                {/* Content Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 font-display">
                            Available Products
                            <span className="ml-3 text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{products.length} Items</span>
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Showing all luxury essentials in {category.name}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-3 group hover:border-primary-500 transition-colors cursor-pointer">
                            <span className="text-sm font-bold text-gray-600 group-hover:text-primary-600">Sort By:</span>
                            <select className="bg-transparent text-sm font-black text-gray-900 border-none outline-none focus:ring-0 cursor-pointer">
                                <option>Newest Arrivals</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                                <option>Most Popular</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="relative">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                            {products.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-24 text-center border border-dashed border-gray-200 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                <Filter size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">No Selection Available</h3>
                            <p className="text-gray-400 max-w-xs mx-auto text-sm">We are currently curating new products for this category. Check back soon!</p>
                            <Link to="/" className="mt-8 inline-block btn btn-primary px-8 py-3 rounded-2xl">
                                Explore Other Categories
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;
