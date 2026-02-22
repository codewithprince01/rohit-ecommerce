import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
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
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    };

    const discount = product.comparePrice 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    const imageUrl = product.images?.[0] 
        ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${product.images[0]}`
        : 'https://via.placeholder.com/300x300?text=No+Image';

    return (
        <div 
            onClick={() => navigate(`/product/${product.slug}`)}
            className="group bg-white rounded-3xl border border-gray-100/60 overflow-hidden hover:shadow-card-hover transition-all duration-300 cursor-pointer relative flex flex-col h-full ring-1 ring-transparent hover:ring-primary-100"
        >
            {/* Image Container */}
            <div className="relative aspect-[4/3] bg-gray-50/50 overflow-hidden p-4">
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 group-hover:rotate-1 transition-transform duration-500 ease-out"
                    loading="lazy"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {discount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
                            {discount}% OFF
                        </span>
                    )}
                    {!product.inStock && (
                        <span className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wide">
                            SOLD OUT
                        </span>
                    )}
                </div>

                {/* Quick Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Product Info */}
            <div className="p-5 flex-1 flex flex-col relative">
                <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1 tracking-wide uppercase">{product.unit || '1 Unit'}</p>
                    <h3 className="text-gray-900 font-bold text-base leading-tight mb-2 line-clamp-2 md:group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900 font-display">₹{product.price}</span>
                        {product.comparePrice > product.price && (
                            <span className="text-xs text-gray-400 line-through font-medium">₹{product.comparePrice}</span>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                            product.inStock 
                                ? 'bg-white border border-gray-100 text-gray-700 hover:bg-primary-600 hover:border-primary-600 hover:text-white hover:shadow-primary-500/30' 
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        }`}
                        title={product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    >
                        <ShoppingCart size={18} className="stroke-[2.5px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
