import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useCatalog } from '../hooks/useCatalog';
import ProductCard from '../components/ProductCard/ProductCard';
import { useFlavor } from '../flavors/FlavorContext';
import { Product } from '../types';

/**
 * The shared catalog page: retail's Shop, insurance's Plans, healthcare's Treatments.
 * The filter/sort logic is industry-agnostic; only the copy comes from the flavor config.
 */
const ShopPage: React.FC = () => {
  const { addToCart } = useCart();
  const { copy } = useFlavor();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  const { items: products, categories, isLoading: loading, error } = useCatalog();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');
  const [sortBy, setSortBy] = useState<string>('default');

  // Filter and sort products with useMemo for performance
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter - match category name to product category (case-insensitive)
        const matchesCategory = selectedCategory === 'all' || 
          product.category.toLowerCase() === selectedCategory.toLowerCase();

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'name':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4"></div>
          <p className="text-gray-600 text-lg">Loading {copy.itemPlural}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading {copy.catalogTitle}</h3>
            <p className="text-red-600 mb-4">
              Failed to load {copy.itemPlural}. Please make sure the backend server is running.
            </p>
            <button
              id="retry-button"
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{copy.catalogTitle}</h1>
          <p className="text-lg text-gray-600">{copy.catalogSubtitle}</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder={copy.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none bg-white"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredProducts.length}</span> of{' '}
              <span className="font-semibold">{products.length}</span> {copy.itemPlural}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No {copy.itemPlural} found</h2>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
            <button
              id="clear-filters-button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('default');
              }}
              className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

