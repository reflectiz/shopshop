import axios from 'axios';
import { API_URL } from '../config';
import { mockAxiosAdapter } from '../mocks/install';
import { Category, Product } from '../types';
import {
  buildFlavorPath,
  DEFAULT_FLAVOR,
  FlavorId,
  isCleanPathname,
  resolveFlavorFromPathname,
} from '../flavors/resolve';

/**
 * Retail is served by the original unprefixed endpoints, so its requests are byte-identical
 * to before. The other industries live under /api/<flavor>/.
 */
const catalogBase = (flavor: FlavorId): string => (flavor === DEFAULT_FLAVOR ? '' : `/${flavor}`);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // Static Pages build: serve every request from the bundled mock instead of a backend.
  adapter: mockAxiosAdapter,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Not a hook, so the industry has to come from the URL rather than context.
      const { pathname } = window.location;
      const flavor = resolveFlavorFromPathname(pathname);
      window.location.href = flavor
        ? buildFlavorPath(flavor, 'login', isCleanPathname(pathname))
        : '/login';
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  getProducts: async (flavor: FlavorId = DEFAULT_FLAVOR): Promise<Product[]> => {
    const response = await api.get<Product[]>(`${catalogBase(flavor)}/products`);
    return response.data;
  },

  getProductById: async (id: number, flavor: FlavorId = DEFAULT_FLAVOR): Promise<Product> => {
    const response = await api.get<Product>(`${catalogBase(flavor)}/products/${id}`);
    return response.data;
  },

  getCategories: async (flavor: FlavorId = DEFAULT_FLAVOR): Promise<Category[]> => {
    const response = await api.get<Category[]>(`${catalogBase(flavor)}/categories`);
    return response.data;
  },

  getCategoryById: async (id: number, flavor: FlavorId = DEFAULT_FLAVOR): Promise<Category> => {
    const response = await api.get<Category>(`${catalogBase(flavor)}/categories/${id}`);
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getScriptsUrl: async (siteId: string): Promise<ScriptsUrlItem[]> => {
    const response = await api.get<ScriptsUrlItem[]>(`/scriptsUrl/${siteId}`);
    return response.data;
  },

  getDoctors: async (specialty?: string): Promise<Doctor[]> => {
    const response = await api.get<Doctor[]>('/healthcare/doctors', {
      params: specialty ? { specialty } : undefined,
    });
    return response.data;
  },

  getDoctorById: async (id: number | string): Promise<Doctor> => {
    const response = await api.get<Doctor>(`/healthcare/doctors/${id}`);
    return response.data;
  },

  postAppointment: async (payload: AppointmentRequest): Promise<AppointmentHold> => {
    const response = await api.post<AppointmentHold>('/healthcare/appointments', payload);
    return response.data;
  },

  getBankAccounts: async (): Promise<BankAccountsResponse> => {
    const response = await api.get<BankAccountsResponse>('/bank/accounts');
    return response.data;
  },

  getBankAccount: async (id: number | string): Promise<BankAccount> => {
    const response = await api.get<BankAccount>(`/bank/accounts/${id}`);
    return response.data;
  },

  getBankTransactions: async (id: number | string): Promise<BankTransaction[]> => {
    const response = await api.get<BankTransaction[]>(`/bank/accounts/${id}/transactions`);
    return response.data;
  },

  postInsuranceQuote: async (payload: unknown): Promise<InsuranceQuoteResponse> => {
    const response = await api.post<InsuranceQuoteResponse>('/insurance/quote', payload);
    return response.data;
  },

};

export type ScriptsUrlItem = {
  url: string;
  signedUrl: string;
  params: { name: string; value: string }[];
};

export type Doctor = {
  id: number;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviews: number;
  yearsExperience: number;
  location: string;
  consultationPrice: number;
  credentials: string[];
  bio: string;
  slots: string[];
};

export type AppointmentRequest = {
  doctorId: number;
  slot: string;
  patientName: string;
  dateOfBirth: string;
  age: number;
  nationalId: string;
  reason: string;
  memberId?: string;
};

export type AppointmentHold = {
  success: boolean;
  holdReference: string;
  doctorId: number;
  doctorName: string;
  specialty: string;
  location: string;
  slot: string;
  price: number;
  currency: string;
};

export type BankAccount = {
  id: number;
  userId: number;
  name: string;
  type: 'checking' | 'savings' | 'credit';
  accountNumberMasked: string;
  sortCode?: string;
  currency: string;
  balance: number;
  available: number;
  arrangedOverdraft?: number;
  interestRate?: number;
  creditLimit?: number;
  minimumPayment?: number;
  paymentDueDate?: string;
  maturesAt?: string;
  openedAt?: string;
};

export type BankAccountsResponse = {
  accounts: BankAccount[];
  totalBalance: number;
  currency: string;
};

export type BankTransaction = {
  id: number;
  accountId: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  balanceAfter: number;
  status: 'posted' | 'pending';
};

export type InsuranceQuoteResponse = {
  premium: number;
  currency: string;
  planId: number;
  planTitle: string;
  tripDays: number;
  travelerCount: number;
  breakdown: { label: string; amount: number }[];
};

export interface LoginResponse {
  success: boolean;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  error?: string;
}

export default apiService;
