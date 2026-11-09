import { FlavorConfig } from '../flavors/types';
import { ScriptSpec } from './injectScript';

export const FACEBOOK_PIXEL_ID = '0000000000000000';
export const TIKTOK_PIXEL_ID = 'CD9079RC77U0N3GBV16Y';

const JSDELIVR = 'https://cdn.jsdelivr.net/npm';

const VULNERABLE_LIBS: { id: string; src: string; note: string }[] = [
  {
    id: 'lib-handlebars',
    src: `${JSDELIVR}/handlebars@4.0.5/dist/handlebars.min.js`,
    note: 'CVE-2019-19919 prototype pollution, CVSS 9.8 — expect rule 44 High',
  },
  {
    id: 'lib-lodash',
    src: `${JSDELIVR}/lodash@4.17.10/lodash.min.js`,
    note: 'CVE-2019-10744 prototype pollution, CVSS 9.1 — expect rule 44 High',
  },
  {
    id: 'lib-jquery',
    src: `${JSDELIVR}/jquery@1.12.4/dist/jquery.min.js`,
    note: 'CVE-2020-11022/11023, CVE-2019-11358 — max CVSS ~6.1, expect rule 44 Medium',
  },
];

const OPEN_CDN_SCRIPT_URL = String(import.meta.env.VITE_OPEN_CDN_SCRIPT_URL ?? '').trim();

const FLAGGED_TEST_DOMAIN_URL = 'https://malware.wicar.org/';

type Win = Record<string, unknown> & typeof globalThis;

function bootstrapFacebookPixel(): void {
  const w = window as unknown as Win;
  if (w.fbq) {
    return;
  }

  const fbq = function (this: unknown, ...args: unknown[]) {
    const self = fbq as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[][] };
    if (self.callMethod) {
      self.callMethod.apply(self, args);
    } else {
      self.queue.push(args);
    }
  } as unknown as Record<string, unknown>;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  w.fbq = fbq;
  w._fbq = fbq;

  (fbq as unknown as (...a: unknown[]) => void)('init', FACEBOOK_PIXEL_ID);
  (fbq as unknown as (...a: unknown[]) => void)('track', 'PageView');
}

function bootstrapTikTokPixel(): void {
  const w = window as unknown as Win;
  if (w.ttq) {
    return;
  }

  w.TiktokAnalyticsObject = 'ttq';

  const ttq = [] as unknown as unknown[] & Record<string, unknown>;
  ttq.methods = [
    'page',
    'track',
    'identify',
    'instances',
    'debug',
    'on',
    'off',
    'once',
    'ready',
    'alias',
    'group',
    'enableCookie',
    'disableCookie',
  ];
  ttq.setAndDefer = function (target: Record<string, unknown>, method: string) {
    target[method] = function (...args: unknown[]) {
      (target as unknown as unknown[][]).push([method, ...args] as unknown as unknown[]);
    };
  };
  (ttq.methods as string[]).forEach((method) => {
    (ttq.setAndDefer as (t: unknown, m: string) => void)(ttq, method);
  });

  const url = 'https://analytics.tiktok.com/i18n/pixel/events.js';
  ttq._i = { [TIKTOK_PIXEL_ID]: Object.assign([] as unknown[], { _u: url }) };
  ttq._t = { [TIKTOK_PIXEL_ID]: Date.now() };
  ttq._o = { [TIKTOK_PIXEL_ID]: {} };

  w.ttq = ttq;

  (ttq.page as () => void)();
}

export function buildThirdPartyScriptSpecs(flavor: FlavorConfig): ScriptSpec[] {
  const shared = { ssFlavor: flavor.id, ssCtx: 'app' };
  const specs: ScriptSpec[] = [
    {
      id: 'fb-pixel',
      src: 'https://connect.facebook.net/en_US/fbevents.js',
      async: true,
      blockKey: 'social',
      bootstrap: bootstrapFacebookPixel,
      dataset: { ...shared, ssPixelId: FACEBOOK_PIXEL_ID },
    },
    {
      id: 'tiktok-pixel',
      src: `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${TIKTOK_PIXEL_ID}&lib=ttq`,
      async: true,
      blockKey: 'social',
      bootstrap: bootstrapTikTokPixel,
      dataset: { ...shared, ssPixelId: TIKTOK_PIXEL_ID },
    },
  ];

  if (OPEN_CDN_SCRIPT_URL) {
    specs.push({
      id: 'open-cdn-formsight',
      src: OPEN_CDN_SCRIPT_URL,
      blockKey: 'cdn',
      dataset: shared,
    });
  } else {
    console.warn(
      '[scripts-loader] VITE_OPEN_CDN_SCRIPT_URL is unset — the open-CDN app is NOT loaded, so no ' +
        'rule 8 finding will attribute to a CDN. See frontend/cdn-app/README.md.'
    );
  }

  VULNERABLE_LIBS.forEach((lib) => {
    specs.push({ id: lib.id, src: lib.src, async: true, blockKey: 'cdn', dataset: shared });
  });

  specs.push({
    id: 'threat-wicar',
    src: FLAGGED_TEST_DOMAIN_URL,
    async: true,
    blockKey: 'threat',
    dataset: shared,
  });

  return specs;
}
