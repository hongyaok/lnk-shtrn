// @ts-ignore
import { describe, it, expect } from 'vitest';
import { encodeLinkPayload, decodeLinkPayload, type LinkPayload } from './urlEncoder';
import LZString from 'lz-string';

describe('urlEncoder', () => {
  const testRoundtrip = (payload: LinkPayload) => {
    const encoded = encodeLinkPayload(payload);
    const decoded = decodeLinkPayload(encoded);
    expect(decoded).not.toBeNull();
    if (!decoded) return;

    expect(decoded.url).toBe(payload.url);

    if (payload.expiry === 0) {
      expect(decoded.expiry).toBe(0);
    } else {
      const diff = Math.abs(decoded.expiry - payload.expiry);
      expect(diff).toBeLessThan(1000); // 1 sec precision
    }
  };

  it('HTTPS + www + forever', () => {
    testRoundtrip({ url: 'https://www.google.com', expiry: 0 });
  });

  it('HTTPS + no www + forever', () => {
    testRoundtrip({ url: 'https://github.com/microsoft/vscode', expiry: 0 });
  });

  it('HTTP + no www + forever', () => {
    testRoundtrip({ url: 'http://example.com/test', expiry: 0 });
  });

  it('HTTP + www + forever', () => {
    testRoundtrip({ url: 'http://www.example.com/test', expiry: 0 });
  });

  it('YouTube URL with query params + forever', () => {
    testRoundtrip({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expiry: 0 });
  });

  it('Short-duration expiry tests', () => {
    testRoundtrip({ url: 'https://www.google.com', expiry: Date.now() + 30000 });
    testRoundtrip({ url: 'https://www.google.com', expiry: Date.now() + 60000 });
    testRoundtrip({ url: 'https://www.google.com', expiry: Date.now() + 3600000 });
    testRoundtrip({ url: 'https://www.google.com', expiry: Date.now() + 86400000 });
    testRoundtrip({ url: 'https://www.google.com', expiry: Date.now() + 604800000 });
  });

  it('Long Google Docs URL + forever', () => {
    testRoundtrip({ url: 'https://docs.google.com/document/d/1BxiMkf0a8Xkp5Y0ZG9Q7vFJQZ9Q/edit', expiry: 0 });
  });

  it('URL with query params and fragment + forever', () => {
    testRoundtrip({ url: 'https://example.com/path?a=1&b=2#section', expiry: 0 });
  });

  it('Expiry precision test', () => {
    const now = Date.now();
    const thirtySecExpiry = now + 30000;
    const encoded = encodeLinkPayload({ url: 'https://example.com', expiry: thirtySecExpiry });
    const decoded = decodeLinkPayload(encoded);
    expect(decoded).not.toBeNull();
    if (decoded) {
      const simulatedNowAfter30s = now + 31000;
      expect(simulatedNowAfter30s).toBeGreaterThan(decoded.expiry);
      
      const simulatedNowBefore30s = now + 20000;
      expect(simulatedNowBefore30s).toBeLessThan(decoded.expiry);
    }
  });

  it('Legacy decode test', () => {
    const legacyPayload = { url: 'https://www.google.com', expiry: 0 };
    const legacyEncoded = LZString.compressToEncodedURIComponent(JSON.stringify(legacyPayload));
    const legacyDecoded = decodeLinkPayload(legacyEncoded);
    
    expect(legacyDecoded).not.toBeNull();
    if (legacyDecoded) {
      expect(legacyDecoded.url).toBe(legacyPayload.url);
      expect(legacyDecoded.expiry).toBe(legacyPayload.expiry);
    }
  });
});

