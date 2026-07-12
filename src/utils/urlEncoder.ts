/**
 * Binary URL encoder/decoder for the lnk-shrtn link shortener.
 *
 * Format (v3 — current):
 * ┌──────────────────────────────────────────────────────────┐
 * │ Byte 0: flags                                           │
 * │   bit 0: 1 = https, 0 = http                            │
 * │   bit 1: 1 = had "www." prefix                          │
 * │   bit 2: 1 = has expiry bytes (4 bytes follow)          │
 * │   bit 3: 1 = v2 seconds-precision expiry                │
 * │   bit 4: 1 = v3 Base79 + Dictionary Encoding            │
 * │   bits 5–7: reserved (must be 0)                        │
 * ├──────────────────────────────────────────────────────────┤
 * │ Bytes 1–4 (optional, only if bit 2 set):                │
 * │   Expiry as seconds since 2024-01-01 UTC (uint32 BE)    │
 * ├──────────────────────────────────────────────────────────┤
 * │ Remaining bytes: URL without protocol and "www." prefix  │
 * │   Encoded with custom Dictionary + UTF-16 escape        │
 * └──────────────────────────────────────────────────────────┘
 *
 * The binary buffer is serialized to Base79 using all safe URL chars.
 * 
 * Backward compatibility:
 * - v2 (Base64Url, Bit 4 = 0)
 * - v1 (Legacy, Bit 4 = 0, Bit 3 = 0, day-precision)
 * - v0 (LZ-String JSON fallback)
 */

import LZString from 'lz-string';
import { packMicroPage, unpackMicroPage, type MicroPageData } from './microPageEncoder';

export interface LinkPayload {
  url: string;
  expiry: number; // timestamp in ms, 0 = forever
}

const EPOCH_MS = Date.UTC(2024, 0, 1);
const MS_PER_DAY = 86_400_000;
const MS_PER_SEC = 1_000;

// --- Base79 + Dictionary Encoding (v3) ---

const NEW_CHARS = ".~:$&'()*+,;=@!";
const ALPHABET_79 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_" + NEW_CHARS;
const BASE_79 = BigInt(ALPHABET_79.length);

const DICTIONARY = [
  '.com', '.org', '.net', '.io', '.co', '.me', '.app', '.dev',
  '.html', '.php', '.js', '.css',
  '.co.uk', '.com.au', '.gov', '.edu',
  '/?', '/#', '?id=', '&id=', '?val=', '&val=',
  'index.', 'login', 'register', 'api/', 'watch?v=',
  'github.com', 'google.com', 'youtube.com', 'twitter.com', 'x.com',
  'instagram.com', 'facebook.com', 'linkedin.com', 'reddit.com',
  'tiktok.com', 'amazon.com', 'apple.com', 'microsoft.com',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
  '.json', '.xml', '.csv', '.pdf',
  'search?q=', '?query=', '&query=', '?q=', '&q=',
  'user/', 'profile/', 'post/', 'article/', 'blog/', 'news/',
  'category/', 'tag/', 'page/', 'item/', 'product/'
].sort((a, b) => b.length - a.length);

function toBase79(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  let num = BigInt('0x' + hex);
  let res = '';
  while (num > 0n) {
    res = ALPHABET_79[Number(num % BASE_79)] + res;
    num = num / BASE_79;
  }
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    res = ALPHABET_79[0] + res;
  }
  return res;
}

function fromBase79(str: string): Uint8Array {
  if (str.length === 0) return new Uint8Array(0);
  let num = 0n;
  let leadingZeros = 0;
  let hasNonZero = false;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ALPHABET_79[0] && !hasNonZero) {
      leadingZeros++;
    } else {
      hasNonZero = true;
      num = num * BASE_79 + BigInt(ALPHABET_79.indexOf(str[i]));
    }
  }
  if (!hasNonZero) return new Uint8Array(leadingZeros);
  
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  const bytes = new Uint8Array(leadingZeros + hex.length / 2);
  for (let i = 0; i < hex.length / 2; i++) {
    bytes[leadingZeros + i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function encodeV3String(str: string): Uint8Array {
  const bytes: number[] = [];
  let i = 0;
  while (i < str.length) {
    let matched = false;
    for (let t = 0; t < DICTIONARY.length; t++) {
      const token = DICTIONARY[t];
      if (str.startsWith(token, i)) {
        bytes.push(128 + t);
        i += token.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const code = str.charCodeAt(i);
    if (code < 128) {
      bytes.push(code);
    } else {
      bytes.push(255, (code >> 8) & 0xFF, code & 0xFF);
    }
    i++;
  }
  return new Uint8Array(bytes);
}

function decodeV3String(bytes: Uint8Array, offset: number): string | null {
  try {
    let str = '';
    let i = offset;
    while (i < bytes.length) {
      const b = bytes[i];
      if (b < 128) {
        str += String.fromCharCode(b);
        i++;
      } else if (b >= 128 && b < 255) {
        const tokenIndex = b - 128;
        if (tokenIndex < DICTIONARY.length) {
          str += DICTIONARY[tokenIndex];
        } else {
          return null; // Invalid token
        }
        i++;
      } else if (b === 255) {
        if (i + 2 >= bytes.length) return null; // Truncated
        const code = (bytes[i + 1] << 8) | bytes[i + 2];
        str += String.fromCharCode(code);
        i += 3;
      }
    }
    return str;
  } catch {
    return null;
  }
}

// --- Base64Url Helpers (v1/v2) ---

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
 * Encodes a URL and expiry time into a highly compressed Base79 string.
 */
export function encodeLinkPayload(payload: LinkPayload): string {
  let stripped = payload.url;
  let flags = 0b00010000; // Bit 4 set for v3

  if (stripped.startsWith('https://')) {
    stripped = stripped.slice(8);
    flags |= 0b0001;
  } else if (stripped.startsWith('http://')) {
    stripped = stripped.slice(7);
  }

  if (stripped.startsWith('www.')) {
    stripped = stripped.slice(4);
    flags |= 0b0010;
  }

  const hasExpiry = payload.expiry > 0;
  if (hasExpiry) {
    flags |= 0b0100;
    flags |= 0b1000;
  }

  const urlBytes = encodeV3String(stripped);
  let buf: Uint8Array;

  if (hasExpiry) {
    let expirySecs = Math.ceil((payload.expiry - EPOCH_MS) / MS_PER_SEC);
    if (expirySecs < 0) expirySecs = 0;
    if (expirySecs > 0xFFFFFFFF) expirySecs = 0xFFFFFFFF;

    buf = new Uint8Array(1 + 4 + urlBytes.length);
    buf[0] = flags;
    buf[1] = (expirySecs >>> 24) & 0xff;
    buf[2] = (expirySecs >>> 16) & 0xff;
    buf[3] = (expirySecs >>> 8) & 0xff;
    buf[4] = expirySecs & 0xff;
    buf.set(urlBytes, 5);
  } else {
    buf = new Uint8Array(1 + urlBytes.length);
    buf[0] = flags;
    buf.set(urlBytes, 1);
  }

  let encoded = toBase79(buf);
  let hasNewChar = false;
  for (let i = 0; i < encoded.length; i++) {
    if (NEW_CHARS.includes(encoded[i])) {
      hasNewChar = true;
      break;
    }
  }
  if (!hasNewChar) encoded += '~';
  return encoded;
}

export interface NotePayload {
  iv: Uint8Array;
  ciphertext: Uint8Array;
  expiry?: number;
}

export function encodeNotePayload(iv: Uint8Array, ciphertext: Uint8Array, expiry: number = 0): string {
  let flags = 0b00110000; // Bit 4 (v3) + Bit 5 (Note)
  
  const hasExpiry = expiry > 0;
  if (hasExpiry) {
    flags |= 0b0100;
    flags |= 0b1000; // Keep consistency with v2/v3 expiry flag
  }

  let buf: Uint8Array;
  if (hasExpiry) {
    let expirySecs = Math.ceil((expiry - EPOCH_MS) / MS_PER_SEC);
    if (expirySecs < 0) expirySecs = 0;
    if (expirySecs > 0xFFFFFFFF) expirySecs = 0xFFFFFFFF;
    
    buf = new Uint8Array(1 + 4 + iv.length + ciphertext.length);
    buf[0] = flags;
    buf[1] = (expirySecs >>> 24) & 0xff;
    buf[2] = (expirySecs >>> 16) & 0xff;
    buf[3] = (expirySecs >>> 8) & 0xff;
    buf[4] = expirySecs & 0xff;
    buf.set(iv, 5);
    buf.set(ciphertext, 5 + iv.length);
  } else {
    buf = new Uint8Array(1 + iv.length + ciphertext.length);
    buf[0] = flags;
    buf.set(iv, 1);
    buf.set(ciphertext, 1 + iv.length);
  }
  let encoded = toBase79(buf);
  let hasNewChar = false;
  for (let i = 0; i < encoded.length; i++) {
    if (NEW_CHARS.includes(encoded[i])) {
      hasNewChar = true;
      break;
    }
  }
  if (!hasNewChar) encoded += '~';
  return encoded;
}

export function decodeNotePayload(encoded: string): NotePayload | null {
  try {
    let toDecode = encoded;
    if (encoded.endsWith('~')) {
      const rest = encoded.slice(0, -1);
      let restHasNew = false;
      for (let i = 0; i < rest.length; i++) {
        if (NEW_CHARS.includes(rest[i])) {
          restHasNew = true;
          break;
        }
      }
      if (!restHasNew) toDecode = rest;
    }
    const buf = fromBase79(toDecode);
    if (buf.length < 1) return null;
    const flags = buf[0];
    if ((flags & 0b00110000) !== 0b00110000) return null; // Must have Bit 4 and 5
    
    let offset = 1;
    let expiry = 0;
    const hasExpiry = (flags & 0b0100) !== 0;
    if (hasExpiry) {
      if (buf.length < 5) return null;
      const expirySecs = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0;
      expiry = EPOCH_MS + expirySecs * MS_PER_SEC;
      offset = 5;
    }

    if (buf.length < offset + 12) return null; // Needs at least flags/expiry + 12 bytes IV
    return {
      iv: buf.subarray(offset, offset + 12),
      ciphertext: buf.subarray(offset + 12),
      expiry: expiry > 0 ? expiry : undefined
    };
  } catch {
    return null;
  }
}

export function encodeMicroPagePayload(data: MicroPageData): string {
  const packed = packMicroPage(data);
  const flags = 0b01010000; // Bit 4 (v3) + Bit 6 (MicroPage)
  const dataBytes = encodeV3String(packed);
  const buf = new Uint8Array(1 + dataBytes.length);
  buf[0] = flags;
  buf.set(dataBytes, 1);
  let encoded = toBase79(buf);
  let hasNewChar = false;
  for (let i = 0; i < encoded.length; i++) {
    if (NEW_CHARS.includes(encoded[i])) {
      hasNewChar = true;
      break;
    }
  }
  if (!hasNewChar) encoded += '~';
  return encoded;
}

export function decodeMicroPagePayload(encoded: string): MicroPageData | null {
  try {
    let toDecode = encoded;
    if (encoded.endsWith('~')) {
      const rest = encoded.slice(0, -1);
      let restHasNew = false;
      for (let i = 0; i < rest.length; i++) {
        if (NEW_CHARS.includes(rest[i])) {
          restHasNew = true;
          break;
        }
      }
      if (!restHasNew) toDecode = rest;
    }
    const buf = fromBase79(toDecode);
    if (buf.length < 1) return null;
    const flags = buf[0];
    if ((flags & 0b01010000) !== 0b01010000) return null; // Must have Bit 4 and 6
    const unpackedStr = decodeV3String(buf, 1);
    if (!unpackedStr) return null;
    return unpackMicroPage(unpackedStr);
  } catch {
    return null;
  }
}

/**
 * Decodes a payload, supporting v3 (Base79), v2/v1 (Base64Url), and v0 (LZ-String).
 */
export function decodeLinkPayload(encoded: string): LinkPayload | null {
  let hasNewChar = false;
  for (let i = 0; i < encoded.length; i++) {
    if (NEW_CHARS.includes(encoded[i])) {
      hasNewChar = true;
      break;
    }
  }

  if (hasNewChar) {
    let toDecode = encoded;
    if (encoded.endsWith('~')) {
      const rest = encoded.slice(0, -1);
      let restHasNew = false;
      for (let i = 0; i < rest.length; i++) {
        if (NEW_CHARS.includes(rest[i])) {
          restHasNew = true;
          break;
        }
      }
      if (!restHasNew) toDecode = rest; // ~ was appended
    }
    const result = decodeV3BinaryPayload(toDecode);
    if (result) return result;
  }

  const binaryResult = decodeBinaryPayload(encoded);
  if (binaryResult) return binaryResult;

  return decodeLegacyPayload(encoded);
}

function decodeV3BinaryPayload(encoded: string): LinkPayload | null {
  try {
    const buf = fromBase79(encoded);
    if (buf.length < 2) return null;

    const flags = buf[0];
    if ((flags & 0b00010000) === 0) return null; // Must be v3
    if ((flags & 0b11100000) !== 0) return null; // Reserved, so this must be a LinkPayload, not a Note or MicroPage

    const hasExpiry = (flags & 0b0100) !== 0;
    let offset = 1;
    let expiry = 0;

    if (hasExpiry) {
      if (buf.length < 6) return null;
      const expirySecs = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0;
      expiry = EPOCH_MS + expirySecs * MS_PER_SEC;
      offset = 5;
    }

    const stripped = decodeV3String(buf, offset);
    if (!stripped) return null;
    if (!stripped.includes('.')) return null;

    const protocol = (flags & 0b0001) ? 'https://' : 'http://';
    const www = (flags & 0b0010) ? 'www.' : '';
    return { url: protocol + www + stripped, expiry };
  } catch {
    return null;
  }
}

function decodeBinaryPayload(encoded: string): LinkPayload | null {
  try {
    const buf = fromBase64Url(encoded);
    if (buf.length < 2) return null;

    const flags = buf[0];
    if ((flags & 0b11110000) !== 0) return null;

    const hasExpiry = (flags & 0b0100) !== 0;
    const isV2 = (flags & 0b1000) !== 0;
    let offset = 1;
    let expiry = 0;

    if (hasExpiry) {
      if (isV2) {
        if (buf.length < 6) return null;
        const expirySecs = ((buf[1] << 24) | (buf[2] << 16) | (buf[3] << 8) | buf[4]) >>> 0;
        expiry = EPOCH_MS + expirySecs * MS_PER_SEC;
        offset = 5;
      } else {
        if (buf.length < 4) return null;
        const expiryDays = (buf[1] << 8) | buf[2];
        expiry = EPOCH_MS + expiryDays * MS_PER_DAY;
        offset = 3;
      }
    }

    const stripped = new TextDecoder().decode(buf.subarray(offset));
    if (!stripped) return null;
    if (!stripped.includes('.')) return null;

    const protocol = (flags & 0b0001) ? 'https://' : 'http://';
    const www = (flags & 0b0010) ? 'www.' : '';
    return { url: protocol + www + stripped, expiry };
  } catch {
    return null;
  }
}

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

