/**
 * Wires the static API mock into both transports the app uses:
 *  - window.fetch (used directly for /auth/me, /purchase, /assist/sync)
 *  - the axios instance in services/api.ts (via a custom adapter)
 *
 * Both funnel through handleApiRequest so there is a single source of truth.
 */
import { handleApiRequest } from './mockApi';

/* eslint-disable @typescript-eslint/no-explicit-any */

function isApiUrl(url: string): boolean {
  try {
    const u = new URL(url, window.location.origin);
    return u.pathname === '/api' || u.pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

/** Patches window.fetch so same-origin /api/* calls are served by the mock. */
export function installFetchMock(): void {
  if (typeof window === 'undefined' || (window as any).__API_MOCK_INSTALLED__) return;
  (window as any).__API_MOCK_INSTALLED__ = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input as Request).url;

    if (!isApiUrl(url)) {
      return originalFetch(input as any, init);
    }

    const method =
      init?.method ||
      (typeof input !== 'string' && !(input instanceof URL) ? (input as Request).method : 'GET') ||
      'GET';

    let body: any;
    const rawBody = init?.body;
    if (typeof rawBody === 'string') {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    }

    const u = new URL(url, window.location.origin);
    const query: Record<string, string> = {};
    u.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const { status, data } = handleApiRequest(method, u.pathname, body, query);
    if (status === 204) {
      return new Response(null, { status: 204 });
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

/** Custom axios adapter: resolves/rejects the same way the real adapters do (validateStatus). */
export function mockAxiosAdapter(config: any): Promise<any> {
  const fullPath = `${config.baseURL || ''}${config.url || ''}`;

  let body = config.data;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      /* leave as string */
    }
  }

  const query: Record<string, string> = {};
  if (config.params) {
    Object.entries(config.params).forEach(([k, v]) => {
      if (v != null) query[k] = String(v);
    });
  }

  const { status, data } = handleApiRequest(config.method || 'get', fullPath, body, query);
  const response = { data, status, statusText: '', headers: {}, config, request: {} };

  if (status >= 200 && status < 300) {
    return Promise.resolve(response);
  }
  const error: any = new Error(`Request failed with status code ${status}`);
  error.config = config;
  error.response = response;
  error.isAxiosError = true;
  return Promise.reject(error);
}
