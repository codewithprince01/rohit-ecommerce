import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const BestSellingCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        // Only show top-level categories for best sellers
        const topLevel = (response.data.data || []).filter(cat => !cat.parent);
        setCategories(topLevel.slice(0, 12)); // Show up to 12
      } catch (error) {
        console.error('Error fetching best selling categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return null;

    return (
        <section className="py-24 bg-gray-50/30">
            <div className="container-custom">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl">
                        <span className="text-primary-600 font-black text-xs uppercase tracking-[0.2em] mb-4 block">
                            Our Collections
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight font-display">
                            Best Selling Categories
                        </h2>
                    </div>
                    <Link
                        to="/products"
                        className="group flex items-center gap-3 text-gray-900 font-black text-xs uppercase tracking-widest hover:text-primary-600 transition-all"
                    >
                        View All Collections
                        <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-primary-600 group-hover:border-primary-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8">
                    {categories.map((category) => (
                        <Link
                            key={category._id}
                            to={`/category/${category.slug}`}
                            className="group flex flex-col transition-all duration-500 rounded-[2.5rem] overflow-hidden bg-white relative border border-gray-100 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-2 ring-1 ring-gray-100/50 hover:ring-primary-500/20"
                        >
                            {/* Image Container */}
                            <div className="relative overflow-hidden aspect-square bg-white p-4">
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white group-hover:opacity-0 transition-opacity duration-500"></div>
                                <img
                                    src={category.image && category.image.startsWith('http') 
                                        ? category.image 
                                        : (category.image ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${category.image.startsWith('/') ? category.image.substring(1) : category.image}` : `https://dummyimage.com/600x600/f3f4f6/9ca3af.png&text=${encodeURIComponent(category.name)}`)
                                    }
                                    alt={category.name}
                                    className="w-full h-full object-contain relative z-10 transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                
                                {/* Badge Overlay */}
                                <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <span className="bg-white/90 backdrop-blur-sm text-[9px] font-black text-gray-900 border border-gray-100 px-3 py-1 rounded-full shadow-sm uppercase tracking-wider">
                                        Explore
                                    </span>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="p-5 pt-2 text-center">
                                <h3 className="font-black text-gray-900 text-sm md:text-base leading-tight group-hover:text-primary-600 transition-colors duration-300 mb-1">
                                    {category.name}
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {Math.floor(Math.random() * 50) + 10} Items
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BestSellingCategories;
