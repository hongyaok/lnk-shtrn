import { describe, it, expect } from 'vitest';
import { encryptNote, decryptNote } from '../crypto';
import { packMicroPage, unpackMicroPage } from '../microPageEncoder';
import { encodeNotePayload, decodeNotePayload, encodeMicroPagePayload, decodeMicroPagePayload } from '../urlEncoder';

describe('Data Pipeline & Cryptography Logic', () => {
  describe('Encrypted Burn Notes (Zero-Knowledge Text)', () => {
    it('should securely encrypt and decrypt notes with correct password', async () => {
      const password = 'my-super-secret-password';
      const text = 'Hello, this is a secret note!';
      
      const { iv, ciphertext } = await encryptNote(text, password);
      expect(iv).toBeInstanceOf(Uint8Array);
      expect(ciphertext).toBeInstanceOf(Uint8Array);
      
      const decrypted = await decryptNote(iv, ciphertext, password);
      expect(decrypted).toBe(text);
    });

    it('should fail to decrypt notes with incorrect password', async () => {
      const password = 'my-super-secret-password';
      const wrongPassword = 'wrong-password';
      const text = 'Hello, this is a secret note!';
      
      const { iv, ciphertext } = await encryptNote(text, password);
      
      const decrypted = await decryptNote(iv, ciphertext, wrongPassword);
      expect(decrypted).toBeNull();
    });

    it('should correctly encode and decode NotePayload to/from Base79 hash', async () => {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = new Uint8Array([1, 2, 3, 4, 5, 255, 254]);
      
      const hash = encodeNotePayload(iv, ciphertext);
      expect(typeof hash).toBe('string');
      
      const decoded = decodeNotePayload(hash);
      expect(decoded).not.toBeNull();
      expect(decoded?.iv).toEqual(iv);
      expect(decoded?.ciphertext).toEqual(ciphertext);
    });
  });

  describe('Serverless Micro-Landing Pages', () => {
    it('should successfully pack and unpack MicroPageData', () => {
      const data = {
        name: 'John Doe',
        bio: 'Software Developer',
        links: [
          { title: 'GitHub', url: 'https://github.com/johndoe' },
          { title: 'Twitter', url: 'https://twitter.com/johndoe' },
        ],
      };
      
      const packed = packMicroPage(data);
      expect(typeof packed).toBe('string');
      
      const unpacked = unpackMicroPage(packed);
      expect(unpacked).toEqual(data);
    });

    it('should handle MicroPageData with 5 links and empty links properly', () => {
      const data = {
        name: 'Alice',
        bio: 'Test',
        links: [
          { title: '', url: '' },
          { title: 'Link 2', url: 'https://example.com' },
          { title: '', url: 'https://only-url.com' },
          { title: 'Only Title', url: '' },
          { title: 'Link 5', url: 'https://example.com/5' },
        ],
      };
      
      const packed = packMicroPage(data);
      const unpacked = unpackMicroPage(packed);
      
      // Expected to only keep the links with either title or URL
      expect(unpacked?.links.length).toBe(4);
      expect(unpacked?.links[0]).toEqual({ title: 'Link 2', url: 'https://example.com' });
      expect(unpacked?.links[1]).toEqual({ title: '', url: 'https://only-url.com' });
      expect(unpacked?.links[2]).toEqual({ title: 'Only Title', url: '' });
      expect(unpacked?.links[3]).toEqual({ title: 'Link 5', url: 'https://example.com/5' });
    });

    it('should correctly encode and decode MicroPagePayload to/from Base79 hash', () => {
      const data = {
        name: 'Jane Doe',
        bio: 'Tech Lead',
        links: [
          { title: 'Portfolio', url: 'https://janedoe.dev' },
        ],
      };
      
      const hash = encodeMicroPagePayload(data);
      expect(typeof hash).toBe('string');
      
      const decoded = decodeMicroPagePayload(hash);
      expect(decoded).toEqual(data);
    });
  });
});
