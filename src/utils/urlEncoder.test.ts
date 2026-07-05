/**
 * Test script for the new compact URL encoder.
 * Run with: npx tsx src/utils/urlEncoder.test.ts
 *
 * Tests:
 * 1. Roundtrip encoding/decoding for various URLs and expiry values
 * 2. Backward compatibility with old LZ-String encoded payloads
 * 3. Edge cases (unicode URLs, very long URLs, etc.)
 */

import { encodeLinkPayload, decodeLinkPayload, type LinkPayload } from './urlEncoder';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

function testRoundtrip(payload: LinkPayload, label: string) {
  const encoded = encodeLinkPayload(payload);
  const decoded = decodeLinkPayload(encoded);

  console.log(`\n${label}`);
  console.log(`  Input:   url="${payload.url}", expiry=${payload.expiry}`);
  console.log(`  Encoded: ${encoded} (${encoded.length} chars)`);

  assert(decoded !== null, 'Decoded is not null');
  if (!decoded) return;

  assert(decoded.url === payload.url, `URL matches: "${decoded.url}"`);

  if (payload.expiry === 0) {
    assert(decoded.expiry === 0, 'Expiry is 0 (forever)');
  } else {
    // Expiry is stored as days, so allow up to 1 day of rounding
    const diff = Math.abs(decoded.expiry - payload.expiry);
    assert(diff < 86_400_000, `Expiry within 1 day: diff=${diff}ms`);
  }
}

console.log('=== Roundtrip tests ===');

testRoundtrip(
  { url: 'https://www.google.com', expiry: 0 },
  'HTTPS + www + forever'
);

testRoundtrip(
  { url: 'https://github.com/microsoft/vscode', expiry: 0 },
  'HTTPS + no www + forever'
);

testRoundtrip(
  { url: 'http://example.com/test', expiry: 0 },
  'HTTP + no www + forever'
);

testRoundtrip(
  { url: 'http://www.example.com/test', expiry: 0 },
  'HTTP + www + forever'
);

testRoundtrip(
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expiry: 0 },
  'YouTube URL with query params + forever'
);

testRoundtrip(
  { url: 'https://www.google.com', expiry: Date.now() + 3600000 },
  'HTTPS + www + 1 hour expiry'
);

testRoundtrip(
  { url: 'https://www.google.com', expiry: Date.now() + 86400000 },
  'HTTPS + www + 1 day expiry'
);

testRoundtrip(
  { url: 'https://www.google.com', expiry: Date.now() + 604800000 },
  'HTTPS + www + 1 week expiry'
);

testRoundtrip(
  { url: 'https://www.google.com', expiry: Date.now() + 31536000000 },
  'HTTPS + www + 1 year expiry'
);

testRoundtrip(
  { url: 'https://docs.google.com/document/d/1BxiMkf0a8Xkp5Y0ZG9Q7vFJQZ9Q/edit', expiry: 0 },
  'Long Google Docs URL + forever'
);

testRoundtrip(
  { url: 'https://example.com/path?a=1&b=2#section', expiry: 0 },
  'URL with query params and fragment + forever'
);

// Size comparison
console.log('\n=== Size comparison ===');
import LZString from 'lz-string';

const benchmarks: LinkPayload[] = [
  { url: 'https://www.google.com', expiry: 0 },
  { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expiry: 0 },
  { url: 'https://github.com/microsoft/vscode', expiry: 0 },
  { url: 'https://www.google.com', expiry: Date.now() + 86400000 },
  { url: 'https://docs.google.com/document/d/1BxiMkf0a8Xkp5Y0ZG9Q7vFJQZ9Q/edit', expiry: Date.now() + 604800000 },
];

console.log('\n  URL                                                    | Old   | New   | Saved');
console.log('  ' + '-'.repeat(90));
benchmarks.forEach(p => {
  const oldEncoded = LZString.compressToEncodedURIComponent(JSON.stringify(p));
  const newEncoded = encodeLinkPayload(p);
  const saved = oldEncoded.length - newEncoded.length;
  const pct = Math.round((saved / oldEncoded.length) * 100);
  const urlDisplay = p.url.length > 55 ? p.url.substring(0, 52) + '...' : p.url.padEnd(55);
  console.log(`  ${urlDisplay} | ${String(oldEncoded.length).padStart(5)} | ${String(newEncoded.length).padStart(5)} | ${String(saved).padStart(3)} (${pct}%)`);
});

// Legacy decode test
console.log('\n=== Legacy decode test ===');
const legacyPayload = { url: 'https://www.google.com', expiry: 0 };
const legacyEncoded = LZString.compressToEncodedURIComponent(JSON.stringify(legacyPayload));
console.log(`  Legacy encoded: ${legacyEncoded}`);
const legacyDecoded = decodeLinkPayload(legacyEncoded);
assert(legacyDecoded !== null, 'Legacy payload decoded successfully');
if (legacyDecoded) {
  assert(legacyDecoded.url === legacyPayload.url, `Legacy URL matches: "${legacyDecoded.url}"`);
  assert(legacyDecoded.expiry === legacyPayload.expiry, `Legacy expiry matches: ${legacyDecoded.expiry}`);
}

// Summary
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  // @ts-ignore
  process.exit(1);
}
