import React from 'react';
import { COVERAGE_TIERS, QuoteResponse, TravelQuoteDraft } from './quoteSchema';
import { daysBetween } from '../../lib/validation';

interface StepSummaryProps {
  draft: TravelQuoteDraft;
  quote: QuoteResponse | null;
  isPending: boolean;
  error: string | null;
  onGetQuote: () => void;
  onAccept: () => void;
}

const StepSummary: React.FC<StepSummaryProps> = ({ draft, quote, isPending, error, onGetQuote, onAccept }) => {
  const tier = COVERAGE_TIERS.find((t) => t.id === draft.coverageTier);
  const days = daysBetween(draft.startDate, draft.endDate);
  const selectedAddOns = Object.entries(draft.addOns)
    .filter(([, on]) => on)
    .map(([key]) => key);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Check your details</h2>
      <p className="text-sm text-gray-600 mb-6">We will calculate your premium from these details.</p>

      <dl className="bg-gray-50 rounded-lg p-4 text-sm space-y-2 mb-6">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Travellers</dt>
          <dd id="quote-summary-travelers" className="font-medium text-gray-900 text-right">
            {draft.travelers
              .map((t) => `${t.firstName} ${t.lastName}`.trim())
              .filter(Boolean)
              .join(', ') || `${draft.travelers.length}`}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Destination</dt>
          <dd className="font-medium text-gray-900">{draft.destination}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Dates</dt>
          <dd className="font-medium text-gray-900 text-right">
            {draft.startDate} to {draft.endDate}
            {days !== null && days > 0 ? ` (${days} day${days === 1 ? '' : 's'})` : ''}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Trip cost</dt>
          <dd className="font-medium text-gray-900">${Number(draft.tripCost || 0).toFixed(2)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-600">Cover</dt>
          <dd className="font-medium text-gray-900">{tier?.label}</dd>
        </div>
        {selectedAddOns.length > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-gray-600">Extras</dt>
            <dd className="font-medium text-gray-900 text-right">{selectedAddOns.length} selected</dd>
          </div>
        )}
      </dl>

      {!quote && (
        <button
          type="button"
          id="quote-get-quote-button"
          onClick={onGetQuote}
          disabled={isPending}
          className="w-full bg-brand text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Calculating...' : 'Calculate my premium'}
        </button>
      )}

      {error && (
        <div id="quote-error-request" className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {quote && (
        <div id="quote-result" className="border-2 border-brand rounded-xl p-5">
          <p className="text-sm text-gray-600">{quote.planTitle}</p>
          <p className="mt-1 mb-4">
            <span id="quote-premium-amount" className="text-4xl font-extrabold text-brand">
              ${quote.premium.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500 ml-2">total premium</span>
          </p>

          <ul className="text-sm space-y-1 border-t border-gray-200 pt-3 mb-4">
            {quote.breakdown.map((line) => (
              <li key={line.label} className="flex justify-between gap-4 text-gray-600">
                <span>{line.label}</span>
                <span className="font-medium text-gray-900">
                  {line.amount > 0 ? `$${line.amount.toFixed(2)}` : 'included'}
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            id="quote-accept-and-checkout-button"
            onClick={onAccept}
            className="w-full bg-action text-white py-3 px-4 rounded-lg font-semibold hover:bg-action-hover transition-colors"
          >
            Accept and continue to payment
          </button>
          <button
            type="button"
            id="quote-recalculate-button"
            onClick={onGetQuote}
            className="w-full mt-2 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Recalculate
          </button>
        </div>
      )}
    </div>
  );
};

export default StepSummary;
