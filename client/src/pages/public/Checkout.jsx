import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Phone, MapPin, User, CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import Head from '../../components/common/Head';
import { orderService } from '../../services';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: user?.name || '',
        mobile: user?.mobile || '',
        address: user?.address || '',
        note: ''
    });

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generateWhatsAppOrder = (orderId) => {
        const border = "--------------------------------";
        
        let message = `*New Order #${orderId}*\n${border}\n\n`;
        message += `*Customer Details:*\n`;
        message += `👤 Name: ${formData.name}\n`;
        message += `📱 Mobile: ${formData.mobile}\n`;
        message += `📍 Address: ${formData.address}\n\n`;
        
        message += `*Order Items:*\n`;
        cartItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name} x ${item.quantity} = ₹${item.price * item.quantity}\n`;
        });
        
        message += `\n${border}\n`;
        message += `*Total Amount: ₹${cartTotal}*\n`;
        message += `${border}\n\n`;
        
        if (formData.note) {
            message += `📝 *Note:* ${formData.note}\n`;
        }

        message += `✅ Please confirm my order.`;
        
        return encodeURIComponent(message);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Log order to database
            const orderItems = cartItems.map(item => ({
                product: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));

            const orderData = {
                customer: {
                    name: formData.name,
                    mobile: formData.mobile,
                    address: formData.address
                },
                items: orderItems,
                totalAmount: cartTotal,
                note: formData.note
            };

            const response = await orderService.logOrder(orderData);
            
            // Generate WhatsApp Link
            const whatsappMessage = generateWhatsAppOrder(response.data.orderId || Date.now().toString().slice(-6));
            const whatsappUrl = `https://wa.me/919098974996?text=${whatsappMessage}`;
            
            // Clear Cart and Redirect
            clearCart();
            window.open(whatsappUrl, '_blank');
            navigate('/order-success');
            toast.success('Order placed successfully! Please send the message on WhatsApp.');
            
        } catch (error) {
            console.error('Order Error:', error);
            toast.error('Failed to place order. Using direct WhatsApp instead.');
            
            // Fallback: Just open WhatsApp without DB log
            const whatsappMessage = generateWhatsAppOrder('Offline-' + Date.now().toString().slice(-4));
            const whatsappUrl = `https://wa.me/919098974996?text=${whatsappMessage}`;
            window.open(whatsappUrl, '_blank');
            clearCart();
            navigate('/order-success');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <Head title="Checkout" />

            <div className="container-custom">
                <h1 className="text-3xl font-bold font-display mb-8 text-center">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                <CheckCircle className="text-primary-600" />
                                Delivery Details
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="input pl-10"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone size={18} className="text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="mobile"
                                            required
                                            pattern="[0-9]{10}"
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            className="input pl-10"
                                            placeholder="10 digit mobile number"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">We will contact you on this number for delivery.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                                    <div className="relative">
                                        <div className="absolute top-3 left-3 pointer-events-none">
                                            <MapPin size={18} className="text-gray-400" />
                                        </div>
                                        <textarea
                                            name="address"
                                            required
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="input pl-10 resize-none"
                                            placeholder="Complete address with landmark"
                                        ></textarea>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Order Notes (Optional)</label>
                                    <textarea
                                        name="note"
                                        rows="2"
                                        value={formData.note}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="Any special instructions for delivery..."
                                    ></textarea>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-soft p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                                <ShoppingBag className="text-primary-600" />
                                Order Summary
                            </h2>

                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar mb-6">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex justify-between items-start gap-4 text-sm">
                                        <div className="flex gap-3">
                                            <div className="bg-gray-100 p-1 rounded">
                                                <span className="text-xs font-bold text-gray-500 w-5 h-5 flex items-center justify-center">
                                                    {item.quantity}x
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 line-clamp-2">{item.name}</p>
                                                <p className="text-xs text-gray-500">{item.unit}</p>
                                            </div>
                                        </div>
                                        <span className="font-semibold text-gray-700 whitespace-nowrap">
                                            ₹{item.price * item.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charges</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-dashed border-gray-200 pt-3 mt-2">
                                    <span>Total Payable</span>
                                    <span>₹{cartTotal}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn btn-primary w-full shadow-lg shadow-green-500/20 group relative overflow-hidden"
                            >
                                <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                                    Place Order via WhatsApp
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                                {loading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </button>
                            
                            <p className="text-xs text-center text-gray-500 mt-4">
                                By placing order, you agree to send the order details via WhatsApp to confirm.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
