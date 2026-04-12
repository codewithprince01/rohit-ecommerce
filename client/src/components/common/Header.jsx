import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { LogOut, ShoppingCart, User, Menu, X, ChevronRight, Search, Heart } from 'lucide-react';
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
        <header className="sticky top-0 z-50 w-full transition-all duration-300">
            {/* Main Header with Glass Effect */}
            <div className="glass border-b border-white/20 shadow-sm">
                <div className="container-custom py-3 md:py-4">
                    <div className="flex items-center justify-between gap-4 md:gap-8">
                        {/* Logo - Minimal & Modern */}
                        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                            <div className="bg-primary-500 text-white w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
                                 <span className="font-display font-bold text-2xl">A</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl md:text-2xl font-bold font-display text-gray-900 leading-none tracking-tight">Agrawal</span>
                                <span className="text-[10px] text-primary-600 font-bold tracking-[0.2em] uppercase mt-0.5">Grocery</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation - Centered & Clean */}
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
                            <Link to="/" className="hover:text-primary-600 transition-colors font-semibold">Home</Link>
                            
                            <div className="relative group">
                                <button className="flex items-center gap-1 hover:text-primary-600 transition-colors py-2 font-medium">
                                    Categories
                                    <ChevronRight size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                                {/* Mega Menu Dropdown */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl border border-white/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-4 group-hover:translate-y-0 z-50 p-2 mt-2">
                                    {categories.slice(0, 8).map(category => (
                                        <Link 
                                            key={category._id} 
                                            to={`/category/${category.slug}`}
                                            className="block px-4 py-2.5 hover:bg-primary-50 hover:text-primary-700 rounded-xl mb-0.5 transition-colors text-sm font-medium text-gray-700"
                                        >
                                            {category.name}
                                        </Link>
                                    ))}
                                    <Link to="/categories" className="block px-4 py-3 text-center text-primary-600 hover:text-primary-700 font-bold text-xs uppercase tracking-wider border-t border-gray-100 mt-1">
                                        View All
                                    </Link>
                                </div>
                            </div>
                            
                            <Link to="/products" className="hover:text-primary-600 transition-colors">Shop</Link>
                            <Link to="/about" className="hover:text-primary-600 transition-colors">About</Link>
                            <Link to="/contact" className="hover:text-primary-600 transition-colors">Contact</Link>
                        </nav>

                        {/* Desktop Search - Pill Shape */}
                        <div className="flex-1 max-w-md hidden md:block relative group">
                             <form onSubmit={handleSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search essentials..."
                                    className="w-full pl-11 pr-4 py-2.5 bg-gray-100/50 border border-transparent rounded-full text-sm focus:bg-white focus:border-primary-200 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner-soft"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                             </form>

                             {/* Search Results Dropdown */}
                             {showResults && searchResults.length > 0 && (
                                 <div className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 max-h-96 overflow-y-auto z-50 animate-fade-in-up p-2">
                                     {searchResults.map(product => (
                                         <Link 
                                            key={product._id} 
                                            to={`/product/${product.slug}`}
                                            className="flex items-center gap-3 p-2 hover:bg-primary-50/50 rounded-xl mb-1 transition-colors"
                                            onClick={() => setShowResults(false)}
                                         >
                                            <div className="w-10 h-10 rounded-lg bg-white p-1 shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                <img 
                                                    src={product.images?.[0] 
                                                        ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${(typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url).startsWith('/') ? (typeof product.images[0] === 'string' ? product.images[0].substring(1) : product.images[0].url.substring(1)) : (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)}` 
                                                        : 'https://dummyimage.com/50x50/f3f4f6/9ca3af.png&text=Product'
                                                    } 
                                                    alt={product.name} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                                                <p className="text-xs text-primary-600 font-bold">₹{product.price}</p>
                                            </div>
                                         </Link>
                                     ))}
                                     <Link 
                                        to={`/products?search=${searchTerm}`}
                                        className="block p-2 text-center text-xs font-bold uppercase tracking-wider text-primary-600 hover:bg-primary-50 rounded-lg mt-1"
                                    >
                                        View all results
                                     </Link>
                                 </div>
                             )}
                        </div>

                        {/* Actions - Icons Only for cleaner look */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {isAuthenticated ? (
                                <div className="hidden sm:flex items-center gap-2">
                                    {isAdmin && (
                                        <Link to="/admin/dashboard" className="p-2.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-all" title="Dashboard">
                                            <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border-2 border-current rounded">A</div>
                                        </Link>
                                    )}
                                    <div className="relative group">
                                         <button className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-100 rounded-full transition-all border border-transparent hover:border-gray-200">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-full flex items-center justify-center font-bold shadow-md text-xs">
                                                {user?.name?.charAt(0)}
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700 max-w-[80px] truncate hidden md:block">{user?.name?.split(' ')[0]}</span>
                                         </button>
                                         {/* User Dropdown */}
                                         <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                                             <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2">
                                                <LogOut size={16} /> Logout
                                             </button>
                                         </div>
                                    </div>
                                </div>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 bg-gray-900 rounded-full hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5"
                                >
                                    Log In
                                </Link>
                            )}

                            <button 
                                onClick={toggleCart} 
                                className="relative p-2.5 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-all select-none"
                            >
                                <ShoppingCart size={22} className="stroke-[2.5px]" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-primary-500 text-white text-[10px] sm:text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-bounce-slow">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button 
                                className="md:hidden p-2.5 text-gray-700 hover:bg-gray-100 rounded-full"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Search - Slide Down */}
            <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                        type="text"
                        placeholder="What are you looking for?"
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </form>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white md:hidden animate-fade-in flex flex-col pt-20">
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <nav className="flex flex-col gap-6">
                            {!isAuthenticated && (
                                <div className="p-6 bg-gray-50 rounded-2xl text-center">
                                    <h3 className="font-bold text-gray-900 mb-2">Welcome!</h3>
                                    <p className="text-sm text-gray-500 mb-4">Sign in to manage your orders</p>
                                    <Link 
                                        to="/login"
                                        className="btn btn-primary w-full shadow-lg shadow-primary-500/20"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Log In / Sign Up
                                    </Link>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Link to="/" className="flex items-center justify-between p-3 text-lg font-bold text-gray-900 border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>
                                    Home <ChevronRight size={16} className="text-gray-400" />
                                </Link>
                                <Link to="/products" className="flex items-center justify-between p-3 text-lg font-bold text-gray-900 border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>
                                    Shop All <ChevronRight size={16} className="text-gray-400" />
                                </Link>
                                <Link to="/categories" className="flex items-center justify-between p-3 text-lg font-bold text-gray-900 border-b border-gray-100" onClick={() => setIsMenuOpen(false)}>
                                    Categories <ChevronRight size={16} className="text-gray-400" />
                                </Link>
                            </div>

                            {isAuthenticated && (
                                <button onClick={logout} className="p-3 text-left font-semibold text-red-600 flex items-center gap-2 rounded-xl hover:bg-red-50">
                                    <LogOut size={20} /> Logout
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
