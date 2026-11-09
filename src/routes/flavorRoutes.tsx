import AboutUs from '../pages/AboutUs';
import Cart from '../pages/Cart';
import CategoriesPage from '../pages/CategoriesPage';
import HomePage from '../pages/HomePage';
import Login from '../pages/Login';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import ShopPage from '../pages/ShopPage';
import VideoPage from '../pages/VideoPage';
import QuotePage from '../pages/insurance/QuotePage';
import AccountsPage from '../pages/bank/AccountsPage';
import AccountDetailPage from '../pages/bank/AccountDetailPage';
import DoctorsPage from '../pages/healthcare/DoctorsPage';
import DoctorDetailPage from '../pages/healthcare/DoctorDetailPage';
import BookingPage from '../pages/healthcare/BookingPage';
import { FLAVOR_IDS, FlavorId } from '../flavors/resolve';
import { demoRoutes } from './demoRoutes';
import { AppRoute } from './types';

/**
 * Per-industry route trees, with paths RELATIVE to the industry prefix ('' is its home).
 *
 * Retail's tree is also mounted unprefixed at the site root, so every URL the retail site
 * uses today keeps working exactly as before.
 *
 * Every industry carries the tracker demos (demoRoutes) so those pages stay inside the site
 * you opened them from, rather than falling back to retail branding and retail nav links.
 *
 * The industry-specific pages (insurance quote wizard, bank accounts, healthcare booking)
 * are added in their own phases; until then each site runs on the shared catalog pages so
 * it is browsable and its branding is verifiable.
 */

const sharedCatalogRoutes = (catalogPath: string, catalogTitle: string): AppRoute[] => [
  { path: catalogPath, element: <ShopPage />, protected: true, layout: true, title: catalogTitle },
  { path: 'categories', element: <CategoriesPage />, protected: true, layout: true, title: 'Categories' },
];

const loginRoute: AppRoute = { path: 'login', element: <Login />, title: 'Login' };
const aboutRoute: AppRoute = {
  path: 'about',
  element: <AboutUs />,
  protected: true,
  layout: true,
  title: 'About Us',
};
const cartRoute = (title: string): AppRoute => ({
  path: 'cart',
  element: <Cart />,
  protected: true,
  layout: true,
  title,
});

/** Shared by every industry with a checkout; copy comes from the industry config. */
const confirmationRoute = (title: string): AppRoute => ({
  path: 'confirmation',
  element: <OrderConfirmationPage />,
  protected: true,
  layout: true,
  title,
});

export const FLAVOR_ROUTES: Record<FlavorId, AppRoute[]> = {
  retail: [
    loginRoute,
    { path: '', element: <HomePage />, protected: true, layout: true, title: 'Home' },
    ...sharedCatalogRoutes('shop', 'Shop'),
    cartRoute('Shopping Cart'),
    confirmationRoute('Order Confirmed'),
    aboutRoute,
    { path: 'video', element: <VideoPage />, protected: true, layout: true, title: 'Video' },
    ...demoRoutes,
  ],

  insurance: [
    loginRoute,
    { path: '', element: <HomePage />, protected: true, layout: true, title: 'Home' },
    { path: 'quote', element: <QuotePage />, protected: true, layout: true, title: 'Get a Quote' },
    ...sharedCatalogRoutes('plans', 'Travel Plans'),
    cartRoute('Your Quote'),
    confirmationRoute('Policy Issued'),
    aboutRoute,
    ...demoRoutes,
  ],

  // No cart, checkout or confirmation route at all: bank has hasCart false, so /bank/cart
  // must 404 rather than render a permanently empty cart.
  bank: [
    loginRoute,
    // The index is the account dashboard, not the shared marketing home.
    { path: '', element: <AccountsPage />, protected: true, layout: true, title: 'Overview' },
    { path: 'accounts', element: <AccountsPage />, protected: true, layout: true, title: 'Accounts' },
    {
      path: 'accounts/:id',
      element: <AccountDetailPage />,
      protected: true,
      layout: true,
      title: 'Account',
    },
    aboutRoute,
    ...demoRoutes,
  ],

  healthcare: [
    loginRoute,
    { path: '', element: <HomePage />, protected: true, layout: true, title: 'Home' },
    { path: 'doctors', element: <DoctorsPage />, protected: true, layout: true, title: 'Find a Doctor' },
    {
      path: 'doctors/:id',
      element: <DoctorDetailPage />,
      protected: true,
      layout: true,
      title: 'Doctor',
    },
    { path: 'book', element: <BookingPage />, protected: true, layout: true, title: 'Book' },
    ...sharedCatalogRoutes('treatments', 'Treatments'),
    cartRoute('Your Booking'),
    confirmationRoute('Appointment Confirmed'),
    aboutRoute,
    ...demoRoutes,
  ],
};

export const CLEAN_FLAVOR_ROUTES = Object.fromEntries(
  FLAVOR_IDS.map((id) => [
    id,
    FLAVOR_ROUTES[id].filter((route) => !demoRoutes.includes(route) && route.path !== 'video'),
  ])
) as Record<FlavorId, AppRoute[]>;
