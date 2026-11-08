import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { CartItem, Product } from '../types';
import { DEFAULT_FLAVOR } from '../flavors/resolve';

/**
 * Cart state, scoped per industry site.
 *
 * The key is per flavor because the sites share the Cart page and the checkout iframe: with
 * one global key, a retail cart would surface inside a healthcare booking.
 *
 * Retail deliberately keeps the original 'cart' key so existing carts survive and its
 * behaviour is unchanged; the new sites get 'cart:<flavor>'.
 */
const storageKey = (flavor: string): string => (flavor === DEFAULT_FLAVOR ? 'cart' : `cart:${flavor}`);

const loadCartFromStorage = (flavor: string): CartItem[] => {
  try {
    const stored = localStorage.getItem(storageKey(flavor));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  return [];
};

export const saveCartToStorage = (flavor: string, items: CartItem[]) => {
  try {
    localStorage.setItem(storageKey(flavor), JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

/** One cart atom per industry, initialised from that industry's localStorage key. */
export const cartItemsAtomFamily = atomFamily((flavor: string) =>
  atom<CartItem[]>(loadCartFromStorage(flavor))
);

export const cartItemCountAtomFamily = atomFamily((flavor: string) =>
  atom((get) => get(cartItemsAtomFamily(flavor)).reduce((total, item) => total + item.quantity, 0))
);

// Pure reducers — exported so useCart can compose them without duplicating the logic.

export const addItem = (items: CartItem[], product: Product): CartItem[] => {
  const existing = items.find((item) => item.product.id === product.id);
  if (existing) {
    return items.map((item) =>
      item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );
  }
  return [...items, { product, quantity: 1 }];
};

export const removeItem = (items: CartItem[], productId: number): CartItem[] =>
  items.filter((item) => item.product.id !== productId);

export const setItemQuantity = (items: CartItem[], productId: number, quantity: number): CartItem[] => {
  if (quantity < 1) {
    return removeItem(items, productId);
  }
  return items.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
};
