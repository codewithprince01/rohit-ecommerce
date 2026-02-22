import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const imageUrl = product.images && product.images.length > 0 
    ? `http://localhost:5000${product.images[0]}`
    : 'https://via.placeholder.com/300x300?text=No+Image';

  return (
    <Link to={`/products/${product.slug}`} className="card hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{product.unit}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary-600">${product.price.toFixed(2)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ${product.comparePrice.toFixed(2)}
              </span>
            )}
          </div>
          {!product.inStock && (
            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
