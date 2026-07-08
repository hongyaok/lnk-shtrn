import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { decodeLinkPayload, type LinkPayload } from '../utils/urlEncoder';

const Spline = lazy(() => import('@splinetool/react-spline'));

// We use the remote production Spline URL
const SPLINE_SCENE_URL = '/spline/loading.splinecode';

const getDisplayLink = (url: string): string => {
  const protocolIndex = url.indexOf('://');
  if (protocolIndex !== -1) {
    const firstSlashIndex = url.indexOf('/', protocolIndex + 3);
    if (firstSlashIndex !== -1) {
      return url.substring(0, firstSlashIndex);
    }
  } else {
    const firstSlashIndex = url.indexOf('/');
    if (firstSlashIndex !== -1) {
      return url.substring(0, firstSlashIndex);
    }
  }
  return url;
};

export default function RedirectPage() {
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<LinkPayload | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const splineContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Only start the redirect timer once the Spline scene has loaded
    if (splineLoaded && payload && !error) {
      const timer = setTimeout(() => {
        window.location.href = payload.url;
      }, 3500); // Redirect after 2 seconds (animation speed is doubled)

      return () => clearTimeout(timer);
    }
  }, [splineLoaded, payload, error]);

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

      <div style={{
        position: 'absolute',
        top: '15vh',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h1 className="redirect-title">lnk-shtrn</h1>
      </div>

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <h2 className="redirect-text">Redirecting...</h2>
        {payload && (
          <div style={{
            fontSize: '1rem',
            color: '#a5b4fc',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Destination
            </span>
            <span style={{ fontWeight: 600 }}>
              {getDisplayLink(payload.url)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
