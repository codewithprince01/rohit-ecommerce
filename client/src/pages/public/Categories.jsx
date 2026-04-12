import { useNavigate, Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { categoryService } from '../../services';
import { LayoutGrid, ChevronRight, Search, Zap } from 'lucide-react';
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
        if (!category.image) return `https://ui-avatars.com/api/?name=${category.name}&background=f3f4f6&color=2fab73&size=200`;
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        return `${baseUrl}/${category.image.startsWith('/') ? category.image.slice(1) : category.image}`;
    };

    return (
        <div className="min-h-screen bg-white">
            <Head title="Explore Categories | Agrawal Store" description="Browse all product categories at Agrawal Store with premium clarity." />
            
            {/* 1. IMMERSIVE CATEGORY HERO */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-950">
                {/* Background Video/Image Pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2574')] bg-cover bg-center opacity-30 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/80 to-transparent" />

                <div className="container-custom relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-6 backdrop-blur-md">
                            <LayoutGrid size={16} className="text-primary-400" />
                            <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Direct from Morena</span>
                        </div>
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-8">
                            A Universe of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Freshness.</span>
                        </h1>
                        <p className="text-xl text-gray-400 font-medium mb-12 max-w-xl">
                            Navigate through our handpicked selection of premium groceries, daily essentials, and organic delights.
                        </p>

                        {/* Search Bar in Hero */}
                        <div className="relative max-w-xl group">
                            <div className="absolute inset-x-0 -bottom-4 h-12 bg-primary-500/20 blur-3xl opacity-0 group-focus-within:opacity-100 transition-all" />
                            <div className="relative flex items-center bg-white border-2 border-transparent focus-within:border-primary-500/30 rounded-[2rem] p-2 shadow-2xl transition-all h-20">
                                <Search className="ml-6 text-gray-400" size={24} />
                                <input 
                                    type="text"
                                    placeholder="Which aisle are you looking for?"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1 bg-transparent px-6 outline-none text-xl font-bold placeholder:text-gray-300"
                                />
                                <div className="hidden md:flex items-center gap-2 mr-4 text-xs font-black text-primary-600 bg-primary-50 px-4 py-2 rounded-xl uppercase tracking-widest">
                                    <Zap size={14} fill="currentColor" /> Live
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. PREMIUM CATEGORY GRID */}
            <section className="py-24">
                <div className="container-custom">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                            {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[3rem] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-12">
                            {filteredCategories.map((category) => (
                                <Link 
                                    to={`/category/${category.slug}`}
                                    key={category._id}
                                    className="group flex flex-col items-center"
                                >
                                    <div className="w-full aspect-[4/5] relative rounded-[3rem] overflow-hidden bg-[#f9faf9] border border-gray-100 transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(47,171,115,0.2)] group-hover:-translate-y-4">
                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                        
                                        {/* Background Subtle Label */}
                                        <div className="absolute top-8 left-0 right-0 text-center opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                            <span className="text-6xl font-black uppercase tracking-tighter truncate block">{category.name}</span>
                                        </div>

                                        <div className="absolute inset-0 p-8 flex items-center justify-center">
                                            <img 
                                                src={getCategoryImage(category)}
                                                alt={category.name}
                                                className="w-full h-full object-contain relative z-20 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_30px_60px_rgba(47,171,115,0.3)]"
                                            />
                                        </div>

                                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
                                            <div className="bg-white text-gray-950 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 whitespace-nowrap">
                                                Explore Shop <ChevronRight size={14} className="text-primary-600" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 text-center">
                                        <h3 className="text-xl font-black text-gray-950 tracking-tight group-hover:text-primary-600 transition-colors uppercase">{category.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Quality Guaranteed</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && filteredCategories.length === 0 && (
                        <div className="text-center py-32">
                           <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100">
                              <Search size={40} className="text-gray-200" />
                           </div>
                           <h3 className="text-3xl font-black text-gray-950 tracking-tight mb-2">No category by that name</h3>
                           <p className="text-gray-500 font-medium">Try searching for generic terms or reset the filter.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Categories;
