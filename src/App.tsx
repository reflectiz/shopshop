import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { injectScript } from './scripts/injectScript';
import { globalRoutes } from './routes/globalRoutes';
import { CLEAN_FLAVOR_ROUTES, FLAVOR_ROUTES } from './routes/flavorRoutes';
import { RouteWrapper } from './routes/RouteWrapper';
import { CLEAN_FLAVORS, FLAVORS } from './flavors/flavors';
import { CLEAN_PREFIX, DEFAULT_FLAVOR, FLAVOR_IDS, FlavorId, isCleanPathname } from './flavors/resolve';
import FlavorShell from './flavors/FlavorShell';
import FlavorPickerPage from './pages/FlavorPickerPage';
import NotFoundPage from './pages/NotFoundPage';
import { AppRoute } from './routes/types';

/** Renders one industry's route tree as children of its FlavorShell. */
const flavorChildren = (routes: AppRoute[]) =>
  routes.map((route) =>
    route.path === '' ? (
      <Route key="index" index element={<RouteWrapper route={route}>{route.element}</RouteWrapper>} />
    ) : (
      <Route
        key={route.path}
        path={route.path}
        element={<RouteWrapper route={route}>{route.element}</RouteWrapper>}
      />
    )
  );

function App() {
  useEffect(() => {
    if (isCleanPathname(window.location.pathname)) return;
    injectScript({
      id: 'gtm',
      src: 'https://www.googletagmanager.com/gtm.js?id=GTM-PSHRK64S',
      async: true,
      bootstrap: () => {
        const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      },
    });
  }, []);

  return (
    <Router>
      <Routes>
        {/*
          Retail is mounted twice: unprefixed at the site root (so /, /shop, /cart and every
          other existing URL are unchanged) and again at /retail for symmetry with the other
          industries.
        */}
        <Route path="/" element={<FlavorShell flavor={FLAVORS[DEFAULT_FLAVOR]} />}>
          {flavorChildren(FLAVOR_ROUTES[DEFAULT_FLAVOR])}
        </Route>

        {FLAVOR_IDS.map((id: FlavorId) => (
          <Route key={id} path={`/${id}`} element={<FlavorShell flavor={FLAVORS[id]} />}>
            {flavorChildren(FLAVOR_ROUTES[id])}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        ))}

        {FLAVOR_IDS.map((id: FlavorId) => (
          <Route
            key={`clean-${id}`}
            path={`/${CLEAN_PREFIX}/${id}`}
            element={<FlavorShell flavor={CLEAN_FLAVORS[id]} />}
          >
            {flavorChildren(CLEAN_FLAVOR_ROUTES[id])}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        ))}

        {globalRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<RouteWrapper route={route}>{route.element}</RouteWrapper>}
          />
        ))}

        <Route path="/flavors" element={<FlavorPickerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
