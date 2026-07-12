import { X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  if (!isOpen) return null;

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    onClose();
  };

  const features = [
    {
      title: 'Link Shortener',
      description: 'Shorten links with customized, client-side expiration dates.',
      action: onClose,
      btnText: 'Shorten Link',
    },
    {
      title: 'Burn Notes',
      description: 'Send temporary, encrypted notes that disappear after reading.',
      action: () => handleNavigate('/create-note'),
      btnText: 'Create Note',
    },
    {
      title: 'Micro-Landing Pages',
      description: 'Build responsive custom link trees and layouts stored entirely in the URL.',
      action: () => handleNavigate('/create-tree'),
      btnText: 'Build Page',
    },
    {
      title: 'AI Updates',
      description: 'Browse breakthrough AI news curated and summarized by AI models.',
      action: () => handleNavigate('/ai'),
      btnText: 'View Updates',
    },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
    }}>
      <div style={{
        background: 'rgba(20, 20, 20, 0.98)', border: '2px solid rgba(255,255,255,0.15)',
        borderRadius: '0', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column',
        gap: '1.5rem', position: 'relative', width: '90%', maxWidth: '600px',
        color: '#fff', textShadow: 'none', boxShadow: '0 0 30px rgba(99, 102, 241, 0.15)'
      }}>
        {/* Close Button */}
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

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <Sparkles size={26} style={{ color: '#a5b4fc', animation: 'pulse 2s infinite' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{
              margin: 0, fontSize: '1.5rem', fontWeight: 600,
              fontFamily: "'Pixelify Sans', sans-serif",
              background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.05em'
            }}>
              Welcome to lnk-shtrn
            </h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontFamily: "'Pixelify Sans', sans-serif", letterSpacing: '0.02em', marginTop: '0.2rem' }}>
              Serverless, privacy-first, zero-knowledge tools.
            </p>
          </div>
        </div>

        {/* Features list */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxHeight: '60vh',
          overflowY: 'auto',
          paddingRight: '0.25rem'
        }} className="pixel-scrollbar">
          {features.map((feature, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', fontFamily: "'Pixelify Sans', sans-serif" }}>
                  {feature.title}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.3' }}>
                  {feature.description}
                </span>
              </div>
              <Button
                variant="default"
                onClick={feature.action}
                style={{
                  borderRadius: '0',
                  fontSize: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  fontFamily: "'Pixelify Sans', sans-serif",
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  width: '120px'
                }}
              >
                {feature.btnText}
              </Button>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div style={{
          fontSize: '0.7rem',
          color: '#64748b',
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          paddingTop: '0.75rem',
          lineHeight: '1.4'
        }}>
          All tools are client-side only. Data resides exclusively in the browser cache or the page URL hash fragment. No databases are used.
        </div>
      </div>
    </div>
  );
}
