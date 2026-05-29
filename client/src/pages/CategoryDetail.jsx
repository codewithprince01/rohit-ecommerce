import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Zap, ArrowRight, Package, Sparkles, Filter, LayoutGrid } from 'lucide-react';

const CategoryDetail = () => {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/slug/${slug}`);
      const cat = response.data.data;
      setCategory(cat);

      const hierarchyRes = await api.get('/categories/hierarchy');
      const allCategories = hierarchyRes.data.data;
      
      const currentCategory = allCategories.find(c => c._id === cat._id);
      if (currentCategory && currentCategory.children) {
        setSubcategories(currentCategory.children);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://dummyimage.com/600x600/f3f4f6/9ca3af.png&text=' + encodeURIComponent(category.name);
    if (typeof imagePath === 'string' && imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL.replace('/api', '')}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
            <div className="w-20 h-20 border-8 border-primary-50 border-t-primary-500 rounded-full animate-spin mx-auto mb-6 shadow-xl"></div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Curating Collection...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-center p-12 bg-white rounded-[3rem] shadow-xl border border-gray-100">
            <h2 className="text-4xl font-black text-gray-950 mb-6 tracking-tighter uppercase">Category Not Found</h2>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-950 transition-all">
                Return to Store <ArrowRight size={16} />
            </Link>
        </div>
      </div>
    );
  }

  const filteredSubcategories = subcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white pb-32">
        {/* 1. PREMIUM CATEGORY HERO */}
        <section className="relative h-[450px] md:h-[600px] overflow-hidden bg-gray-950">
            <motion.img
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                src={getImageUrl(category.image)}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="absolute inset-0 flex flex-col justify-end">
                <div className="container-custom pb-24 relative z-10 text-center md:text-left">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center md:justify-start gap-3 mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400"
                    >
                        <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
                        <ChevronRight size={10} />
                        <Link to="/products" className="hover:text-primary-500 transition-colors">Store</Link>
                        <ChevronRight size={10} />
                        <span className="text-gray-950">{category.name}</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-xl mb-6 shadow-2xl shadow-primary-600/20">
                            <Sparkles size={12} className="fill-current" /> Premium Range
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black text-gray-950 mb-8 leading-[0.9] tracking-tighter font-display uppercase">
                            {category.name}.
                        </h1>
                        <p className="text-gray-500 text-lg md:text-xl font-bold max-w-2xl leading-relaxed">
                            {category.description || `Discover our handpicked collection of fresh, high-quality ${category.name.toLowerCase()} delivered to your home in Sabalgarh.`}
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>

        <div className="container-custom -mt-16 relative z-20">
            {/* 2. SEARCH BAR & STATS */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-gray-50"
            >
                <div className="flex-1 relative group w-full">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors">
                        <Search size={22} className="stroke-[2.5px]" />
                    </div>
                    <input
                        type="text"
                        placeholder={`Search in ${category.name}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-18 pl-16 pr-8 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-primary-500/30 outline-none text-gray-950 font-black tracking-tight text-lg transition-all"
                    />
                </div>

                <div className="flex items-center gap-8 px-8 border-l border-gray-100 hidden md:flex">
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Departments</span>
                        <span className="text-2xl font-black text-gray-950 font-display leading-none">{filteredSubcategories.length}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                        <LayoutGrid size={24} />
                    </div>
                </div>
            </motion.div>

            {/* 3. SUBCATEGORIES GRID */}
            <section className="py-24">
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
                    <div>
                        <div className="inline-flex items-center gap-2 text-primary-600 mb-2">
                            <Zap size={18} className="fill-current" />
                            <span className="font-black text-[10px] uppercase tracking-widest">Explore Departments</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-950 leading-none tracking-tighter font-display uppercase">Sub <span className="text-primary-600">Collections.</span></h2>
                    </div>
                    <Link
                        to={`/products?category=${category._id}`}
                        className="flex items-center gap-4 bg-gray-950 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-primary-600 transition-all active:scale-95"
                    >
                        View All Items <ArrowRight size={18} />
                    </Link>
                </div>

                {filteredSubcategories.length > 0 ? (
                    <motion.div 
                        initial="initial"
                        animate="animate"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10"
                    >
                        <AnimatePresence>
                            {filteredSubcategories.map((sub, idx) => (
                                <motion.div
                                    key={sub._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link
                                        to={`/products?category=${category._id}&subcategory=${sub._id}`}
                                        className="group block bg-[#fafafa] rounded-[3.5rem] border border-gray-100 p-8 text-center hover:bg-white hover:shadow-[0_40px_80px_-20px_rgba(47,171,115,0.15)] hover:border-primary-100 transition-all duration-700 hover:-translate-y-4"
                                    >
                                        <div className="relative aspect-square mb-8 p-6 bg-white rounded-[3rem] shadow-inner group-hover:rotate-6 transition-transform duration-700 overflow-hidden border border-gray-50">
                                            <img
                                                src={getImageUrl(sub.image)}
                                                alt={sub.name}
                                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-125 transition-transform duration-700"
                                            />
                                        </div>
                                        <h3 className="text-xl font-black text-gray-950 mb-3 group-hover:text-primary-600 transition-colors uppercase tracking-tight leading-none">
                                            {sub.name}
                                        </h3>
                                        <div className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 group-hover:text-primary-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                            Shop Dept <ChevronRight size={12} className="stroke-[3px]" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-40 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-100"
                    >
                        <Package size={80} className="mx-auto mb-8 text-gray-200" />
                        <h3 className="text-3xl font-black text-gray-950 mb-4 tracking-tight uppercase">No results found</h3>
                        <p className="text-gray-400 font-medium max-w-md mx-auto leading-relaxed">We couldn't find any department matching your current search criteria.</p>
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="mt-10 px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            Reset Search
                        </button>
                    </motion.div>
                )}
            </section>
        </div>
    </div>
  );
};

export default CategoryDetail;
