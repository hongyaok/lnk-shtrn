/**
 * Binary URL encoder/decoder for the lnk-shrtn link shortener.
 *
 * Format (v1):
 * ┌──────────────────────────────────────────────────────────┐
 * │ Byte 0: flags                                           │
 * │   bit 0: 1 = https, 0 = http                            │
 * │   bit 1: 1 = had "www." prefix                          │
 * │   bit 2: 1 = has expiry bytes (2 bytes follow)          │
 * │   bits 3–7: reserved (must be 0)                        │
 * ├──────────────────────────────────────────────────────────┤
 * │ Bytes 1–2 (optional, only if bit 2 set):                │
 * │   Expiry as days since 2024-01-01 UTC (uint16 BE)       │
 * │   Max 65535 days ≈ 179 years                            │
 * ├──────────────────────────────────────────────────────────┤
 * │ Remaining bytes: URL without protocol and "www." prefix  │
 * │   Encoded as UTF-8                                       │
 * └──────────────────────────────────────────────────────────┘
 *
 * The binary buffer is serialized as a base64url string (RFC 4648 §5, no padding).
 *
 * Backward compatibility:
 * Old links used LZ-String to compress a JSON payload. The decoder detects
 * old format by checking if the new binary decode yields an invalid result,
 * then falls back to LZ-String decompression.
 */

import LZString from 'lz-string';

export interface LinkPayload {
  url: string;
  expiry: number; // timestamp in ms, 0 = forever
}

/** Epoch for relative expiry encoding: 2024-01-01T00:00:00Z */
const EPOCH_MS = Date.UTC(2024, 0, 1); // 1704067200000
const MS_PER_DAY = 86_400_000;

// --- base64url helpers (browser-compatible, no padding) ---

/** Encode a Uint8Array to a base64url string (no padding). */
function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** Decode a base64url string (no padding) to a Uint8Array. */
function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// --- Public API ---

/**
 * Encodes a URL and expiry time into a compact base64url string.
 * Typically 50–80% shorter than the old LZ-String JSON encoding.
 */
export function encodeLinkPayload(payload: LinkPayload): string {
  let stripped = payload.url;
  let flags = 0;

  // Extract protocol
  if (stripped.startsWith('https://')) {
    stripped = stripped.slice(8);
    flags |= 0b001; // bit 0
  } else if (stripped.startsWith('http://')) {
    stripped = stripped.slice(7);
  }

  // Extract www prefix
  if (stripped.startsWith('www.')) {
    stripped = stripped.slice(4);
    flags |= 0b010; // bit 1
  }

  const hasExpiry = payload.expiry > 0;
  if (hasExpiry) {
    flags |= 0b100; // bit 2
  }

  const urlBytes = new TextEncoder().encode(stripped);

  if (hasExpiry) {
    let expiryDays = Math.ceil((payload.expiry - EPOCH_MS) / MS_PER_DAY);
    if (expiryDays < 0) expiryDays = 0;
    if (expiryDays > 65535) expiryDays = 65535;

    const buf = new Uint8Array(1 + 2 + urlBytes.length);
    buf[0] = flags;
    buf[1] = (expiryDays >> 8) & 0xff;
    buf[2] = expiryDays & 0xff;
    buf.set(urlBytes, 3);
    return toBase64Url(buf);
  } else {
    const buf = new Uint8Array(1 + urlBytes.length);
    buf[0] = flags;
    buf.set(urlBytes, 1);
    return toBase64Url(buf);
  }
}

/**
 * Decodes a base64url or legacy LZ-String encoded string back into a LinkPayload.
 * Returns null if decoding fails in both formats.
 */
export function decodeLinkPayload(encoded: string): LinkPayload | null {
  // Try new binary format first
  const binaryResult = decodeBinaryPayload(encoded);
  if (binaryResult) return binaryResult;

  // Fall back to old LZ-String JSON format for backward compatibility
  return decodeLegacyPayload(encoded);
}

/** Decode from the new compact binary format. */
function decodeBinaryPayload(encoded: string): LinkPayload | null {
  try {
    const buf = fromBase64Url(encoded);
    if (buf.length < 2) return null; // Need at least flags + 1 byte of URL

    const flags = buf[0];

    // Reserved bits must be 0 — if not, this isn't our binary format
    if ((flags & 0b11111000) !== 0) return null;

    const hasExpiry = (flags & 0b100) !== 0;
    let offset = 1;
    let expiry = 0;

    if (hasExpiry) {
      if (buf.length < 4) return null; // flags + 2 expiry + at least 1 url byte
      const expiryDays = (buf[1] << 8) | buf[2];
      expiry = EPOCH_MS + expiryDays * MS_PER_DAY;
      offset = 3;
    }

    const stripped = new TextDecoder().decode(buf.subarray(offset));
    if (!stripped) return null;

    // Sanity: the decoded URL portion should look like a domain (contain a dot)
    if (!stripped.includes('.')) return null;

    const protocol = (flags & 0b001) ? 'https://' : 'http://';
    const www = (flags & 0b010) ? 'www.' : '';
    const url = protocol + www + stripped;

    return { url, expiry };
  } catch {
    return null;
  }
}

/** Decode from the old LZ-String JSON format (backward compatibility). */
function decodeLegacyPayload(encoded: string): LinkPayload | null {
  try {
    const jsonString = LZString.decompressFromEncodedURIComponent(encoded);
    if (!jsonString) return null;

    const parsed = JSON.parse(jsonString) as LinkPayload;
    if (parsed && typeof parsed.url === 'string' && typeof parsed.expiry === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}
