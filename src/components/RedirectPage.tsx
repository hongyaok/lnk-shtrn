import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { decodeLinkPayload, type LinkPayload } from '../utils/urlEncoder';
import { Button } from './ui/button';
import { PixelSpinner } from './PixelSpinner';

const Spline = lazy(() => import('@splinetool/react-spline'));

// We use the remote production Spline URL
const SPLINE_SCENE_URL = '/spline/redirect2.splinecode';

const getDisplayLink = (url: string): string => {
  const protocolIndex = url.indexOf('://');
  let firstSlashIndex = -1;
  if (protocolIndex !== -1) {
    firstSlashIndex = url.indexOf('/', protocolIndex + 3);
  } else {
    firstSlashIndex = url.indexOf('/');
  }

  if (firstSlashIndex !== -1) {
    const mainPart = url.substring(0, firstSlashIndex);
    const remainder = url.substring(firstSlashIndex + 1);
    if (remainder.length > 0) {
      return mainPart + '/...';
    }
    return mainPart;
  }
  return url;
};

export default function RedirectPage() {
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<LinkPayload | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [isTitleLoading, setIsTitleLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const splineContainerRef = useRef<HTMLDivElement>(null);

  const handleCancel = () => {
    setCancelled(true);
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    const container = splineContainerRef.current;
    if (!container) return;

    const blockEvent = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const eventsToBlock = [
      'mousedown',
      'mouseup',
      'click',
      'pointerdown',
      'pointerup',
      'touchstart',
      'touchend'
    ];

    eventsToBlock.forEach(event => {
      container.addEventListener(event, blockEvent, true);
    });

    return () => {
      eventsToBlock.forEach(event => {
        container.removeEventListener(event, blockEvent, true);
      });
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
      setError('Invalid link: No payload found.');
      return;
    }

    const decoded = decodeLinkPayload(hash);
    if (!decoded) {
      setError('Invalid link: Malformed payload.');
      return;
    }

    setPayload(decoded);
  }, []);

  const fetchMicrolinkTitle = (url: string) => {
    fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Microlink failed');
        return res.json();
      })
      .then((data) => {
        if (data && data.status === 'success' && data.data && data.data.title) {
          setPageTitle(data.data.title);
        }
      })
      .catch((err) => {
        console.error('Fallback title fetching failed:', err);
      });
  };

  useEffect(() => {
    if (payload && payload.url) {
      setIsTitleLoading(true);
      fetch('/api/title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: payload.url }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('API failed');
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            throw new Error('Returned HTML instead of JSON (likely local Vite server fallback)');
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.title) {
            setPageTitle(data.title);
          } else {
            fetchMicrolinkTitle(payload.url);
          }
        })
        .catch((err) => {
          console.warn('Primary title API failed, trying fallback:', err);
          fetchMicrolinkTitle(payload.url);
        })
        .finally(() => {
          setIsTitleLoading(false);
        });
    }
  }, [payload]);

  useEffect(() => {
    if (cancelled) return;

    // Only start the redirect timer once the Spline scene has loaded
    if (splineLoaded && payload && !error) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.href = payload.url;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [splineLoaded, payload, error, cancelled]);

  if (error) {
    return (
      <div className="redirect-container">
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error</h1>
          <p>{error}</p>
          <a href="/" className="btn-secondary" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none' }}>
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <div ref={splineContainerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Suspense fallback={null}>
          <Spline
            scene={SPLINE_SCENE_URL}
            onLoad={(splineApp) => {
              setSplineLoaded(true);
              if (splineApp && (splineApp as any).clock) {
                const clock = (splineApp as any).clock;
                const originalGetDelta = clock.getDelta;
                clock.getDelta = function (this: any) {
                  return originalGetDelta.apply(this) * 2.5; // double speed
                };
                const originalGetElapsedTime = clock.getElapsedTime;
                clock.getElapsedTime = function (this: any) {
                  return originalGetElapsedTime.apply(this) * 2.5; // double speed
                };
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              opacity: splineLoaded ? 1 : 0,
              transition: 'opacity 0.5s ease'
            }}
          />
        </Suspense>
      </div>

      {/* Main Content Area (Centered Vertically and Horizontally) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '90%',
        maxWidth: '420px',
        textAlign: 'center'
      }}>
        {/* lnk-shtrn Title */}
        <h1 className="redirect-title" style={{ margin: 0 }}>lnk-shtrn</h1>

        {/* Pulsing Redirect State */}
        <h2 className="redirect-text" style={{ margin: 0, fontSize: '1.05rem', letterSpacing: '0.05em' }}>
          Redirecting in {countdown}s...
        </h2>

        {/* Browser Live Preview Card */}
        {payload && (
          <div style={{
            width: '100%',
            background: 'rgba(15, 15, 15, 0.95)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '0', // Square theme
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto'
          }}>
            {/* Top Address Bar / Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.05)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.4rem 0.75rem',
              gap: '0.5rem',
              userSelect: 'none'
            }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }}></span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }}></span>
              </div>
              <div style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.65rem',
                color: '#94a3b8',
                padding: '0.15rem 0.5rem',
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontFamily: "'Pixelify Sans', sans-serif"
              }}>
                {payload.url}
              </div>
            </div>
            {/* Image Preview Viewport */}
            <div style={{ position: 'relative', width: '100%', height: '220px', background: '#121212', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!imageLoaded && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 15, 15, 0.85)', zIndex: 10 }}>
                  <PixelSpinner size={32} color="#a5b4fc" />
                </div>
              )}
              {imageError ? (
                <div style={{
                  padding: '1.5rem',
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  fontFamily: "'Pixelify Sans', sans-serif",
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  height: '100%'
                }}>
                  <div style={{ color: '#a5b4fc', fontSize: '1rem', fontWeight: 'bold' }}>Preview Unavailable</div>
                  <div>Unable to load live preview for this website.</div>
                </div>
              ) : (
                <img
                  src={`https://api.microlink.io/?url=${encodeURIComponent(payload.url)}&screenshot=true&embed=screenshot.url`}
                  alt="Website Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: imageLoaded ? 'block' : 'none'
                  }}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(true);
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Destination Title Details */}
        {payload && (
          <div style={{
            pointerEvents: 'auto',
            fontSize: '1rem',
            color: '#a5b4fc',
            wordBreak: 'break-word',
            fontFamily: "'Pixelify Sans', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
            width: '100%'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Destination
            </span>
            <span style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: '1.25' }}>
              {isTitleLoading ? (
                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Loading title...</span>
              ) : (
                pageTitle || getDisplayLink(payload.url)
              )}
            </span>
          </div>
        )}

        {/* Cancel Button */}
        <Button
          onClick={handleCancel}
          variant="default"
          size="lg"
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '240px'
          }}
        >
          Cancel Redirect
        </Button>
      </div>
    </div>
  );
}
