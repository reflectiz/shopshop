import React, { useEffect } from 'react';
import { Product } from '../../types';
import { useFlavor } from '../../flavors/FlavorContext';
import FacebookTags from '../Trackers/FacebookTags';
import PaymentForm from './PaymentForm';

interface PaymentIframeProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  /** Called with the order id from the payment document, so the host can confirm. */
  onSuccess?: (orderId?: string) => void;
}

const PaymentIframe: React.FC<PaymentIframeProps> = ({ isOpen, onClose, product, onSuccess }) => {
  const flavor = useFlavor();

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  return (
    <div
      id="payment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Purchase</h2>
            <p className="text-sm text-gray-600 mt-1">
              {product.title} - ${product.price.toFixed(2)}
            </p>
          </div>
          <button
            id="payment-modal-close-button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto min-h-[600px] bg-gray-50">
          <PaymentForm flavorId={flavor.id} onSuccess={onSuccess ?? onClose} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {/*
            Social plugin inside the payment modal. It cannot read the card fields — it is a
            cross-origin frame — but a third-party frame in payment scope is itself something
            PCI DSS 6.4.3 expects you to have inventoried and justified.
          */}
          {!flavor.clean && (
            <div className="flex items-center justify-center mb-3">
              <FacebookTags variant="compact" />
            </div>
          )}
          <p className="text-xs text-gray-500 text-center">
            This is a demo payment form. No real transactions will be processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentIframe;

