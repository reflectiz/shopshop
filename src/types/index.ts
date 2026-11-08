/**
 * The shared catalog item, used by every industry site: retail products, insurance plans,
 * healthcare treatments and doctors. The optional fields below are additive so retail's
 * data and cards are unaffected.
 */
export interface Product {
  id: number;
  title: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  /** Secondary line: a doctor's specialty, a plan's tier. */
  subtitle?: string;
  /** Rendered after the price: 'per traveler', '/visit'. */
  priceUnit?: string;
  /** Short pills: cover highlights, credentials. */
  tags?: string[];
  /** Free-form extras shown on detail pages (deductible, rating, duration). */
  meta?: Record<string, string | number>;
}

/** Readability alias for non-retail code working with the same shape. */
export type CatalogItem = Product;

export interface Category {
  id: number;
  name: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
