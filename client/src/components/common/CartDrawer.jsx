import { useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { 
        isCartOpen, 
        toggleCart, 
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        cartTotal,
        setIsCartOpen 
    } = useCart();
    
    const navigate = useNavigate();
    const overlayRef = useRef(null);

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) {
            setIsCartOpen(false);
        }
    };

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Overlay */}
            <div 
                ref={overlayRef}
                onClick={handleOverlayClick}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-slide-in-right flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-primary-600" />
                        <h2 className="text-lg font-bold">Shopping Cart ({cartItems.length})</h2>
                    </div>
                    <button 
                        onClick={toggleCart}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cartItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                <ShoppingBag size={40} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                            <button 
                                onClick={() => { setIsCartOpen(false); navigate('/products'); }}
                                className="btn btn-primary btn-sm"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item._id} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                                {/* Image */}
                                <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden shrink-0">
                                    <img 
                                        src={item.images?.[0] ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${item.images[0]}` : 'https://via.placeholder.com/80'} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-gray-500">{item.unit}</p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <p className="font-bold text-primary-600">₹{item.price}</p>
                                        
                                        <div className="flex items-center gap-3">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border border-gray-200 rounded-md h-8">
                                                <button 
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    className="w-8 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            {/* Delete */}
                                            <button 
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-xl font-bold text-gray-900">₹{cartTotal}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4 text-center">
                            Shipping and taxes calculated at checkout.
                        </p>
                        <button 
                            onClick={handleCheckout}
                            className="btn btn-primary w-full py-3 shadow-lg shadow-primary-600/20"
                        >
                            Checkout Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
