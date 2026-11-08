/**
 * Small hand-rolled validators, shared by the insurance quote wizard and the healthcare
 * booking form. There is no form library in this project and these forms do not justify
 * adding one — they need exact-field error messages and nothing else.
 *
 * Native HTML validation (required, type=date/email) is used as a first line in the markup,
 * but these functions are the real gate: browser validation bubbles are awkward to assert
 * against in automation, and the demo relies on stable error element ids.
 */

export type FieldErrors = Record<string, string>;

export const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || String(value).trim() === '';

/** Deliberately permissive: catches typos, not RFC-5322 exotica. */
export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const parseDate = (value: string): Date | null => {
  if (isBlank(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const startOfToday = (): Date => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const isPastDate = (value: string): boolean => {
  const date = parseDate(value);
  return date !== null && date < startOfToday();
};

export const isTodayOrFuture = (value: string): boolean => {
  const date = parseDate(value);
  return date !== null && date >= startOfToday();
};

export const daysBetween = (from: string, to: string): number | null => {
  const start = parseDate(from);
  const end = parseDate(to);
  if (!start || !end) {
    return null;
  }
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
};

/** Whole years, as an insurer or clinic would compute it from a date of birth. */
export const ageFrom = (dateOfBirth: string): number | null => {
  const dob = parseDate(dateOfBirth);
  if (!dob) {
    return null;
  }
  const today = startOfToday();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

/** Whole years between 0 and 120, entered directly rather than derived from a date of birth. */
export const isValidAge = (value: unknown): boolean => {
  const parsed = Number(String(value));
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 120;
};

/** Government ID: 6-12 digits, which is as much shape as this demo needs. */
export const isIdNumber = (value: string): boolean => /^\d{6,12}$/.test(value.trim());

export const isPositiveNumber = (value: unknown): boolean => {
  const parsed = typeof value === 'number' ? value : Number(String(value));
  return Number.isFinite(parsed) && parsed > 0;
};

/** Sets `key` only if it is not already set, so the first (most specific) error wins. */
export const addError = (errors: FieldErrors, key: string, message: string): void => {
  if (!errors[key]) {
    errors[key] = message;
  }
};
