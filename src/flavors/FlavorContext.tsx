import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { buildFlavorPath, DEFAULT_FLAVOR } from './resolve';
import { FLAVORS } from './flavors';
import { FlavorConfig } from './types';

/**
 * The active industry site.
 *
 * Defaults to retail rather than throwing, because the global routes that stay unprefixed
 * (/redirect, /scripts/:siteId) render Layout -> Header, which reads this context without a
 * provider above it. With a retail default they keep their current appearance and need no
 * wrapper.
 *
 * Note this default is a fallback, not a feature: the tracker demos used to rely on it and
 * silently re-branded every non-retail site to ShopHub. They are now mounted per-industry.
 */
const FlavorContext = createContext<FlavorConfig>(FLAVORS[DEFAULT_FLAVOR]);

export const FlavorProvider: React.FC<{ flavor: FlavorConfig; children: React.ReactNode }> = ({
  flavor,
  children,
}) => <FlavorContext.Provider value={flavor}>{children}</FlavorContext.Provider>;

export const useFlavor = (): FlavorConfig => useContext(FlavorContext);

/**
 * Builds a path inside the current industry site.
 *
 *   flavorPath()          -> '/insurance'      (industry home)
 *   flavorPath('cart')    -> '/insurance/cart'
 *   flavorPath('/gdpr')   -> '/gdpr'           (absolute escape hatch, unchanged)
 *
 * Retail is special-cased to the bare paths it uses today ('/', '/shop', '/cart'), so the
 * existing site keeps its current URLs and nothing that links to them breaks.
 */
export const useFlavorPath = () => {
  const flavor = useFlavor();
  return useCallback(
    (relative = '') => {
      if (relative.startsWith('/')) {
        return relative;
      }
      if (flavor.clean) {
        return buildFlavorPath(flavor.id, relative, true);
      }
      if (flavor.id === DEFAULT_FLAVOR) {
        return relative ? `/${relative}` : '/';
      }
      return buildFlavorPath(flavor.id, relative);
    },
    [flavor.id, flavor.clean]
  );
};

/** Convenience for components that need both. */
export const useFlavorWithPath = () => {
  const flavor = useFlavor();
  const flavorPath = useFlavorPath();
  return useMemo(() => ({ flavor, flavorPath }), [flavor, flavorPath]);
};
