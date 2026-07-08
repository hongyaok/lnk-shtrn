import { X, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div style={{
        background: 'rgba(30,30,30,0.95)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0', padding: '2rem', display: 'flex', flexDirection: 'column',
        gap: '1.25rem', position: 'relative', width: '90%', maxWidth: '440px',
        color: '#fff', textShadow: 'none'
      }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'none', border: 'none', color: '#fff',
            cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          title="Close Dialog"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
          <ShieldCheck size={28} style={{ color: '#a5b4fc' }} />
          <h2 style={{
            margin: 0, fontSize: '1.4rem', fontWeight: 600,
            fontFamily: "'Pixelify Sans', sans-serif"
          }}>
            Privacy & Security
          </h2>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '1rem',
          fontSize: '0.9rem', lineHeight: 1.5, color: '#e5e7eb'
        }}>
          <div>
            <strong style={{ color: '#fff' }}>100% Client-Side. Zero Servers.</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              We do not run any database or storage servers. Your shortened links, destination URLs, and app settings are never uploaded, leaked, or tracked.
            </p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>Local Device Storage Only</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              Everything is saved exclusively inside your browser's local cache on this device (<code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.3rem' }}>localStorage</code>).
            </p>
          </div>

          <div>
            <strong style={{ color: '#fff' }}>How to clear your data:</strong>
            <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1.25rem' }}>
              <li>Clear link history using the red <strong>Clear History</strong> button on the My Links page.</li>
              {/* <li>Or click the <strong>Clear Local Data</strong> button below to purge all link and news cache.</li> */}
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.75rem' }}>
          {/* <Button
            variant="outline"
            onClick={handleClearAllData}
            style={{
              flex: 1, borderRadius: 0, borderColor: '#ef4444',
              color: '#ef4444', fontFamily: "'Pixelify Sans', sans-serif",
              fontSize: '0.85rem'
            }}
          >
            Clear Local Data
          </Button> */}
          <Button
            variant="secondary"
            onClick={onClose}
            style={{
              flex: 1, borderRadius: 0,
              fontFamily: "'Pixelify Sans', sans-serif",
              fontSize: '0.85rem'
            }}
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
