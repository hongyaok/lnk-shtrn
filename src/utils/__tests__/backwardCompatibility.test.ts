import { describe, it, expect } from 'vitest';
import { decodeLinkPayload, encodeLinkPayload } from '../urlEncoder';
import LZString from 'lz-string';

describe('Backward Compatibility', () => {
  it('should correctly decode v3 (Current Base79)', () => {
    const payload = { url: 'https://example.com/test', expiry: 0 };
    const encoded = encodeLinkPayload(payload);
    const decoded = decodeLinkPayload(encoded);
    expect(decoded?.url).toBe(payload.url);
    expect(decoded?.expiry).toBe(0);
  });

  it('should correctly decode v2 (Base64Url, Bit 3 = 1)', () => {
    // v2 uses bit 3 = 1, bit 4 = 0
    // URL: https://example.com/test -> flags = 0b00001001 (https = 1, v2 = 8, total = 9)
    // No expiry for simplicity
    const flags = 0b00001001;
    const urlStr = "example.com/test";
    const urlBytes = new TextEncoder().encode(urlStr);
    const buf = new Uint8Array(1 + urlBytes.length);
    buf[0] = flags;
    buf.set(urlBytes, 1);
    
    // Convert to Base64Url
    const binaryStr = Array.from(buf).map(b => String.fromCharCode(b)).join('');
    const base64Url = btoa(binaryStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const decoded = decodeLinkPayload(base64Url);
    expect(decoded?.url).toBe('https://example.com/test');
    expect(decoded?.expiry).toBe(0);
  });

  it('should correctly decode v0 (LZ-String JSON fallback)', () => {
    const jsonStr = JSON.stringify({ url: 'https://legacy.com', expiry: 1234567890 });
    const encoded = LZString.compressToEncodedURIComponent(jsonStr);
    
    const decoded = decodeLinkPayload(encoded);
    expect(decoded?.url).toBe('https://legacy.com');
    expect(decoded?.expiry).toBe(1234567890);
  });
});
