import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';

const CategoryDetail = () => {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');

  // Category data with subcategories
  const categoryData = {
    'cleaning-items': {
      name: 'Cleaning Items',
      description: 'Browse our wide range of cleaning products for your home and office',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=1200&h=400&fit=crop',
      subcategories: [
        { 
          name: 'Detergent', 
          productCount: 10, 
          slug: 'detergent', 
          image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400&h=400&fit=crop',
          description: 'Laundry and dishwashing detergents'
        },
        { 
          name: 'Oral Care', 
          productCount: 6, 
          slug: 'oral-care', 
          image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&h=400&fit=crop',
          description: 'Toothpaste, toothbrush, and mouthwash'
        },
        { 
          name: 'Shampoo', 
          productCount: 10, 
          slug: 'shampoo', 
          image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
          description: 'Hair care and shampoo products'
        },
        { 
          name: 'Shaving & Grooming', 
          productCount: 5, 
          slug: 'shaving-grooming', 
          image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=400&fit=crop',
          description: 'Razors, shaving cream, and grooming essentials'
        },
        { 
          name: 'Soap', 
          productCount: 10, 
          slug: 'soap', 
          image: 'https://images.unsplash.com/photo-1600857544200-242c2b8e5e46?w=400&h=400&fit=crop',
          description: 'Bath and hand soaps'
        }
      ]
    }
  };

  const category = categoryData[slug];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h2>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const filteredSubcategories = category.subcategories.filter(sub =>
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Category Image */}
      <div className="relative h-64 md:h-80 bg-gray-900 overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        
        {/* Breadcrumb and Title */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container-custom pb-8">
            {/* Breadcrumb */}
            <nav className="mb-4">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link to="/" className="text-white/80 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-white/60">/</li>
                <li>
                  <Link to="/#categories" className="text-white/80 hover:text-white transition-colors">
                    Categories
                  </Link>
                </li>
                <li className="text-white/60">/</li>
                <li className="text-white font-semibold">{category.name}</li>
              </ol>
            </nav>

            {/* Title and Description */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
              {category.name}
            </h1>
            <p className="text-white/90 text-lg max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white shadow-sm"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Subcategories Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Browse Subcategories
          </h2>
          <p className="text-gray-600">
            {filteredSubcategories.length} subcategories available
          </p>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredSubcategories.map((subcategory, index) => (
            <Link
              key={index}
              to={`/products?category=${slug}&subcategory=${subcategory.slug}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Subcategory Image */}
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={subcategory.image}
                  alt={subcategory.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Product Count Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-xs font-semibold text-gray-900">
                    {subcategory.productCount} items
                  </span>
                </div>
              </div>

              {/* Subcategory Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1 group-hover:text-primary-600 transition-colors">
                  {subcategory.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {subcategory.description}
                </p>
              </div>

              {/* View Products Button */}
              <div className="px-4 pb-4">
                <div className="flex items-center text-primary-600 text-sm font-medium group-hover:gap-2 transition-all">
                  <span>View Products</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredSubcategories.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subcategories found</h3>
            <p className="text-gray-600">Try adjusting your search query</p>
          </div>
        )}

        {/* View All Products Button */}
        <div className="mt-12 text-center">
          <Link
            to={`/products?category=${slug}`}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            View All {category.name}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
