import { X, Sparkles, FileText, Share2, Bot } from 'lucide-react';
import { Button } from './ui/button';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeaturesModal({ isOpen, onClose }: FeaturesModalProps) {
  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    onClose();
  };

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
          <Sparkles size={28} style={{ color: '#a5b4fc' }} />
          <h2 style={{
            margin: 0, fontSize: '1.4rem', fontWeight: 600,
            fontFamily: "'Pixelify Sans', sans-serif"
          }}>
            More Features
          </h2>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: '1rem',
          fontSize: '0.9rem', lineHeight: 1.5, color: '#e5e7eb'
        }}>
          <div>
            <strong style={{ color: '#fff' }}>Serverless, Zero-Knowledge Apps</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              Explore our database-free tools built entirely on the URL hash fragment.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '0.75rem' }}>
          <Button
            variant="default"
            onClick={() => handleNavigate('/create-note')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', borderRadius: 0,
              fontFamily: "'Pixelify Sans', sans-serif",
              fontSize: '1rem', padding: '0.75rem'
            }}
          >
            <FileText size={18} />
            Create Burn Note
          </Button>
          <Button
            variant="default"
            onClick={() => handleNavigate('/create-tree')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', borderRadius: 0,
              fontFamily: "'Pixelify Sans', sans-serif",
              fontSize: '1rem', padding: '0.75rem'
            }}
          >
            <Share2 size={18} />
            Create Micro-Landing Page
          </Button>
          <Button
            variant="default"
            onClick={() => handleNavigate('/ai')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', borderRadius: 0,
              fontFamily: "'Pixelify Sans', sans-serif",
              fontSize: '1rem', padding: '0.75rem'
            }}
          >
            <Bot size={18} />
            AI Updates
          </Button>
        </div>
      </div>
    </div>
  );
}
