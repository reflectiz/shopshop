import React from 'react';
import FieldError from './FieldError';
import { DESTINATIONS, TravelQuoteDraft } from './quoteSchema';
import { daysBetween, FieldErrors } from '../../lib/validation';

interface StepTripProps {
  draft: TravelQuoteDraft;
  errors: FieldErrors;
  onChange: (patch: Partial<TravelQuoteDraft>) => void;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none';

const StepTrip: React.FC<StepTripProps> = ({ draft, errors, onChange }) => {
  const days = daysBetween(draft.startDate, draft.endDate);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about the trip</h2>
      <p className="text-sm text-gray-600 mb-6">
        Destination and duration drive the medical loading; trip cost drives cancellation cover.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="quote-destination-select" className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <select
            id="quote-destination-select"
            value={draft.destination}
            onChange={(e) => onChange({ destination: e.target.value })}
            className={`${inputClass} bg-white`}
          >
            <option value="">Select a destination</option>
            {DESTINATIONS.map((destination) => (
              <option key={destination} value={destination}>
                {destination}
              </option>
            ))}
          </select>
          <FieldError name="destination" message={errors.destination} />
        </div>

        <div>
          <label htmlFor="quote-start-date-input" className="block text-sm font-medium text-gray-700 mb-1">
            Departure date
          </label>
          <input
            id="quote-start-date-input"
            type="date"
            value={draft.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={inputClass}
          />
          <FieldError name="startDate" message={errors.startDate} />
        </div>

        <div>
          <label htmlFor="quote-end-date-input" className="block text-sm font-medium text-gray-700 mb-1">
            Return date
          </label>
          <input
            id="quote-end-date-input"
            type="date"
            value={draft.endDate}
            min={draft.startDate || undefined}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className={inputClass}
          />
          <FieldError name="endDate" message={errors.endDate} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="quote-trip-cost-input" className="block text-sm font-medium text-gray-700 mb-1">
            Total trip cost (USD)
          </label>
          <input
            id="quote-trip-cost-input"
            type="text"
            inputMode="decimal"
            placeholder="e.g. 3200"
            value={draft.tripCost}
            onChange={(e) => onChange({ tripCost: e.target.value })}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">
            Flights, accommodation and anything else you would want refunded if you cancelled.
          </p>
          <FieldError name="tripCost" message={errors.tripCost} />
        </div>
      </div>

      {days !== null && days > 0 && !errors.endDate && (
        <p id="quote-trip-duration" className="mt-4 text-sm font-medium text-brand">
          {days} day{days === 1 ? '' : 's'} of cover
        </p>
      )}
    </div>
  );
};

export default StepTrip;
