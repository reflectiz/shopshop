import React from 'react';
import { Link } from 'react-router-dom';
import { useFlavor, useFlavorPath } from '../../flavors/FlavorContext';

const Hero: React.FC = () => {
  const { copy } = useFlavor();
  const flavorPath = useFlavorPath();

  return (
    <section className="relative bg-gradient-to-br from-heroFrom via-heroVia to-heroTo text-white py-20 sm:py-24 lg:py-32 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop')"
        }}
      />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
          {copy.heroTitle}
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
          {copy.heroSubtitle}
        </p>
        <Link
          to={flavorPath(copy.heroCtaTo)}
          id="shop-now-button"
          className="inline-block bg-white text-brand px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-200 active:scale-100"
        >
          {copy.heroCtaLabel}
        </Link>
      </div>
    </section>
  );
};

export default Hero;

