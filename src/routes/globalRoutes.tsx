import RedirectPage from '../pages/RedirectPage';
import ScriptsLoaderPage from '../pages/ScriptsLoaderPage';
import { AppRoute } from './types';

/**
 * Routes that belong to no industry site and keep their original unprefixed paths, so
 * existing bookmarks, scans and automation are unaffected. They render outside a
 * FlavorShell, which is why FlavorContext defaults to retail.
 *
 * The tracker demos used to live here. They now live in every industry's route tree
 * (see demoRoutes) — retail's copy of that tree is mounted unprefixed at the site root, so
 * /gdpr-demo, /ccpa-demo and /us-demo still resolve, exactly as /shop and /cart do.
 */
export const globalRoutes: AppRoute[] = [
  {
    path: '/redirect',
    element: <RedirectPage />,
    protected: false,
    layout: true,
    title: 'Redirect',
  },
  {
    path: '/scripts/:siteId',
    element: <ScriptsLoaderPage />,
    protected: false,
    layout: false,
    title: 'Scripts loader',
  },
];
