import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { formatSlot } from './doctorAdapter';
import { formatCurrency } from '../../lib/format';
import { useCart } from '../../hooks/useCart';
import { useFlavorPath } from '../../flavors/FlavorContext';
import { addError, ageFrom, FieldErrors, isBlank, isIdNumber, isPastDate, isValidAge } from '../../lib/validation';

interface BookingState {
  doctorId?: number;
  slot?: string;
}

const REASONS = [
  'New symptom or concern',
  'Follow-up appointment',
  'Routine check-up',
  'Second opinion',
  'Test results review',
];

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none';

/**
 * Single-step booking form. Shares the validators with the insurance quote wizard via
 * lib/validation.ts rather than repeating the date and required-field logic.
 */
const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const flavorPath = useFlavorPath();
  const { addToCart } = useCart();
  const { state } = useLocation();

  const { doctorId, slot } = (state ?? {}) as BookingState;

  const [patientName, setPatientName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [reason, setReason] = useState('');
  const [memberId, setMemberId] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const doctorQuery = useQuery({
    queryKey: ['doctor', doctorId],
    enabled: Boolean(doctorId),
    queryFn: () => apiService.getDoctorById(doctorId!),
  });

  // Reached directly, without choosing a doctor and slot first.
  useEffect(() => {
    if (!doctorId || !slot) {
      navigate(flavorPath('doctors'), { replace: true });
    }
  }, [doctorId, slot, navigate, flavorPath]);

  const bookingMutation = useMutation({
    mutationFn: () =>
      apiService.postAppointment({
        doctorId: doctorId!,
        slot: slot!,
        patientName,
        dateOfBirth,
        age: Number(age),
        nationalId,
        reason,
        memberId,
      }),
    onSuccess: (hold) => {
      addToCart({
        id: hold.doctorId,
        title: `${hold.doctorName} — ${hold.specialty}`,
        subtitle: formatSlot(hold.slot),
        price: hold.price,
        priceUnit: 'consultation',
        image: doctorQuery.data?.image ?? '',
        category: hold.specialty.toLowerCase(),
        description: `${patientName} · ${reason} · ${hold.location}`,
        tags: [hold.holdReference],
      });
      navigate(flavorPath('cart'));
    },
  });

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (isBlank(patientName)) {
      addError(next, 'patientName', 'Patient name is required.');
    }
    if (isBlank(dateOfBirth)) {
      addError(next, 'dateOfBirth', 'Date of birth is required.');
    } else if (!isPastDate(dateOfBirth)) {
      addError(next, 'dateOfBirth', 'Date of birth must be in the past.');
    } else {
      const derivedAge = ageFrom(dateOfBirth);
      if (derivedAge !== null && derivedAge > 120) {
        addError(next, 'dateOfBirth', 'Please check this date of birth.');
      }
    }
    if (isBlank(age)) {
      addError(next, 'age', 'Age is required.');
    } else if (!isValidAge(age)) {
      addError(next, 'age', 'Enter an age in whole years between 0 and 120.');
    }
    if (isBlank(nationalId)) {
      addError(next, 'nationalId', 'ID number is required.');
    } else if (!isIdNumber(nationalId)) {
      addError(next, 'nationalId', 'ID number must be 6 to 12 digits.');
    }
    if (isBlank(reason)) {
      addError(next, 'reason', 'Please tell us the reason for the visit.');
    }
    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length === 0) {
      bookingMutation.mutate();
    }
  };

  const requestError = useMemo(() => {
    if (!bookingMutation.isError) {
      return null;
    }
    return bookingMutation.error instanceof Error
      ? bookingMutation.error.message
      : 'Could not hold that appointment. Please try again.';
  }, [bookingMutation.isError, bookingMutation.error]);

  const doctor = doctorQuery.data;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm your booking</h1>
        <p className="text-gray-600 mb-8">
          We hold the slot while you pay. Nothing is charged until you complete checkout.
        </p>

        {doctor && slot && (
          <div className="bg-white rounded-xl shadow-md p-5 mb-6 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-brand">{doctor.specialty}</p>
              <p className="font-bold text-gray-900">{doctor.name}</p>
              <p id="booking-slot-summary" className="text-sm text-gray-600">
                {formatSlot(slot)} · {doctor.location}
              </p>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(doctor.consultationPrice)}</p>
          </div>
        )}

        <form className="bg-white rounded-xl shadow-md p-6" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="booking-patient-name-input" className="block text-sm font-medium text-gray-700 mb-1">
                Patient full name
              </label>
              <input
                id="booking-patient-name-input"
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className={inputClass}
              />
              {errors.patientName && (
                <p id="booking-error-patientName" className="mt-1 text-xs text-red-600">
                  {errors.patientName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="booking-dob-input" className="block text-sm font-medium text-gray-700 mb-1">
                Date of birth
              </label>
              <input
                id="booking-dob-input"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClass}
              />
              {errors.dateOfBirth && (
                <p id="booking-error-dateOfBirth" className="mt-1 text-xs text-red-600">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="booking-age-input" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                id="booking-age-input"
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputClass}
              />
              {errors.age && (
                <p id="booking-error-age" className="mt-1 text-xs text-red-600">
                  {errors.age}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="booking-national-id-input" className="block text-sm font-medium text-gray-700 mb-1">
                ID number
              </label>
              <input
                id="booking-national-id-input"
                type="text"
                inputMode="numeric"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Government-issued ID"
                className={inputClass}
              />
              {errors.nationalId && (
                <p id="booking-error-nationalId" className="mt-1 text-xs text-red-600">
                  {errors.nationalId}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="booking-reason-select" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for visit
              </label>
              <select
                id="booking-reason-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                <option value="">Select a reason</option>
                {REASONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.reason && (
                <p id="booking-error-reason" className="mt-1 text-xs text-red-600">
                  {errors.reason}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="booking-member-id-input" className="block text-sm font-medium text-gray-700 mb-1">
                Insurance member ID <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="booking-member-id-input"
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="If you are claiming on insurance"
                className={inputClass}
              />
            </div>
          </div>

          {requestError && (
            <div id="booking-error-request" className="mt-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {requestError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 mt-8 pt-6 border-t border-gray-200">
            <Link
              to={flavorPath(doctorId ? `doctors/${doctorId}` : 'doctors')}
              id="booking-back-link"
              className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Back
            </Link>
            <button
              type="submit"
              id="booking-submit-button"
              disabled={bookingMutation.isPending}
              className="px-5 py-2.5 rounded-lg font-semibold text-white bg-action hover:bg-action-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bookingMutation.isPending ? 'Holding slot...' : 'Hold slot and continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
