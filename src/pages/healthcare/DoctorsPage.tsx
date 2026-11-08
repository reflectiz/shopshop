import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import { formatSlot, toCatalogItem } from './doctorAdapter';
import { useFlavorPath } from '../../flavors/FlavorContext';

const DoctorsPage: React.FC = () => {
  const navigate = useNavigate();
  const flavorPath = useFlavorPath();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') ?? 'all');

  const { data: doctors = [], isLoading, isError, error } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => apiService.getDoctors(),
  });

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((d) => d.specialty))).sort(),
    [doctors]
  );

  const visible = useMemo(
    () =>
      doctors.filter((doctor) => {
        const matchesSpecialty =
          specialty === 'all' || doctor.specialty.toLowerCase() === specialty.toLowerCase();
        const term = search.trim().toLowerCase();
        const matchesSearch =
          term === '' ||
          doctor.name.toLowerCase().includes(term) ||
          doctor.specialty.toLowerCase().includes(term) ||
          doctor.location.toLowerCase().includes(term);
        return matchesSpecialty && matchesSearch;
      }),
    [doctors, specialty, search]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand mb-4" />
          <p className="text-gray-600 text-lg">Finding available doctors...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Could not load doctors</h2>
          <p className="text-red-600 text-sm mb-4">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
          <button
            id="doctors-retry-button"
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find a doctor</h1>
          <p className="text-lg text-gray-600">
            Book a consultation with one of our specialists. Same-week slots available.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctors-search-input" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                id="doctors-search-input"
                type="text"
                placeholder="Name, specialty or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label htmlFor="doctors-specialty-select" className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                id="doctors-specialty-select"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-brand focus:border-transparent outline-none"
              >
                <option value="all">All specialties</option>
                {specialties.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            Showing <span className="font-semibold">{visible.length}</span> of{' '}
            <span className="font-semibold">{doctors.length}</span> doctors
          </p>
        </div>

        {visible.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No doctors found</h2>
            <p className="text-gray-600 mb-6">Try a different specialty or search term.</p>
            <button
              id="doctors-clear-filters-button"
              onClick={() => {
                setSearch('');
                setSpecialty('all');
              }}
              className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-hover transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((doctor) => (
              <div key={doctor.id}>
                {/*
                  The shared catalog card, fed by the doctor adapter. "Add to cart" here means
                  "choose this doctor", so it navigates to the slot picker rather than adding
                  anything to the cart — a doctor is not a line item until a slot is chosen.
                */}
                <ProductCard
                  product={toCatalogItem(doctor)}
                  ctaLabel="Book"
                  onAddToCart={() => navigate(flavorPath(`doctors/${doctor.id}`))}
                />
                {doctor.slots[0] && (
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Next available: {formatSlot(doctor.slots[0])}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
