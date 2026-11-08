import { Doctor } from '../../services/api';
import { Product } from '../../types';

/**
 * Presents a doctor as a catalog item so the shared ProductCard can render them, rather than
 * forking a near-identical card component.
 *
 * The optional Product fields carry the doctor-specific detail: subtitle is the specialty,
 * tags are credentials, meta holds rating and availability for the detail page.
 *
 * If the design later calls for avatars and availability chips, split out a PersonCard then —
 * this adapter is the seam that makes that change cheap.
 */
export const toCatalogItem = (doctor: Doctor): Product => ({
  id: doctor.id,
  title: doctor.name,
  subtitle: doctor.specialty,
  price: doctor.consultationPrice,
  priceUnit: 'consultation',
  category: doctor.specialty.toLowerCase(),
  description: doctor.bio,
  tags: doctor.credentials,
  meta: {
    rating: doctor.rating,
    reviews: doctor.reviews,
    yearsExperience: doctor.yearsExperience,
    location: doctor.location,
    nextAvailable: doctor.slots[0] ?? '',
  },
});

/** 2026-08-12T09:00 -> "Wed 12 Aug, 09:00" */
export const formatSlot = (slot: string): string => {
  const date = new Date(slot);
  if (Number.isNaN(date.getTime())) {
    return slot;
  }
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
