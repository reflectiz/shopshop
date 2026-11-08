import React, { useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useFlavor } from '../flavors/FlavorContext';
import { AppRoute } from './types';

interface RouteWrapperProps {
  route: AppRoute;
  children: React.ReactElement;
}

export const RouteWrapper: React.FC<RouteWrapperProps> = ({ route, children }) => {
  const flavor = useFlavor();

  // AppRoute.title existed but was never used; drive the document title from it so each
  // industry site names itself correctly in the tab and in history.
  useEffect(() => {
    document.title = route.title ? `${route.title} | ${flavor.brandName}` : flavor.documentTitle;
  }, [route.title, flavor.brandName, flavor.documentTitle]);

  let element = children;

  // Apply Layout if explicitly set to true
  if (route.layout) {
    element = <Layout>{element}</Layout>;
  }

  // Apply ProtectedRoute if route is protected
  if (route.protected) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  return element;
};
