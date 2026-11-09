import { FlavorConfig } from '../flavors/types';
import { BlockKey, ScriptSpec } from './injectScript';

/**
 * The vendor scripts present on every page of every industry site.
 *
 * They are repo-local, same-origin static files (frontend/public/vendor/assist/), which is
 * what lets them work with zero Reflectiz DB connectivity. The DB-driven list from
 * GET /api/scriptsUrl/:siteId is additive on top, never a prerequisite.
 *
 * Naming note: no path here contains "analytics", "collect", "telemetry", "beacon" or
 * "track". Those shapes are on EasyPrivacy-style filter lists, so anyone running uBlock or
 * Brave shields would see the blocked state without a policy doing anything.
 */

export const VENDOR_SCRIPT_BASE = '/vendor/assist';
/** The conversion pixel lives on its own path so it can be blocked independently. */
export const PIXEL_SCRIPT_BASE = '/vendor/insight';

export function buildVendorScriptSpecs(flavor: FlavorConfig): ScriptSpec[] {
  const shared = { ssFlavor: flavor.id, ssCtx: 'app' };
  const { widget } = flavor;

  return [
    // loader.js first: it defines window.__ssReadConfig, which the other two prefer over
    // their inlined fallbacks. async=false in the injector preserves that order.
    {
      id: 'ss-loader',
      src: `${VENDOR_SCRIPT_BASE}/loader.js`,
      dataset: shared,
    },
    {
      id: 'ss-session',
      src: `${VENDOR_SCRIPT_BASE}/session.js`,
      blockKey: 'silent',
      dataset: shared,
    },
    {
      id: 'ss-widget',
      src: `${VENDOR_SCRIPT_BASE}/widget.js`,
      blockKey: 'widget',
      dataset: {
        ...shared,
        ssVariant: 'float',
        ssBrand: flavor.brandName,
        ssTitle: widget.title,
        ssSubtitle: widget.subtitle,
        ssCta: widget.ctaLabel,
        ssBadge: widget.badge,
        ssBg: widget.bg,
        ssFg: widget.fg,
        ssAccent: widget.accent,
        ssGlyph: widget.glyph,
      },
    },
    {
      id: 'ss-pixel',
      src: `${PIXEL_SCRIPT_BASE}/px.js`,
      blockKey: 'pixel',
      dataset: shared,
    },
    {
      id: 'ss-rtc',
      src: `${VENDOR_SCRIPT_BASE}/rtc.js`,
      blockKey: 'rtc',
      dataset: shared,
    },
  ];
}

/** Re-exported so existing importers of BlockKey from this module keep working. */
export type { BlockKey };

/**
 * Every group ?ssblock=all covers.
 *
 * Derived from a Record keyed by BlockKey rather than written as an array literal, so adding a
 * key to the union without listing it here is a compile error instead of a group that silently
 * stops being blocked by ?ssblock=all.
 */
const ALL_BLOCK_KEYS = Object.keys({
  silent: true,
  widget: true,
  pixel: true,
  social: true,
  cdn: true,
  threat: true,
  rtc: true,
} satisfies Record<BlockKey, true>) as BlockKey[];

/**
 * Parses ?ssblock=widget|silent|pixel|social|cdn|threat|rtc|all (or =1, equivalent to all), so the
 * blocked state can be screenshotted and scripted before a real policy is wired.
 *
 * Be clear about what this is: it SKIPS injection, it does not block a request. DevTools
 * request blocking on the /vendor/assist/ path is the truthful method, because it proves
 * nothing in the app is conditionally hiding anything.
 */
export function parseBlockParam(search: string): Set<BlockKey> {
  const blocked = new Set<BlockKey>();
  const raw = new URLSearchParams(search).get('ssblock');
  if (!raw) {
    return blocked;
  }
  raw
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .forEach((token) => {
      if (token === 'all' || token === '1' || token === 'true') {
        ALL_BLOCK_KEYS.forEach((key) => blocked.add(key));
      } else if (token === 'silent' || token === 'session') {
        blocked.add('silent');
      } else if (token === 'widget' || token === 'assist') {
        blocked.add('widget');
      } else if (token === 'pixel') {
        blocked.add('pixel');
      } else if (token === 'social') {
        blocked.add('social');
      } else if (token === 'cdn') {
        blocked.add('cdn');
      } else if (token === 'threat' || token === 'malware') {
        blocked.add('threat');
      } else if (token === 'rtc' || token === 'webrtc') {
        blocked.add('rtc');
      }
    });
  return blocked;
}
