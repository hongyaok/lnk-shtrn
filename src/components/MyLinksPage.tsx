import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Trash2, ExternalLink, QrCode, ArrowLeft, Home, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import ShareModal from './ShareModal';
import { decodeLinkPayload } from '../utils/urlEncoder';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE_URL = '/spline/landingv2.splinecode';

interface SavedLink {
  id: string;
  url: string;
  shortLink: string;
  createdAt: number;
  durationLabel: string;
  expiry: number;
}

export default function MyLinksPage() {
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [activeShareLink, setActiveShareLink] = useState<string | null>(null);
  const [revealedLinks, setRevealedLinks] = useState<Record<string, boolean>>({});

  const splineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = splineContainerRef.current;
    if (!container) return;

    const blockEvent = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    // Only block mouse clicks and drags to avoid selection/camera rotation issues on desktop.
    // Do not block touch/pointer down/up/move to ensure smooth mobile scrolling and touch reactions.
    const eventsToBlock = [
      'mousedown',
      'mouseup',
      'click'
    ];

    eventsToBlock.forEach(event => {
      container.addEventListener(event, blockEvent, true);
    });

    // Translate touch events to mouse/pointer move events globally.
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];

        // Dispatch mousemove
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          screenX: touch.screenX,
          screenY: touch.screenY,
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(mouseEvent);

        // Dispatch pointermove
        const pointerEvent = new PointerEvent('pointermove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          screenX: touch.screenX,
          screenY: touch.screenY,
          bubbles: true,
          cancelable: true,
          pointerType: 'touch'
        });
        window.dispatchEvent(pointerEvent);
      }
    };

    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });

    return () => {
      eventsToBlock.forEach(event => {
        container.removeEventListener(event, blockEvent, true);
      });
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedLinks(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    try {
      const historyJson = localStorage.getItem('lnk_shrtn_history');
      if (historyJson) {
        setLinks(JSON.parse(historyJson));
      }
    } catch (e) {
      console.error('Failed to load links from localStorage', e);
    }
  }, []);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your link history?')) {
      localStorage.removeItem('lnk_shrtn_history');
      setLinks([]);
    }
  };

  const handleGoHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <>
      <div ref={splineContainerRef} className="spline-container" style={{ background: '#0a0a0a' }}>
        <Suspense fallback={null}>
          <Spline
            scene={SPLINE_SCENE_URL}
            onLoad={() => setSplineLoaded(true)}
            style={{
              opacity: splineLoaded ? 1 : 0,
              transition: 'opacity 1s ease-in-out'
            }}
          />
        </Suspense>
      </div>

      <div className="content-wrapper">
        <div style={{
          maxWidth: '600px',
          width: '95%',
          background: 'rgba(10, 10, 10, 0.85)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '2rem',
          pointerEvents: 'auto',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <div className="header" style={{ marginBottom: '1.5rem', marginTop: 0 }}>
            <h1>My Links</h1>
            <p>Your created shortened links history</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', pointerEvents: 'auto' }}>
            {links.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p style={{ letterSpacing: '0.05em', fontSize: '0.9rem' }}>No links created yet on this device.</p>
                <Button variant="secondary" onClick={handleGoHome} style={{ marginTop: '1.5rem', marginInline: 'auto' }}>
                  <Home size={16} /> Go Create One
                </Button>
              </div>
            ) : (
              <>
                <div className="history-container" style={{ maxHeight: '310px', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {links.map((link) => {
                    const isUsable = link.expiry === 0 || Date.now() < link.expiry;
                    const statusState = isUsable ? 'active' : 'down';
                    const statusLabel = isUsable ? 'active' : 'expired';
                    const formattedDate = new Date(link.createdAt).toLocaleString();
                    const decoded = decodeLinkPayload(link.id);
                    const destinationUrl = decoded ? decoded.url : link.url || 'Unknown';

                    return (
                      <div key={link.id} className="history-item" style={{
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '2px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div className="status-indicator" data-state={statusState} style={{ position: 'static', padding: '0', background: 'none', border: 'none', gap: '0.375rem' }}>
                            <span className="status-dot" />
                            <span className="status-label" style={{ fontSize: '0.65rem' }}>{statusLabel}</span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formattedDate}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</span>
                            <button
                              type="button"
                              onClick={() => toggleReveal(link.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                              title={revealedLinks[link.id] ? "Hide Destination URL" : "Show Destination URL"}
                            >
                              {revealedLinks[link.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <a href={destinationUrl} target="_blank" rel="noopener noreferrer" style={{
                            color: 'var(--text-main)',
                            fontSize: '0.85rem',
                            wordBreak: 'break-all',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            filter: revealedLinks[link.id] ? 'none' : 'blur(5px)',
                            transition: 'filter 0.2s ease',
                            pointerEvents: revealedLinks[link.id] ? 'auto' : 'none',
                            userSelect: revealedLinks[link.id] ? 'auto' : 'none'
                          }}>
                            {destinationUrl} <ExternalLink size={12} style={{ flexShrink: 0 }} />
                          </a>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Short Link</span>
                          <a href={link.shortLink} target="_blank" rel="noopener noreferrer" style={{
                            color: '#a5b4fc',
                            fontSize: '0.85rem',
                            wordBreak: 'break-all',
                            textDecoration: 'underline'
                          }}>
                            {link.shortLink}
                          </a>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Duration: {link.durationLabel}
                          </span>
                          {isUsable && (
                            <Button size="sm" variant="secondary" onClick={() => setActiveShareLink(link.shortLink)}>
                              <QrCode size={14} /> Share
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button variant="secondary" onClick={handleGoHome} style={{ flex: 1 }}>
                    <ArrowLeft size={16} /> Home
                  </Button>
                  <Button variant="outline" onClick={handleClearHistory} style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                    <Trash2 size={16} /> Clear History
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={!!activeShareLink}
        onClose={() => setActiveShareLink(null)}
        shortLink={activeShareLink || ''}
      />
    </>
  );
}
