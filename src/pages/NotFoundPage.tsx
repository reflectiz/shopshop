import React from 'react';
import { Link } from 'react-router-dom';
import { useFlavor, useFlavorPath } from '../flavors/FlavorContext';

/**
 * There was no 404 before this: Express rewrites any non-/api path to index.html, so the
 * SPA rendered nothing at all for an unknown URL.
 */
const NotFoundPage: React.FC = () => {
  const flavor = useFlavor();
  const flavorPath = useFlavorPath();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <p className="text-6xl font-extrabold text-brand mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-8">
          We couldn&apos;t find that page. It may have moved, or the link may be incorrect.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to={flavorPath()}
            id="not-found-home-link"
            className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
          >
            Back to {flavor.brandName}
          </Link>
          {flavor.clean ? (
            <a
              href="/flavors"
              id="not-found-flavors-link"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              All sites
            </a>
          ) : (
            <Link
              to="/flavors"
              id="not-found-flavors-link"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              All sites
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
