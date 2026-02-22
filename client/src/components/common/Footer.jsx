import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="relative bg-[#0f1f18] text-gray-300 pt-20 pb-10 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600"></div>

            <div className="container-custom relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    {/* Brand Info - Spans 4 columns */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="flex items-center gap-3 mb-6 group">
                            <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-2.5 rounded-xl shadow-lg shadow-primary-900/50 group-hover:scale-105 transition-transform duration-300">
                                <span className="font-display font-bold text-2xl">A</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold font-display text-white leading-none tracking-tight">Agrawal</span>
                                <span className="text-[10px] text-primary-400 font-bold tracking-[0.2em] uppercase mt-1">Grocery Store</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 mb-8 leading-relaxed text-base pr-4">
                            Your trusted neighborhood grocery store, now online. We bring the freshest produce, highest quality staples, and daily essentials directly to your doorstep with love and care.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Facebook, color: 'hover:bg-[#1877F2]' },
                                { icon: Instagram, color: 'hover:bg-[#E4405F]' },
                                { icon: Twitter, color: 'hover:bg-[#1DA1F2]' }
                            ].map((social, idx) => (
                                <a key={idx} href="#" className={`w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center ${social.color} hover:text-white transition-all duration-300 text-gray-400 hover:border-transparent hover:shadow-lg hover:-translate-y-1`}>
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links - Spans 2 columns */}
                    <div className="lg:col-span-2 lg:pl-4">
                        <h3 className="text-white font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-primary-500 rounded-full"></span> Company
                        </h3>
                        <ul className="space-y-4">
                            {['Home', 'About Us', 'Contact', 'Careers', 'Blog'].map((item) => (
                                <li key={item}>
                                    <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2 group text-sm font-medium">
                                        <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary-500" />
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories - Spans 3 columns */}
                    <div className="lg:col-span-3">
                        <h3 className="text-white font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-primary-500 rounded-full"></span> Top Categories
                        </h3>
                        <ul className="space-y-4">
                            {[
                                { name: 'Fresh Fruits & Veggies', link: '/category/fruits-vegetables' },
                                { name: 'Dairy & Bakery', link: '/category/dairy-bakery' },
                                { name: 'Snacks & Munchies', link: '/category/snacks' },
                                { name: 'Cleaning Essentials', link: '/category/cleaning' },
                                { name: 'Personal Care', link: '/category/personal-care' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link to={item.link} className="text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-2 group text-sm font-medium">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-primary-500 transition-colors"></span>
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info - Spans 3 columns */}
                    <div className="lg:col-span-3">
                        <h3 className="text-white font-display font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="w-8 h-1 bg-primary-500 rounded-full"></span> Contact Us
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex items-start gap-4 group">
                                <div className="mt-1 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shrink-0">
                                    <MapPin size={18} />
                                </div>
                                <p className="text-sm text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                    Fatehchand Colony, Sabalgarh,<br />
                                    District Morena, Madhya Pradesh,<br />
                                    India - 476229
                                </p>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shrink-0">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Call Us</p>
                                    <a href="tel:+919098974996" className="text-white font-bold hover:text-primary-400 transition-colors">+91 9098974996</a>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shrink-0">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-0.5">Email Us</p>
                                    <a href="mailto:support@agrawalstore.com" className="text-white font-bold hover:text-primary-400 transition-colors">support@agrawalstore.com</a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Agrawal General Store. Made with <span className="text-red-500 animate-pulse">❤</span> in India.</p>
                    <div className="flex gap-8">
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
