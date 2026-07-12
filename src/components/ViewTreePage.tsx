import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { decodeMicroPagePayload } from '../utils/urlEncoder';
import { type MicroPageData } from '../utils/microPageEncoder';
import { Button } from './ui/button';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE_URL = '/spline/redirect2.splinecode';

export default function ViewTreePage() {
  const [data, setData] = useState<MicroPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const splineContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
      setError('Invalid link: No payload found.');
      return;
    }

    const decoded = decodeMicroPagePayload(hash);
    if (!decoded) {
      setError('Invalid link: Malformed payload.');
      return;
    }

    setData(decoded);
  }, []);

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

      <div className="content-wrapper" style={{ padding: 0 }}>
        {data && (
          <div style={{ width: '100%', maxWidth: '440px', padding: '2rem 1rem' }}>
            <div 
              className="glass-card" 
              style={{ 
                padding: '2.5rem 2rem', 
                width: '100%',
                background: 'rgba(10, 10, 10, 0.45)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '2.5rem',
                alignItems: 'center',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem', width: '100%' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#ffffff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{data.name}</h1>
                {data.bio && <p style={{ color: '#f1f5f9', margin: '0', fontSize: '1.05rem', fontWeight: 500, textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>{data.bio}</p>}
              </div>
            
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
                {data.links.map((link, idx) => {
                  let url = link.url;
                  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                  return (
                    <Button
                      key={idx}
                      variant="default"
                      size="lg"
                      withArrow
                      onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                      style={{ width: '100%' }}
                    >
                      {link.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
