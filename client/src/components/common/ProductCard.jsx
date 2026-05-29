import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../services/api';

const ProductCard = ({ product }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const navigate = useNavigate();

    // Check if item is already in cart to show increment/decrement
    const cartItem = cartItems.find(item => item._id === product._id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    const handleAddInitial = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock > 0) {
            addToCart(product, 1);
            toast.success('Added to cart');
        } else {
            toast.error('Out of stock');
        }
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantityInCart < product.stock) {
            updateQuantity(product._id, quantityInCart + 1);
        } else {
            toast.error(`Only ${product.stock} units available`);
        }
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantityInCart > 1) {
            updateQuantity(product._id, quantityInCart - 1);
        } else {
            removeFromCart(product._id);
        }
    };

    const discount = product.comparePrice 
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;

    const imageUrl = getImageUrl(product.image || product.images?.[0]) || `https://dummyimage.com/300x300/f3f4f6/9ca3af.png&text=${encodeURIComponent(product.name)}`;

    return (
        <div 
            onClick={() => navigate(`/product/${product.slug}`)}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer relative flex flex-col h-full"
        >
            {/* Top Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                {discount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                        {discount}% OFF
                    </span>
                )}
            </div>

            {/* Image Section */}
            <div className="relative aspect-square bg-gray-50 p-4 flex items-center justify-center">
                <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                    loading="lazy"
                />
            </div>

            {/* Content Section */}
            <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 w-fit px-1.5 py-0.5 rounded mb-2">
                    <Clock size={10} /> 10 MINS
                </div>
                
                <h3 className="text-gray-900 font-semibold text-sm leading-tight mb-1 line-clamp-2 min-h-[40px]">
                    {product.name}
                </h3>
                
                <span className="text-xs text-gray-500 mb-3">{product.unit || '1 unit'}</span>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                        {product.comparePrice > product.price && (
                            <span className="text-[10px] text-gray-400 line-through">₹{product.comparePrice}</span>
                        )}
                    </div>
                    
                    {/* Add to Cart Button Logic (Zepto Style) */}
                    <div onClick={(e) => e.stopPropagation()}>
                        {product.stock <= 0 ? (
                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                        ) : quantityInCart === 0 ? (
                            <button 
                                onClick={handleAddInitial}
                                className="border border-primary-600 text-primary-600 bg-primary-50 px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-100 transition-colors uppercase"
                            >
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center bg-primary-600 text-white rounded-lg overflow-hidden">
                                <button onClick={handleDecrement} className="px-2.5 py-1.5 font-bold hover:bg-primary-700 transition-colors">-</button>
                                <span className="px-2 font-bold text-sm">{quantityInCart}</span>
                                <button onClick={handleIncrement} className="px-2.5 py-1.5 font-bold hover:bg-primary-700 transition-colors">+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
