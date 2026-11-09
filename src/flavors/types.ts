import { FlavorId } from './resolve';

/**
 * Colour tokens for one industry site.
 *
 * Values are space-separated RGB channel triplets ('79 70 229'), NOT hex and NOT rgb(...),
 * because Tailwind composes them as `rgb(var(--brand) / <alpha-value>)`. Using hex here
 * silently breaks every opacity utility (bg-brand/10 emits invalid CSS).
 */
export interface FlavorTheme {
  brand: string;
  brandHover: string;
  brandSubtle: string;
  action: string;
  actionHover: string;
  heroFrom: string;
  heroVia: string;
  heroTo: string;
}

/** Every user-visible string that differs between industries. */
export interface FlavorCopy {
  itemSingular: string;
  itemPlural: string;
  /** Flavor-relative path of the catalog page: 'shop' | 'plans' | 'treatments'. */
  catalogPath: string;
  catalogTitle: string;
  catalogSubtitle: string;
  searchPlaceholder: string;
  /** ProductCard CTA: 'Add to Cart' | 'Select Plan' | 'Book'. */
  selectItemLabel: string;
  cartTitle: string;
  cartEmptyTitle: string;
  cartEmptyBody: string;
  cartEmptyCtaLabel: string;
  /**
   * Flavor-relative target of the empty-cart CTA. Its own field rather than a reuse of
   * heroCtaTo, because retail's has always gone to the home page while insurance's sends
   * you to the quote wizard.
   */
  cartEmptyCtaTo: string;
  /** Cart's primary button: 'Buy Now' | 'Pay Premium' | 'Confirm & Pay'. */
  checkoutLabel: string;
  orderIdLabel: string;
  confirmationTitle: string;
  confirmationBody: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  /** Flavor-relative target of the hero CTA. */
  heroCtaTo: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
}

export interface FlavorNavItem {
  /** Becomes id={`header-nav-${id}`}. */
  id: string;
  label: string;
  /** Flavor-relative path; '' is the industry home. */
  to: string;
  /** Set for global links like /gdpr-demo that must not be prefixed. */
  absolute?: boolean;
}

/** Copy and colour for the Assist widget that the vendor script renders. */
export interface WidgetPreset {
  title: string;
  subtitle: string;
  ctaLabel: string;
  badge: string;
  /** Hex — these are handed to a plain JS file, not to Tailwind. */
  bg: string;
  fg: string;
  accent: string;
  glyph: string;
}

export interface FlavorConfig {
  id: FlavorId;
  brandName: string;
  tagline: string;
  documentTitle: string;
  theme: FlavorTheme;
  copy: FlavorCopy;
  nav: FlavorNavItem[];
  /** Footer "Quick Links" — usually nav minus the global links, plus extras. */
  footerLinks: FlavorNavItem[];
  footerBlurb: string;
  /** Footer service column: two industry-specific reassurance lines. */
  footerHighlights: [string, string];
  /** Bank has no cart: the header icon is hidden and no cart route is registered. */
  hasCart: boolean;
  hasCheckout: boolean;
  clean?: boolean;
  orderIdPrefix: 'ORD' | 'POL' | 'APT';
  widget: WidgetPreset;
  /** Shown on the login page and the /flavors picker. */
  demoCredentials: { email: string; password: string };
  /**
   * Reflectiz snippet for THIS site. The URL itself identifies the site, exactly as on a
   * real customer install — nothing looks a siteId up at runtime. Giving each industry its
   * own snippet is what lets a blocking policy target one site and leave the others alone,
   * even though all four share one checkout document.
   *
   * Empty means "not monitored yet"; no snippet is injected.
   */
  reflectizSnippetUrl?: string;
}
