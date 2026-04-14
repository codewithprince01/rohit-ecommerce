import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Filter,
  Search,
  LayoutGrid,
  ChevronRight,
  Zap,
  Tag,
  Loader2,
} from "lucide-react";
import ProductCard from "../../components/common/ProductCard";
import { productService, categoryService } from "../../services";
import Head from "../../components/common/Head";
import { useDebounce } from "../../hooks/useDebounce";

const ProductList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";

  // States
  const [products, setProducts] = useState([]);
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({
    category: queryParams.get("category") || null,
    subCategory: queryParams.get("subCategory") || null,
    subSubCategory: queryParams.get("subSubCategory") || null,
    sort: queryParams.get("sort") || "-createdAt",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const debouncedSearch = useDebounce(search, 500);

  // Fetch Category Hierarchy
  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const res = await categoryService.getHierarchy();
        setHierarchy(res.data);
      } catch (err) {
        console.error("Hierarchy Load Error:", err);
      }
    };
    fetchHierarchy();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: debouncedSearch,
          page: pagination.page,
          limit: 12,
          ...filters,
        };

        // Cleanup empty params
        Object.keys(params).forEach((key) => {
          if (params[key] === "" || params[key] === null) delete params[key];
        });

        const res = await productService.getAll(params);
        setProducts(res.data);
        setPagination(res.pagination);
      } catch (err) {
        console.error("Product Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Sync URL
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.category) params.set("category", filters.category);
    if (filters.subCategory) params.set("subCategory", filters.subCategory);
    if (filters.subSubCategory) params.set("subSubCategory", filters.subSubCategory);
    if (filters.sort) params.set("sort", filters.sort);

    navigate({ search: params.toString() }, { replace: true });
  }, [debouncedSearch, filters, pagination.page]);

  const handleFilterChange = (key, value) => {
    // If changing category, clear children
    if (key === "category") {
      setFilters(prev => ({ ...prev, category: value, subCategory: null, subSubCategory: null }));
    } else if (key === "subCategory") {
      setFilters(prev => ({ ...prev, subCategory: value, subSubCategory: null }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: null,
      subCategory: null,
      subSubCategory: null,
      sort: "-createdAt",
    });
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <Head title="Shop Premium | Agrawal Store" />

      <div className="container-custom">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 px-4 lg:px-0">
          <div>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] mb-3 block">Agrawal Exclusive</span>
              <h1 className="text-5xl md:text-7xl font-black font-display text-gray-950 tracking-tighter leading-none">
                {filters.category ? 'Curated' : 'Complete'} <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Selection.</span>
              </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80 group">
              <div className="absolute inset-0 bg-primary-100 blur-xl opacity-0 group-focus-within:opacity-40 transition-opacity" />
              <div className="relative flex items-center bg-gray-50 border-2 border-transparent focus-within:border-primary-500 rounded-2xl p-1 transition-all">
                <Search className="ml-4 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search 5000+ luxury items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-gray-900 placeholder:text-gray-300"
                />
              </div>
            </div>
            <button
              className="lg:hidden w-full sm:w-auto bg-gray-950 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Close Filters' : 'Toggle Filters'}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Enhanced Sidebar Filters */}
          <aside className={`lg:w-80 space-y-12 ${showFilters ? "block" : "hidden lg:block"} px-4 lg:px-0`}>
            
            {/* Hierarchy Tree */}
            <div>
              <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest mb-8 flex items-center gap-2">
                 <LayoutGrid size={16} className="text-primary-500" /> Catalog Depth
              </h3>
              <div className="space-y-6">
                {hierarchy.map(cat => (
                  <div key={cat._id} className="space-y-4">
                    <button 
                      onClick={() => handleFilterChange('category', filters.category === cat._id ? null : cat._id)}
                      className={`flex items-center gap-3 w-full text-left group transition-all ${filters.category === cat._id ? 'text-primary-600 scale-105' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                      <div className={`w-1.5 h-10 rounded-full transition-all ${filters.category === cat._id ? 'bg-primary-500' : 'bg-gray-100 group-hover:bg-gray-200'}`} />
                      <span className="text-sm font-black uppercase tracking-tight">{cat.name}</span>
                    </button>

                    {/* Subcategories (Only if parent selected) */}
                    {filters.category === cat._id && cat.subcategories?.length > 0 && (
                      <div className="ml-6 flex flex-col gap-3 border-l-2 border-gray-50 pl-6 py-2">
                        {cat.subcategories.map(sub => (
                          <div key={sub._id} className="space-y-3">
                            <button 
                              onClick={() => handleFilterChange('subCategory', filters.subCategory === sub._id ? null : sub._id)}
                              className={`text-xs font-bold transition-all ${filters.subCategory === sub._id ? 'text-primary-600 translate-x-1' : 'text-gray-400 hover:text-gray-700'}`}
                            >
                               {sub.name}
                            </button>

                            {/* Sub-subcategories / Brands */}
                            {filters.subCategory === sub._id && sub.subSubCategories?.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1 pb-3">
                                {sub.subSubCategories.map(ssub => (
                                  <button
                                    key={ssub._id}
                                    onClick={() => handleFilterChange('subSubCategory', filters.subSubCategory === ssub._id ? null : ssub._id)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${filters.subSubCategory === ssub._id ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                  >
                                    {ssub.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Sort */}
            <div className="pt-8 border-t border-gray-100">
               <h3 className="text-xs font-black text-gray-950 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Tag size={16} className="text-orange-500" /> Market Sort
              </h3>
              <div className="grid grid-cols-1 gap-2">
                 {[
                   { label: 'Newest First', value: '-createdAt' },
                   { label: 'Price: Low-High', value: 'price' },
                   { label: 'Price: High-Low', value: '-price' },
                   { label: 'Alphabetical', value: 'name' }
                 ].map(opt => (
                   <button 
                    key={opt.value}
                    onClick={() => handleFilterChange('sort', opt.value)}
                    className={`text-left px-5 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filters.sort === opt.value ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                   >
                    {opt.label}
                   </button>
                 ))}
              </div>
            </div>

            <button
               onClick={clearAllFilters}
               className="w-full flex items-center justify-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest py-4 border-2 border-dashed border-gray-100 rounded-2xl hover:bg-red-50 hover:border-red-100 transition-all"
            >
               Reset All Experience <X size={14} />
            </button>
          </aside>

          {/* Luxury Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 aspect-[4/5] rounded-[3rem] animate-pulse flex items-center justify-center"
                  >
                    <Loader2 className="animate-spin text-gray-200" size={40} />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Modern Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center gap-6 mt-20 p-4 bg-gray-50 rounded-full w-fit mx-auto shadow-inner">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: i + 1 }))
                        }
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          pagination.page === i + 1
                            ? "bg-gray-950 text-white shadow-2xl scale-125"
                            : "text-gray-400 hover:text-gray-950"
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 rounded-[4rem] p-32 text-center border-4 border-dashed border-white shadow-2xl">
                <Search size={64} className="mx-auto mb-8 text-gray-200" />
                <h3 className="text-4xl font-black text-gray-950 mb-4 font-display italic">Zero Discoveries...</h3>
                <p className="text-gray-400 text-lg font-medium mb-12 max-w-sm mx-auto">
                    We couldn't find any matches for your current selection. Try widening your catalog search.
                </p>
                <button 
                  onClick={clearAllFilters} 
                  className="bg-primary-600 text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] hover:bg-gray-950 hover:shadow-2xl transition-all"
                >
                  Reset Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
