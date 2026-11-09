/**
 * Industry resolution — pure, framework-free, no React imports.
 *
 * Deliberately dependency-free so non-hook callers can use it too (e.g. the axios 401
 * interceptor in services/api.ts, which has no access to context).
 *
 * The industry is the first path segment: /insurance/login -> 'insurance'. Retail is also
 * mounted unprefixed at the site root, so '/' and '/shop' have no segment to match — which
 * is why an unrecognised first segment falls back to DEFAULT_FLAVOR rather than erroring.
 */

export const FLAVOR_IDS = ['retail', 'insurance', 'bank', 'healthcare'] as const;

export type FlavorId = (typeof FLAVOR_IDS)[number];

export const DEFAULT_FLAVOR: FlavorId = 'retail';

export const CLEAN_PREFIX = 'clean';

export const isFlavorId = (value?: string | null): value is FlavorId =>
  Boolean(value) && (FLAVOR_IDS as readonly string[]).includes(value as string);

const segments = (pathname: string): string[] =>
  String(pathname || '/')
    .split('/')
    .filter(Boolean);

export const isCleanPathname = (pathname: string): boolean => segments(pathname)[0] === CLEAN_PREFIX;

/** The industry named by the first path segment, or null if it names none. */
export const resolveFlavorFromPathname = (pathname: string): FlavorId | null => {
  const segs = segments(pathname);
  const first = segs[0] === CLEAN_PREFIX ? segs[1] : segs[0];
  return isFlavorId(first) ? first : null;
};

/** As above but never null — unprefixed paths belong to retail. */
export const resolveFlavorOrDefault = (pathname: string): FlavorId =>
  resolveFlavorFromPathname(pathname) ?? DEFAULT_FLAVOR;

/**
 * Builds an industry-scoped path. A `relative` value starting with '/' is treated as an
 * absolute escape hatch and returned unchanged (for global routes like /gdpr-demo).
 */
export const buildFlavorPath = (flavor: FlavorId, relative = '', clean = false): string => {
  if (relative.startsWith('/')) {
    return relative;
  }
  const base = clean ? `/${CLEAN_PREFIX}/${flavor}` : `/${flavor}`;
  return relative ? `${base}/${relative}` : base;
};
