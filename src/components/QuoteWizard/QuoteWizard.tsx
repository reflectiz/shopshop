import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import StepCoverage from './StepCoverage';
import StepSummary from './StepSummary';
import StepTravelers from './StepTravelers';
import StepTrip from './StepTrip';
import {
  COVERAGE_TIERS,
  emptyDraft,
  QuoteResponse,
  STEPS,
  TravelQuoteDraft,
  toQuoteRequest,
  validateStep,
} from './quoteSchema';
import { apiService } from '../../services/api';
import { useCart } from '../../hooks/useCart';
import { useFlavor, useFlavorPath } from '../../flavors/FlavorContext';
import { FieldErrors } from '../../lib/validation';

/**
 * Multi-step travel insurance quote.
 *
 * The draft lives in local state on purpose: it should not survive navigation away from the
 * page. The one thing that must persist — the chosen plan and its premium — goes into the
 * cart, which is already persisted, so this wizard introduces no new global state.
 */
const QuoteWizard: React.FC = () => {
  const navigate = useNavigate();
  const flavorPath = useFlavorPath();
  const { copy } = useFlavor();
  const { addToCart } = useCart();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<TravelQuoteDraft>(emptyDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [quote, setQuote] = useState<QuoteResponse | null>(null);

  const quoteMutation = useMutation({
    mutationFn: () => apiService.postInsuranceQuote(toQuoteRequest(draft)),
    onSuccess: (result) => setQuote(result),
  });

  const onChange = useCallback((patch: Partial<TravelQuoteDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    // Any edit invalidates a premium that was already calculated.
    setQuote(null);
  }, []);

  const goNext = () => {
    const stepErrors = validateStep(step, draft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length === 0) {
      setStep((current) => Math.min(current + 1, STEPS.length - 1));
    }
  };

  const goBack = () => {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  };

  const acceptQuote = () => {
    if (!quote) {
      return;
    }
    const tier = COVERAGE_TIERS.find((t) => t.id === draft.coverageTier);
    addToCart({
      id: quote.planId,
      title: `${quote.planTitle} — ${draft.destination}`,
      subtitle: `${quote.travelerCount} traveller${quote.travelerCount === 1 ? '' : 's'} · ${quote.tripDays} days`,
      price: quote.premium,
      priceUnit: 'total premium',
      image:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
      category: 'travel',
      description: `${draft.startDate} to ${draft.endDate}. ${tier?.blurb ?? ''}`.trim(),
      tags: [`Medical to $${(tier?.medicalLimit ?? 0).toLocaleString('en-US')}`],
    });
    navigate(flavorPath('cart'));
  };

  const requestError = useMemo(() => {
    if (!quoteMutation.isError) {
      return null;
    }
    return quoteMutation.error instanceof Error
      ? `Could not calculate a premium: ${quoteMutation.error.message}`
      : 'Could not calculate a premium. Please try again.';
  }, [quoteMutation.isError, quoteMutation.error]);

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="bg-gray-50 py-8 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get a travel insurance quote</h1>
        <p className="text-gray-600 mb-8">Four short steps. No payment details until you accept a premium.</p>

        {/* Step indicator */}
        <ol className="flex items-center gap-2 mb-8" aria-label="Progress">
          {STEPS.map((label, index) => (
            <li key={label} className="flex-1">
              <div
                id={`quote-step-indicator-${index}`}
                aria-current={index === step ? 'step' : undefined}
                className={`h-1.5 rounded-full mb-2 ${index <= step ? 'bg-brand' : 'bg-gray-200'}`}
              />
              <span className={`text-xs font-medium ${index === step ? 'text-brand' : 'text-gray-500'}`}>
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="bg-white rounded-xl shadow-md p-6">
          {step === 0 && <StepTravelers draft={draft} errors={errors} onChange={onChange} />}
          {step === 1 && <StepTrip draft={draft} errors={errors} onChange={onChange} />}
          {step === 2 && <StepCoverage draft={draft} onChange={onChange} />}
          {step === 3 && (
            <StepSummary
              draft={draft}
              quote={quote}
              isPending={quoteMutation.isPending}
              error={requestError}
              onGetQuote={() => quoteMutation.mutate()}
              onAccept={acceptQuote}
            />
          )}

          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              id={`quote-step-${step}-back-button`}
              onClick={step === 0 ? () => navigate(flavorPath()) : goBack}
              className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            {!isLastStep && (
              <button
                type="button"
                id={`quote-step-${step}-next-button`}
                onClick={goNext}
                className="px-5 py-2.5 rounded-lg font-semibold text-white bg-brand hover:bg-brand-hover transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Prefer to compare plans first?{' '}
          <button
            type="button"
            id="quote-browse-plans-link"
            onClick={() => navigate(flavorPath(copy.catalogPath))}
            className="font-medium text-brand hover:underline"
          >
            Browse all plans
          </button>
        </p>
      </div>
    </div>
  );
};

export default QuoteWizard;
