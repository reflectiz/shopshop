/**
 * Static API mock for the GitHub Pages build.
 *
 * The original app is served by an Express backend reading JSON data files and a SQL/GCS layer.
 * GitHub Pages is static, so this module reproduces the data endpoints the frontend calls,
 * entirely client-side, from the bundled JSON under ./data and the computed logic ported from
 * the backend controllers. No database connection, no credentials, no secrets are included.
 *
 * Deliberately omitted (backend/DB/GCS-only): /api/scriptsUrl (returns []), /api/payment-script
 * (the script is now injected directly from safesafe.net in ScriptsLoader). Auth is reduced to a
 * single always-signed-in demo identity so the otherwise login-gated catalog is browsable.
 */
import usersData from './data/users.json';
import retailProducts from './data/products.json';
import retailCategories from './data/categories.json';
import insuranceProducts from './data/insurance/products.json';
import insuranceCategories from './data/insurance/categories.json';
import bankProducts from './data/bank/products.json';
import bankCategories from './data/bank/categories.json';
import bankAccounts from './data/bank/accounts.json';
import bankTransactions from './data/bank/transactions.json';
import healthcareProducts from './data/healthcare/products.json';
import healthcareCategories from './data/healthcare/categories.json';
import doctorsData from './data/healthcare/doctors.json';
import { FLAVORS } from '../flavors/flavors';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

export interface MockResult {
  status: number;
  data: Any;
}

const users = usersData as Any[];
/** Fallback identity (all flavors) when a session has no matching user record. */
const DEMO_USER = users.find((u) => (u.flavors?.length ?? 0) >= 4) || users[0];

/**
 * Login is gated like the original backend: the journey starts at the login page. Credentials are
 * validated against the per-flavor demo logins the login page already displays (public, and
 * already bundled via flavors.ts), not against any shipped password store.
 */
const DEMO_CREDS = Object.values(FLAVORS)
  .map((f: Any) => f.demoCredentials)
  .filter(Boolean) as { email: string; password: string }[];

const SESSION_KEY = 'shopshop_session';
function readSession(): Any | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function writeSession(user: Any): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}
function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
/** The signed-in user from the client session, or the fallback identity. */
function currentUser(): Any {
  return readSession() || DEMO_USER;
}

const catalogs: Record<string, { products: Any[]; categories: Any[] }> = {
  retail: { products: retailProducts as Any[], categories: retailCategories as Any[] },
  insurance: { products: insuranceProducts as Any[], categories: insuranceCategories as Any[] },
  bank: { products: bankProducts as Any[], categories: bankCategories as Any[] },
  healthcare: { products: healthcareProducts as Any[], categories: healthcareCategories as Any[] },
};

const FLAVOR_PREFIXES = ['insurance', 'bank', 'healthcare'];
const round2 = (n: number): number => Math.round(n * 100) / 100;
const ok = (data: Any): MockResult => ({ status: 200, data });
const notFound = (): MockResult => ({ status: 404, data: { error: 'Not found' } });
const publicUser = (u: Any) => ({ id: u.id, email: u.email, name: u.name });

// ---------------------------------------------------------------------------
// Auth (no passwords are shipped; the demo login accepts any filled-in form)
// ---------------------------------------------------------------------------
function authMe(): MockResult {
  const session = readSession();
  if (!session) return { status: 401, data: { error: 'Access token required' } };
  return ok(session);
}

function login(body: Any): MockResult {
  const email = String(body?.email ?? '').trim();
  const password = String(body?.password ?? '');
  const match = DEMO_CREDS.find(
    (c) => c.email.toLowerCase() === email.toLowerCase() && c.password === password
  );
  if (!match) {
    return { status: 401, data: { success: false, error: 'Invalid credentials' } };
  }
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || DEMO_USER;
  const session = publicUser(user);
  writeSession(session);
  return ok({ success: true, user: session });
}

// ---------------------------------------------------------------------------
// Purchase — orderId prefix by flavor, matching purchaseController
// ---------------------------------------------------------------------------
function purchase(body: Any): MockResult {
  const flavor = String(body?.flavor ?? 'retail');
  const prefix = flavor === 'insurance' ? 'POL' : flavor === 'healthcare' ? 'APT' : 'ORD';
  return ok({
    success: true,
    message: 'Purchase completed successfully',
    orderId: `${prefix}-${Date.now()}`,
    userId: currentUser().id,
    timestamp: new Date().toISOString(),
  });
}

// ---------------------------------------------------------------------------
// Bank — filter by the signed-in user, port of bankController
// ---------------------------------------------------------------------------
function bankAccountsResponse(): MockResult {
  const accounts = (bankAccounts as Any[]).filter((a) => a.userId === currentUser().id);
  const totalBalance = round2(accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0));
  return ok({ accounts, totalBalance, currency: accounts[0]?.currency ?? 'USD' });
}

function bankAccountById(id: number): MockResult {
  const account = (bankAccounts as Any[]).find((a) => a.id === id && a.userId === currentUser().id);
  return account ? ok(account) : notFound();
}

function bankTransactions(id: number): MockResult {
  const owned = (bankAccounts as Any[]).some((a) => a.id === id && a.userId === currentUser().id);
  if (!owned) return notFound();
  const txns = (bankTransactions as Any[])
    .filter((t: Any) => t.accountId === id)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  return ok(txns);
}

// ---------------------------------------------------------------------------
// Healthcare — doctors list/detail and appointment hold, port of healthcareController
// ---------------------------------------------------------------------------
function doctors(specialty?: string): MockResult {
  const all = doctorsData as Any[];
  const filtered = specialty
    ? all.filter((d) => d.specialty.toLowerCase() === specialty.toLowerCase())
    : all;
  return ok(filtered);
}

function doctorById(id: number): MockResult {
  const doctor = (doctorsData as Any[]).find((d) => d.id === id);
  return doctor ? ok(doctor) : notFound();
}

function appointmentHold(body: Any): MockResult {
  const doctor = (doctorsData as Any[]).find((d) => d.id === Number(body?.doctorId));
  if (!doctor) return { status: 404, data: { success: false, error: 'Doctor not found' } };

  const required = ['slot', 'patientName', 'dateOfBirth', 'nationalId', 'reason'];
  const missing = required.filter((f) => !body?.[f] || String(body[f]).trim() === '');
  if (missing.length > 0) {
    return { status: 400, data: { success: false, error: `Missing required details: ${missing.join(', ')}` } };
  }
  if (!doctor.slots.includes(String(body.slot))) {
    return { status: 409, data: { success: false, error: 'That appointment time is no longer available.' } };
  }
  return ok({
    success: true,
    holdReference: `HOLD-${doctor.id}-${Date.now()}`,
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    location: doctor.location,
    slot: body.slot,
    price: doctor.consultationPrice,
    currency: 'USD',
  });
}

// ---------------------------------------------------------------------------
// Insurance quote — exact port of insuranceController
// ---------------------------------------------------------------------------
const TIERS: Record<string, { planId: number; title: string; dailyRate: number }> = {
  basic: { planId: 1, title: 'Travel Essentials', dailyRate: 1.9 },
  standard: { planId: 2, title: 'Travel Standard', dailyRate: 3.4 },
  premium: { planId: 3, title: 'Travel Premier', dailyRate: 5.6 },
};
const HIGH_COST_DESTINATIONS = ['United States', 'Canada', 'Japan', 'Australia', 'New Zealand'];
const ADD_ON_RATES = { medicalEvacuation: 0.18, adventureSports: 0.22, cancelForAnyReason: 0.4 } as const;

const ageFrom = (dateOfBirth?: string): number => {
  if (!dateOfBirth) return 35;
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return 35;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) age -= 1;
  return Math.max(0, Math.min(120, age));
};
const ageLoading = (age: number): number => {
  if (age < 18) return 0.6;
  if (age < 36) return 1;
  if (age < 51) return 1.25;
  if (age < 66) return 1.75;
  if (age < 76) return 2.5;
  return 3.4;
};

function insuranceQuote(body: Any): MockResult {
  const travelers = Array.isArray(body?.travelers) && body.travelers.length > 0 ? body.travelers : [{}];
  const tier = TIERS[body?.coverageTier] ? body.coverageTier : 'standard';
  const tierConfig = TIERS[tier];

  const start = new Date(`${body?.startDate}T00:00:00`);
  const end = new Date(`${body?.endDate}T00:00:00`);
  const rawDays =
    Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
      ? 7
      : Math.round((end.getTime() - start.getTime()) / 86_400_000);
  const tripDays = Math.min(Math.max(rawDays, 1), 180);

  const destinationLoading = HIGH_COST_DESTINATIONS.includes(String(body?.destination)) ? 1.35 : 1;

  const baseByTraveler = travelers.map((t: Any) => {
    const age = ageFrom(t?.dateOfBirth);
    return tierConfig.dailyRate * tripDays * ageLoading(age) * destinationLoading;
  });
  const base = round2(baseByTraveler.reduce((total: number, amount: number) => total + amount, 0));

  const breakdown: { label: string; amount: number }[] = [
    {
      label: `${tierConfig.title} · ${tripDays} day${tripDays === 1 ? '' : 's'} · ${travelers.length} traveller${travelers.length === 1 ? '' : 's'}`,
      amount: base,
    },
  ];
  if (destinationLoading > 1) {
    breakdown.push({ label: `Long-haul loading (${body?.destination})`, amount: 0 });
  }

  const tripCost = Number.isFinite(Number(body?.tripCost)) ? Math.max(0, Number(body.tripCost)) : 0;
  const cancellationRate = tier === 'basic' ? 0.008 : tier === 'standard' ? 0.014 : 0.022;
  const cancellationCover = round2(tripCost * cancellationRate);
  if (cancellationCover > 0) {
    breakdown.push({ label: 'Trip cancellation cover', amount: cancellationCover });
  }

  let addOnTotal = 0;
  (Object.keys(ADD_ON_RATES) as (keyof typeof ADD_ON_RATES)[]).forEach((key) => {
    if (body?.addOns?.[key]) {
      const amount = round2(base * ADD_ON_RATES[key]);
      addOnTotal += amount;
      breakdown.push({
        label:
          key === 'medicalEvacuation'
            ? 'Medical evacuation'
            : key === 'adventureSports'
              ? 'Adventure sports'
              : 'Cancel for any reason',
        amount,
      });
    }
  });

  const subtotal = base + cancellationCover + addOnTotal;
  const tax = round2(subtotal * 0.12);
  breakdown.push({ label: 'Insurance premium tax (12%)', amount: tax });
  const premium = round2(Math.max(subtotal + tax, 12));

  return ok({
    premium,
    currency: 'USD',
    planId: tierConfig.planId,
    planTitle: tierConfig.title,
    tripDays,
    travelerCount: travelers.length,
    breakdown,
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
export function handleApiRequest(
  method: string,
  rawPath: string,
  body?: Any,
  query?: Record<string, string>
): MockResult {
  const m = (method || 'GET').toUpperCase();
  let path = rawPath.split('?')[0];
  // Drop everything up to and including "/api" (handles both "/api/x" and "https://host/api/x").
  path = path.replace(/^.*?\/api/, '');
  const seg = path.split('/').filter(Boolean);

  if (seg.length === 0 || seg[0] === 'health_check') {
    return ok({ status: 200, message: 'The server is healthy' });
  }

  if (seg[0] === 'auth') {
    if (seg[1] === 'me') return m === 'GET' ? authMe() : notFound();
    if (seg[1] === 'login' && m === 'POST') return login(body);
    if (seg[1] === 'logout' && m === 'POST') {
      clearSession();
      return ok({ success: true, message: 'Logged out successfully' });
    }
    return notFound();
  }
  if (seg[0] === 'users') return ok(users);
  if (seg[0] === 'purchase' && m === 'POST') return purchase(body);
  if (seg[0] === 'assist' && seg[1] === 'sync') return { status: 204, data: null };
  if (seg[0] === 'scriptsUrl') return ok([]); // DB-backed; omitted in the static build

  if (seg[0] === 'insurance' && seg[1] === 'quote' && m === 'POST') return insuranceQuote(body);

  if (seg[0] === 'bank' && seg[1] === 'accounts') {
    if (seg.length === 2) return bankAccountsResponse();
    const id = Number(seg[2]);
    if (seg[3] === 'transactions') return bankTransactions(id);
    return bankAccountById(id);
  }

  if (seg[0] === 'healthcare') {
    if (seg[1] === 'doctors') {
      if (seg.length === 2) return doctors(query?.specialty);
      return doctorById(Number(seg[2]));
    }
    if (seg[1] === 'appointments' && m === 'POST') return appointmentHold(body);
    // fall through to catalog for /healthcare/products etc.
  }

  // Catalog: retail unprefixed, other flavors under /<flavor>/...
  let flavor = 'retail';
  let rest = seg;
  if (FLAVOR_PREFIXES.includes(seg[0])) {
    flavor = seg[0];
    rest = seg.slice(1);
  }
  if (rest[0] === 'products') {
    const list = catalogs[flavor]?.products ?? [];
    if (rest.length === 1) return ok(list);
    const item = list.find((p) => String(p.id) === rest[1]);
    return item ? ok(item) : notFound();
  }
  if (rest[0] === 'categories') {
    const list = catalogs[flavor]?.categories ?? [];
    if (rest.length === 1) return ok(list);
    const item = list.find((c) => String(c.id) === rest[1]);
    return item ? ok(item) : notFound();
  }

  return notFound();
}
