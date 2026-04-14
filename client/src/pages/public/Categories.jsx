import { useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { categoryService } from '../../services';
import { LayoutGrid, ChevronRight, Search, Zap, ArrowRight } from 'lucide-react';
import Head from '../../components/common/Head';
import { useState } from 'react';

const Categories = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const { data: categories = [], loading } = useFetch(categoryService.getAll);

    const filteredCategories = (categories || []).filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCategoryImage = (category) => {
        if (!category.image) return null;
        if (category.image.startsWith('http')) return category.image;

        const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        const imagePath = category.image.startsWith('/') ? category.image : `/${category.image}`;
        return `${baseUrl}${imagePath}`;
    };

    const handleImageError = (e, name) => {
        const keywords = name.toLowerCase();
        let fallback = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';
        
        if (keywords.includes('fruit')) fallback = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80';
        else if (keywords.includes('veg')) fallback = 'https://images.unsplash.com/photo-1566385101042-1a000c1267c4?w=800&q=80';
        else if (keywords.includes('dairy') || keywords.includes('milk')) fallback = 'https://images.unsplash.com/photo-1550583724-125581cc255b?w=800&q=80';
        else if (keywords.includes('bakery') || keywords.includes('bread')) fallback = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80';
        else if (keywords.includes('snack')) fallback = 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=800&q=80';
        else if (keywords.includes('atta') || keywords.includes('flour') || keywords.includes('dal')) fallback = 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80';
        
        e.target.src = fallback;
    };

    return (
        <div className="min-h-screen bg-[#fcfdfc]">
            <Head title="Browse All Categories | Agrawal Store" description="Premium grocery categories for your daily needs." />
            
            {/* 1. CLEAN HEADER (Quick-Commerce Style) */}
            <section className="pt-32 pb-12">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4 border-b border-gray-100 pb-12">
                        <div className="max-w-2xl">
                             <h1 className="text-5xl md:text-7xl font-black text-gray-950 tracking-tighter leading-none mb-6">
                                Shop by <span className="text-primary-600">Category</span>
                             </h1>
                             <p className="text-gray-500 font-bold text-lg">Fastest delivery on over 5000+ essentials.</p>
                        </div>
                        
                        <div className="relative w-full md:w-[400px] group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input 
                                type="text"
                                placeholder="Search all categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-8 py-5 rounded-2xl bg-white border-2 border-gray-100 focus:border-primary-500 outline-none text-lg font-bold transition-all shadow-sm focus:shadow-xl focus:shadow-primary-500/5"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. PREMIUM CATEGORY GRID */}
            <section className="pb-32">
                <div className="container-custom">
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                                <div key={i} className="aspect-square bg-gray-50 rounded-[2.5rem] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-6 gap-y-10">
                            {filteredCategories.map((category) => (
                                <Link 
                                    to={`/category/${category.slug}`}
                                    key={category._id}
                                    className="group flex flex-col items-center"
                                >
                                    <div className="w-full aspect-square relative rounded-[2.5rem] overflow-hidden bg-white border-2 border-gray-50 transition-all duration-500 group-hover:shadow-[0_40px_80px_-20px_rgba(47,171,115,0.15)] group-hover:-translate-y-3 group-hover:border-primary-500/30 flex items-center justify-center p-6 bg-gradient-to-br from-white to-gray-50/50">
                                        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                                            <img 
                                                src={getCategoryImage(category) || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'}
                                                alt={category.name}
                                                onError={(e) => handleImageError(e, category.name)}
                                                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700 mix-blend-multiply"
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/[0.03] transition-colors" />
                                        <div className="absolute bottom-4 inset-x-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                                           <div className="bg-primary-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-center shadow-xl">
                                              Shop All <ChevronRight size={10} className="inline ml-1" />
                                           </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 text-center px-4 w-full">
                                        <h3 className="text-sm font-black text-gray-950 tracking-tight group-hover:text-primary-600 transition-colors uppercase truncate w-full">
                                           {category.name}
                                        </h3>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 block">Explore Items</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && filteredCategories.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
                           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={32} className="text-gray-200" />
                           </div>
                           <h3 className="text-2xl font-black text-gray-950 tracking-tight mb-2">Humm, nothing found</h3>
                           <p className="text-gray-500 font-medium">Try another search or browse generic categories.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Categories;
