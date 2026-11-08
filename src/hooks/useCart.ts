import { useCallback } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
  addItem,
  cartItemCountAtomFamily,
  cartItemsAtomFamily,
  removeItem,
  saveCartToStorage,
  setItemQuantity,
} from '../store/cartAtoms';
import { useFlavor } from '../flavors/FlavorContext';
import { Product } from '../types';

/**
 * Cart for the current industry site.
 *
 * The public API is unchanged from the single-site version, so Cart, ShopPage and Layout
 * need no edits for the per-industry scoping — the flavor comes from context.
 */
export const useCart = () => {
  const { id, clean } = useFlavor();
  const flavor = clean ? `clean:${id}` : id;
  const [cartItems, setCartItems] = useAtom(cartItemsAtomFamily(flavor));
  const cartItemCount = useAtomValue(cartItemCountAtomFamily(flavor));

  const commit = useCallback(
    (next: ReturnType<typeof addItem>) => {
      saveCartToStorage(flavor, next);
      setCartItems(next);
    },
    [flavor, setCartItems]
  );

  const addToCart = useCallback(
    (product: Product) => commit(addItem(cartItems, product)),
    [cartItems, commit]
  );

  const removeFromCart = useCallback(
    (productId: number) => commit(removeItem(cartItems, productId)),
    [cartItems, commit]
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => commit(setItemQuantity(cartItems, productId, quantity)),
    [cartItems, commit]
  );

  const clearCart = useCallback(() => commit([]), [commit]);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartItemCount: () => cartItemCount,
    clearCart,
  };
};
