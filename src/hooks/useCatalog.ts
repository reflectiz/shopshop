import { useAtomValue } from 'jotai';
import { categoriesAtomFamily, productsAtomFamily } from '../store/queryAtoms';
import { useFlavor } from '../flavors/FlavorContext';
import { Category, Product } from '../types';

/**
 * Catalog (items + categories) for the current industry site.
 *
 * Single place the shared pages — HomePage, ShopPage, CategoriesPage — get their data, so
 * they stay identical across industries and only their copy differs.
 */
export const useCatalog = (): {
  items: Product[];
  categories: Category[];
  isLoading: boolean;
  error: unknown;
} => {
  const { id: flavor } = useFlavor();

  const {
    data: items = [],
    isLoading: itemsLoading,
    error: itemsError,
  } = useAtomValue(productsAtomFamily(flavor));

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useAtomValue(categoriesAtomFamily(flavor));

  return {
    items,
    categories,
    isLoading: itemsLoading || categoriesLoading,
    error: itemsError || categoriesError,
  };
};
