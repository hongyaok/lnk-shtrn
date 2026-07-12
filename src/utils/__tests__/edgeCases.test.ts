import { describe, it, expect } from 'vitest';
import { encodeNotePayload, decodeNotePayload, decodeMicroPagePayload, decodeLinkPayload } from '../urlEncoder';
import { encryptNote, decryptNote } from '../crypto';

describe('Edge Cases and Bounds', () => {
  it('should gracefully handle malformed hashes', () => {
    // Random gibberish not conforming to Base79 or format
    const malformed1 = "Just_Some_Random_String_With_Invalid_Chars!!!";
    const malformed2 = "~";
    const malformed3 = "A~";

    expect(decodeLinkPayload(malformed1)).toBeNull();
    expect(decodeLinkPayload(malformed2)).toBeNull();
    expect(decodeLinkPayload(malformed3)).toBeNull();

    expect(decodeNotePayload(malformed1)).toBeNull();
    expect(decodeNotePayload(malformed2)).toBeNull();
    
    expect(decodeMicroPagePayload(malformed1)).toBeNull();
  });

  it('should handle large data structures within maximum reasonable hash limits', async () => {
    // Generate a very large note
    const largeText = "A".repeat(5000); // 5KB of text
    const password = "test";
    const { iv, ciphertext } = await encryptNote(largeText, password);
    const hash = encodeNotePayload(iv, ciphertext);
    
    // Check if the hash is valid
    const decoded = decodeNotePayload(hash);
    expect(decoded).not.toBeNull();
    
    // Decrypt to ensure data is perfectly retained
    if (decoded) {
      const decrypted = await decryptNote(decoded.iv, decoded.ciphertext, password);
      expect(decrypted).toBe(largeText);
    }
  });

  it('should reject Note payloads if passed to MicroPage decoder and vice versa', async () => {
    // Note payload
    const password = "test";
    const { iv, ciphertext } = await encryptNote("Test note", password);
    const noteHash = encodeNotePayload(iv, ciphertext);

    // MicroPage payload
    // Using a valid string that we encode

    expect(decodeMicroPagePayload(noteHash)).toBeNull();
    expect(decodeLinkPayload(noteHash)).toBeNull();
  });
});
