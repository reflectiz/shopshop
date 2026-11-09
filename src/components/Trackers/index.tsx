import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import FacebookTags from './FacebookTags';
import { injectScript } from '../../scripts/injectScript';
import { parseBlockParam } from '../../scripts/vendorScripts';

const videoId = 'mMiL4_1Yewg';
const tiktokVideoUrl = 'https://www.tiktok.com/@cr7skills17/video/7599177249929055543';

export const TrackingProbe = () => {
  const { search } = useLocation();
  const blocked = useMemo(() => parseBlockParam(search), [search]);
  useEffect(() => {
    // Performance/Analytics cookies with well-known names (recognized by most scanners/CMPs incl. OneTrust)
    const has = (name: string) =>
      document.cookie.split(';').some((c) => c.trim().startsWith(`${name}=`));

    // Google Analytics-style cookies
    if (!has('_ga')) {
      // GA cookie format is typically GA1.1.<clientId>.<timestamp>
      const clientId = `${Math.floor(Math.random() * 1e10)}.${Math.floor(Date.now() / 1000)}`;
      document.cookie = `_ga=GA1.1.${clientId}; Max-Age=63072000; Path=/; SameSite=Lax`;
    }
    if (!has('_gid')) {
      document.cookie = `_gid=GA1.2.${Math.floor(Math.random() * 1e10)}.${Math.floor(
        Date.now() / 1000
      )}; Max-Age=86400; Path=/; SameSite=Lax`;
    }
    if (!has('_gat')) {
      document.cookie = `_gat=1; Max-Age=60; Path=/; SameSite=Lax`;
    }

    // Microsoft Clarity-style cookies
    if (!has('_clck')) {
      document.cookie = `_clck=${Math.random().toString(36).slice(2)}|1|${Math.floor(
        Date.now() / 1000
      )}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }
    if (!has('_clsk')) {
      document.cookie = `_clsk=${Math.random().toString(36).slice(2)}|${Math.floor(
        Date.now() / 1000
      )}|1|1; Max-Age=3600; Path=/; SameSite=Lax`;
    }

    // Bizible / Adobe Marketo Measure cookies
    const bizId = Math.random().toString(36).slice(2) + Date.now().toString(36);

    // Facebook-style cookie (first-party copy for scanning/demo)
    if (!has('fr')) {
      document.cookie = `fr=${bizId}; Max-Age=7776000; Path=/; SameSite=Lax`;
    }
    if (!has('_biz_uid')) {
      document.cookie = `_biz_uid=${bizId}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }
    if (!has('_biz_nA')) {
      document.cookie = `_biz_nA=1; Max-Age=31536000; Path=/; SameSite=Lax`;
    }
    if (!has('_biz_flagsA')) {
      document.cookie = `_biz_flagsA=0x01; Max-Age=31536000; Path=/; SameSite=Lax`;
    }
    if (!has('_biz_pendingA')) {
      document.cookie = `_biz_pendingA=; Max-Age=31536000; Path=/; SameSite=Lax`;
    }
  }, []);

  /**
   * Both embed loaders go through injectScript rather than a hand-rolled createElement.
   *
   * That is the whole point of the change: index.html loads OneTrust's OtAutoBlock.js and scans
   * run with acceptCookies:false, so an uncategorised third-party script gets rewritten to
   * type="text/plain" and never executes — which is why tiktok.com and linkedin.com were absent
   * from the scan results entirely. injectScript sets data-ot-ignore, which opts out.
   *
   * (The old LinkedIn loader also set s.text alongside s.src. That is a no-op: the inline body of
   * a script with a src is ignored, so the intended 'lang: en_US' config never applied.)
   *
   * ?ssblock is applied here rather than relying on spec.blockKey: injectScript does not read
   * blockKey, ScriptsLoader does. Setting the field without checking it would leave ?ssblock=all
   * half-blocked — pixels skipped, these two still loading.
   */
  useEffect(() => {
    if (blocked.has('social')) {
      console.warn('[trackers] ?ssblock=social — skipping the TikTok and LinkedIn embed scripts');
      return;
    }
    injectScript({
      id: 'tiktok-embed-script',
      src: 'https://www.tiktok.com/embed.js',
      async: true,
    });
    injectScript({
      id: 'linkedin-platform-script',
      src: 'https://platform.linkedin.com/in.js',
      async: true,
    });
    // Runs once per full page load, matching ScriptsLoader: injectScript is idempotent and the
    // block param cannot change without a navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="mt-4 w-full flex justify-center">
        <blockquote
          className="tiktok-embed"
          cite={tiktokVideoUrl}
          data-video-id="7599177249929055543"
          style={{ maxWidth: 605, minWidth: 325 }}
        >
          <section>
            <a target="_blank" rel="noreferrer" href={tiktokVideoUrl}>
              TikTok video
            </a>
          </section>
        </blockquote>
      </div>
      <div className="relative w-full" style={{ paddingBottom: '30.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
      {/* Extracted so the same Facebook assets can also be placed in checkout scope. */}
      <FacebookTags variant="full" />

      {/* Functional: Google Maps — sets NID, CONSENT, etc. on .google.com */}
      <iframe
        title="Google Maps"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019394744146!2d-122.41941868468176!3d37.77492977975892!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c5b5f3b1d%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000"
        width="100%"
        height="300"
        style={{ border: 0, borderRadius: 8 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />

      {/* Performance: Vimeo embed — sets vuid, player cookies on .vimeo.com */}
      <div className="relative w-full mt-4" style={{ paddingBottom: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          title="Vimeo Video"
          src="https://player.vimeo.com/video/76979871?h=8272103f6e"
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Social Media: LinkedIn share + follow — sets bcookie, li_sugr, lidc, UserMatchHistory, AnalyticsSyncHistory, lang on .linkedin.com */}
      <iframe
        title="LinkedIn Share"
        src="https://www.linkedin.com/embed/feed/update/urn:li:activity:7442175155172302849"
        width="100%"
        height="400"
        className="mt-4 rounded-lg"
        frameBorder={0}
        allowFullScreen
      />

      {/* Performance: Spotify embed — sets sp_t, sp_landing cookies on .spotify.com */}
      <iframe
        className="mt-4 rounded-lg"
        title="Spotify Track"
        src="https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT"
        width="100%"
        height="152"
        frameBorder={0}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />

      {/* Performance: Bizible / Adobe Marketo Measure — third-party iframe request */}
      <iframe
        title="Bizible Pixel (iframe)"
        src="https://cdn.bizible.com/m/ipv"
        width="1"
        height="1"
        style={{ display: 'none' }}
        frameBorder={0}
      />
    </>
  );
};
