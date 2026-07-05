import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Copy, CheckCircle2, ChevronDown } from 'lucide-react';
import { encodeLinkPayload } from '../utils/urlEncoder';
import { InputBase } from './base/input/input';
import { InputGroup } from './base/input/input-group';
import { Button } from './ui/button';

const Spline = lazy(() => import('@splinetool/react-spline'));

// We use the remote production Spline URL
const SPLINE_SCENE_URL = '/spline/landingv2.splinecode';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('3600000'); // Default 1 hour
  const [customSeconds, setCustomSeconds] = useState('30');
  const [customError, setCustomError] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    // This allows the Spline background to follow the user's finger on mobile
    // without blocking native scrolling (by using passive listeners).
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

  const durationOptions = [
    { value: '600000', label: '10 Minutes' },
    { value: '3600000', label: '1 Hour' },
    { value: '86400000', label: '1 Day' },
    { value: '604800000', label: '1 Week' },
    { value: '2592000000', label: '1 Month' },
    { value: '0', label: 'Forever' },
    { value: 'custom', label: 'Custom Time...' }
  ];

  const selectedDuration = durationOptions.find(o => o.value === duration);
  const selectedLabel = duration === 'custom'
    ? `Custom (${customSeconds}s)`
    : (selectedDuration?.label || 'Select Duration');

  const handleCustomSecondsChange = (val: string) => {
    setCustomSeconds(val);
    const num = parseInt(val, 10);
    if (!val) {
      setCustomError('Duration is required');
    } else if (isNaN(num) || num < 30 || num > 99999) {
      setCustomError('Must be between 30 and 99999 seconds');
    } else {
      setCustomError('');
    }
  };

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    let durationMs = 0;
    if (duration === 'custom') {
      const num = parseInt(customSeconds, 10);
      if (isNaN(num) || num < 30 || num > 99999) {
        setCustomError('Must be between 30 and 99999 seconds');
        return;
      }
      durationMs = num * 1000;
    } else {
      durationMs = parseInt(duration, 10);
    }

    const expiry = durationMs === 0 ? 0 : Date.now() + durationMs;
    const encoded = encodeLinkPayload({ url: targetUrl, expiry });

    const generatedLink = `${window.location.origin}/#${encoded}`;
    setShortLink(generatedLink);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (!shortLink) return;
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <div className="glass-card">
          <div className="header">
            <h1>lnk-shrtn</h1>
            <p>Serverless, privacy-first link shortener.</p>
          </div>

          <form onSubmit={handleShorten} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <InputGroup
              isRequired
              label="Destination URL"
              leadingAddon={<InputGroup.Prefix>https://</InputGroup.Prefix>}
            >
              <InputBase
                id="url"
                type="url"
                placeholder="example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (shortLink) {
                    setShortLink('');
                  }
                }}
                required
              />
            </InputGroup>

            <div className="form-group">
              <label htmlFor="duration">Active For</label>
              <div className="custom-dropdown" style={{ position: 'relative' }}>
                <div
                  className="input-field"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span>{selectedLabel}</span>
                  <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.375rem',
                    background: 'rgba(30, 30, 30, 0.4)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    zIndex: 50
                  }}>
                    {durationOptions.map(option => (
                      <div
                        key={option.value}
                        className="dropdown-item"
                        onClick={() => {
                          setDuration(option.value);
                          setIsDropdownOpen(false);
                          if (shortLink) {
                            setShortLink('');
                          }
                        }}
                        style={{
                          padding: '0.625rem 0.875rem',
                          cursor: 'pointer',
                          color: duration === option.value ? '#a5b4fc' : '#fff',
                          background: duration === option.value ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          transition: 'background 0.2s',
                          userSelect: 'none',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = duration === option.value ? 'rgba(255, 255, 255, 0.1)' : 'transparent'; }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {duration === 'custom' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <InputGroup
                  isRequired
                  label="Custom Duration"
                  hint={
                    customError ? (
                      <span style={{ color: '#ef4444' }}>{customError}</span>
                    ) : (
                      'Enter duration in seconds (30s - 99999s)'
                    )
                  }
                  trailingAddon={<InputGroup.Suffix>seconds</InputGroup.Suffix>}
                >
                  <InputBase
                    id="custom-duration"
                    type="number"
                    min="30"
                    max="99999"
                    placeholder="30 - 99999"
                    value={customSeconds}
                    onChange={(e) => {
                      handleCustomSecondsChange(e.target.value);
                      if (shortLink) {
                        setShortLink('');
                      }
                    }}
                    required
                    style={{ borderColor: customError ? '#ef4444' : undefined }}
                  />
                </InputGroup>
              </div>
            )}

            {/* {shortLink && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <InputGroup label="Shortened URL">
                  <InputBase
                    id="short-url"
                    type="text"
                    value={shortLink}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    style={{ color: '#a5b4fc', cursor: 'pointer' }}
                  />
                </InputGroup>
              </div>
            )} */}

            {!shortLink ? (
              <Button
                type="submit"
                variant="default"
                size="lg"
                withArrow
                disabled={duration === 'custom' && !!customError}
                style={{ width: '100%' }}
              >
                Shorten Link
              </Button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={copyToClipboard}
                style={{
                  width: '100%',
                  background: copied ? '#22c55e' : undefined,
                  color: copied ? '#ffffff' : undefined,
                  borderColor: copied ? '#22c55e' : undefined
                }}
              >
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </Button>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
