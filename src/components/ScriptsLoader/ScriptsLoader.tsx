import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useFlavor } from '../../flavors/FlavorContext';
import { injectScript } from '../../scripts/injectScript';
import { buildVendorScriptSpecs, parseBlockParam } from '../../scripts/vendorScripts';
import { buildThirdPartyScriptSpecs } from '../../scripts/thirdPartyScripts';

/**
 * Loads this industry site's scripts on every page, login included — both the repo-local vendor
 * fixtures (scripts/vendorScripts) and the real third-party tags (scripts/thirdPartyScripts).
 *
 * Rendered inside FlavorShell (so it can read the industry config) rather than at the App
 * root, and on every route including login — the login inputs are where the field-access
 * signal matters most, and that route has no Layout.
 *
 * Everything here resolves synchronously from the flavor config: no API call, so a backend
 * or DB failure cannot cost us the scripts, and there is no window in which a script is
 * injected before its identity is known.
 *
 * There is deliberately no cleanup: these scripts must survive client-side navigation. The
 * opposite pattern in ScriptsLoaderPage (script.remove() on unmount) is why scripts used to
 * vanish everywhere except that page. Removing a <script> element does not undo its side
 * effects anyway.
 */
export default function ScriptsLoader() {
  const flavor = useFlavor();
  const { search } = useLocation();
  const blocked = useMemo(() => parseBlockParam(search), [search]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__SAFESAFE_FLAVOR__ = {
      id: flavor.id,
      brandName: flavor.brandName,
      scripts: { widget: flavor.widget },
    };

    // The Reflectiz snippet for THIS site. Its URL identifies the site, so a blocking
    // policy attached to one industry cannot affect the other three.
    if (flavor.reflectizSnippetUrl) {
      injectScript({
        id: 'reflectiz-snippet',
        src: flavor.reflectizSnippetUrl,
        dataset: { ssFlavor: flavor.id },
      });
    }

    // Vendor first, then third party: the vendor loader defines window.__ssReadConfig, and the
    // third-party tags are the noisier ones — a failure there should not delay the fixtures.
    [...buildVendorScriptSpecs(flavor), ...buildThirdPartyScriptSpecs(flavor)].forEach((spec) => {
      if (spec.blockKey && blocked.has(spec.blockKey)) {
        console.warn('[scripts-loader] ?ssblock — skipping injection of', spec.id);
        return;
      }
      injectScript(spec);
    });

    if (!blocked.has('cdn')) {
      // Static Pages build: the script is served from its own origin (safesafe.net) rather than
      // via the backend /api/payment-script signed-GCS indirection, which no longer exists here.
      injectScript({
        id: 'accessing-sensitive-inputs',
        src: 'https://www.safesafe.net/js/accessing-sensitive-inputs.js',
        async: true,
        dataset: { ssFlavor: flavor.id, ssCtx: 'app' },
      });
    }
    // Runs once per full page load: injectScript is idempotent, and re-running on every
    // navigation would only add no-op calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
