import { Link } from 'react-router-dom';

const BestSellingCategories = () => {
  const categories = [
    {
      id: 1,
      name: 'Cleaning Items',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop',
      slug: 'cleaning-items',
      hasSubcategories: true,
      subcategoryCount: 5
    },
    {
      id: 2,
      name: 'Chocolate & Cakes',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
      slug: 'chocolate-cakes'
    },
    {
      id: 3,
      name: 'Biscuit & Bakery',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop',
      slug: 'biscuit-bakery'
    },
    {
      id: 4,
      name: 'Fryums & Snacks',
      image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400&h=400&fit=crop',
      slug: 'fryums-snacks'
    },
    {
      id: 5,
      name: 'Mouth Freshners & Sweet Supari',
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop',
      slug: 'mouth-freshners'
    },
    {
      id: 6,
      name: 'Daily Use Items',
      image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400&h=400&fit=crop',
      slug: 'daily-use-items'
    },
    {
      id: 7,
      name: 'Creams & Oils',
      image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
      slug: 'creams-oils'
    },
    {
      id: 8,
      name: 'Stationary',
      image: 'https://images.unsplash.com/photo-1612521564730-62fc7691cd85?w=400&h=400&fit=crop',
      slug: 'stationary'
    },
    {
      id: 9,
      name: 'Festival Special',
      image: 'https://images.unsplash.com/photo-1605559911160-a3d95d213904?w=400&h=400&fit=crop',
      slug: 'festival-special'
    },
    {
      id: 10,
      name: 'Baby & Women Care',
      image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop',
      slug: 'baby-women-care'
    },
    {
      id: 11,
      name: 'Namkeen',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=400&fit=crop',
      slug: 'namkeen'
    },
    {
      id: 12,
      name: 'Pooja & Religious Items',
      image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=400&fit=crop',
      slug: 'pooja-religious'
    },
    {
      id: 13,
      name: 'Spices & Masala',
      image: 'https://images.unsplash.com/photo-1596040033229-a0b3b7d1f4b1?w=400&h=400&fit=crop',
      slug: 'spices-masala'
    },
    {
      id: 14,
      name: 'Instant Food',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=400&fit=crop',
      slug: 'instant-food'
    },
    {
      id: 15,
      name: 'Tobacco & Pan Products',
      image: 'https://images.unsplash.com/photo-1464454709131-ffd692591ee5?w=400&h=400&fit=crop',
      slug: 'tobacco-pan'
    },
    {
      id: 16,
      name: 'Beverages & Drinks',
      image: 'https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=400&h=400&fit=crop',
      slug: 'beverages-drinks'
    },
    {
      id: 17,
      name: 'Disposable Items',
      image: 'https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=400&h=400&fit=crop',
      slug: 'disposable-items'
    },
    {
      id: 18,
      name: 'Fun Accessories',
      image: 'https://images.unsplash.com/photo-1571168345540-d3e8fc17f8e6?w=400&h=400&fit=crop',
      slug: 'fun-accessories'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Best Selling Categories
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore our most popular product categories and find exactly what you need
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.hasSubcategories ? `/category/${category.slug}` : `/products?category=${category.slug}`}
              className="group flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 rounded-xl overflow-hidden bg-white relative"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden aspect-square">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Subcategory Indicator */}
                {category.hasSubcategories && (
                  <div className="absolute top-2 right-2 bg-primary-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                    {category.subcategoryCount}
                  </div>
                )}
              </div>

              {/* Category Name Below Image */}
              <div className="p-3 bg-white">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base leading-tight text-center group-hover:text-primary-600 transition-colors duration-300">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            View All Products
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
    </section>
  );
};

export default BestSellingCategories;
