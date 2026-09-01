import dns from 'dns';

/**
 * SSRF Security Guard for InBid.site
 * Validates domain DNS resolution and prevents requests to internal/private IP ranges.
 */

// Helper to convert IPv4 string to 32-bit integer for subnet checks
function ipv4ToInt(ip: string): number {
  return (
    ip
      .split('.')
      .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  );
}

// Subnet check
function inSubnet(ipInt: number, networkIp: string, cidr: number): boolean {
  const netInt = ipv4ToInt(networkIp);
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  return (ipInt & mask) === (netInt & mask);
}

/**
 * Check if IP address is internal, loopback, private, or cloud metadata address
 */
export function isPrivateOrInternalIP(ip: string): boolean {
  const cleanIp = ip.trim();

  // IPv6 checks
  if (cleanIp.includes(':')) {
    const lower = cleanIp.toLowerCase();
    if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
    if (lower.startsWith('fe80:') || lower.startsWith('fc00:') || lower.startsWith('fd00:')) return true;
    if (lower.startsWith('::ffff:127.') || lower.startsWith('::ffff:10.') || lower.startsWith('::ffff:192.168.')) return true;
    return false;
  }

  // IPv4 checks
  const parts = cleanIp.split('.');
  if (parts.length !== 4) return true; // Invalid format treated as unsafe

  const ipInt = ipv4ToInt(cleanIp);

  // 127.0.0.0/8 (Loopback)
  if (inSubnet(ipInt, '127.0.0.0', 8)) return true;

  // 10.0.0.0/8 (Private Class A)
  if (inSubnet(ipInt, '10.0.0.0', 8)) return true;

  // 172.16.0.0/12 (Private Class B)
  if (inSubnet(ipInt, '172.16.0.0', 12)) return true;

  // 192.168.0.0/16 (Private Class C)
  if (inSubnet(ipInt, '192.168.0.0', 16)) return true;

  // 169.254.0.0/16 (Link-Local & Cloud Metadata 169.254.169.254)
  if (inSubnet(ipInt, '169.254.0.0', 16)) return true;

  // 0.0.0.0/8 (Current network)
  if (inSubnet(ipInt, '0.0.0.0', 8)) return true;

  // 100.64.0.0/10 (Shared Address Space / CGNAT)
  if (inSubnet(ipInt, '100.64.0.0', 10)) return true;

  return false;
}

/**
 * Validate URL and resolve DNS before allowing request
 */
export async function validateUrlForSSRF(urlInput: string): Promise<{
  safeUrl: string;
  hostname: string;
  ip: string;
}> {
  if (!urlInput || typeof urlInput !== 'string') {
    throw new Error('Invalid URL provided');
  }

  let parsed: URL;
  try {
    const hasProtocol = /^https?:\/\//i.test(urlInput.trim());
    parsed = new URL(hasProtocol ? urlInput.trim() : `https://${urlInput.trim()}`);
  } catch {
    throw new Error('Invalid URL structure');
  }

  // Protocol check: Only allow HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Forbidden protocol: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Hostname string checks
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Access to local hostnames is forbidden');
  }

  // Perform DNS resolution check
  try {
    const lookupResult = await dns.promises.lookup(hostname, { all: true });
    if (!lookupResult || lookupResult.length === 0) {
      throw new Error(`DNS resolution failed for hostname: ${hostname}`);
    }

    for (const record of lookupResult) {
      if (isPrivateOrInternalIP(record.address)) {
        throw new Error(`SSRF Blocked: Hostname ${hostname} resolved to restricted IP ${record.address}`);
      }
    }

    return {
      safeUrl: parsed.toString(),
      hostname,
      ip: lookupResult[0].address,
    };
  } catch (err: any) {
    if (err.message?.includes('SSRF Blocked') || err.message?.includes('Forbidden')) {
      throw err;
    }
    throw new Error(`Unable to verify domain DNS safety: ${hostname}`);
  }
}
