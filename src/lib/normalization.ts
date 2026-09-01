/**
 * InBid Destination Normalization Utility
 * Strips cosmetic differences (http/https, www, trailing slashes, tracking parameters)
 * to prevent duplicate listings.
 */

export function sanitizeDestinationUrl(input: string): string {
  if (!input || typeof input !== 'string') return '';
  const clean = input.trim();

  // If handle starts with @
  if (clean.startsWith('@')) {
    const handle = clean.substring(1).replace(/[^a-zA-Z0-9_.]/g, '');
    return `https://instagram.com/${handle}`;
  }

  // Handle x.com or twitter.com without protocol
  if (clean.toLowerCase().startsWith('x.com/') || clean.toLowerCase().startsWith('twitter.com/')) {
    return `https://${clean}`;
  }

  // Handle instagram.com without protocol
  if (clean.toLowerCase().startsWith('instagram.com/')) {
    return `https://${clean}`;
  }

  // Standard website without http protocol
  if (!/^https?:\/\//i.test(clean)) {
    return `https://${clean}`;
  }

  return clean;
}

export function normalizeDestination(input: string): {
  normalized: string;
  raw: string;
  isHandle: boolean;
  displayUrl: string;
} {
  if (!input || typeof input !== 'string') {
    return { normalized: '', raw: '', isHandle: false, displayUrl: '' };
  }

  const raw = input.trim();
  let text = raw.toLowerCase();

  // Handle @username format
  if (text.startsWith('@')) {
    const handle = text.substring(1).replace(/[^a-z0-9_.]/g, '');
    return {
      normalized: `@${handle}`,
      raw: `https://instagram.com/${handle}`,
      isHandle: true,
      displayUrl: `@${handle}`,
    };
  }

  // Handle URL normalization
  try {
    const hasProtocol = /^https?:\/\//i.test(raw);
    const urlToParse = hasProtocol ? raw : `https://${raw}`;
    const parsed = new URL(urlToParse);

    let host = parsed.hostname.toLowerCase();
    if (host.startsWith('www.')) {
      host = host.substring(4);
    }

    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.substring(0, pathname.length - 1);
    }
    if (pathname === '/') pathname = '';

    const normalized = `${host}${pathname}`;

    return {
      normalized,
      raw: sanitizeDestinationUrl(raw),
      isHandle: false,
      displayUrl: normalized,
    };
  } catch {
    let clean = text
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\?.*$/, '')
      .replace(/#.*$/, '')
      .replace(/\/$/, '');

    return {
      normalized: clean,
      raw: sanitizeDestinationUrl(raw),
      isHandle: false,
      displayUrl: clean,
    };
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || `listing-${Date.now().toString(36)}`;
}
