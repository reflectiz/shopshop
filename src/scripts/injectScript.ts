/**
 * Shared <script> injector.
 *
 * One module-level registry, so the site-wide loader (components/ScriptsLoader) and the
 * per-site debug page (pages/ScriptsLoaderPage) cannot double-inject the same script.
 */

/**
 * Groups a script for ?ssblock. Defined here rather than in vendorScripts so thirdPartyScripts
 * can use it without importing the vendor module.
 *
 * 'social' and 'cdn' are the third-party groups; the rest are the repo-local vendor files.
 */
export type BlockKey = 'silent' | 'widget' | 'pixel' | 'social' | 'cdn' | 'threat' | 'rtc';

export interface ScriptSpec {
  /** Element id, also the registry key. */
  id: string;
  src: string;
  /** Defaults to false — see the note in injectScript(). */
  async?: boolean;
  /** Written as data-* attributes; camelCase keys become dash-case. */
  dataset?: Record<string, string>;
  /** Used by vendorScripts/parseBlockParam to simulate a blocked state. */
  blockKey?: BlockKey;
  /**
   * Runs immediately before the element is appended, for tags whose vendor snippet normally
   * executes inline ahead of the external file — Facebook's fbq stub, TikTok's ttq stub. The
   * external file then drains the queue the stub built.
   */
  bootstrap?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

const injected = new Set<string>();

export const isInjected = (id: string): boolean => injected.has(id);

export const injectedIds = (): string[] => Array.from(injected);

/**
 * Appends a <script> to document.body. Returns null if it was already injected.
 *
 * Idempotency is load-bearing, not defensive polish: StrictMode double-invokes effects in
 * dev, and both the app shell and the payment iframe load the same files.
 */
export function injectScript(spec: ScriptSpec): HTMLScriptElement | null {
  if (injected.has(spec.id) || document.getElementById(spec.id)) {
    return null;
  }

  const el = document.createElement('script');
  el.id = spec.id;
  el.src = spec.src;

  // Dynamically created scripts default to async=true, which discards execution order —
  // including the ORDER BY priority that controllers/scriptsUrl.ts computes. async=false
  // preserves insertion order.
  el.async = spec.async ?? false;

  Object.entries(spec.dataset ?? {}).forEach(([key, value]) => {
    el.dataset[key] = value;
  });

  el.onload = () => {
    console.debug('[scripts-loader] loaded', spec.id, spec.src);
    spec.onLoad?.();
  };
  el.onerror = () => {
    console.warn('[scripts-loader] BLOCKED or failed to load:', spec.id, spec.src);
    spec.onError?.();
  };

  // Before append, never after: the queue stub has to exist by the time the external file runs,
  // and a cached script can execute the moment it is in the document.
  if (spec.bootstrap) {
    try {
      spec.bootstrap();
    } catch (err) {
      console.warn('[scripts-loader] bootstrap threw for', spec.id, err);
    }
  }

  document.body.appendChild(el);
  injected.add(spec.id);
  return el;
}
