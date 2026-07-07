import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { CheckCircle2, ChevronDown, X, QrCode, Download, Link } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
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
  const [customValue, setCustomValue] = useState('30');
  const [customUnit, setCustomUnit] = useState('minutes');
  const [customError, setCustomError] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCopied, setQrCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    ? `Custom (${customValue} ${customUnit})`
    : (selectedDuration?.label || 'Select Duration');

  const validateCustomDuration = (val: string, unit: string) => {
    const num = parseInt(val, 10);
    if (!val) {
      return 'Duration is required';
    }
    if (isNaN(num) || num <= 0) {
      return 'Must be a positive number';
    }
    if (unit === 'seconds' && num < 30) {
      return 'Minimum is 30 seconds';
    }

    let months = 0;
    if (unit === 'seconds') months = num / (30 * 24 * 60 * 60);
    else if (unit === 'minutes') months = num / (30 * 24 * 60);
    else if (unit === 'days') months = num / 30;
    else if (unit === 'months') months = num;

    if (months > 999) {
      return 'Maximum duration is 999 months';
    }
    return '';
  };

  const handleCustomValueChange = (val: string) => {
    setCustomValue(val);
    setCustomError(validateCustomDuration(val, customUnit));
  };

  const handleCustomUnitChange = (unit: string) => {
    setCustomUnit(unit);
    setCustomError(validateCustomDuration(customValue, unit));
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
      const error = validateCustomDuration(customValue, customUnit);
      if (error) {
        setCustomError(error);
        return;
      }
      const num = parseInt(customValue, 10);

      let multiplier = 1000; // seconds
      if (customUnit === 'minutes') multiplier = 60 * 1000;
      else if (customUnit === 'days') multiplier = 24 * 60 * 60 * 1000;
      else if (customUnit === 'months') multiplier = 30 * 24 * 60 * 60 * 1000;

      durationMs = num * multiplier;
    } else {
      durationMs = parseInt(duration, 10);
    }

    const expiry = durationMs === 0 ? 0 : Date.now() + durationMs;
    const encoded = encodeLinkPayload({ url: targetUrl, expiry });

    const generatedLink = `${window.location.origin}/#${encoded}`;
    setShortLink(generatedLink);
    setCopied(false);
    setQrCopied(false);
    setShowModal(true);
  };

  const copyToClipboard = () => {
    if (!shortLink) return;
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyQRCode = async () => {
    const canvas = document.getElementById('qr-canvas-modal') as HTMLCanvasElement;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        setQrCopied(true);
        setTimeout(() => setQrCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy QR code', err);
      }
    });
  };

  const downloadQR = () => {
    const canvas = document.getElementById('qr-canvas-modal') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = 'qrcode.png';
      a.href = url;
      a.click();
    }
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
            <h1>lnk-shtrn</h1>
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
                    background: 'rgba(30, 30, 30, 0.95)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0',
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
                      `Enter duration in ${customUnit} (max 999 months)`
                    )
                  }
                  trailingAddon={
                    <InputGroup.Suffix>
                      <select
                        value={customUnit}
                        onChange={(e) => {
                          handleCustomUnitChange(e.target.value);
                          if (shortLink) setShortLink('');
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'inherit',
                          outline: 'none',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 'inherit'
                        }}
                      >
                        <option value="seconds" style={{ color: '#0a0a0a' }}>seconds</option>
                        <option value="minutes" style={{ color: '#0a0a0a' }}>minutes</option>
                        <option value="days" style={{ color: '#0a0a0a' }}>days</option>
                        <option value="months" style={{ color: '#0a0a0a' }}>months</option>
                      </select>
                    </InputGroup.Suffix>
                  }
                >
                  <InputBase
                    id="custom-duration"
                    type="number"
                    min={customUnit === 'seconds' ? "30" : "1"}
                    placeholder={`e.g. 30`}
                    value={customValue}
                    onChange={(e) => {
                      handleCustomValueChange(e.target.value);
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
          </form>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: 'rgba(30,30,30,0.95)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: '1.5rem', position: 'relative', width: '90%', maxWidth: '400px'
          }}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', opacity: 0.7, transition: 'opacity 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <X size={24} />
            </button>

            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Your Link is Ready</h2>

            <div style={{ position: 'relative', padding: '1rem', background: '#fff', borderRadius: '0.5rem' }}>
              <QRCodeCanvas
                id="qr-canvas-modal"
                value={shortLink}
                size={200}
                imageSettings={{
                  src: '/favicon.svg',
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <button
                type="button"
                onClick={downloadQR}
                style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff',
                  borderRadius: '0.25rem', padding: '0.25rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: 0.8, transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                title="Download QR Code"
              >
                <Download size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={copyToClipboard}
                style={{
                  flex: 1,
                  background: copied ? '#22c55e' : undefined,
                  color: copied ? '#ffffff' : undefined,
                  borderColor: copied ? '#22c55e' : undefined
                }}
              >
                {copied ? <CheckCircle2 size={18} /> : <Link size={18} />}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={copyQRCode}
                style={{
                  flex: 1,
                  background: qrCopied ? '#22c55e' : undefined,
                  color: qrCopied ? '#ffffff' : undefined,
                  borderColor: qrCopied ? '#22c55e' : undefined
                }}
              >
                {qrCopied ? <CheckCircle2 size={18} /> : <QrCode size={18} />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
