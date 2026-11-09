import React from 'react';
import { useCart } from '../../hooks/useCart';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { getCartItemCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={getCartItemCount()} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

