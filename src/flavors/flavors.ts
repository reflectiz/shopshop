import { FlavorId } from './resolve';
import { FlavorConfig, FlavorNavItem } from './types';

/**
 * The four industry sites.
 *
 * IMPORTANT: retail's copy and colours reproduce what is hard-coded in the components
 * today, verbatim. Retail is the reference implementation and the regression canary — the
 * site at / must render identically after this refactor.
 */

/**
 * Shared link to the tracker demo. Flavor-RELATIVE on purpose: every industry mounts its own
 * copy of the page (see routes/demoRoutes.tsx), so insurance stays on /insurance/gdpr-demo
 * instead of being thrown out to the retail-branded /gdpr-demo. Retail still resolves to the
 * bare /gdpr-demo, because useFlavorPath leaves retail paths unprefixed.
 */
const GDPR_NAV: FlavorNavItem = { id: 'gdpr', label: 'GDPR Demo', to: 'gdpr-demo' };

export const FLAVORS: Record<FlavorId, FlavorConfig> = {
  retail: {
    id: 'retail',
    brandName: 'ShopHub',
    tagline: 'Quality products at unbeatable prices',
    documentTitle: 'ShopHub - Your Online Store',
    theme: {
      brand: '79 70 229', // indigo-600
      brandHover: '67 56 202', // indigo-700
      brandSubtle: '238 242 255', // indigo-50
      action: '22 163 74', // green-600
      actionHover: '21 128 61', // green-700
      heroFrom: '79 70 229', // indigo-600
      heroVia: '147 51 234', // purple-600
      heroTo: '236 72 153', // pink-500
    },
    copy: {
      itemSingular: 'product',
      itemPlural: 'products',
      catalogPath: 'shop',
      catalogTitle: 'Shop',
      catalogSubtitle: 'Browse our complete collection of products',
      searchPlaceholder: 'Search products...',
      selectItemLabel: 'Add to Cart',
      cartTitle: 'Shopping Cart',
      cartEmptyTitle: 'Your cart is empty',
      cartEmptyBody: "Looks like you haven't added anything to your cart yet",
      cartEmptyCtaLabel: 'Continue Shopping',
      cartEmptyCtaTo: '',
      checkoutLabel: 'Buy Now',
      orderIdLabel: 'Order ID',
      confirmationTitle: 'Thank you for your order!',
      confirmationBody: 'Your order has been placed and is being prepared for shipping.',
      heroTitle: 'Discover Amazing Products',
      heroSubtitle:
        'Shop the latest trends and find everything you need in one place. Quality products at unbeatable prices.',
      heroCtaLabel: 'Shop Now',
      heroCtaTo: 'shop',
      categoriesTitle: 'Shop by Category',
      categoriesSubtitle: 'Browse our wide range of product categories',
    },
    nav: [
      { id: 'home', label: 'Home', to: '' },
      { id: 'about', label: 'About Us', to: 'about' },
      { id: 'shop', label: 'Shop', to: 'shop' },
      { id: 'categories', label: 'Categories', to: 'categories' },
      GDPR_NAV,
    ],
    footerLinks: [
      { id: 'home', label: 'Home', to: '' },
      { id: 'shop', label: 'Shop', to: 'shop' },
      { id: 'categories', label: 'Categories', to: 'categories' },
      { id: 'about', label: 'About Us', to: 'about' },
      { id: 'video', label: 'Video', to: 'video' },
    ],
    footerBlurb: 'Your one-stop shop for all your needs. Quality products, great prices.',
    footerHighlights: ['Free Shipping on Orders $50+', '30-Day Return Policy'],
    hasCart: true,
    hasCheckout: true,
    orderIdPrefix: 'ORD',
    widget: {
      title: 'ShopHub Assist',
      subtitle: 'Questions about your order? An advisor is online now.',
      ctaLabel: 'Start chat',
      badge: '1',
      bg: '#4f46e5',
      fg: '#ffffff',
      accent: '#f59e0b',
      glyph: '💬',
    },
    demoCredentials: { email: 'demo@shophub-demo.com', password: 'Shop12345' },
    // Paste this site's Reflectiz snippet URL here. Must stay DISTINCT per industry —
    // sharing one URL across flavors is what makes a policy hit all four at once.
    reflectizSnippetUrl: '',
  },

  insurance: {
    id: 'insurance',
    brandName: 'SafeTravel Assurance',
    tagline: 'Cover you can count on, wherever you go',
    documentTitle: 'SafeTravel Assurance - Travel Insurance',
    theme: {
      brand: '13 148 136', // teal-600
      brandHover: '15 118 110', // teal-700
      brandSubtle: '240 253 250', // teal-50
      action: '13 148 136',
      actionHover: '15 118 110',
      heroFrom: '15 118 110', // teal-700
      heroVia: '13 148 136', // teal-600
      heroTo: '56 189 248', // sky-400
    },
    copy: {
      itemSingular: 'plan',
      itemPlural: 'plans',
      catalogPath: 'plans',
      catalogTitle: 'Travel Plans',
      catalogSubtitle: 'Compare cover levels and choose the plan that fits your trip',
      searchPlaceholder: 'Search plans...',
      selectItemLabel: 'Select Plan',
      cartTitle: 'Your Quote',
      cartEmptyTitle: 'No quote yet',
      cartEmptyBody: 'Tell us about your trip and we will calculate your premium',
      cartEmptyCtaLabel: 'Get a Quote',
      cartEmptyCtaTo: 'quote',
      checkoutLabel: 'Pay Premium',
      orderIdLabel: 'Policy Number',
      confirmationTitle: 'Your policy is issued',
      confirmationBody: 'Your certificate of insurance has been sent to your email address.',
      heroTitle: 'Travel Covered, Not Worried',
      heroSubtitle:
        'Medical cover, trip cancellation and lost baggage protection from a single policy. Get a quote in under two minutes.',
      heroCtaLabel: 'Get a Quote',
      heroCtaTo: 'quote',
      categoriesTitle: 'Our Cover',
      categoriesSubtitle: 'Explore the types of insurance we offer',
    },
    nav: [
      { id: 'home', label: 'Home', to: '' },
      { id: 'quote', label: 'Get a Quote', to: 'quote' },
      { id: 'plans', label: 'Plans', to: 'plans' },
      { id: 'about', label: 'About Us', to: 'about' },
      GDPR_NAV,
    ],
    footerLinks: [
      { id: 'home', label: 'Home', to: '' },
      { id: 'quote', label: 'Get a Quote', to: 'quote' },
      { id: 'plans', label: 'Plans', to: 'plans' },
      { id: 'about', label: 'About Us', to: 'about' },
    ],
    footerBlurb: 'Travel, home and motor cover underwritten with care. Claims handled by people, not scripts.',
    footerHighlights: ['24/7 emergency assistance', '14-day cooling-off period'],
    hasCart: true,
    hasCheckout: true,
    orderIdPrefix: 'POL',
    widget: {
      title: 'SafeTravel Assist',
      subtitle: 'Not sure which cover you need? A licensed agent can help.',
      ctaLabel: 'Talk to an agent',
      badge: '1',
      bg: '#0d9488',
      fg: '#ffffff',
      accent: '#f59e0b',
      glyph: '🛡️',
    },
    demoCredentials: { email: 'demo@safetravel-demo.com', password: 'Travel12345' },
    reflectizSnippetUrl: '',
  },

  bank: {
    id: 'bank',
    brandName: 'Northbank',
    tagline: 'Everyday banking, quietly done well',
    documentTitle: 'Northbank - Online Banking',
    theme: {
      brand: '30 58 138', // blue-900
      brandHover: '30 64 175', // blue-800
      brandSubtle: '239 246 255', // blue-50
      action: '5 150 105', // emerald-600
      actionHover: '4 120 87', // emerald-700
      heroFrom: '15 23 42', // slate-900
      heroVia: '30 58 138', // blue-900
      heroTo: '37 99 235', // blue-600
    },
    copy: {
      itemSingular: 'account',
      itemPlural: 'accounts',
      catalogPath: 'accounts',
      catalogTitle: 'Your Accounts',
      catalogSubtitle: 'Balances across all of your Northbank accounts',
      searchPlaceholder: 'Search accounts...',
      selectItemLabel: 'View Account',
      // Bank has no cart or checkout; these exist only to satisfy the shared type.
      cartTitle: '',
      cartEmptyTitle: '',
      cartEmptyBody: '',
      cartEmptyCtaLabel: '',
      cartEmptyCtaTo: '',
      checkoutLabel: '',
      orderIdLabel: 'Reference',
      confirmationTitle: 'Transfer submitted',
      confirmationBody: 'Your transfer has been submitted and will be processed shortly.',
      heroTitle: 'Banking Without the Busywork',
      heroSubtitle: 'See every balance in one place, move money in seconds.',
      heroCtaLabel: 'View Accounts',
      heroCtaTo: 'accounts',
      categoriesTitle: 'Ways to Bank',
      categoriesSubtitle: 'Current accounts, savings and cards',
    },
    // No Transfer link: there is no transfer page, and a nav item that 404s looks broken.
    nav: [
      { id: 'overview', label: 'Overview', to: '' },
      { id: 'accounts', label: 'Accounts', to: 'accounts' },
      { id: 'about', label: 'About Us', to: 'about' },
      GDPR_NAV,
    ],
    footerLinks: [
      { id: 'overview', label: 'Overview', to: '' },
      { id: 'accounts', label: 'Accounts', to: 'accounts' },
      { id: 'about', label: 'About Us', to: 'about' },
    ],
    footerBlurb: 'Current accounts, savings and cards, without the branch queue.',
    footerHighlights: ['Deposits protected up to $250,000', 'Fraud monitoring, day and night'],
    hasCart: false,
    hasCheckout: false,
    orderIdPrefix: 'ORD',
    widget: {
      title: 'Northbank Secure Assist',
      subtitle: 'Questions about this transfer? A specialist is online.',
      ctaLabel: 'Start secure chat',
      badge: '1',
      bg: '#1e3a8a',
      fg: '#ffffff',
      accent: '#22c55e',
      glyph: '🔒',
    },
    demoCredentials: { email: 'demo@northbank-demo.com', password: 'Bank12345' },
    reflectizSnippetUrl: '',
  },

  healthcare: {
    id: 'healthcare',
    brandName: 'WellCare Clinic',
    tagline: 'Care that fits your calendar',
    documentTitle: 'WellCare Clinic - Book Care Online',
    theme: {
      brand: '2 132 199', // sky-600
      brandHover: '3 105 161', // sky-700
      brandSubtle: '240 249 255', // sky-50
      action: '20 184 166', // teal-500
      actionHover: '13 148 136', // teal-600
      heroFrom: '3 105 161', // sky-700
      heroVia: '2 132 199', // sky-600
      heroTo: '45 212 191', // teal-300
    },
    copy: {
      itemSingular: 'treatment',
      itemPlural: 'treatments',
      catalogPath: 'treatments',
      catalogTitle: 'Treatments',
      catalogSubtitle: 'Browse the treatments and consultations we offer',
      searchPlaceholder: 'Search treatments...',
      selectItemLabel: 'Book',
      cartTitle: 'Your Booking',
      cartEmptyTitle: 'Nothing booked yet',
      cartEmptyBody: 'Choose a doctor or a treatment to start a booking',
      cartEmptyCtaLabel: 'Find a Doctor',
      cartEmptyCtaTo: 'doctors',
      checkoutLabel: 'Confirm & Pay',
      orderIdLabel: 'Appointment ID',
      confirmationTitle: 'Your appointment is confirmed',
      confirmationBody: 'A confirmation and pre-visit instructions have been sent to your email.',
      heroTitle: 'See the Right Doctor, Sooner',
      heroSubtitle:
        'Book consultations and treatments with our specialists online. Same-week appointments available.',
      heroCtaLabel: 'Find a Doctor',
      heroCtaTo: 'doctors',
      categoriesTitle: 'Our Specialties',
      categoriesSubtitle: 'Find care by specialty',
    },
    nav: [
      { id: 'home', label: 'Home', to: '' },
      { id: 'doctors', label: 'Find a Doctor', to: 'doctors' },
      { id: 'treatments', label: 'Treatments', to: 'treatments' },
      { id: 'about', label: 'About Us', to: 'about' },
      GDPR_NAV,
    ],
    footerLinks: [
      { id: 'home', label: 'Home', to: '' },
      { id: 'doctors', label: 'Find a Doctor', to: 'doctors' },
      { id: 'treatments', label: 'Treatments', to: 'treatments' },
      { id: 'about', label: 'About Us', to: 'about' },
    ],
    footerBlurb: 'A multi-specialty clinic with same-week appointments and online booking.',
    footerHighlights: ['Most insurance plans accepted', 'Free cancellation up to 24h before'],
    hasCart: true,
    hasCheckout: true,
    orderIdPrefix: 'APT',
    widget: {
      title: 'WellCare Assist',
      subtitle: 'Need help choosing a doctor? Our care team is available.',
      ctaLabel: 'Ask the care team',
      badge: '1',
      bg: '#0284c7',
      fg: '#ffffff',
      accent: '#14b8a6',
      glyph: '🩺',
    },
    demoCredentials: { email: 'demo@wellcare-demo.com', password: 'Care12345' },
    reflectizSnippetUrl: '',
  },
};

export const FLAVOR_LIST = Object.values(FLAVORS);

export const CLEAN_FLAVORS = Object.fromEntries(
  FLAVOR_LIST.map((flavor) => [
    flavor.id,
    {
      ...flavor,
      clean: true,
      nav: flavor.nav.filter((item) => item !== GDPR_NAV),
      footerLinks: flavor.footerLinks.filter((item) => item.id !== 'video'),
      reflectizSnippetUrl: '',
    },
  ])
) as Record<FlavorId, FlavorConfig>;

export const CLEAN_FLAVOR_LIST = Object.values(CLEAN_FLAVORS);
