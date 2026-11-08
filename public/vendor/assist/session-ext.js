/*
 * Assist SDK — session extension.
 *
 * Loaded at runtime by session.js via document.createElement('script'), so the page's script
 * inventory shows a script that pulled in another script. Sets a global and logs one line;
 * no listeners, no network, no storage access.
 */
(function () {
  'use strict';

  var self = document.currentScript;
  var data = (self && self.dataset) || {};

  window.__SS_SESSION_EXT__ = {
    version: '1.0.0',
    loadedAt: Date.now(),
    flavor: data.ssFlavor || '',
    siteId: data.ssSiteId || '',
    ctx: data.ssCtx || '',
  };

  if (window.console) {
    console.info(
      '[ss-session-ext] v1.0.0 loaded — chained from session.js (flavor=' + (data.ssFlavor || '?') + ')'
    );
  }
})();
