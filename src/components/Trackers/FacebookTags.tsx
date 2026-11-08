import { useEffect } from 'react';

/**
 * The Facebook assets this site carries, extracted from TrackingProbe so they can also be
 * placed in checkout scope.
 *
 * IMPORTANT about what this does and does not do: the plugin iframes below are served from
 * www.facebook.com, a different origin. Same-origin policy means code inside them cannot read
 * this page's DOM, and this page cannot read theirs. So they CANNOT see the card fields.
 *
 * Their value on a payment page is presence, not access: a third-party frame inside a page
 * that captures cardholder data is itself a finding (PCI DSS 6.4.3 asks you to inventory and
 * justify every script and frame in payment scope), and it attributes to facebook.com.
 *
 * The tag that actually reads the card fields is /vendor/insight/px.js — a script, because
 * scripts execute in the host page's origin and therefore have DOM access.
 */

const facebookLikeUrl = encodeURIComponent('https://example.com/');

/** Plants the Facebook first-party cookie name, readable by any same-origin script. */
export const useFacebookCookie = () => {
  useEffect(() => {
    const has = (name: string) =>
      document.cookie.split(';').some((c) => c.trim().startsWith(`${name}=`));
    if (!has('fr')) {
      const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      document.cookie = `fr=${id}; Max-Age=7776000; Path=/; SameSite=Lax`;
    }
  }, []);
};

interface FacebookTagsProps {
  /** 'full' renders the like button and the video embed; 'compact' only the like button. */
  variant?: 'full' | 'compact';
  className?: string;
}

const facebookVideoUrl = encodeURIComponent(
  'https://www.facebook.com/leomesssiiii.10/videos/bicycle-kick-difficult-but-created-by-manyankara-messi-impossible-once-in-a-life/932217918830748/'
);

const FacebookTags: React.FC<FacebookTagsProps> = ({ variant = 'full', className }) => {
  useFacebookCookie();

  return (
    <div className={className} data-ss-facebook-tags={variant}>
      <iframe
        id="facebook-like-iframe"
        title="Facebook Like Button"
        src={`https://www.facebook.com/plugins/like.php?href=${facebookLikeUrl}&width=180&layout=button_count&action=like&size=small&share=true&height=35`}
        width="180"
        height="35"
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder={0}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
      />

      {variant === 'full' && (
        <div className="relative w-full mt-4" style={{ paddingBottom: '56.25%' }}>
          <iframe
            id="facebook-video-iframe"
            className="absolute top-0 left-0 w-full h-full rounded-lg"
            title="Facebook Video"
            src={`https://www.facebook.com/plugins/video.php?href=${facebookVideoUrl}&show_text=false&width=560`}
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder={0}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default FacebookTags;
