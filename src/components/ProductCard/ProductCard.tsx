import React from 'react';
import { Product } from '../../types';
import { useFlavor } from '../../flavors/FlavorContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  /** Overrides the industry's default CTA label (e.g. per-page variations). */
  ctaLabel?: string;
}

/**
 * The shared catalog card. Used by every industry: retail products, insurance plans,
 * healthcare treatments and doctors (via an adapter that fills subtitle/tags/meta).
 *
 * The optional Product fields (subtitle, priceUnit, tags) render only when present, so
 * retail's cards are unchanged.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, ctaLabel }) => {
  const { copy } = useFlavor();

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border border-gray-100"
    >
      {product.image && (
        <div className="relative w-full h-64 overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-2">{product.title}</h3>
        {product.subtitle && (
          <p className="text-sm font-medium text-brand mb-2">{product.subtitle}</p>
        )}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        {product.tags && product.tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mb-3">
            {product.tags.map((tag) => (
              <li key={tag} className="text-xs bg-brand-subtle text-brand rounded-full px-2.5 py-1">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto">
          <p className="text-2xl font-bold text-brand mb-4">
            ${product.price.toFixed(2)}
            {product.priceUnit && (
              <span className="text-sm font-medium text-gray-500 ml-1.5">{product.priceUnit}</span>
            )}
          </p>
          <button
            id={`product-add-to-cart-button-${product.id}`}
            className="w-full bg-brand text-white py-3 px-4 text-sm font-semibold rounded-lg hover:bg-brand-hover active:scale-95 transform transition-all duration-200 shadow-md hover:shadow-lg"
            onClick={() => onAddToCart(product)}
          >
            {ctaLabel ?? copy.selectItemLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
