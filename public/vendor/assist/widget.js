/*
 * Assist SDK — widget module. Renders the Assist launcher.
 *
 * Two variants, selected by data-ss-variant / ?variant=:
 *   float  (default) — launcher bubble, bottom-right, site-wide
 *   inline           — trust row above #payment-submit-button in the payment document
 *
 * Styling is inline rather than class-based: Tailwind is compiled from the app's TSX
 * sources, so class names referenced only from a file under public/ are absent from the CSS
 * bundle and would render unstyled.
 *
 * Renders into document.body, outside #root, so React reconciliation cannot remove it and it
 * persists across client-side navigation. That is also why this is a script and not a React
 * component: it needs its own individually blockable URL, and a React-rendered element would
 * survive a script block, which would defeat the point.
 *
 * Observation: window.__SS_ASSIST__, or #safesafe-assist / #safesafe-assist-inline.
 */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var self = document.currentScript;

  var FLOAT_ID = 'safesafe-assist';
  var INLINE_ID = 'safesafe-assist-inline';

  if (window.__SS_ASSIST__ || document.getElementById(FLOAT_ID) || document.getElementById(INLINE_ID)) {
    return;
  }

  var cfg =
    typeof window.__ssReadConfig === 'function'
      ? window.__ssReadConfig(self)
      : (function () {
          var first = window.location.pathname.split('/').filter(Boolean)[0];
          var known = ['retail', 'insurance', 'bank', 'healthcare'];
          return {
            flavor: known.indexOf(first) !== -1 ? first : 'retail',
            siteId: '',
            variant: 'float',
            widget: {
              brand: 'SafeSafe',
              title: 'SafeSafe Assist',
              subtitle: 'Questions? An advisor is online now.',
              cta: 'Start chat',
              badge: '1',
              bg: '#4f46e5',
              fg: '#ffffff',
              accent: '#f59e0b',
              glyph: '💬',
            },
          };
        })();

  var widget = cfg.widget;
  var root = null;
  var panelOpen = false;

  function css(el, styles) {
    Object.keys(styles).forEach(function (key) {
      el.style.setProperty(key, styles[key]);
    });
    return el;
  }

  function el(tag, id, styles, text) {
    var node = document.createElement(tag);
    if (id) {
      node.id = id;
    }
    if (styles) {
      css(node, styles);
    }
    if (text !== undefined) {
      node.textContent = text;
    }
    return node;
  }

  var FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  // The consent banner sits at the bottom of the viewport and would cover a bottom-right
  // launcher. A covered widget reads as "already blocked", so measure it and sit above it.
  function bannerOffset() {
    var banner =
      document.getElementById('onetrust-banner-sdk') || document.getElementById('onetrust-consent-sdk');
    if (!banner) {
      return 20;
    }
    var rect = banner.getBoundingClientRect();
    if (!rect.height || rect.top > window.innerHeight - 8) {
      return 20;
    }
    return Math.round(rect.height) + 32;
  }

  function applyOffset() {
    if (root && cfg.variant !== 'inline') {
      root.style.setProperty('bottom', bannerOffset() + 'px');
    }
  }

  function buildFloat() {
    root = el('div', FLOAT_ID, {
      position: 'fixed',
      right: '20px',
      bottom: bannerOffset() + 'px',
      'z-index': '2147483000',
      font: '14px/1.45 ' + FONT,
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'flex-end',
      gap: '10px',
    });
    root.setAttribute('data-ss-flavor', cfg.flavor);
    root.setAttribute('data-ss-variant', 'float');
    root.setAttribute('data-ss-site-id', cfg.siteId || '');
    root.setAttribute('role', 'complementary');
    root.setAttribute('aria-label', widget.title);

    var panel = el('div', 'safesafe-assist-panel', {
      width: '300px',
      background: '#ffffff',
      color: '#111827',
      'border-radius': '14px',
      'box-shadow': '0 18px 45px rgba(15, 23, 42, 0.22)',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      overflow: 'hidden',
      display: 'none',
    });

    var header = el('div', null, {
      background: widget.bg,
      color: widget.fg,
      padding: '14px 16px',
    });
    header.appendChild(
      el('div', 'safesafe-assist-title', { 'font-weight': '600', 'font-size': '15px' }, widget.title)
    );
    header.appendChild(
      el('div', 'safesafe-assist-brand', { 'font-size': '11px', opacity: '0.85', 'margin-top': '2px' }, widget.brand)
    );
    panel.appendChild(header);

    var body = el('div', null, { padding: '14px 16px' });
    body.appendChild(
      el('div', 'safesafe-assist-subtitle', { color: '#4b5563', 'font-size': '13px' }, widget.subtitle)
    );

    var cta = el(
      'button',
      'safesafe-assist-cta',
      {
        'margin-top': '12px',
        width: '100%',
        background: widget.bg,
        color: widget.fg,
        border: '0',
        'border-radius': '9px',
        padding: '10px 12px',
        'font-size': '14px',
        'font-weight': '600',
        cursor: 'pointer',
        font: '600 14px ' + FONT,
      },
      widget.cta
    );
    cta.type = 'button';
    cta.addEventListener('click', function () {
      var note = document.getElementById('safesafe-assist-note');
      if (note) {
        note.textContent = 'No agents are available right now.';
        note.style.setProperty('color', widget.bg);
      }
    });
    body.appendChild(cta);
    body.appendChild(
      el(
        'div',
        'safesafe-assist-note',
        { 'margin-top': '10px', 'font-size': '11px', color: '#9ca3af', 'text-align': 'center' },
        'Powered by SafeSafe Assist'
      )
    );
    panel.appendChild(body);
    root.appendChild(panel);

    var button = el('button', 'safesafe-assist-button', {
      position: 'relative',
      width: '56px',
      height: '56px',
      'border-radius': '50%',
      background: widget.bg,
      color: widget.fg,
      border: '0',
      'box-shadow': '0 10px 25px rgba(15, 23, 42, 0.28)',
      cursor: 'pointer',
      'font-size': '24px',
      display: 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      transition: 'transform 0.15s ease',
    });
    button.type = 'button';
    button.textContent = widget.glyph;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', widget.title);
    button.setAttribute('title', widget.title);

    if (widget.badge) {
      button.appendChild(
        el(
          'span',
          'safesafe-assist-badge',
          {
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            'min-width': '20px',
            height: '20px',
            padding: '0 5px',
            'border-radius': '10px',
            background: widget.accent,
            color: '#111827',
            'font-size': '11px',
            'font-weight': '700',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'box-sizing': 'border-box',
          },
          String(widget.badge)
        )
      );
    }

    button.addEventListener('mouseenter', function () {
      button.style.setProperty('transform', 'scale(1.06)');
    });
    button.addEventListener('mouseleave', function () {
      button.style.setProperty('transform', 'scale(1)');
    });
    button.addEventListener('click', function () {
      panelOpen = !panelOpen;
      panel.style.setProperty('display', panelOpen ? 'block' : 'none');
      button.setAttribute('aria-expanded', panelOpen ? 'true' : 'false');
    });

    root.appendChild(button);
    document.body.appendChild(root);

    window.addEventListener('resize', applyOffset);
    // The consent banner appears asynchronously; re-measure rather than depending on its DOM.
    setTimeout(applyOffset, 1200);
    setTimeout(applyOffset, 3500);
  }

  function buildInline() {
    var submit = document.getElementById('payment-submit-button');
    if (!submit || !submit.parentNode) {
      return false;
    }

    root = el('div', INLINE_ID, {
      display: 'flex',
      'align-items': 'center',
      gap: '10px',
      margin: '18px 0 0',
      padding: '11px 14px',
      'border-radius': '10px',
      background: 'rgba(15, 23, 42, 0.035)',
      border: '1px solid rgba(15, 23, 42, 0.08)',
      font: '13px/1.4 ' + FONT,
      color: '#374151',
    });
    root.setAttribute('data-ss-flavor', cfg.flavor);
    root.setAttribute('data-ss-variant', 'inline');
    root.setAttribute('data-ss-site-id', cfg.siteId || '');

    root.appendChild(
      el(
        'span',
        'safesafe-assist-inline-glyph',
        {
          width: '26px',
          height: '26px',
          'border-radius': '50%',
          background: widget.bg,
          color: widget.fg,
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'font-size': '14px',
          'flex-shrink': '0',
        },
        '🔒'
      )
    );

    var text = el('div', null, { flex: '1' });
    text.appendChild(
      el(
        'div',
        'safesafe-assist-inline-title',
        { 'font-weight': '600', color: '#111827' },
        'Verified by ' + widget.title
      )
    );
    text.appendChild(
      el(
        'div',
        'safesafe-assist-inline-subtitle',
        { 'font-size': '11.5px', color: '#6b7280', 'margin-top': '1px' },
        'This transaction is monitored for fraud.'
      )
    );
    root.appendChild(text);

    submit.parentNode.insertBefore(root, submit);
    return true;
  }

  function render() {
    if (cfg.variant === 'inline') {
      if (!buildInline()) {
        document.addEventListener('DOMContentLoaded', buildInline);
      }
      return;
    }
    if (document.body) {
      buildFloat();
    } else {
      document.addEventListener('DOMContentLoaded', buildFloat);
    }
  }

  window.__SS_ASSIST__ = {
    version: VERSION,
    flavor: cfg.flavor,
    siteId: cfg.siteId,
    variant: cfg.variant,
    get el() {
      return document.getElementById(FLOAT_ID) || document.getElementById(INLINE_ID);
    },
    /** Restyle in place when a client-side navigation crosses an industry boundary. */
    setFlavor: function (next) {
      if (!next || !next.id || next.id === cfg.flavor) {
        return;
      }
      var nextWidget = (next.scripts && next.scripts.widget) || {};
      var defaults =
        (window.__ssReadConfig && window.__ssReadConfig.DEFAULTS && window.__ssReadConfig.DEFAULTS[next.id]) || {};
      cfg.flavor = next.id;
      widget = {
        brand: next.brandName || nextWidget.brand || defaults.brand || widget.brand,
        title: nextWidget.title || defaults.title || widget.title,
        subtitle: nextWidget.subtitle || defaults.subtitle || widget.subtitle,
        cta: nextWidget.ctaLabel || defaults.cta || widget.cta,
        badge: nextWidget.badge || defaults.badge || widget.badge,
        bg: nextWidget.bg || defaults.bg || widget.bg,
        fg: nextWidget.fg || defaults.fg || widget.fg,
        accent: nextWidget.accent || defaults.accent || widget.accent,
        glyph: nextWidget.glyph || defaults.glyph || widget.glyph,
      };
      var existing = document.getElementById(FLOAT_ID) || document.getElementById(INLINE_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      root = null;
      panelOpen = false;
      render();
    },
    remove: function () {
      var existing = document.getElementById(FLOAT_ID) || document.getElementById(INLINE_ID);
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
      }
      root = null;
    },
  };

  render();

  if (window.console) {
    console.info('[ss-assist] v' + VERSION + ' flavor=' + cfg.flavor + ' variant=' + cfg.variant);
  }
})();
