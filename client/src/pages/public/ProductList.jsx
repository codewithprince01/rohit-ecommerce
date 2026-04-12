import { useState, useEffect } from "react";
import { useLocation, Link, useParams, useNavigate } from "react-router-dom";
import {
  Filter,
  X,
  ChevronDown,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import ProductCard from "../../components/common/ProductCard";
import { useFetch } from "../../hooks/useFetch";
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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({
    category: null,
    minPrice: "",
    maxPrice: "",
    sort: "-createdAt", // Default: Newest first
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const debouncedSearch = useDebounce(search, 500);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryService.getHierarchy();
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
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
          sort: filters.sort,
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Update URL query params without navigation
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.category) params.set("category", filters.category);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);

    navigate({ search: params.toString() }, { replace: true });
  }, [debouncedSearch, filters, pagination.page]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const clearFilters = () => {
    setFilters({
      category: null,
      minPrice: "",
      maxPrice: "",
      sort: "-createdAt",
    });
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Head title="Shop All Products" />

      <div className="container-custom">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900">
              All Products
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Found {pagination.total} products
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
            </div>
            <button
              className="md:hidden btn btn-secondary btn-sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`md:w-64 space-y-8 ${showFilters ? "block" : "hidden md:block"}`}
          >
            {/* Categories */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex justify-between items-center">
                Categories
                {filters.category && (
                  <button
                    onClick={() => handleFilterChange("category", null)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {(() => {
                  const renderCats = (cats, level = 0) => {
                    return (cats || []).map((cat) => (
                      <div key={cat._id} className="w-full">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <div
                            style={{ marginLeft: `${level * 12}px` }}
                            className={`flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              filters.category === cat._id
                                ? "bg-primary-600 border-primary-600"
                                : "border-gray-300 group-hover:border-primary-500"
                            }`}
                          >
                            {filters.category === cat._id && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <input
                            type="radio"
                            name="category"
                            className="hidden"
                            checked={filters.category === cat._id}
                            onChange={() =>
                              handleFilterChange("category", cat._id)
                            }
                          />
                          <span
                            className={`text-sm truncate ${
                              filters.category === cat._id
                                ? "text-primary-700 font-semibold"
                                : "text-gray-600 group-hover:text-gray-900"
                            }`}
                          >
                            {cat.name}
                          </span>
                        </label>
                        {cat.children && cat.children.length > 0 && (
                          <div className="mt-1">
                            {renderCats(cat.children, level + 1)}
                          </div>
                        )}
                      </div>
                    ));
                  };
                  return renderCats(categories);
                })()}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Price Range
              </h3>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="input p-2 text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="input p-2 text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Sort By
              </h3>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="input text-sm"
              >
                <option value="-createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {/* Clear Filters Button (Mobile) */}
            <button
              onClick={clearFilters}
              className="w-full btn btn-outline btn-sm md:hidden"
            >
              Reset All Filters
            </button>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white h-80 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="product-grid mb-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() =>
                          setPagination((prev) => ({ ...prev, page: i + 1 }))
                        }
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${
                          pagination.page === i + 1
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <button onClick={clearFilters} className="btn btn-secondary">
                  Clear All Filters
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
