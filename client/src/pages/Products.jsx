import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/common/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronDown, SlidersHorizontal, Package, Sparkles, ArrowRight, Zap, X } from 'lucide-react';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '',
    page: parseInt(searchParams.get('page')) || 1
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.sort) params.append('sort', filters.sort);
      params.append('page', filters.page);
      params.append('limit', 12);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.data || []);
      setPagination({
        page: response.data.page,
        pages: response.data.pages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      // Simulate slight delay for smooth entry
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k]) params.set(k, newFilters[k]);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const defaultFilters = { search: '', category: '', sort: '', page: 1 };
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 1. SHOP HERO / HEADER */}
      <section className="bg-[#fafafa] pt-12 pb-16 border-b border-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-50 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
        <div className="container-custom relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg text-primary-600 text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm border border-gray-100">
                        <Package size={12} className="fill-current" /> All Products
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-gray-950 leading-[0.95] tracking-tighter font-display uppercase">
                        The Store <br />
                        <span className="text-primary-500">Collection.</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col text-right">
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Items</span>
                        <span className="text-2xl font-black text-gray-950 font-display">{pagination.total || 0}</span>
                    </div>
                    <div className="w-px h-12 bg-gray-200 hidden md:block"></div>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isFilterOpen ? 'bg-primary-600 text-white' : 'bg-white text-gray-950 border border-gray-100 shadow-sm'}`}
                    >
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                </div>
            </div>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* 2. SIDEBAR FILTERS (Visible on Desktop) */}
            <aside className={`lg:w-72 shrink-0 space-y-10 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
                {/* Search Filter */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] ml-2">Search Essentials</h4>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="text-gray-400 group-focus-within:text-primary-600 transition-colors" size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Find milk, eggs..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] ml-2">Categories</h4>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => handleFilterChange('category', '')}
                            className={`px-6 py-3.5 rounded-2xl text-[11px] font-black text-left uppercase tracking-widest transition-all ${!filters.category ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button 
                                key={cat._id}
                                onClick={() => handleFilterChange('category', cat._id)}
                                className={`px-6 py-3.5 rounded-2xl text-[11px] font-black text-left uppercase tracking-widest transition-all ${filters.category === cat._id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Filter */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] ml-2">Sort By</h4>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Sparkles className="text-gray-400" size={16} />
                        </div>
                        <select
                            value={filters.sort}
                            onChange={(e) => handleFilterChange('sort', e.target.value)}
                            className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none appearance-none focus:bg-white focus:border-primary-500/30 transition-all cursor-pointer"
                        >
                            <option value="">Default Listing</option>
                            <option value="price">Price: Low to High</option>
                            <option value="-price">Price: High to Low</option>
                            <option value="name">Name: A to Z</option>
                            <option value="-name">Name: Z to A</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                </div>

                {/* Clear All */}
                {(filters.search || filters.category || filters.sort) && (
                    <button 
                        onClick={clearFilters}
                        className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest py-4 border-2 border-dashed border-red-100 rounded-2xl hover:bg-red-50 transition-all"
                    >
                        <X size={14} /> Clear All Filters
                    </button>
                )}
            </aside>

            {/* 3. PRODUCT GRID */}
            <main className="flex-1">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="aspect-square bg-gray-50 rounded-[2.5rem] animate-pulse relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"
                    >
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-sm">
                            <Search size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-950 mb-3 tracking-tight">No items matched your search</h3>
                        <p className="text-gray-400 font-medium mb-10 max-w-xs mx-auto">Try adjusting your filters or search term to find what you're looking for.</p>
                        <button 
                            onClick={clearFilters}
                            className="px-8 py-4 bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        >
                            Clear All Filters
                        </button>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence mode="popLayout">
                                {products.map((product, idx) => (
                                    <motion.div 
                                        key={product._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex items-center justify-center gap-6 pt-12 border-t border-gray-50">
                                <button
                                    onClick={() => handleFilterChange('page', filters.page - 1)}
                                    disabled={filters.page === 1}
                                    className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                                >
                                    <ArrowRight className="rotate-180" size={20} />
                                </button>
                                
                                <div className="flex flex-col items-center leading-none">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Page</span>
                                    <span className="text-xl font-black text-gray-950 font-display">{pagination.page} <span className="text-gray-300">/</span> {pagination.pages}</span>
                                </div>

                                <button
                                    onClick={() => handleFilterChange('page', filters.page + 1)}
                                    disabled={filters.page === pagination.pages}
                                    className="w-14 h-14 flex items-center justify-center bg-white border border-gray-100 rounded-2xl text-gray-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Extra Promo Section */}
                {!loading && products.length > 0 && (
                    <div className="mt-20 p-10 bg-gray-950 rounded-[3rem] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-full bg-primary-600/10 -skew-x-12 translate-x-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-md text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight mb-4 uppercase">Can't find something?</h3>
                                <p className="text-gray-400 font-medium text-sm">Our 10-minute delivery fleet is expanding! Chat with us to request new items.</p>
                            </div>
                            <button className="flex items-center gap-3 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-gray-950 transition-all shadow-xl shadow-primary-500/10">
                                Request Item <Zap size={14} fill="currentColor" />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
