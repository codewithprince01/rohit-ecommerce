import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, Zap, MessageSquare, Smartphone } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/contact', formData);
      toast.success('Message sent! We\'ll get back to you soon.', {
        icon: '🚀',
        style: { borderRadius: '16px', background: '#111827', color: '#fff' }
      });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative py-24 md:py-40 bg-[#fafafa] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-50 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 opacity-60"></div>
        <div className="container-custom relative z-10 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-2xl shadow-sm border border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 mb-10"
            >
                <MessageSquare size={14} className="fill-current" /> Get In Touch
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-9xl font-black text-gray-950 leading-[0.9] tracking-tighter mb-10 font-display"
            >
                Let's Start a <br />
                <span className="text-primary-500">Conversation.</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium"
            >
                Have a question, feedback, or just want to say hi? Our team is always here to help you with your grocery needs.
            </motion.p>
        </div>
      </section>

      {/* 2. CONTACT CONTENT */}
      <section className="py-32">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Side: Info Cards */}
            <div className="lg:col-span-5 space-y-6">
                <motion.div 
                    {...fadeIn}
                    className="p-10 bg-primary-600 rounded-[3rem] text-white relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8">
                        <Phone size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-200 mb-2">Call Us Directly</p>
                    <h3 className="text-3xl font-black font-display tracking-tight">+91 90989 74996</h3>
                    <p className="mt-6 text-sm text-primary-100 font-medium opacity-80 leading-relaxed">Available 7 AM - 11 PM daily for support and orders.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                        {...fadeIn}
                        transition={{ delay: 0.1 }}
                        className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                        <Mail className="text-primary-600 mb-6" size={28} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Us</p>
                        <p className="font-black text-gray-950 text-sm break-words">support@agrawalstore.com</p>
                    </motion.div>
                    <motion.div 
                        {...fadeIn}
                        transition={{ delay: 0.2 }}
                        className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-500"
                    >
                        <Clock className="text-primary-600 mb-6" size={28} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Store Hours</p>
                        <p className="font-black text-gray-950 text-sm">7:00 AM - 11:00 PM</p>
                    </motion.div>
                </div>

                <motion.div 
                    {...fadeIn}
                    transition={{ delay: 0.3 }}
                    className="p-10 bg-gray-950 rounded-[3rem] text-white relative overflow-hidden group"
                >
                    <div className="flex items-start gap-6">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-primary-600 transition-colors duration-500">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Our Location</p>
                            <h3 className="text-xl font-black font-display tracking-tight leading-relaxed">
                                Fatehchand Colony, Sabalgarh,<br />
                                Morena, MP - 476229
                            </h3>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Form */}
            <motion.div 
                {...fadeIn}
                transition={{ delay: 0.4 }}
                className="lg:col-span-7 bg-white border border-gray-100 rounded-[4rem] p-10 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)]"
            >
                <div className="mb-10">
                    <h2 className="text-4xl font-black text-gray-950 tracking-tight font-display mb-3 uppercase">Send Message</h2>
                    <p className="text-gray-400 font-medium">Expected response time: Under 2 hours</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                placeholder="rahul@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                placeholder="+91 00000 00000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all"
                                placeholder="How can we help?"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-950 uppercase tracking-widest ml-4">Your Message</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] text-sm font-bold focus:bg-white focus:border-primary-500/30 outline-none transition-all resize-none"
                            placeholder="Tell us what you need..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full h-20 bg-gray-950 text-white rounded-[2rem] overflow-hidden transition-all hover:bg-primary-600 active:scale-95 shadow-2xl disabled:opacity-50"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                        <div className="relative z-10 flex items-center justify-center gap-4">
                            <span className="text-sm font-black uppercase tracking-[0.3em]">
                                {loading ? 'Sending Message...' : 'Send Message Now'}
                            </span>
                            {!loading && (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-primary-600 transition-all duration-500">
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </div>
                            )}
                        </div>
                    </button>
                </form>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. QUICK HELP (Zap Style) */}
      <section className="py-24 bg-gray-950">
        <div className="container-custom">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
                <div className="max-w-xl">
                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight font-display tracking-tighter mb-4">Need a Quick Answer?</h2>
                    <p className="text-gray-400 font-medium">Chat with us instantly on WhatsApp for order updates and quick queries.</p>
                </div>
                <button className="flex items-center gap-4 bg-[#25D366] text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(37,211,102,0.4)] hover:scale-105 active:scale-95 transition-all">
                    WhatsApp Support <Smartphone size={20} />
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
