import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';
import { useFlavor, useFlavorPath } from '../../flavors/FlavorContext';

interface CategoriesProps {
  categories: Category[];
}

const Categories: React.FC<CategoriesProps> = ({ categories }) => {
  const { copy } = useFlavor();
  const flavorPath = useFlavorPath();

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{copy.categoriesTitle}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{copy.categoriesSubtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={flavorPath(`${copy.catalogPath}?category=${category.name.toLowerCase()}`)}
              className="relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group h-80 block"
            >
              <div className="absolute inset-0">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white text-2xl sm:text-3xl font-bold">{category.name}</h3>
                <p className="text-white/90 text-sm font-medium flex items-center gap-2 mt-2">
                  {copy.heroCtaLabel}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;

