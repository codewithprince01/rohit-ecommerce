import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Search, MapPin, User, ShoppingCart, ChevronDown, Clock, Zap } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { productService } from '../../services';

const Header = () => {
    const { user, isAuthenticated } = useAuth();
    const { cartCount, toggleCart } = useCart();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
        }, 300);
        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    useEffect(() => {
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
        <header className="sticky top-0 z-[100] w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="container-custom py-3 md:py-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6">
                    
                    {/* Top Row for Mobile (Logo + Cart) / Left side for Desktop */}
                    <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8">
                        {/* Logo & Location */}
                        <div className="flex items-center gap-4">
                            <Link to="/" className="hidden md:flex items-center gap-2 border-r border-gray-200 pr-6">
                                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white">
                                    <Zap size={24} className="fill-current" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-gray-900">Agrawal</span>
                            </Link>

                            {/* Location Selector (Blinkit style) */}
                            <div className="flex flex-col cursor-pointer group">
                                <div className="flex items-center gap-1">
                                    <h2 className="text-sm md:text-base font-black text-gray-900 leading-tight">Delivery in 10 minutes</h2>
                                </div>
                                <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                                    <span className="truncate max-w-[200px] md:max-w-[300px]">Fatehchand Colony, Sabalgarh, MP...</span>
                                    <ChevronDown size={14} className="group-hover:text-primary-600" />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Profile & Cart */}
                        <div className="flex md:hidden items-center gap-3">
                            <Link to={isAuthenticated ? "/profile" : "/login"} className="p-2">
                                <User size={24} className="text-gray-700" />
                            </Link>
                            <button onClick={toggleCart} className="p-2 relative">
                                <ShoppingCart size={24} className="text-gray-700" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Search Bar - Full width on mobile */}
                    <div className="flex-1 w-full max-w-3xl" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Search className="text-gray-400" size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder='Search for "Milk", "Bread", "Butter"...'
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>

                        {/* Search Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[110]">
                                <div className="max-h-[60vh] overflow-y-auto">
                                    {searchResults.map(product => (
                                        <Link 
                                            key={product._id} 
                                            to={`/product/${product.slug}`}
                                            className="flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                                            onClick={() => setShowResults(false)}
                                        >
                                            <div className="w-12 h-12 bg-white border border-gray-100 rounded flex items-center justify-center p-1 shrink-0">
                                                <img 
                                                    src={product.images?.[0] ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/${product.images[0].replace(/^\//, '')}` : 'https://dummyimage.com/100x100/f3f4f6/9ca3af.png'} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-500">{product.unit}</span>
                                                    <span className="text-xs font-bold text-gray-900">₹{product.price}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Desktop Auth & Cart */}
                    <div className="hidden md:flex items-center gap-6">
                        {isAuthenticated ? (
                            <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium text-sm">
                                Profile
                            </Link>
                        ) : (
                            <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium text-sm">
                                Login
                            </Link>
                        )}
                        <button 
                            onClick={toggleCart} 
                            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <ShoppingCart size={20} />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] font-bold">My Cart</span>
                                <span className="text-xs font-bold">{cartCount > 0 ? `${cartCount} items` : 'Empty'}</span>
                            </div>
                        </button>
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;
