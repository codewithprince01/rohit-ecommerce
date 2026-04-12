import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success('Added to cart', {
            icon: '🛒',
            style: {
                borderRadius: '12px',
                background: '#111827',
                color: '#fff',
            },
        });
    };

    const discount = product.comparePrice 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    const getProductImage = () => {
        const img = product.images?.[0] || product.thumbnail;
        if (!img) return 'https://dummyimage.com/600x600/f3f4f6/9ca3af.png&text=' + encodeURIComponent(product.name);
        
        const path = typeof img === 'string' ? img : img.url;
        if (!path) return 'https://dummyimage.com/600x600/f3f4f6/9ca3af.png&text=' + encodeURIComponent(product.name);
        
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
        return `${baseUrl}/${path.startsWith('/') ? path.substring(1) : path}`;
    };
    const imageUrl = getProductImage();

    return (
        <div 
            onClick={() => navigate(`/product/${product.slug}`)}
            className="group bg-white rounded-[2rem] border border-gray-100 overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer relative flex flex-col h-full ring-1 ring-gray-100/50 hover:ring-primary-400/20"
        >
            {/* Top Action Bar */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all">
                    <Heart size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-gray-400 hover:text-primary-600 hover:scale-110 transition-all">
                    <Eye size={18} />
                </button>
            </div>

            {/* Badges */}
            <div className="absolute top-5 left-5 flex flex-col gap-2 z-20">
                {discount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/20 uppercase tracking-wider">
                        -{discount}%
                    </span>
                )}
                {product.isOrganic && (
                    <span className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-green-500/20 uppercase tracking-wider">
                        Organic
                    </span>
                )}
                {product.isBestSeller && (
                    <span className="bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/20 uppercase tracking-wider">
                        Best Seller
                    </span>
                )}
            </div>

            {/* Image Section */}
            <div className="relative aspect-[4/4] bg-gray-50/30 overflow-hidden p-6">
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Content Section */}
            <div className="p-6 pt-2 flex-1 flex flex-col">
                <div className="flex-1">
                    {/* Category/Unit */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded">
                            {product.unit || '1 Unit'}
                        </span>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span className="text-[11px] font-bold text-gray-700">{product.averageRating || '4.8'}</span>
                        </div>
                    </div>

                    <h3 className="text-gray-900 font-bold text-lg leading-tight mb-2 line-clamp-2 md:group-hover:text-primary-600 transition-colors duration-300">
                        {product.name}
                    </h3>
                    
                    <p className="text-gray-400 text-xs line-clamp-1 mb-4">
                        {product.description || 'Premium quality selection'}
                    </p>
                </div>

                {/* Price & Cart */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 tracking-tight font-display">₹{product.price}</span>
                            {product.comparePrice > product.price && (
                                <span className="text-sm text-gray-400 line-through font-medium">₹{product.comparePrice}</span>
                            )}
                        </div>
                        <p className="text-[10px] text-green-600 font-bold">Inclusive of all taxes</p>
                    </div>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className={`group/btn relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-500 shadow-lg ${
                            product.stock > 0 
                                ? 'bg-primary-600 text-white hover:bg-black hover:shadow-black/20' 
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                    >
                        <ShoppingCart size={20} className="relative z-10 transition-transform group-hover/btn:scale-110" />
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>
            </div>

            {/* Out of Stock Overlay */}
            {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-30 flex items-center justify-center p-6 text-center">
                    <div className="bg-gray-900 text-white px-6 py-2.5 rounded-full shadow-xl animate-pulse font-black text-xs uppercase tracking-widest">
                        Sold Out
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
