import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import PaymentIframe from '../components/PaymentIframe/PaymentIframe';
import { useFlavor, useFlavorPath } from '../flavors/FlavorContext';
import { FlavorId } from '../flavors/resolve';

const BLOCKING_SITE_ID_BY_FLAVOR: Partial<Record<FlavorId, string>> = {
  insurance: '98053',
  retail: '98059',
  healthcare: '98056',
};

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { copy, id: flavorId, clean } = useFlavor();
  const flavorPath = useFlavorPath();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (clean) return;
    const siteId = BLOCKING_SITE_ID_BY_FLAVOR[flavorId];
    if (!siteId) return;
    const el = document.createElement('script');
    el.src = `https://${siteId}.blocking.reflectiz.net/blocking.min.js?t=${Date.now()}`;
    el.async = false;
    el.setAttribute('data-ot-ignore', '');
    document.body.appendChild(el);
    return () => {
      el.remove();
    };
  }, [flavorId, clean]);

  const total = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  );

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleBuyNow = () => {
    if (cartItems.length === 0) {
      alert(copy.cartEmptyTitle);
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPaymentModalOpen(false);
  };

  const cartTotalProduct = useMemo(() => ({
    id: 0,
    title: `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in cart`,
    price: total,
    image: cartItems[0]?.product.image || '',
    description: `Total: $${total.toFixed(2)}`,
    category: 'cart'
  }), [cartItems, total]);

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{copy.cartTitle}</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{copy.cartEmptyTitle}</h2>
            <p className="text-gray-600 mb-6">{copy.cartEmptyBody}</p>
            <button
              id="cart-empty-continue-shopping-button"
              onClick={() => navigate(flavorPath(copy.cartEmptyCtaTo))}
              className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
            >
              {copy.cartEmptyCtaLabel}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col sm:flex-row gap-4">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-full sm:w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.product.title}</h3>
                    {item.product.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.product.description}</p>
                    )}
                    <p className="text-xl font-bold text-brand mb-4">${item.product.price.toFixed(2)}</p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          id={`cart-decrease-quantity-button-${item.product.id}`}
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 border-x border-gray-300">{item.quantity}</span>
                        <button
                          id={`cart-increase-quantity-button-${item.product.id}`}
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        > 
                          +
                        </button>
                      </div>
                      <button
                        id={`cart-remove-item-button-${item.product.id}`}
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  {copy.itemSingular === 'product' && (
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  id="cart-buy-now-button"
                  onClick={handleBuyNow}
                  className="w-full bg-action text-white py-3 px-4 rounded-lg font-semibold hover:bg-action-hover active:scale-95 transform transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {copy.checkoutLabel}
                </button>
                <button
                  id="cart-continue-shopping-button"
                  onClick={() => navigate(flavorPath())}
                  className="w-full mt-3 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentIframe
        isOpen={isPaymentModalOpen}
        onClose={handleCloseModal}
        product={cartTotalProduct}
        onSuccess={(orderId) => {
          setIsPaymentModalOpen(false);
          // The confirmation page empties the cart, so it must be reached via navigation
          // rather than clearing here (which would blank this page mid-transition).
          navigate(flavorPath('confirmation'), { state: { orderId, total } });
        }}
      />
    </div>
  );
};

export default Cart;

