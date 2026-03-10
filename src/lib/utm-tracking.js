const STORAGE_KEY = 'star_traffic_source';

/**
 * Captures UTM parameters from URL and/or document.referrer.
 * Call this once on page load. Data is stored in sessionStorage
 * so it persists across page navigations within the same visit.
 */
export function captureTrafficSource() {
  if (typeof window === 'undefined') return;

  // Don't overwrite if already captured this session
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');

  let source = 'Direct';
  let medium = '';
  let campaign = '';

  if (utm_source) {
    source = utm_source;
    medium = utm_medium || '';
    campaign = utm_campaign || '';
  } else {
    // Fallback: detect from document.referrer
    const referrer = document.referrer;
    if (referrer) {
      try {
        const host = new URL(referrer).hostname.toLowerCase();
        if (host.includes('facebook.com') || host.includes('fb.com')) {
          source = 'Facebook';
          medium = 'social';
        } else if (host.includes('instagram.com')) {
          source = 'Instagram';
          medium = 'social';
        } else if (host.includes('google.com') || host.includes('google.co')) {
          source = 'Google';
          medium = 'organic';
        } else if (host.includes('tiktok.com')) {
          source = 'TikTok';
          medium = 'social';
        } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
          source = 'YouTube';
          medium = 'social';
        } else if (host.includes('bing.com')) {
          source = 'Bing';
          medium = 'organic';
        } else if (host.includes('yahoo.com')) {
          source = 'Yahoo';
          medium = 'organic';
        } else if (!host.includes('stareventrentaltx.com')) {
          source = host;
          medium = 'referral';
        }
      } catch {
        // invalid referrer URL, keep as Direct
      }
    }
  }

  const data = { source, medium, campaign };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Returns the captured traffic source data.
 * Returns { source: 'Direct', medium: '', campaign: '' } if nothing captured.
 */
export function getTrafficSource() {
  if (typeof window === 'undefined') {
    return { source: 'Direct', medium: '', campaign: '' };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }

  return { source: 'Direct', medium: '', campaign: '' };
}

/**
 * Returns a human-readable label for the traffic source.
 * Example: "Facebook (social)" or "Google (organic)" or "Direct"
 */
export function getTrafficSourceLabel() {
  const { source, medium, campaign } = getTrafficSource();
  let label = source;
  if (medium) label += ` (${medium})`;
  if (campaign) label += ` — Campaign: ${campaign}`;
  return label;
}
