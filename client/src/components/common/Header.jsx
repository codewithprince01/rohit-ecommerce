import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { LogOut, ShoppingCart, User, Menu, X, ChevronRight, Search, Heart, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { categoryService, productService } from '../../services';

const Header = () => {
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const { cartCount, toggleCart } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data.data || []);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    // Search debouncing
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.length > 2) {
                try {
                    const data = await productService.search(searchTerm);
                    setSearchResults(data.data || []);
                    setShowResults(true);
                } catch (error) {
                    console.error('Search failed', error);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setShowResults(false);
    }, [location]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?search=${searchTerm}`);
            setShowResults(false);
        }
    };

    return (
        <header className="sticky top-0 z-[100] w-full bg-white border-b border-gray-100 shadow-sm">
            {/* Main Navigation Row */}
            <div className="container-custom py-2 md:py-3">
                <div className="flex items-center justify-between gap-4 md:gap-12">
                    
                    {/* 1. BRAND LOGO (Left) */}
                    <Link to="/" className="flex items-center gap-2 group shrink-0">
                        <div className="bg-primary-500 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-12 transition-all duration-500">
                             <Zap size={22} fill="currentColor" />
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-xl font-black font-display text-gray-950 leading-none tracking-tighter">Agrawal</span>
                            <span className="text-[10px] text-primary-600 font-bold tracking-[0.2em] uppercase">Store</span>
                        </div>
                    </Link>

                    {/* 2. SEARCH BAR (Center - Persistent) */}
                    <div className="flex-1 max-w-2xl relative group">
                         <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder='Search for "milk", "bread" or "atta"...'
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500/30 focus:ring-4 focus:ring-primary-500/5 outline-none transition-all placeholder:text-gray-400"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                         </form>

                         {/* Quick Results Dropdown */}
                         {showResults && searchResults.length > 0 && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-fade-in-up">
                                 <div className="p-2 max-h-[70vh] overflow-y-auto no-scrollbar">
                                     {searchResults.map(product => (
                                         <Link 
                                            key={product._id} 
                                            to={`/product/${product.slug}`}
                                            className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors group/item"
                                            onClick={() => setShowResults(false)}
                                         >
                                            <div className="w-12 h-12 rounded-lg bg-gray-50 p-2 flex items-center justify-center overflow-hidden shrink-0">
                                                <img 
                                                    src={product.images?.[0] 
                                                        ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${(typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url).startsWith('/') ? (typeof product.images[0] === 'string' ? product.images[0].substring(1) : product.images[0].url.substring(1)) : (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)}` 
                                                        : 'https://dummyimage.com/50x50/f3f4f6/9ca3af.png&text=Product'
                                                    } 
                                                    alt={product.name} 
                                                    className="w-full h-full object-contain mix-blend-multiply group-hover/item:scale-110 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-primary-600 font-black">₹{product.price}</p>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                                         </Link>
                                     ))}
                                 </div>
                                 <Link 
                                    to={`/products?search=${searchTerm}`}
                                    className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors"
                                >
                                    See all matching results
                                 </Link>
                             </div>
                         )}
                    </div>

                    {/* 3. ACTION HUB (Right) */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Categories Desktop link */}
                        <Link to="/categories" className="hidden lg:flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-primary-600 transition-colors">
                           <Menu size={20} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Categories</span>
                        </Link>

                        <div className="w-px h-8 bg-gray-100 hidden md:block" />

                        {isAuthenticated ? (
                             <div className="relative group">
                                <button className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                    <div className="w-9 h-9 bg-primary-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-primary-500/20">
                                        {user?.name?.charAt(0)}
                                    </div>
                                    <div className="hidden xl:flex flex-col items-start translate-y-0.5">
                                        <span className="text-[10px] text-gray-400 font-black uppercase leading-none tracking-widest mb-1">My Account</span>
                                        <span className="text-sm font-bold text-gray-950 leading-none">{user?.name?.split(' ')[0]}</span>
                                    </div>
                                </button>
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-4 group-hover:translate-y-0 z-[120]">
                                    {isAdmin && (
                                        <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-2xl mb-1">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black">A</div>
                                            Admin Panel
                                        </Link>
                                    )}
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-2xl">
                                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"><LogOut size={16} /></div>
                                        Logout
                                    </button>
                                </div>
                             </div>
                        ) : (
                            <Link 
                                to="/login" 
                                className="px-6 py-2.5 bg-gray-950 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-lg shadow-gray-900/10 active:scale-95"
                            >
                                Login
                            </Link>
                        )}

                        <button 
                            onClick={toggleCart} 
                            className="relative group flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-primary-500/20 active:scale-95 ml-2"
                        >
                            <ShoppingCart size={20} className="stroke-[2.5px]" />
                            <span className="hidden md:inline text-xs font-black uppercase tracking-widest mt-0.5">Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-xl animate-bounce-slow">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button 
                            className="lg:hidden p-2 text-gray-900"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[150] bg-white lg:hidden animate-fade-in pt-20 px-6">
                    <nav className="flex flex-col gap-4">
                        <Link to="/" className="text-2xl font-black text-gray-950 border-b border-gray-100 py-4 flex justify-between items-center" onClick={() => setIsMenuOpen(false)}>
                            Home <ChevronRight />
                        </Link>
                        <Link to="/categories" className="text-2xl font-black text-gray-950 border-b border-gray-100 py-4 flex justify-between items-center" onClick={() => setIsMenuOpen(false)}>
                            Categories <ChevronRight />
                        </Link>
                        <Link to="/products" className="text-2xl font-black text-gray-950 border-b border-gray-100 py-4 flex justify-between items-center" onClick={() => setIsMenuOpen(false)}>
                            Shop All <ChevronRight />
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
