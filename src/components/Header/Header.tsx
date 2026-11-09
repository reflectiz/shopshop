import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFlavor, useFlavorPath } from '../../flavors/FlavorContext';
import { API_URL } from '../../config';

interface HeaderProps {
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const flavor = useFlavor();
  const flavorPath = useFlavorPath();

  const navLinkClass = 'text-gray-700 hover:text-brand font-medium transition-colors';

  const cartIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );

  const cartBadge = cartItemCount > 0 && (
    <span className="absolute top-0 right-0 bg-brand text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {cartItemCount}
    </span>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link
              to={flavorPath()}
              id="header-brand-link"
              className="text-2xl font-bold text-gray-900 hover:text-brand transition-colors"
            >
              {flavor.brandName}
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {flavor.nav.map((item) => (
              <Link
                key={item.id}
                id={`header-nav-${item.id}`}
                to={item.absolute ? item.to : flavorPath(item.to)}
                className={navLinkClass}
              >
                {item.label}
              </Link>
            ))}
            {!flavor.clean && (
              <a href={`${API_URL}/redirect/go`} id="header-deals-link" className={navLinkClass}>
                Deals
              </a>
            )}
            {flavor.hasCart && (
              <Link
                to={flavorPath('cart')}
                id="header-cart-link-desktop"
                className="relative p-2 text-gray-700 hover:text-brand transition-colors"
              >
                {cartIcon}
                {cartBadge}
              </Link>
            )}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 text-sm">Hello, {user?.name}</span>
              <button
                id="header-logout-button-desktop"
                onClick={logout}
                className="text-gray-700 hover:text-brand font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>
          <div className="md:hidden flex items-center space-x-2">
            {!flavor.clean && (
              <Link to={flavorPath('gdpr-demo')} className="p-2 text-gray-700 text-sm">
                GDPR
              </Link>
            )}
            {flavor.hasCart && (
              <Link
                to={flavorPath('cart')}
                id="header-cart-link-mobile"
                className="relative p-2 text-gray-700"
              >
                {cartIcon}
                {cartBadge}
              </Link>
            )}
            {isAuthenticated ? (
              <button id="header-logout-button-mobile" onClick={logout} className="p-2 text-gray-700 text-sm">
                Logout
              </button>
            ) : (
              <Link to={flavorPath('login')} className="p-2 text-gray-700 text-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
