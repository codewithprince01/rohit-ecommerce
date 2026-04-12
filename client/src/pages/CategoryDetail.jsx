import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

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
      // Fetch category details
      const response = await api.get(`/categories/slug/${slug}`);
      const cat = response.data.data;
      setCategory(cat);

      // Fetch hierarchy/subcategories for this category
      const hierarchyRes = await api.get('/categories/hierarchy');
      const allCategories = hierarchyRes.data.data;
      
      const currentCategory = allCategories.find(c => c._id === cat._id);
      if (currentCategory && currentCategory.children) {
        setSubcategories(currentCategory.children);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const filteredSubcategories = subcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://dummyimage.com/600x600/f3f4f6/9ca3af.png&text=' + encodeURIComponent(category.name);
    if (typeof imagePath === 'string' && imagePath.startsWith('http')) return imagePath;
    return `${import.meta.env.VITE_API_URL.replace('/api', '')}/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`;
  };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Premium Category Hero */}
            <div className="relative bg-gray-900 h-[400px] overflow-hidden group">
                <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-[2000ms] opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                <div className="absolute inset-0 flex flex-col justify-end">
                    <div className="container-custom pb-16 relative z-10">
                        <nav className="mb-8 flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                            <Link to="/" className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Home</Link>
                            <span className="text-white/20 text-xs">/</span>
                            <Link to="/products" className="text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Categories</Link>
                            <span className="text-white/20 text-xs">/</span>
                            <span className="text-primary-400 text-[10px] font-black uppercase tracking-widest">{category.name}</span>
                        </nav>

                        <div className="max-w-3xl">
                            <span className="inline-block bg-primary-600 px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl shadow-primary-600/20">
                                Fresh Selection
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] font-display">
                                {category.name}
                            </h1>
                            <p className="text-gray-300 text-lg md:text-xl font-medium max-w-2xl leading-relaxed opacity-90">
                                {category.description || `Experience the pinnacle of quality with our curated range of ${category.name.toLowerCase()}.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container-custom -mt-10 relative z-20">
                {/* Search & Filter Bar */}
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 md:p-6 mb-16 border border-gray-100 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            placeholder={`Search inside ${category.name}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 bg-gray-50 border-transparent rounded-[1.25rem] focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-300 outline-none text-gray-900 font-bold transition-all"
                        />
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-primary-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="h-10 w-[1px] bg-gray-100 hidden md:block" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Results</span>
                            <span className="text-xl font-black text-gray-900 font-display">{filteredSubcategories.length} Found</span>
                        </div>
                    </div>
                </div>

                {/* Subcategories Grid */}
                <div className="space-y-10">
                    <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 font-display">Sub-Collections</h2>
                            <p className="text-gray-400 font-medium text-sm mt-1">Refine your search by visiting specific departments</p>
                        </div>
                        <Link to={`/products?category=${category._id}`} className="text-primary-600 font-black text-xs uppercase tracking-widest hover:text-black transition-colors">
                            View All Products
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredSubcategories.map((subcategory) => (
                            <Link
                                key={subcategory._id}
                                to={`/products?category=${category._id}&subcategory=${subcategory._id}`}
                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 border border-gray-100/50 hover:-translate-y-3"
                            >
                                <div className="relative aspect-square overflow-hidden bg-gray-50 p-6">
                                    <img
                                        src={getImageUrl(subcategory.image)}
                                        alt={subcategory.name}
                                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-8 text-center bg-white">
                                    <h3 className="font-black text-gray-900 text-xl mb-3 group-hover:text-primary-600 transition-colors duration-300">
                                        {subcategory.name}
                                    </h3>
                                    <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-gray-50 border border-gray-100 group-hover:bg-primary-50 group-hover:border-primary-200 transition-all">
                                        <span className="text-[10px] font-black text-gray-400 group-hover:text-primary-700 uppercase tracking-widest transition-colors">Open Store</span>
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-all transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {filteredSubcategories.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4 font-display">No matches found</h3>
                            <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed font-medium">We couldn't find any sub-collection matching your current search. Try adjusting your keywords.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryDetail;
