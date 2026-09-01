import { validateUrlForSSRF } from './ssrf';

export interface ExtractedMetadata {
  platform: 'website' | 'instagram' | 'x';
  title: string;
  description: string;
  image: string | null;
  logo: string;
  domain: string;
  canonicalUrl: string;
  siteName: string;
  handle?: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  isFallback: boolean;
  errorNotice?: string;
}

interface CachedItem {
  data: ExtractedMetadata;
  timestamp: number;
}

const METADATA_CACHE = new Map<string, CachedItem>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in-memory cache

function cleanText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveUrl(relativeOrAbsolute: string, baseUrl: string): string {
  try {
    return new URL(relativeOrAbsolute, baseUrl).toString();
  } catch {
    return relativeOrAbsolute;
  }
}

/**
 * Normalize and detect destination platform (Website, Instagram, or X)
 */
export function parseDestinationInput(input: string): {
  platform: 'website' | 'instagram' | 'x';
  normalizedUrl: string;
  handle?: string;
  domain: string;
} {
  const clean = input.trim();

  // Check Instagram @handle
  if (clean.startsWith('@') && !clean.includes('.')) {
    const handle = clean.replace(/^@+/, '');
    return {
      platform: 'instagram',
      handle,
      domain: 'instagram.com',
      normalizedUrl: `https://instagram.com/${handle}`,
    };
  }

  // Check URLs
  let rawUrl = clean;
  if (!/^https?:\/\//i.test(rawUrl)) {
    rawUrl = `https://${rawUrl}`;
  }

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    // Instagram check
    if (host.includes('instagram.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const handle = parts[0] || 'profile';
      return {
        platform: 'instagram',
        handle: handle.replace(/^@/, ''),
        domain: 'instagram.com',
        normalizedUrl: `https://instagram.com/${handle.replace(/^@/, '')}`,
      };
    }

    // X / Twitter check
    if (host.includes('x.com') || host.includes('twitter.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const handle = parts[0] || 'profile';
      return {
        platform: 'x',
        handle: handle.replace(/^@/, ''),
        domain: 'x.com',
        normalizedUrl: `https://x.com/${handle.replace(/^@/, '')}`,
      };
    }

    // Standard Website
    return {
      platform: 'website',
      domain: host,
      normalizedUrl: parsed.origin + parsed.pathname,
    };
  } catch {
    // Handle fallback if URL parse fails
    if (clean.startsWith('@')) {
      const handle = clean.slice(1);
      return {
        platform: 'x',
        handle,
        domain: 'x.com',
        normalizedUrl: `https://x.com/${handle}`,
      };
    }
    const host = clean.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return {
      platform: 'website',
      domain: host || 'website.com',
      normalizedUrl: `https://${host || 'website.com'}`,
    };
  }
}

/**
 * Fetch and parse permitted public metadata for Websites, Instagram & X
 */
export async function fetchAndExtractMetadata(targetInput: string): Promise<ExtractedMetadata> {
  const parsedDest = parseDestinationInput(targetInput);
  const cacheKey = parsedDest.normalizedUrl.toLowerCase();

  // Check In-Memory Cache
  const cached = METADATA_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Handle Instagram Platform Fallback
  if (parsedDest.platform === 'instagram') {
    const handle = parsedDest.handle || 'user';
    const metadata: ExtractedMetadata = {
      platform: 'instagram',
      handle,
      title: `${handle}`,
      description: `Instagram profile (@${handle}).`,
      image: `https://api.dicebear.com/7.x/identicon/svg?seed=instagram_${handle}`,
      logo: `https://api.dicebear.com/7.x/identicon/svg?seed=instagram_${handle}`,
      domain: 'instagram.com',
      canonicalUrl: `https://instagram.com/${handle}`,
      siteName: 'Instagram',
      socialLinks: { instagram: `https://instagram.com/${handle}` },
      isFallback: false,
    };
    METADATA_CACHE.set(cacheKey, { data: metadata, timestamp: Date.now() });
    return metadata;
  }

  // Handle X / Twitter Platform Fallback
  if (parsedDest.platform === 'x') {
    const handle = parsedDest.handle || 'user';
    const metadata: ExtractedMetadata = {
      platform: 'x',
      handle,
      title: `@${handle}`,
      description: `X profile (@${handle}).`,
      image: `https://api.dicebear.com/7.x/identicon/svg?seed=x_${handle}`,
      logo: `https://api.dicebear.com/7.x/identicon/svg?seed=x_${handle}`,
      domain: 'x.com',
      canonicalUrl: `https://x.com/${handle}`,
      siteName: 'X',
      socialLinks: { twitter: `https://x.com/${handle}` },
      isFallback: false,
    };
    METADATA_CACHE.set(cacheKey, { data: metadata, timestamp: Date.now() });
    return metadata;
  }

  // Handle Standard Website Metadata Extraction
  let hostname = parsedDest.domain;
  let safeTargetUrl = parsedDest.normalizedUrl;

  try {
    const ssrfCheck = await validateUrlForSSRF(parsedDest.normalizedUrl);
    hostname = ssrfCheck.hostname;
    safeTargetUrl = ssrfCheck.safeUrl;
  } catch {
    const fallbackMeta: ExtractedMetadata = {
      platform: 'website',
      title: hostname,
      description: 'Preview unavailable',
      image: null,
      logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(hostname)}`,
      domain: hostname,
      canonicalUrl: safeTargetUrl,
      siteName: hostname,
      socialLinks: {},
      isFallback: true,
      errorNotice: 'Preview unavailable',
    };
    METADATA_CACHE.set(cacheKey, { data: fallbackMeta, timestamp: Date.now() });
    return fallbackMeta;
  }

  const defaultLogo = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(hostname)}`;
  const faviconIco = `https://${hostname}/favicon.ico`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const response = await fetch(safeTargetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) InBidBot/1.0 (+https://inbid.site)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      const fallbackData: ExtractedMetadata = {
        platform: 'website',
        title: hostname,
        description: 'Preview unavailable',
        image: null,
        logo: faviconIco,
        domain: hostname,
        canonicalUrl: safeTargetUrl,
        siteName: hostname,
        socialLinks: {},
        isFallback: true,
      };
      METADATA_CACHE.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
      return fallbackData;
    }

    const htmlText = await response.text();
    const truncatedHtml = htmlText.slice(0, 1024 * 1024);

    // Extract Title (Priority: og:title -> <title> -> hostname)
    let title = '';
    const ogTitleMatch = truncatedHtml.match(/<meta\s+[^>]*property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                        truncatedHtml.match(/<meta\s+[^>]*content=["']([^"']+)["']\s+property=["']og:title["']/i);
    if (ogTitleMatch) title = cleanText(ogTitleMatch[1]);

    if (!title) {
      const titleMatch = truncatedHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) title = cleanText(titleMatch[1]);
    }
    if (!title) title = hostname;

    // Extract Description (Priority: og:description -> meta description -> fallback)
    let description = '';
    const ogDescMatch = truncatedHtml.match(/<meta\s+[^>]*property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                       truncatedHtml.match(/<meta\s+[^>]*content=["']([^"']+)["']\s+property=["']og:description["']/i);
    if (ogDescMatch) description = cleanText(ogDescMatch[1]);

    if (!description) {
      const metaDescMatch = truncatedHtml.match(/<meta\s+[^>]*name=["']description["']\s+content=["']([^"']+)["']/i) ||
                          truncatedHtml.match(/<meta\s+[^>]*content=["']([^"']+)["']\s+name=["']description["']/i);
      if (metaDescMatch) description = cleanText(metaDescMatch[1]);
    }
    if (!description) description = 'Preview unavailable';

    // Extract Image (Priority: og:image -> twitter:image)
    let image: string | null = null;
    const ogImgMatch = truncatedHtml.match(/<meta\s+[^>]*property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                      truncatedHtml.match(/<meta\s+[^>]*content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
                      truncatedHtml.match(/<meta\s+[^>]*name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    if (ogImgMatch) {
      image = resolveUrl(ogImgMatch[1], safeTargetUrl);
    }

    // Extract Logo / Favicon Priority: og:image -> favicon -> apple-touch-icon -> icon -> defaultLogo
    let logo: string = defaultLogo;
    const appleIconMatch = truncatedHtml.match(/<link\s+[^>]*rel=["']apple-touch-icon["']\s+href=["']([^"']+)["']/i);
    const iconMatch = truncatedHtml.match(/<link\s+[^>]*rel=["'](?:shortcut )?icon["']\s+href=["']([^"']+)["']/i);
    const ogLogoMatch = truncatedHtml.match(/<meta\s+[^>]*property=["']og:logo["']\s+content=["']([^"']+)["']/i);

    if (ogLogoMatch) {
      logo = resolveUrl(ogLogoMatch[1], safeTargetUrl);
    } else if (iconMatch) {
      logo = resolveUrl(iconMatch[1], safeTargetUrl);
    } else if (appleIconMatch) {
      logo = resolveUrl(appleIconMatch[1], safeTargetUrl);
    } else {
      logo = faviconIco;
    }

    // Extract Canonical URL
    let canonicalUrl: string = safeTargetUrl;
    const canonicalMatch = truncatedHtml.match(/<link\s+[^>]*rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    if (canonicalMatch) {
      canonicalUrl = resolveUrl(canonicalMatch[1], safeTargetUrl);
    }

    // Extract Site Name
    let siteName: string = title;
    const siteNameMatch = truncatedHtml.match(/<meta\s+[^>]*property=["']og:site_name["']\s+content=["']([^"']+)["']/i);
    if (siteNameMatch) {
      siteName = cleanText(siteNameMatch[1]);
    }

    const metadata: ExtractedMetadata = {
      platform: 'website',
      title,
      description,
      image,
      logo,
      domain: hostname,
      canonicalUrl,
      siteName,
      socialLinks: {},
      isFallback: false,
    };

    METADATA_CACHE.set(cacheKey, { data: metadata, timestamp: Date.now() });
    return metadata;
  } catch {
    const fallbackMeta: ExtractedMetadata = {
      platform: 'website',
      title: hostname,
      description: 'Preview unavailable',
      image: null,
      logo: faviconIco || defaultLogo,
      domain: hostname,
      canonicalUrl: safeTargetUrl,
      siteName: hostname,
      socialLinks: {},
      isFallback: true,
    };
    METADATA_CACHE.set(cacheKey, { data: fallbackMeta, timestamp: Date.now() });
    return fallbackMeta;
  }
}
