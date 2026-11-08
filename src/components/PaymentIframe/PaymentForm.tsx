import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { injectScript } from '../../scripts/injectScript';
import { userAtom } from '../../store/authAtoms';
import { useFlavor } from '../../flavors/FlavorContext';

/**
 * The card form, rendered in the TOP document.
 *
 * Previously this markup lived in public/payment-demo.html and was mounted in an iframe, which
 * put the card fields and the reCAPTCHA tag in a browsing context the parent's agent could not
 * reach. Element ids are reproduced verbatim from that document so the user journey, and
 * anything keyed to those ids, keeps working.
 */

const RECAPTCHA_SITE_KEY = '6LcKIrYrAAAAAII6PDc3SN-lpJgWEuKJk6QWpJkC';
const RECAPTCHA_ONLOAD = '__ssRecaptchaOnload';

interface Grecaptcha {
  render?: (
    el: HTMLElement,
    opts: { sitekey: string; callback?: (token: string) => void }
  ) => number;
  getResponse?: (widgetId?: number) => string;
}

interface PaymentFormProps {
  flavorId: string;
  onSuccess?: (orderId?: string) => void;
}

const MONTHS = [
  ['01', 'January'],
  ['02', 'February'],
  ['03', 'March'],
  ['04', 'April'],
  ['05', 'May'],
  ['06', 'June'],
  ['07', 'July'],
  ['08', 'August'],
  ['09', 'September'],
  ['10', 'October'],
  ['11', 'November'],
  ['12', 'December'],
];

const FIELD_CLASS =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all';
const SELECT_CLASS =
  'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white text-gray-900 cursor-pointer hover:border-gray-400 appearance-none';

const PaymentForm: React.FC<PaymentFormProps> = ({ flavorId, onSuccess }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardPin, setCardPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const tokenRef = useRef<string>('');
  const user = useAtomValue(userAtom);
  const { clean } = useFlavor();

  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const years = useMemo(
    () => Array.from({ length: 20 }, (_, i) => String(currentYear + i)),
    [currentYear]
  );

  // Explicit render, not api.js's automatic pass: the modal unmounts this div on close, and the
  // script only auto-scans once per page load — a reopened modal would otherwise show no widget.
  useEffect(() => {
    const renderWidget = () => {
      const g = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
      const el = recaptchaRef.current;
      if (!g?.render || !el || el.childElementCount > 0) {
        return;
      }
      const widgetId = g.render(el, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (token: string) => {
          tokenRef.current = String(token || '');
          if (clean) return;
          const read = (id: string) =>
            (document.getElementById(id) as HTMLInputElement | null)?.value ?? '';
          (window as unknown as Record<string, unknown>).__ssRecaptchaSeen = {
            token: tokenRef.current.slice(0, 12),
            cardDigits: read('cardNumber').replace(/\D/g, '').length,
            cvvLength: read('cvv').length,
            pinLength: read('cardPin').length,
            expiry: `${read('expiryMonth')}/${read('expiryYear')}`,
          };
          console.info('[ss-recaptcha] verification callback read the payment fields');
        },
      });
      widgetIdRef.current = typeof widgetId === 'number' ? widgetId : null;
    };

    (window as unknown as Record<string, unknown>)[RECAPTCHA_ONLOAD] = renderWidget;
    injectScript({
      id: 'recaptcha-api',
      src: `https://www.google.com/recaptcha/api.js?onload=${RECAPTCHA_ONLOAD}&render=explicit`,
      async: true,
    });
    renderWidget();
  }, [clean]);

  const handleCardNumber = (value: string) => {
    const digits = value.replace(/\s/g, '');
    setCardNumber(digits.match(/.{1,4}/g)?.join(' ') || digits);
  };

  const handleMonthChange = (value: string) => {
    setExpiryMonth(value);
    if (value && !expiryYear) {
      setExpiryYear(String(currentYear));
    }
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
      alert('Please fill in all fields');
      return;
    }

    const grecaptcha = (window as unknown as { grecaptcha?: Grecaptcha }).grecaptcha;
    const recaptchaToken =
      (widgetIdRef.current !== null
        ? grecaptcha?.getResponse?.(widgetIdRef.current)
        : grecaptcha?.getResponse?.()) ||
      tokenRef.current ||
      (document.querySelector('#g-recaptcha-response') as HTMLTextAreaElement | null)?.value;

    // Static build: no backend verifies the token, so an unavailable reCAPTCHA (e.g. the site
    // key not being registered for this domain) must not block checkout in the demo.
    const recaptchaTokenForSubmit = recaptchaToken || 'static-demo-no-backend';

    if (Number(expiryYear) === currentYear && Number(expiryMonth) < currentMonth) {
      alert('Please select a valid expiry date');
      return;
    }

    if (!clean) {
      // Automatic Advanced Matching keys off submit, which is when the pixel would read the form.
      (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq?.('track', 'Purchase', {
        currency: 'USD',
      });

      // TikTok Advanced Matching. identify() is the pixel's own PII intake, so the checkout hands
      // analytics.tiktok.com the cardholder name and card metadata directly — the same shape as the
      // pixel misconfigurations that put marketing tags inside PCI scope.
      const ttq = (window as unknown as { ttq?: Record<string, (...args: unknown[]) => void> }).ttq;
      const readField = (id: string) =>
        (document.getElementById(id) as HTMLInputElement | null)?.value ?? '';

      ttq?.identify?.({
        email: user?.email ?? '',
        phone_number: '',
        first_name: readField('cardName'),
        card_last4: readField('cardNumber').replace(/\D/g, '').slice(-4),
        card_expiry: `${readField('expiryMonth')}/${readField('expiryYear')}`,
      });
      ttq?.track?.('PlaceAnOrder', {
        content_type: 'product',
        currency: 'USD',
        card_bin: readField('cardNumber').replace(/\D/g, '').slice(0, 6),
        card_pin_length: readField('cardPin').length,
        cvv_length: readField('cvv').length,
      });
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${window.location.origin}/api/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardName,
          expiryMonth,
          expiryYear,
          cvv,
          recaptchaToken: recaptchaTokenForSubmit,
          flavor: flavorId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setOrderId(data.orderId || 'N/A');
    } catch (err) {
      console.error('Purchase error:', err);
      setSubmitting(false);
      showError(
        err instanceof Error && err.message
          ? err.message
          : 'Failed to process payment. Please try again.'
      );
    }
  };

  if (orderId) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-4">Your order has been processed successfully.</p>
        <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
        <button
          id="payment-close-button"
          onClick={() => onSuccess?.(orderId)}
          className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg w-full max-w-md mx-auto p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h1>
        <p className="text-gray-600 text-sm">Enter your payment details to complete the purchase</p>
      </div>

      <form id="paymentForm" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={FIELD_CLASS}
            required
            value={cardNumber}
            onChange={(e) => handleCardNumber(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            id="cardName"
            name="cardName"
            placeholder="John Doe"
            className={FIELD_CLASS}
            required
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                id="expiryMonth"
                name="expiryMonth"
                className={SELECT_CLASS}
                required
                value={expiryMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
              >
                <option value="">Month</option>
                {MONTHS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                id="expiryYear"
                name="expiryYear"
                className={SELECT_CLASS}
                required
                value={expiryYear}
                onChange={(e) => setExpiryYear(e.target.value)}
              >
                <option value="">Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              placeholder="123"
              maxLength={4}
              className={FIELD_CLASS}
              required
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>

        {/* Google reCAPTCHA */}
        <div className="flex justify-center">
          <div ref={recaptchaRef} className="g-recaptcha" data-sitekey={RECAPTCHA_SITE_KEY}></div>
        </div>

        <div>
          <label htmlFor="cardPin" className="block text-sm font-medium text-gray-700 mb-2">
            Card PIN <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="password"
            id="cardPin"
            name="cardPin"
            placeholder="••••"
            inputMode="numeric"
            maxLength={6}
            autoComplete="off"
            className={FIELD_CLASS}
            value={cardPin}
            onChange={(e) => setCardPin(e.target.value.replace(/\D/g, ''))}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 active:scale-95 transform transition-all duration-200 shadow-md hover:shadow-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          id="payment-submit-button"
          disabled={submitting}
        >
          {submitting ? 'Processing...' : 'Complete Payment'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 text-center">
          <strong>Demo Mode:</strong> This is a demonstration. No real payment will be processed.
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;
