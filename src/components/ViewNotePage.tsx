import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { decodeNotePayload } from '../utils/urlEncoder';
import { decryptNote } from '../utils/crypto';
import { InputBase } from './base/input/input';
import { InputGroup } from './base/input/input-group';
import { Button } from './ui/button';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE_URL = '/spline/redirect2.splinecode';

export default function ViewNotePage() {
  const [password, setPassword] = useState('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const splineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const notePayload = decodeNotePayload(hash);
    if (!notePayload) {
      setIsInvalid(true);
    } else if (notePayload.expiry && Date.now() > notePayload.expiry) {
      setIsExpired(true);
    }
  }, []);

  useEffect(() => {
    const container = splineContainerRef.current;
    if (!container) return;

    const blockEvent = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const eventsToBlock = ['mousedown', 'mouseup', 'click'];
    eventsToBlock.forEach(event => container.addEventListener(event, blockEvent, true));

    return () => {
      eventsToBlock.forEach(event => container.removeEventListener(event, blockEvent, true));
    };
  }, []);

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    const hash = window.location.hash.replace(/^#/, '');
    const notePayload = decodeNotePayload(hash);

    if (!notePayload) {
      setError('Invalid link payload.');
      return;
    }
    
    if (notePayload.expiry && Date.now() > notePayload.expiry) {
      setIsExpired(true);
      return;
    }

    setIsDecrypting(true);
    setError(null);
    try {
      const text = await decryptNote(notePayload.iv, notePayload.ciphertext, password);
      if (text === null) {
        setError('Incorrect password. Failed to decrypt.');
      } else {
        setDecryptedText(text);
      }
    } catch (err) {
      setError('An error occurred during decryption.');
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <>
      <div ref={splineContainerRef} className="spline-container" style={{ background: '#0a0a0a' }}>
        <Suspense fallback={null}>
          <Spline
            scene={SPLINE_SCENE_URL}
            onLoad={() => setSplineLoaded(true)}
            style={{ opacity: splineLoaded ? 1 : 0, transition: 'opacity 1s ease-in-out' }}
          />
        </Suspense>
      </div>

      <div className="content-wrapper">
        <div className="glass-card">
          <div className="header">
            <h1>Encrypted Note</h1>
            <p>Enter the password to decrypt the contents.</p>
          </div>

          {isInvalid ? (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Invalid Link</h2>
              <p style={{ color: 'var(--text-muted)' }}>The link provided is malformed or invalid.</p>
              <a href="/" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>Go to Home</a>
            </div>
          ) : isExpired ? (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Expired Note</h2>
              <p style={{ color: 'var(--text-muted)' }}>This note has expired and can no longer be viewed.</p>
              <a href="/" className="btn-secondary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>Go to Home</a>
            </div>
          ) : decryptedText !== null ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0',
                padding: '1rem',
                color: '#000',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {decryptedText}
              </div>
              <a href="/" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                Go to Home
              </a>
            </div>
          ) : (
            <form onSubmit={handleDecrypt} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <InputGroup isRequired label="Decryption Password">
                <InputBase
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </InputGroup>

              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="default"
                size="lg"
                withArrow
                disabled={isDecrypting || !password}
                style={{ width: '100%' }}
              >
                {isDecrypting ? 'Decrypting...' : 'Decrypt Note'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
