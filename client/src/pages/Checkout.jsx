import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, 
    ArrowLeft, 
    ShieldCheck, 
    Smartphone, 
    ChevronRight, 
    ShoppingBag, 
    CheckCircle2, 
    Phone, 
    MapPin, 
    Mail, 
    Info 
} from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    notes: ''
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/products');
    }
    fetchSettings();
  }, [cartItems]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.customerName || !formData.customerPhone) {
      toast.error('Please fill in required fields');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        ...formData,
        items: cartItems.map(item => ({
          product: item._id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: cartTotal
      };

      await api.post('/orders', orderData);

      const whatsappMessage = createWhatsAppMessage();
      const whatsappUrl = `https://wa.me/${settings?.whatsappNumber || '919098974996'}?text=${encodeURIComponent(whatsappMessage)}`;

      clearCart();
      window.open(whatsappUrl, '_blank');

      toast.success('Order placed! Redirecting...', {
        icon: '🚀',
        style: { borderRadius: '16px', background: '#111827', color: '#fff' }
      });
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const createWhatsAppMessage = () => {
    let message = `*NEW ORDER - AGRAWAL STORE*\n\n`;
    message += `I would like to order the following items:\n\n`;

    cartItems.forEach((item, index) => {
      message += `• ${item.name}\n   Qty: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}\n\n`;
    });

    message += `*Total Amount: ₹${cartTotal}*\n\n`;
    message += `*Customer Details*\n`;
    message += `Name: ${formData.customerName}\n`;
    message += `Phone: ${formData.customerPhone}\n`;
    if (formData.customerEmail) message += `Email: ${formData.customerEmail}\n`;
    if (formData.deliveryAddress) message += `Address: ${formData.deliveryAddress}\n`;
    if (formData.notes) message += `Notes: ${formData.notes}\n\n`;
    message += `_Sent from Agrawal Store Web App_`;

    return message;
  };

  return (
    <div className="bg-white min-h-screen pb-40">
      {/* 1. COMPACT HEADER */}
      <section className="py-6 border-b border-gray-50 bg-[#fafafa]">
        <div className="container-custom flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all">
                    <Zap size={20} fill="currentColor" />
                </div>
                <span className="text-lg font-black font-display text-gray-950 uppercase tracking-tighter">Agrawal Store</span>
            </Link>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span className="text-primary-600">Basket</span>
                <ChevronRight size={10} />
                <span className="text-gray-950 underline decoration-2 underline-offset-4 decoration-primary-500">Checkout</span>
                <ChevronRight size={10} />
                <span>Confirm</span>
            </div>
        </div>
      </section>

      <div className="container-custom pt-12 md:pt-20">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start"
        >
            {/* 2. LEFT: DELIVERY FORM (7 cols) */}
            <div className="lg:col-span-7">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-6xl font-black text-gray-950 tracking-tighter font-display uppercase leading-none mb-4">
                        Secure <br /> <span className="text-primary-500">Checkout.</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Please provide your delivery details to complete the order via WhatsApp.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                           <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-[10px]">1</span> 
                           Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Full Name*</label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                    placeholder="Rahul Sharma"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Phone Number*</label>
                                <input
                                    type="tel"
                                    name="customerPhone"
                                    value={formData.customerPhone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                    placeholder="90989 74996"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                           <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-[10px]">2</span> 
                           Delivery Address
                        </h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Full Address in Sabalgarh*</label>
                            <textarea
                                name="deliveryAddress"
                                value={formData.deliveryAddress}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all resize-none"
                                placeholder="Fatehchand Colony, near main market..."
                            />
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-gray-950 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                           <span className="w-6 h-6 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center text-[10px]">3</span> 
                           Special Instructions
                        </h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Notes (Optional)</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all resize-none"
                                placeholder="Any specific requirements for your delivery..."
                            />
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-4 p-4 bg-primary-50 rounded-2xl border border-primary-100">
                            <ShieldCheck className="text-primary-600" size={24} />
                            <div>
                                <p className="text-[10px] font-black text-gray-950 uppercase tracking-widest leading-none mb-1">Secure Ordering</p>
                                <p className="text-[9px] text-primary-700 font-bold uppercase opacity-70">Handled directly via WhatsApp</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-[#fafafa] rounded-2xl border border-gray-100">
                            <Zap className="text-gray-400" size={24} />
                            <div>
                                <p className="text-[10px] font-black text-gray-950 uppercase tracking-widest leading-none mb-1">Instant Response</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase opacity-70">Live tracking available post-order</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* 3. RIGHT: ORDER SUMMARY (5 cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-32">
                <div className="bg-white rounded-[3rem] border border-gray-100 p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
                    
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-50">
                        <div>
                            <h2 className="text-2xl font-black text-gray-950 tracking-tight font-display uppercase">Order Summary</h2>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{cartItems.length} Items Selected</p>
                        </div>
                        <Link to="/products" className="text-primary-600 text-[10px] font-black uppercase tracking-widest hover:text-gray-950 transition-colors underline decoration-2 underline-offset-4">Edit Basket</Link>
                    </div>

                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex items-center gap-4 group">
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 shrink-0 border border-gray-50 group-hover:bg-white transition-all">
                                    <img 
                                        src={item.image ? (typeof item.image === 'string' ? (item.image.startsWith('http') ? item.image : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${item.image.startsWith('/') ? item.image.substring(1) : item.image}`) : 'https://dummyimage.com/100x100') : 'https://dummyimage.com/100x100'} 
                                        alt={item.name} 
                                        className="w-full h-full object-contain mix-blend-multiply"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-950 truncate">{item.name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.quantity} × ₹{item.price}</p>
                                </div>
                                <span className="font-black text-gray-950 text-sm">₹{item.quantity * item.price}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-10 border-t border-gray-50 space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span>Items Total</span>
                            <span>₹{cartTotal}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            <span>Delivery</span>
                            <span className="text-primary-600">FREE</span>
                        </div>
                        <div className="h-px bg-gray-50 w-full" />
                        <div className="flex items-center justify-between pt-2">
                            <div className="flex flex-col">
                                <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Final Amount</span>
                                <span className="text-4xl font-black text-gray-950 tracking-tighter font-display leading-none">₹{cartTotal}</span>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-[9px] font-black uppercase tracking-widest rounded-lg">Pay on Delivery</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="group relative w-full h-20 bg-gray-950 text-white rounded-[2rem] overflow-hidden transition-all hover:bg-primary-600 active:scale-95 shadow-2xl mt-10 disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10 flex items-center justify-center gap-4">
                            {loading ? (
                                <span className="text-sm font-black uppercase tracking-[0.3em] animate-pulse">Processing...</span>
                            ) : (
                                <>
                                    <span className="text-sm font-black uppercase tracking-[0.3em]">Place Order Now</span>
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-all duration-500">
                                        <Smartphone size={20} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                </>
                            )}
                        </div>
                    </button>

                    <div className="mt-8 flex items-center gap-3 p-4 bg-[#fafafa] rounded-2xl border border-gray-100">
                        <Info size={16} className="text-gray-400 shrink-0" />
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">
                            Redirecting to WhatsApp for order confirmation. Your order log will be saved in our system.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
