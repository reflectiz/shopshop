import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import { formatSlot } from './doctorAdapter';
import { formatCurrency } from '../../lib/format';
import { useFlavorPath } from '../../flavors/FlavorContext';

const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const flavorPath = useFlavorPath();
  const [slot, setSlot] = useState('');

  const { data: doctor, isLoading, isError } = useQuery({
    queryKey: ['doctor', id],
    enabled: Boolean(id),
    queryFn: () => apiService.getDoctorById(id!),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand" />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Doctor not found</h2>
          <Link
            to={flavorPath('doctors')}
            className="inline-block mt-4 bg-brand text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
          >
            Back to doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to={flavorPath('doctors')}
          id="doctor-detail-back-link"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-hover mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All doctors
        </Link>

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="sm:flex">
            <div className="p-6 flex-1">
              <p className="text-sm font-semibold text-brand">{doctor.specialty}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{doctor.name}</h1>
              <p className="text-sm text-gray-500 mt-1">{doctor.location}</p>

              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="font-semibold text-gray-900">
                  ★ {doctor.rating}
                  <span className="font-normal text-gray-500"> ({doctor.reviews} reviews)</span>
                </span>
                <span className="text-gray-500">{doctor.yearsExperience} years experience</span>
              </div>

              <p className="text-gray-600 mt-4">{doctor.bio}</p>

              <ul className="flex flex-wrap gap-1.5 mt-4">
                {doctor.credentials.map((credential) => (
                  <li key={credential} className="text-xs bg-brand-subtle text-brand rounded-full px-2.5 py-1">
                    {credential}
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-2xl font-bold text-brand">
                {formatCurrency(doctor.consultationPrice)}
                <span className="text-sm font-medium text-gray-500 ml-1.5">consultation</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Choose an appointment time</h2>
          <p className="text-sm text-gray-600 mb-5">
            {doctor.slots.length} slot{doctor.slots.length === 1 ? '' : 's'} available.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {doctor.slots.map((available) => {
              const selected = slot === available;
              return (
                <label
                  key={available}
                  htmlFor={`doctor-slot-radio-${available}`}
                  className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${
                    selected ? 'border-brand bg-brand-subtle' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    id={`doctor-slot-radio-${available}`}
                    type="radio"
                    name="slot"
                    value={available}
                    checked={selected}
                    onChange={() => setSlot(available)}
                  />
                  <span className="font-medium text-gray-900">{formatSlot(available)}</span>
                </label>
              );
            })}
          </div>

          <button
            type="button"
            id="doctor-continue-to-booking-button"
            disabled={!slot}
            onClick={() =>
              navigate(flavorPath('book'), { state: { doctorId: doctor.id, slot } })
            }
            className="w-full mt-6 bg-brand text-white py-3 px-4 rounded-lg font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {slot ? 'Continue to booking' : 'Select a time to continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetailPage;
