import CCPATrackersPage from '../pages/CCPATrackersPage';
import GDPRTrackersPage from '../pages/GDPRTrackersPage';
import USTrackersPage from '../pages/USTrackersPage';
import { AppRoute } from './types';

/**
 * The compliance tracker demos, with paths RELATIVE to an industry prefix.
 *
 * Spread into every industry tree in flavorRoutes.tsx, which is what fixes the bug these
 * routes used to have: as unprefixed global routes they rendered with no FlavorProvider above
 * them, so FlavorContext fell back to retail — the header re-branded to ShopHub and its links
 * pointed into the retail site, so clicking "GDPR Demo" from insurance/bank/healthcare dumped
 * you on the shop.
 *
 * The bare /gdpr-demo, /ccpa-demo and /us-demo URLs still resolve — retail's tree is mounted
 * unprefixed at the site root, so they come for free, the same way /shop and /cart do. They
 * are deliberately NOT also listed in globalRoutes: two route patterns for one URL would leave
 * the winner up to react-router's ranking tie-break.
 */
export const demoRoutes: AppRoute[] = [
  {
    path: 'gdpr-demo',
    element: <GDPRTrackersPage />,
    protected: false,
    layout: true,
    title: 'GDPR Demo',
  },
  {
    path: 'ccpa-demo',
    element: <CCPATrackersPage />,
    protected: false,
    layout: true,
    title: 'CCPA Demo',
  },
  {
    path: 'us-demo',
    element: <USTrackersPage />,
    protected: false,
    layout: true,
    title: 'US Demo',
  },
];
