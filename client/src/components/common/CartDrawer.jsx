import { useRef, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../services/api';

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

    // Disable body scroll when cart is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCartOpen]);

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    {/* Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                    />

                    {/* Drawer */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-lg h-full bg-white shadow-[-20px_0_80px_-20px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-8 py-8 border-b border-gray-50 flex items-center justify-between bg-white relative">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <ShoppingBag className="text-primary-600" size={24} />
                                    <h2 className="text-2xl font-black text-gray-950 tracking-tight font-display">My Basket</h2>
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cartItems.length} Items Selected</span>
                            </div>
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                className="w-12 h-12 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all group"
                            >
                                <X size={24} className="text-gray-400 group-hover:text-gray-950 group-hover:rotate-90 transition-all duration-300" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 no-scrollbar">
                            {cartItems.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="h-full flex flex-col items-center justify-center text-center py-20"
                                >
                                    <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center mb-8 text-gray-200 border border-gray-100">
                                        <ShoppingBag size={56} className="stroke-[1.5px]" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-950 mb-3 tracking-tight">Your basket is empty</h3>
                                    <p className="text-gray-400 text-sm font-medium mb-10 max-w-xs leading-relaxed">Looks like you haven't added anything to your cart yet. Let's find some essentials!</p>
                                    <button 
                                        onClick={() => { setIsCartOpen(false); navigate('/products'); }}
                                        className="px-10 py-5 bg-gray-950 text-white rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Start Shopping
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item, idx) => (
                                        <motion.div 
                                            key={item._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group relative flex gap-6 p-5 bg-white border border-gray-100 rounded-[2.5rem] hover:border-primary-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500"
                                        >
                                            {/* Image */}
                                            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] p-3 overflow-hidden shrink-0 border border-gray-50 group-hover:bg-white transition-colors duration-500">
                                                <img 
                                                    src={item.image ? getImageUrl(item.image) : (item.images?.[0] ? getImageUrl(item.images[0]) : 'https://dummyimage.com/150x150/f3f4f6/9ca3af.png&text=Product')} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h4 className="font-black text-gray-950 text-sm md:text-base leading-tight group-hover:text-primary-600 transition-colors">{item.name}</h4>
                                                        <button 
                                                            onClick={() => removeFromCart(item._id)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block">{item.unit || '1 unit'}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex flex-col leading-none">
                                                        <span className="text-lg font-black text-gray-950">₹{item.price}</span>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Per Unit</span>
                                                    </div>
                                                    
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                                                        <button 
                                                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                                            className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-primary-600 rounded-xl transition-all text-gray-400"
                                                        >
                                                            <Minus size={14} className="stroke-[3px]" />
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-black text-gray-950">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                            className="w-10 h-10 flex items-center justify-center hover:bg-white hover:text-primary-600 rounded-xl transition-all text-gray-400"
                                                        >
                                                            <Plus size={14} className="stroke-[3px]" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cartItems.length > 0 && (
                            <div className="px-8 pt-8 pb-12 border-t border-gray-50 bg-white relative">
                                {/* Extra Info */}
                                <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-2xl mb-8 border border-primary-100">
                                    <div className="w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-950 uppercase tracking-widest leading-none mb-1">Guaranteed Fresh</p>
                                        <p className="text-[10px] text-primary-700 font-bold uppercase tracking-tight opacity-70">Sourced daily from local farmers</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-10">
                                    <div className="flex items-center justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                        <span>Items Total</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                        <span>Delivery Fee</span>
                                        <span className="text-primary-600">FREE</span>
                                    </div>
                                    <div className="h-px bg-gray-50 w-full" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col leading-none">
                                            <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Amount</span>
                                            <span className="text-3xl font-black text-gray-950 tracking-tighter font-display">₹{cartTotal}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-primary-600 font-black text-[10px] uppercase tracking-widest">
                                            <Zap size={14} className="fill-current" />
                                            Express Delivery
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCheckout}
                                    className="group relative w-full h-20 bg-gray-950 text-white rounded-[2rem] overflow-hidden transition-all hover:bg-primary-600 active:scale-95 shadow-2xl shadow-gray-900/20"
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                    <div className="relative z-10 flex items-center justify-center gap-4">
                                        <span className="text-sm font-black uppercase tracking-[0.3em]">Secure Checkout</span>
                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-all duration-500">
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </button>
                                <p className="text-center mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em]">By checking out, you agree to our terms of service.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
