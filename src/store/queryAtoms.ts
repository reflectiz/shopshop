import { atomWithQuery } from 'jotai-tanstack-query';
import { queryClientAtom } from 'jotai-tanstack-query';
import { atomFamily } from 'jotai/utils';
import apiService from '../services/api';
import { DEFAULT_FLAVOR, FlavorId } from '../flavors/resolve';

/**
 * Catalog queries, keyed per industry.
 *
 * These used to be flavor-blind singletons keyed ['products'] / ['categories']. With four
 * sites sharing the catalog page that is a correctness bug: navigating from retail to
 * healthcare would serve retail's cached catalog for the 5-minute staleTime.
 */

export const productsAtomFamily = atomFamily((flavor: FlavorId) =>
  atomWithQuery(() => ({
    queryKey: ['products', flavor],
    queryFn: () => apiService.getProducts(flavor),
  }))
);

export const categoriesAtomFamily = atomFamily((flavor: FlavorId) =>
  atomWithQuery(() => ({
    queryKey: ['categories', flavor],
    queryFn: () => apiService.getCategories(flavor),
  }))
);

/**
 * Retail-scoped aliases, kept so any code (or automation) still importing the original
 * names keeps working and resolves to retail exactly as before.
 */
export const productsAtom = productsAtomFamily(DEFAULT_FLAVOR);
export const categoriesAtom = categoriesAtomFamily(DEFAULT_FLAVOR);

export { queryClientAtom };
