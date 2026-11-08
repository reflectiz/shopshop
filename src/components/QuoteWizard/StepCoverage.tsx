import React from 'react';
import { ADD_ONS, COVERAGE_TIERS, CoverageTier, TravelQuoteDraft } from './quoteSchema';

interface StepCoverageProps {
  draft: TravelQuoteDraft;
  onChange: (patch: Partial<TravelQuoteDraft>) => void;
}

const StepCoverage: React.FC<StepCoverageProps> = ({ draft, onChange }) => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-1">Choose your level of cover</h2>
    <p className="text-sm text-gray-600 mb-6">You can change this before you pay.</p>

    <div className="space-y-3">
      {COVERAGE_TIERS.map((tier) => {
        const selected = draft.coverageTier === tier.id;
        return (
          <label
            key={tier.id}
            htmlFor={`quote-coverage-tier-radio-${tier.id}`}
            className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
              selected ? 'border-brand bg-brand-subtle' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              id={`quote-coverage-tier-radio-${tier.id}`}
              type="radio"
              name="coverageTier"
              value={tier.id}
              checked={selected}
              onChange={() => onChange({ coverageTier: tier.id as CoverageTier })}
              className="mt-1"
            />
            <span className="flex-1">
              <span className="block font-semibold text-gray-900">{tier.label}</span>
              <span className="block text-sm text-gray-600">{tier.blurb}</span>
              <span className="block text-xs text-gray-500 mt-1">
                Medical cover to ${tier.medicalLimit.toLocaleString('en-US')}
              </span>
            </span>
          </label>
        );
      })}
    </div>

    <h3 className="text-base font-semibold text-gray-900 mt-8 mb-3">Optional extras</h3>
    <div className="space-y-3">
      {ADD_ONS.map((addOn) => (
        <label
          key={addOn.id}
          htmlFor={`quote-addon-checkbox-${addOn.id}`}
          className="flex items-start gap-3 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition-colors"
        >
          <input
            id={`quote-addon-checkbox-${addOn.id}`}
            type="checkbox"
            checked={draft.addOns[addOn.id]}
            onChange={(e) => onChange({ addOns: { ...draft.addOns, [addOn.id]: e.target.checked } })}
            className="mt-1"
          />
          <span className="flex-1">
            <span className="block font-medium text-gray-900">{addOn.label}</span>
            <span className="block text-sm text-gray-600">{addOn.blurb}</span>
          </span>
        </label>
      ))}
    </div>
  </div>
);

export default StepCoverage;
