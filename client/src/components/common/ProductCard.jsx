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
            className="group bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer relative flex flex-col h-full"
        >
            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
                {discount > 0 && (
                    <span className="bg-primary-600 text-white text-[9px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider">
                        {discount}% OFF
                    </span>
                )}
            </div>

            {/* Image Section */}
            <div className="relative aspect-square bg-[#f8f9f8] overflow-hidden p-4">
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    loading="lazy"
                />
            </div>

            {/* Content Section */}
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                    {/* Unit & Delivery */}
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{product.unit || '1 unit'}</span>
                    </div>

                    <h3 className="text-gray-900 font-bold text-sm leading-tight mb-2 line-clamp-2 min-h-[40px]">
                        {product.name}
                    </h3>
                </div>

                {/* Price & Add Utility */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                        <span className="text-base font-black text-gray-950">₹{product.price}</span>
                        {product.comparePrice > product.price && (
                            <span className="text-[10px] text-gray-400 line-through font-bold">₹{product.comparePrice}</span>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all shadow-sm ${
                            product.stock > 0 
                                ? 'bg-white border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white' 
                                : 'bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {product.stock > 0 ? 'ADD' : 'OUT'}
                    </button>
                </div>
            </div>

            {/* Out of Stock Overlay */}
            {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
                </div>
            )}
        </div>
    );
};

export default ProductCard;
