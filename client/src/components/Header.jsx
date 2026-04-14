import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categoryService } from '../services';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LayoutGrid, 
  Tag, 
  Zap, 
  ArrowRight
} from 'lucide-react';

const Header = () => {
    const { getCartCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMegaMenu, setActiveMegaMenu] = useState(null);
    const [hierarchy, setHierarchy] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        
        const fetchHierarchy = async () => {
            try {
                const res = await categoryService.getHierarchy();
                setHierarchy(res.data); // Show all categories for the new 25+ departmental scale
            } catch (err) { console.error(err); }
        };
        fetchHierarchy();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
                isScrolled ? 'bg-white/80 backdrop-blur-2xl shadow-2xl py-2' : 'bg-white py-6'
            }`}
        >
            <div className="container-custom">
                <div className="flex items-center justify-between gap-8 h-12">
                    {/* Brand Identity */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gray-950 rounded-[1.25rem] flex items-center justify-center transform group-hover:rotate-[15deg] transition-all duration-500 shadow-xl shadow-gray-200">
                            <span className="text-white font-black text-2xl tracking-tighter">A</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black text-gray-950 tracking-tighter leading-none">Agrawal</span>
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">Storefront</span>
                        </div>
                    </Link>

                    {/* Integrated Search Console */}
                    <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl group">
                        <div className="relative w-full">
                            <div className="absolute inset-0 bg-primary-100/30 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative flex items-center bg-gray-50 border-2 border-transparent focus-within:border-primary-500 rounded-2xl w-full px-5 py-2.5 transition-all transition-duration-300">
                                <Search className="text-gray-300" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search 5000+ luxury groceries..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-transparent px-4 outline-none font-bold text-sm text-gray-950 placeholder:text-gray-300"
                                />
                                <button type="submit" className="text-[10px] font-black text-primary-600 uppercase tracking-widest px-3 border-l border-gray-200">Go</button>
                            </div>
                        </div>
                    </form>

                    {/* Interaction Hub */}
                    <div className="flex items-center gap-3">
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="hidden sm:flex px-6 py-3 bg-gray-100 hover:bg-gray-950 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                Admin Deck
                            </Link>
                        )}
                        
                        <Link to="/cart" className="relative group p-3 bg-gray-50 hover:bg-primary-600 rounded-xl transition-all duration-300">
                            <ShoppingBag className="text-gray-950 group-hover:text-white transition-colors" size={22} />
                            {getCartCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-gray-950 text-white text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white group-hover:scale-110 transition-transform shadow-lg shadow-gray-200">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>

                        <Link to={user ? "/profile" : "/login"} className="p-3 bg-gray-50 hover:bg-gray-950 text-gray-950 hover:text-white rounded-xl transition-all duration-300">
                             <User size={22} />
                        </Link>

                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-3 bg-gray-50 hover:bg-gray-950 text-gray-950 hover:text-white rounded-xl transition-all duration-300"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Desktop Global Catalog Navigation */}
                <nav className="hidden lg:flex items-center gap-8 mt-6 pt-4 border-t border-gray-50 flex-wrap">
                    {hierarchy.slice(0, 8).map(cat => (
                        <div 
                            key={cat._id} 
                            className="relative"
                            onMouseEnter={() => setActiveMegaMenu(cat._id)}
                            onMouseLeave={() => setActiveMegaMenu(null)}
                        >
                            <Link 
                                to={`/category/${cat.slug}`}
                                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all pb-4 ${
                                    activeMegaMenu === cat._id ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-950'
                                }`}
                            >
                                {cat.name}
                                <ChevronDown size={10} className={`transition-transform duration-300 ${activeMegaMenu === cat._id ? 'rotate-180' : ''}`} />
                            </Link>

                            {/* Luxury Mega Menu Reveal */}
                            <div className={`absolute top-full left-0 w-[700px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 origin-top-left z-[101] ${
                                activeMegaMenu === cat._id ? 'opacity-100 translate-y-2' : 'opacity-0 translate-y-10 pointer-events-none'
                            }`}>
                                <div className="grid grid-cols-4 gap-0">
                                    <div className="col-span-3 p-10 grid grid-cols-2 gap-8 bg-white">
                                        {(cat.subcategories || []).slice(0, 6).map(sub => (
                                            <div key={sub._id} className="space-y-4">
                                                <Link 
                                                    to={`/category/${cat.slug}/${sub.slug}`}
                                                    className="flex items-center gap-2 group/sub"
                                                >
                                                    <div className="w-1.5 h-4 bg-primary-600 rounded-full scale-y-0 group-hover/sub:scale-y-100 transition-transform" />
                                                    <h4 className="text-[10px] font-black text-gray-950 uppercase tracking-widest">{sub.name}</h4>
                                                </Link>
                                                <div className="flex flex-col gap-2 pl-3">
                                                    {(sub.subSubCategories || []).slice(0, 4).map(ssub => (
                                                        <Link 
                                                            key={ssub._id}
                                                            to={`/category/${cat.slug}/${sub.slug}?brand=${ssub.slug}`}
                                                            className="text-xs font-bold text-gray-400 hover:text-primary-600 transition-colors flex items-center justify-between group/link"
                                                        >
                                                            {ssub.name}
                                                            <ArrowRight size={10} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50/50 p-8 border-l border-gray-50 flex flex-col justify-between">
                                        <div>
                                            <span className="text-[8px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md uppercase mb-3 inline-block">Curated Spotlight</span>
                                            <h3 className="text-xl font-black text-gray-950 font-display italic tracking-tight leading-tight mb-3">{cat.name}</h3>
                                            <p className="text-[9px] font-black text-gray-400 uppercase leading-relaxed tracking-widest">Discover elite premium {cat.name} essentials.</p>
                                        </div>
                                        <Link 
                                          to={`/category/${cat.slug}`}
                                          className="group flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-primary-600 hover:text-gray-950 transition-all"
                                        >
                                          View Collective <ArrowRight size={12} className="group-hover:translate-x-2 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* More Categories Dropdown */}
                    {hierarchy.length > 8 && (
                      <div 
                        className="relative"
                        onMouseEnter={() => setActiveMegaMenu('more')}
                        onMouseLeave={() => setActiveMegaMenu(null)}
                      >
                        <button className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all pb-4 ${
                            activeMegaMenu === 'more' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400 hover:text-gray-950'
                        }`}>
                          More <LayoutGrid size={12} />
                        </button>
                        
                        <div className={`absolute top-full right-0 w-[600px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 origin-top-right z-[101] ${
                            activeMegaMenu === 'more' ? 'opacity-100 translate-y-2' : 'opacity-0 translate-y-10 pointer-events-none'
                        }`}>
                           <div className="p-8 grid grid-cols-3 gap-x-6 gap-y-8">
                             {hierarchy.slice(8).map(cat => (
                               <Link 
                                 key={cat._id}
                                 to={`/category/${cat.slug}`}
                                 className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all group"
                               >
                                 <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                   <LayoutGrid size={14} />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-tight text-gray-600 group-hover:text-gray-950">{cat.name}</span>
                               </Link>
                             ))}
                           </div>
                        </div>
                      </div>
                    )}

                    <Link to="/products" className="text-[10px] font-black text-gray-400 hover:text-primary-600 uppercase tracking-widest pb-4 ml-auto">All Marketplaces</Link>
                </nav>
            </div>

            {/* Mobile Catalog Overlay */}
            <div className={`lg:hidden fixed inset-0 top-[72px] bg-white transition-all duration-700 ${
                mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
            }`}>
               <div className="h-full overflow-y-auto p-8 space-y-12">
                   <div className="space-y-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Explore Catalog</span>
                      <div className="grid grid-cols-1 gap-4">
                         {hierarchy.map(cat => (
                            <Link 
                                key={cat._id}
                                to={`/category/${cat.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] group active:scale-95 transition-all"
                            >
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg"><LayoutGrid size={18} className="text-primary-600" /></div>
                                  <span className="text-sm font-black text-gray-950 uppercase tracking-tight">{cat.name}</span>
                               </div>
                               <ChevronRight size={18} className="text-gray-300 group-hover:text-primary-600 transform translate-x-0 group-hover:translate-x-2 transition-all" />
                            </Link>
                         ))}
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 gap-3 pt-8 border-t border-gray-100">
                      <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black text-gray-950 uppercase tracking-widest px-4 py-2">Home</Link>
                      <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black text-gray-950 uppercase tracking-widest px-4 py-2">Full Market</Link>
                      <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black text-gray-950 uppercase tracking-widest px-4 py-2">Essence</Link>
                      <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-xs font-black text-gray-950 uppercase tracking-widest px-4 py-2">Human Connect</Link>
                   </div>
               </div>
            </div>
        </header>
    );
};

export default Header;
