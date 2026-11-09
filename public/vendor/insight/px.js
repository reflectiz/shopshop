/*
 * Insight Pixel — marketing conversion pixel.
 *
 * Shaped like the mainstream social/ad pixels: a queue-style global, standard event names,
 * and a 1x1 GET to a collector with the payload flattened into cd[...] query parameters.
 *
 * The point of this fixture is the PAYMENT PAGE. It is loaded site-wide for PageView and
 * funnel events, and in the payment document it also reads the card fields — which is how
 * marketing tags end up in PCI scope without anyone intending it. A tag added to measure
 * conversions turns out to be able to see the card brand, the expiry and the CVV.
 *
 * BOUNDS — load-bearing, do not relax:
 *   - No raw card number, CVV or cardholder name is captured or transmitted. Card data is
 *     reduced to metadata only: detected brand, digit count, field lengths, expiry.
 *   - The collector host is under .invalid (RFC 2606) and can never resolve. The request and
 *     its parameters are fully visible in DevTools and to a sensor; the data cannot leave
 *     the machine.
 *   - No obfuscation, no eval, no storage writes.
 *
 * Observation: window.__SS_PIXEL__.events() / .card() / .stats(), or the failing collector
 * requests in the Network tab.
 */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var self = document.currentScript;

  if (window.__SS_PIXEL__) {
    return;
  }

  var COLLECTOR = 'https://px.insight-edge.invalid/tr';
  var CARD_FIELDS = ['cardNumber', 'cardName', 'cvv', 'expiryMonth', 'expiryYear'];

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

  var data = (self && self.dataset) || {};
  var pixelId = data.ssPixelId || '1098455213377502';
  var state = { events: [], sent: 0, card: {}, reported: false };

  function log() {
    if (cfg.debug && window.console) {
      console.log.apply(console, ['[ss-pixel]'].concat([].slice.call(arguments)));
    }
  }

  /** Flattens a payload into the cd[key]=value form the mainstream pixels use on the wire. */
  function send(eventName, payload) {
    var qs =
      'id=' + encodeURIComponent(pixelId) +
      '&ev=' + encodeURIComponent(eventName) +
      '&dl=' + encodeURIComponent(window.location.href) +
      '&fl=' + encodeURIComponent(cfg.flavor);

    Object.keys(payload || {}).forEach(function (key) {
      qs += '&cd[' + encodeURIComponent(key) + ']=' + encodeURIComponent(String(payload[key]));
    });

    state.events.push({ t: Date.now(), event: eventName, payload: payload || {} });
    state.sent += 1;

    try {
      var img = new Image(1, 1);
      img.src = COLLECTOR + '?' + qs;
    } catch (err) {
      /* ignore */
    }

    log('tracked', eventName, payload);
  }

  /** Card brand from the leading digits, the way any payment form does it. */
  function detectBrand(digits) {
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    if (/^3(?:0[0-5]|[68])/.test(digits)) return 'diners';
    if (/^35/.test(digits)) return 'jcb';
    return digits ? 'unknown' : '';
  }

  /**
   * Reads the payment form. Values are reduced to metadata HERE and nowhere else — nothing
   * downstream ever receives the raw strings.
   */
  function readCardFields(doc) {
    var get = function (id) {
      var el = doc.getElementById(id);
      return el && typeof el.value === 'string' ? el.value : '';
    };

    var digits = get('cardNumber').replace(/\D/g, '');
    var name = get('cardName');
    var cvv = get('cvv');
    var month = get('expiryMonth');
    var year = get('expiryYear');

    return {
      card_brand: detectBrand(digits),
      card_digits: digits.length,
      card_complete: digits.length >= 13,
      // Expiry alone identifies nobody, and every value on this site is fabricated. The
      // number, name and CVV are still reduced to lengths only.
      card_expiry: month && year ? month + '/' + String(year).slice(-2) : '',
      name_length: name.length,
      cvv_length: cvv.length,
    };
  }

  function watchPaymentForm(doc, label) {
    var form = doc.getElementById('paymentForm');
    if (!form || form.__ssPixelWatched) {
      return;
    }
    form.__ssPixelWatched = true;

    // Delegated, so it covers the fields regardless of when they render.
    doc.addEventListener(
      'input',
      function (event) {
        var el = event.target;
        if (!el || !el.id || CARD_FIELDS.indexOf(el.id) === -1) {
          return;
        }
        state.card = readCardFields(doc);
        // Fire once, as soon as the pixel can tell a real card is being entered — the
        // "AddPaymentInfo" conversion event every ad platform asks for.
        if (state.card.card_complete && !state.reported) {
          state.reported = true;
          send('AddPaymentInfo', {
            card_brand: state.card.card_brand,
            card_digits: state.card.card_digits,
            card_expiry: state.card.card_expiry,
            name_length: state.card.name_length,
            cvv_length: state.card.cvv_length,
            doc: label,
          });
        }
      },
      true
    );

    form.addEventListener(
      'submit',
      function () {
        var snapshot = readCardFields(doc);
        state.card = snapshot;
        send('Purchase', {
          card_brand: snapshot.card_brand,
          card_digits: snapshot.card_digits,
          card_expiry: snapshot.card_expiry,
          cvv_length: snapshot.cvv_length,
          currency: 'USD',
          doc: label,
        });
      },
      true
    );

    send('InitiateCheckout', { doc: label });
    log('watching payment form in', label);
  }

  /**
   * From the parent page the card form lives in an iframe. Its sandbox keeps the origin, so a
   * tag on the parent page reaches straight into the fields — the same path session.js uses.
   */
  function watchPaymentIframe() {
    var attach = function (iframe) {
      if (!iframe || iframe.__ssPixelAttached) {
        return;
      }
      var run = function () {
        try {
          var doc = iframe.contentDocument;
          if (!doc || !doc.getElementById('paymentForm')) {
            return;
          }
          iframe.__ssPixelAttached = true;
          watchPaymentForm(doc, 'payment-iframe');
        } catch (err) {
          /* a cross-origin frame would throw; this one is same-origin */
        }
      };
      iframe.addEventListener('load', run);
      run();
    };

    // The modal now mounts the card form in THIS document, so the same fields are reachable
    // without a frame. Kept alongside the iframe path so payment-demo.html still works direct.
    var attachDoc = function () {
      if (document.getElementById('paymentForm')) {
        watchPaymentForm(document, 'payment-doc');
      }
    };
    attachDoc();

    var existing = document.getElementById('payment-iframe');
    if (existing) {
      attach(existing);
    }
    if (!window.MutationObserver || !document.body) {
      return;
    }
    new MutationObserver(function (mutations) {
      attachDoc();
      for (var i = 0; i < mutations.length; i += 1) {
        var added = mutations[i].addedNodes;
        for (var j = 0; j < added.length; j += 1) {
          var node = added[j];
          if (!node || node.nodeType !== 1) continue;
          if (node.id === 'payment-iframe') {
            attach(node);
          } else if (node.querySelector) {
            var found = node.querySelector('#payment-iframe');
            if (found) attach(found);
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  // ---------------------------------------------------------------------------
  // Public pixel API, mirroring the queue style of the mainstream tags
  // ---------------------------------------------------------------------------
  function ssq(command, arg, payload) {
    ssq.queue.push([command, arg, payload]);
    if (command === 'init') {
      pixelId = String(arg || pixelId);
      return;
    }
    if (command === 'track' || command === 'trackCustom') {
      send(String(arg), payload || {});
    }
  }
  ssq.queue = [];
  ssq.version = VERSION;
  window.ssq = window.ssq || ssq;

  window.__SS_PIXEL__ = {
    version: VERSION,
    pixelId: pixelId,
    flavor: cfg.flavor,
    ctx: cfg.ctx,
    collector: COLLECTOR,
    events: function () {
      if (window.console && console.table) {
        console.table(
          state.events.map(function (e) {
            return {
              event: e.event,
              when: new Date(e.t).toISOString(),
              payload: JSON.stringify(e.payload),
            };
          })
        );
      }
      return state.events;
    },
    /** Last read of the card form — metadata only. */
    card: function () {
      return state.card;
    },
    stats: function () {
      return {
        version: VERSION,
        pixelId: pixelId,
        flavor: cfg.flavor,
        ctx: cfg.ctx,
        sent: state.sent,
        reportedPaymentInfo: state.reported,
      };
    },
  };

  document.documentElement.setAttribute('data-ss-pixel', '1');

  if (window.console) {
    console.info(
      '[ss-pixel] v' + VERSION + ' id=' + pixelId + ' flavor=' + cfg.flavor + ' ctx=' + cfg.ctx +
        ' — window.__SS_PIXEL__.events()'
    );
  }

  send('PageView', { ctx: cfg.ctx });

  if (cfg.ctx === 'payment') {
    // Loaded inside the payment document itself.
    if (document.getElementById('paymentForm')) {
      watchPaymentForm(document, 'payment-doc');
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        watchPaymentForm(document, 'payment-doc');
      });
    }
  } else {
    watchPaymentIframe();
  }
})();
