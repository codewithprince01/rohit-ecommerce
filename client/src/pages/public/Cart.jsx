import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import Head from '../../components/common/Head';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
                <Head title="Shopping Cart" />
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-primary-200">
                    <ShoppingBag size={48} />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our products and find great deals!</p>
                <Link to="/products" className="btn btn-primary btn-lg shadow-lg shadow-primary-600/20">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Shopping Cart" />

            <div className="container-custom">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold font-display text-gray-900">Shopping Cart <span className="text-gray-400 font-normal text-xl ml-2">({cartItems.length} items)</span></h1>
                    <button 
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} /> Clear Cart
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item._id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
                                {/* Image */}
                                <Link to={`/product/${item.slug}`} className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                                    <img 
                                        src={item.images?.[0] 
                                            ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}` 
                                            : 'https://via.placeholder.com/150?text=Product'
                                        } 
                                        alt={item.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </Link>

                                {/* Content */}
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <Link to={`/product/${item.slug}`} className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                                        {item.name}
                                    </Link>
                                    <p className="text-gray-500 text-sm mb-4">{item.unit}</p>
                                    <div className="text-xl font-bold text-primary-600 sm:hidden mb-4">₹{item.price * item.quantity}</div>
                                    
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-8">
                                        {/* Quantity Control */}
                                        <div className="flex items-center border border-gray-200 rounded-lg h-10 w-32">
                                            <button 
                                                onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-l-lg"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="flex-1 text-center font-bold text-gray-900">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                className="w-10 h-full flex items-center justify-center hover:bg-gray-50 text-gray-600 rounded-r-lg"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>

                                        <button 
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                                        >
                                            <Trash2 size={16} /> Remove
                                        </button>
                                    </div>
                                </div>

                                {/* Price (Desktop) */}
                                <div className="text-right hidden sm:block min-w-[100px]">
                                    <div className="text-xl font-bold text-primary-600">₹{item.price * item.quantity}</div>
                                    <div className="text-sm text-gray-400">₹{item.price} / unit</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-xl shadow-soft p-6 lg:sticky lg:top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charges</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹0</span>
                                </div>
                                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-4 border-t border-dashed border-gray-200">
                                    <span>Total</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                            </div>

                            <Link 
                                to="/checkout" 
                                className="btn btn-primary w-full py-4 text-lg shadow-lg shadow-primary-600/20 group"
                            >
                                Proceed to Checkout <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
                                <Shield className="text-green-500" size={16} />
                                <span>Safe and Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
