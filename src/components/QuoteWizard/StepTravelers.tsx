import React from 'react';
import FieldError from './FieldError';
import { MAX_TRAVELERS, TravelQuoteDraft, Traveler, emptyTraveler } from './quoteSchema';
import { FieldErrors } from '../../lib/validation';

interface StepTravelersProps {
  draft: TravelQuoteDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<TravelQuoteDraft>) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none';

const StepTravelers: React.FC<StepTravelersProps> = ({ draft, errors, onChange }) => {
  const updateTraveler = (index: number, patch: Partial<Traveler>) => {
    onChange({
      travelers: draft.travelers.map((traveler, i) => (i === index ? { ...traveler, ...patch } : traveler)),
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Who is travelling?</h2>
      <p className="text-sm text-gray-600 mb-6">
        Premiums are age-banded, so we need a date of birth for each traveller.
      </p>

      <FieldError name="travelers" message={errors.travelers} />

      <div className="space-y-6">
        {draft.travelers.map((traveler, index) => (
          <fieldset key={index} className="border border-gray-200 rounded-lg p-4">
            <legend className="px-2 text-sm font-semibold text-gray-700">
              {index === 0 ? 'Lead traveller' : `Traveller ${index + 1}`}
            </legend>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={`quote-traveler-firstname-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  id={`quote-traveler-firstname-input-${index}`}
                  type="text"
                  value={traveler.firstName}
                  onChange={(e) => updateTraveler(index, { firstName: e.target.value })}
                  className={inputClass}
                />
                <FieldError name={`traveler-${index}-firstName`} message={errors[`traveler-${index}-firstName`]} />
              </div>

              <div>
                <label htmlFor={`quote-traveler-lastname-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Last name
                </label>
                <input
                  id={`quote-traveler-lastname-input-${index}`}
                  type="text"
                  value={traveler.lastName}
                  onChange={(e) => updateTraveler(index, { lastName: e.target.value })}
                  className={inputClass}
                />
                <FieldError name={`traveler-${index}-lastName`} message={errors[`traveler-${index}-lastName`]} />
              </div>

              <div>
                <label htmlFor={`quote-traveler-dob-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Date of birth
                </label>
                <input
                  id={`quote-traveler-dob-input-${index}`}
                  type="date"
                  value={traveler.dateOfBirth}
                  onChange={(e) => updateTraveler(index, { dateOfBirth: e.target.value })}
                  className={inputClass}
                />
                <FieldError name={`traveler-${index}-dateOfBirth`} message={errors[`traveler-${index}-dateOfBirth`]} />
              </div>

              <div>
                <label htmlFor={`quote-traveler-age-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  id={`quote-traveler-age-input-${index}`}
                  type="number"
                  min={0}
                  max={120}
                  value={traveler.age}
                  onChange={(e) => updateTraveler(index, { age: e.target.value })}
                  className={inputClass}
                />
                <FieldError name={`traveler-${index}-age`} message={errors[`traveler-${index}-age`]} />
              </div>

              <div>
                <label htmlFor={`quote-traveler-national-id-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  ID number
                </label>
                <input
                  id={`quote-traveler-national-id-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={traveler.nationalId}
                  onChange={(e) => updateTraveler(index, { nationalId: e.target.value })}
                  className={inputClass}
                />
                <FieldError name={`traveler-${index}-nationalId`} message={errors[`traveler-${index}-nationalId`]} />
              </div>

              <div>
                <label htmlFor={`quote-traveler-email-input-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Email {index === 0 ? '' : <span className="text-gray-400">(optional)</span>}
                </label>
                <input
                  id={`quote-traveler-email-input-${index}`}
                  type="email"
                  value={traveler.email}
                  onChange={(e) => updateTraveler(index, { email: e.target.value })}
                  className={inputClass}
                />
                <FieldError name={`traveler-${index}-email`} message={errors[`traveler-${index}-email`]} />
              </div>
            </div>

            {draft.travelers.length > 1 && (
              <button
                type="button"
                id={`quote-remove-traveler-button-${index}`}
                onClick={() => onChange({ travelers: draft.travelers.filter((_, i) => i !== index) })}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Remove traveller
              </button>
            )}
          </fieldset>
        ))}
      </div>

      {draft.travelers.length < MAX_TRAVELERS && (
        <button
          type="button"
          id="quote-add-traveler-button"
          onClick={() => onChange({ travelers: [...draft.travelers, emptyTraveler()] })}
          className="mt-4 text-sm font-semibold text-brand hover:text-brand-hover"
        >
          + Add another traveller
        </button>
      )}
    </div>
  );
};

export default StepTravelers;
