import {
  addError,
  ageFrom,
  daysBetween,
  FieldErrors,
  isBlank,
  isEmail,
  isIdNumber,
  isPositiveNumber,
  isValidAge,
  isTodayOrFuture,
  isPastDate,
} from '../../lib/validation';

export type CoverageTier = 'basic' | 'standard' | 'premium';

export interface Traveler {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: string; // kept as a string: it is bound straight to a number input
  nationalId: string;
  email: string;
}

export interface TravelQuoteDraft {
  travelers: Traveler[];
  destination: string;
  startDate: string;
  endDate: string;
  tripCost: string; // kept as a string: it is bound straight to a text input
  coverageTier: CoverageTier;
  addOns: {
    medicalEvacuation: boolean;
    adventureSports: boolean;
    cancelForAnyReason: boolean;
  };
}

export const MAX_TRIP_DAYS = 180;
export const MAX_TRAVELERS = 6;

export const DESTINATIONS = [
  'France',
  'Spain',
  'Italy',
  'Greece',
  'Portugal',
  'United Kingdom',
  'United States',
  'Canada',
  'Mexico',
  'Brazil',
  'Japan',
  'Thailand',
  'Australia',
  'New Zealand',
  'South Africa',
  'United Arab Emirates',
];

export const COVERAGE_TIERS: { id: CoverageTier; label: string; blurb: string; medicalLimit: number }[] = [
  { id: 'basic', label: 'Essentials', blurb: 'Emergency medical and baggage', medicalLimit: 100_000 },
  { id: 'standard', label: 'Standard', blurb: 'Adds trip cancellation and delay', medicalLimit: 250_000 },
  { id: 'premium', label: 'Premier', blurb: 'Highest limits, zero deductible', medicalLimit: 1_000_000 },
];

export const ADD_ONS: { id: keyof TravelQuoteDraft['addOns']; label: string; blurb: string }[] = [
  {
    id: 'medicalEvacuation',
    label: 'Medical evacuation',
    blurb: 'Repatriation and air ambulance where medically necessary',
  },
  {
    id: 'adventureSports',
    label: 'Adventure sports',
    blurb: 'Skiing, diving, climbing and similar activities',
  },
  {
    id: 'cancelForAnyReason',
    label: 'Cancel for any reason',
    blurb: 'Cancel up to 48 hours before departure, 75% refunded',
  },
];

export const emptyTraveler = (): Traveler => ({
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  age: '',
  nationalId: '',
  email: '',
});

export const emptyDraft = (): TravelQuoteDraft => ({
  travelers: [emptyTraveler()],
  destination: '',
  startDate: '',
  endDate: '',
  tripCost: '',
  coverageTier: 'standard',
  addOns: { medicalEvacuation: false, adventureSports: false, cancelForAnyReason: false },
});

export const STEPS = ['Travellers', 'Trip', 'Cover', 'Summary'] as const;

/**
 * Per-step validation. Error keys are the field ids the inputs use, so the wizard can render
 * each message next to its field with a stable id (`quote-error-<key>`).
 */
export const validateStep = (step: number, draft: TravelQuoteDraft): FieldErrors => {
  const errors: FieldErrors = {};

  if (step === 0) {
    if (draft.travelers.length === 0) {
      addError(errors, 'travelers', 'Add at least one traveller.');
    }
    draft.travelers.forEach((traveler, index) => {
      if (isBlank(traveler.firstName)) {
        addError(errors, `traveler-${index}-firstName`, 'First name is required.');
      }
      if (isBlank(traveler.lastName)) {
        addError(errors, `traveler-${index}-lastName`, 'Last name is required.');
      }
      if (isBlank(traveler.dateOfBirth)) {
        addError(errors, `traveler-${index}-dateOfBirth`, 'Date of birth is required.');
      } else if (!isPastDate(traveler.dateOfBirth)) {
        addError(errors, `traveler-${index}-dateOfBirth`, 'Date of birth must be in the past.');
      } else {
        const age = ageFrom(traveler.dateOfBirth);
        if (age !== null && age > 120) {
          addError(errors, `traveler-${index}-dateOfBirth`, 'Please check this date of birth.');
        }
      }
      if (isBlank(traveler.age)) {
        addError(errors, `traveler-${index}-age`, 'Age is required.');
      } else if (!isValidAge(traveler.age)) {
        addError(errors, `traveler-${index}-age`, 'Enter an age in whole years between 0 and 120.');
      }
      if (isBlank(traveler.nationalId)) {
        addError(errors, `traveler-${index}-nationalId`, 'ID number is required.');
      } else if (!isIdNumber(traveler.nationalId)) {
        addError(errors, `traveler-${index}-nationalId`, 'ID number must be 6 to 12 digits.');
      }
      // Only the lead traveller needs contactable details.
      if (index === 0) {
        if (isBlank(traveler.email)) {
          addError(errors, `traveler-${index}-email`, 'Email is required for the lead traveller.');
        } else if (!isEmail(traveler.email)) {
          addError(errors, `traveler-${index}-email`, 'Enter a valid email address.');
        }
      } else if (!isBlank(traveler.email) && !isEmail(traveler.email)) {
        addError(errors, `traveler-${index}-email`, 'Enter a valid email address.');
      }
    });
  }

  if (step === 1) {
    if (isBlank(draft.destination)) {
      addError(errors, 'destination', 'Choose a destination.');
    }
    if (isBlank(draft.startDate)) {
      addError(errors, 'startDate', 'Departure date is required.');
    } else if (!isTodayOrFuture(draft.startDate)) {
      addError(errors, 'startDate', 'Departure cannot be in the past.');
    }
    if (isBlank(draft.endDate)) {
      addError(errors, 'endDate', 'Return date is required.');
    }

    const days = daysBetween(draft.startDate, draft.endDate);
    if (days !== null) {
      if (days <= 0) {
        addError(errors, 'endDate', 'Return date must be after the departure date.');
      } else if (days > MAX_TRIP_DAYS) {
        addError(errors, 'endDate', `Trips longer than ${MAX_TRIP_DAYS} days need an annual policy.`);
      }
    }

    if (isBlank(draft.tripCost)) {
      addError(errors, 'tripCost', 'Total trip cost is required.');
    } else if (!isPositiveNumber(draft.tripCost)) {
      addError(errors, 'tripCost', 'Enter the trip cost as a number greater than zero.');
    }
  }

  // Step 2 (cover) always has a valid tier selected, and add-ons are optional.
  return errors;
};

/** The payload POST /api/insurance/quote expects. */
export const toQuoteRequest = (draft: TravelQuoteDraft) => ({
  travelers: draft.travelers.map((traveler) => ({
    dateOfBirth: traveler.dateOfBirth,
    age: Number(traveler.age),
    nationalId: traveler.nationalId,
  })),
  destination: draft.destination,
  startDate: draft.startDate,
  endDate: draft.endDate,
  tripCost: Number(draft.tripCost),
  coverageTier: draft.coverageTier,
  addOns: draft.addOns,
});

export interface QuoteBreakdownLine {
  label: string;
  amount: number;
}

export interface QuoteResponse {
  premium: number;
  currency: string;
  planId: number;
  planTitle: string;
  tripDays: number;
  travelerCount: number;
  breakdown: QuoteBreakdownLine[];
}
