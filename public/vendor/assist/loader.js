/*
 * Assist SDK — config resolver. Defines window.__ssReadConfig(scriptEl).
 *
 * Resolution order, first hit wins:
 *   1. data-ss-* attributes on the script's own tag
 *   2. data-params='[{"name":..,"value":..}]'
 *   3. query string on the script's own src
 *   4. window.__SAFESAFE_FLAVOR__ (also tried via parent, for framed documents)
 *   5. location.pathname prefix, against the defaults below
 *
 * Layer 5 means session.js / widget.js resolve correctly with no attributes set at all.
 * Both consumers inline a minimal fallback, so either can run without this file present.
 */
(function () {
  'use strict';

  if (window.__ssReadConfig) {
    return;
  }

  var FLAVOR_IDS = ['retail', 'insurance', 'bank', 'healthcare'];

  var DEFAULTS = {
    retail: {
      brand: 'ShopHub',
      bg: '#4f46e5',
      fg: '#ffffff',
      accent: '#f59e0b',
      glyph: '💬',
      title: 'ShopHub Assist',
      subtitle: 'Questions about your order? An advisor is online now.',
      cta: 'Start chat',
      badge: '1',
    },
    insurance: {
      brand: 'SafeTravel Assurance',
      bg: '#0d9488',
      fg: '#ffffff',
      accent: '#f59e0b',
      glyph: '🛡️',
      title: 'SafeTravel Assist',
      subtitle: 'Not sure which cover you need? A licensed agent can help.',
      cta: 'Talk to an agent',
      badge: '1',
    },
    bank: {
      brand: 'Northbank',
      bg: '#1e3a8a',
      fg: '#ffffff',
      accent: '#22c55e',
      glyph: '🔒',
      title: 'Northbank Secure Assist',
      subtitle: 'Questions about this transfer? A specialist is online.',
      cta: 'Start secure chat',
      badge: '1',
    },
    healthcare: {
      brand: 'WellCare Clinic',
      bg: '#0284c7',
      fg: '#ffffff',
      accent: '#14b8a6',
      glyph: '🩺',
      title: 'WellCare Assist',
      subtitle: 'Need help choosing a doctor? Our care team is available.',
      cta: 'Ask the care team',
      badge: '1',
    },
  };

  function isFlavor(value) {
    return typeof value === 'string' && FLAVOR_IDS.indexOf(value) !== -1;
  }

  function sniffFlavorFromPath(pathname) {
    var first = String(pathname || '/')
      .split('/')
      .filter(Boolean)[0];
    return isFlavor(first) ? first : 'retail';
  }

  function readParams(el) {
    var out = {};
    if (!el || !el.dataset || !el.dataset.params) {
      return out;
    }
    try {
      var parsed = JSON.parse(el.dataset.params);
      if (Object.prototype.toString.call(parsed) === '[object Array]') {
        parsed.forEach(function (entry) {
          if (entry && entry.name) {
            out[String(entry.name)] = entry.value;
          }
        });
      }
    } catch (err) {
      /* malformed params must never break rendering */
    }
    return out;
  }

  function readSrcQuery(el) {
    var out = {};
    if (!el || !el.src) {
      return out;
    }
    try {
      var qs = new URL(el.src, window.location.href).searchParams;
      qs.forEach(function (value, key) {
        out[key] = value;
      });
    } catch (err) {
      /* ignore */
    }
    return out;
  }

  function readGlobalFlavor() {
    var candidates = [];
    try {
      candidates.push(window.__SAFESAFE_FLAVOR__);
    } catch (err) {
      /* ignore */
    }
    try {
      if (window.parent && window.parent !== window) {
        candidates.push(window.parent.__SAFESAFE_FLAVOR__);
      }
    } catch (err) {
      /* cross-origin parent throws; expected */
    }
    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];
      if (candidate && isFlavor(candidate.id)) {
        return candidate;
      }
    }
    return null;
  }

  /**
   * @param {HTMLScriptElement|null} scriptEl the consumer's own document.currentScript
   */
  window.__ssReadConfig = function (scriptEl) {
    var data = (scriptEl && scriptEl.dataset) || {};
    var params = readParams(scriptEl);
    var query = readSrcQuery(scriptEl);
    var globalFlavor = readGlobalFlavor();

    function pick() {
      for (var i = 0; i < arguments.length; i += 1) {
        var value = arguments[i];
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
      return undefined;
    }

    var flavor = pick(
      isFlavor(data.ssFlavor) ? data.ssFlavor : undefined,
      isFlavor(params.flavor) ? params.flavor : undefined,
      isFlavor(query.flavor) ? query.flavor : undefined,
      globalFlavor ? globalFlavor.id : undefined,
      sniffFlavorFromPath(window.location.pathname)
    );

    var fallback = DEFAULTS[flavor] || DEFAULTS.retail;
    var globalWidget = (globalFlavor && globalFlavor.scripts && globalFlavor.scripts.widget) || {};

    return {
      flavor: flavor,
      siteId: String(
        pick(
          data.ssSiteId,
          params.siteId,
          query.siteId,
          globalFlavor && globalFlavor.scripts && globalFlavor.scripts.siteId,
          ''
        )
      ),
      ctx: String(pick(data.ssCtx, params.ctx, query.ctx, 'app')),
      variant: String(pick(data.ssVariant, params.variant, query.variant, 'float')),
      debug:
        /(?:^|[?&])ssdebug=1/.test(window.location.search) ||
        (function () {
          try {
            return window.localStorage.getItem('ss:debug') === '1';
          } catch (err) {
            return false;
          }
        })(),
      widget: {
        brand: pick(data.ssBrand, params.brand, query.brand, globalFlavor && globalFlavor.brandName, fallback.brand),
        title: pick(data.ssTitle, params.title, query.title, globalWidget.title, fallback.title),
        subtitle: pick(data.ssSubtitle, params.subtitle, query.subtitle, globalWidget.subtitle, fallback.subtitle),
        cta: pick(data.ssCta, params.cta, query.cta, globalWidget.ctaLabel, fallback.cta),
        badge: pick(data.ssBadge, params.badge, query.badge, globalWidget.badge, fallback.badge),
        bg: pick(data.ssBg, params.bg, query.bg, globalWidget.bg, fallback.bg),
        fg: pick(data.ssFg, params.fg, query.fg, globalWidget.fg, fallback.fg),
        accent: pick(data.ssAccent, params.accent, query.accent, globalWidget.accent, fallback.accent),
        glyph: pick(data.ssGlyph, params.glyph, query.glyph, globalWidget.glyph, fallback.glyph),
      },
    };
  };

  window.__ssReadConfig.FLAVOR_IDS = FLAVOR_IDS;
  window.__ssReadConfig.DEFAULTS = DEFAULTS;
})();
