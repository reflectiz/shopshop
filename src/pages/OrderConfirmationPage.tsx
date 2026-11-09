import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useFlavor, useFlavorPath } from '../flavors/FlavorContext';

interface ConfirmationState {
  orderId?: string;
  total?: number;
}

/**
 * Shared by every industry that has a checkout: retail orders, insurance policies, healthcare
 * appointments. The copy and the reference label come from the industry config.
 *
 * This is also where the cart is finally emptied. clearCart existed but had no callers, so
 * the cart used to survive a completed purchase.
 */
const OrderConfirmationPage: React.FC = () => {
  const { state } = useLocation();
  const { copy, orderIdPrefix } = useFlavor();
  const flavorPath = useFlavorPath();
  const { clearCart } = useCart();

  const { orderId, total } = (state ?? {}) as ConfirmationState;

  // Runs once on arrival. A ref rather than an empty dep list with clearCart omitted, so the
  // intent is explicit: empty the cart exactly one time for this confirmation.
  const cleared = useRef(false);
  useEffect(() => {
    if (!cleared.current) {
      cleared.current = true;
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-action/10 flex items-center justify-center mb-6">
          <svg className="w-9 h-9 text-action" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 id="confirmation-title" className="text-2xl font-bold text-gray-900 mb-2">
          {copy.confirmationTitle}
        </h1>
        <p className="text-gray-600 mb-6">{copy.confirmationBody}</p>

        <dl className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-8 text-left">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">{copy.orderIdLabel}</dt>
            <dd id="confirmation-order-id" className="font-mono font-semibold text-gray-900">
              {orderId || `${orderIdPrefix}-—`}
            </dd>
          </div>
          {typeof total === 'number' && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-600">Amount paid</dt>
              <dd id="confirmation-total" className="font-semibold text-gray-900">
                ${total.toFixed(2)}
              </dd>
            </div>
          )}
        </dl>

        <Link
          to={flavorPath()}
          id="confirmation-home-link"
          className="inline-block w-full bg-brand text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
