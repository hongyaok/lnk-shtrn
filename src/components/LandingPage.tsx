import React, { useState, lazy, Suspense } from 'react';
import { ArrowRight, Copy, CheckCircle2, ChevronDown } from 'lucide-react';
import { encodeLinkPayload } from '../utils/urlEncoder';
import { InputBase } from './base/input/input';
import { InputGroup } from './base/input/input-group';

const Spline = lazy(() => import('@splinetool/react-spline'));

// We use the remote production Spline URL
const SPLINE_SCENE_URL = '/spline/landingv2.splinecode';

export default function LandingPage() {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('3600000'); // Default 1 hour
  const [shortLink, setShortLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const durationOptions = [
    { value: '300000', label: '5 Minutes' },
    { value: '600000', label: '10 Minutes' },
    { value: '3600000', label: '1 Hour' },
    { value: '86400000', label: '1 Day' },
    { value: '604800000', label: '1 Week' },
    { value: '2592000000', label: '1 Month' },
    { value: '31536000000', label: '1 Year' },
    { value: '0', label: 'Forever' }
  ];
  const selectedDuration = durationOptions.find(o => o.value === duration);

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    const durationMs = parseInt(duration, 10);
    const expiry = durationMs === 0 ? 0 : Date.now() + durationMs;
    const encoded = encodeLinkPayload({ url: targetUrl, expiry });
    
    const generatedLink = `${window.location.origin}/#${encoded}`;
    setShortLink(generatedLink);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };



  return (
    <>
      <div className="spline-container" style={{ background: '#0a0a0a' }}>
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

          <form onSubmit={handleShorten} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                onChange={(e) => setUrl(e.target.value)}
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
                  <span>{selectedDuration?.label}</span>
                  <ChevronDown size={20} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </div>
                {isDropdownOpen && (
                  <div className="dropdown-menu" style={{ 
                    position: 'absolute', 
                    top: '100%', 
                    left: 0, 
                    right: 0, 
                    marginTop: '0.5rem',
                    background: 'rgba(30, 30, 30, 0.4)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
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
                        }}
                        style={{
                          padding: '0.875rem 1rem',
                          cursor: 'pointer',
                          color: duration === option.value ? '#a5b4fc' : '#fff',
                          background: duration === option.value ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                          transition: 'background 0.2s',
                          userSelect: 'none'
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

            <button type="submit" className="btn-primary">
              Shorten Link
              <ArrowRight size={20} className="arrow-icon" />
            </button>
          </form>

          {shortLink && (
            <div className="result-card" style={{ padding: '0', background: 'transparent', border: 'none' }}>
              <button 
                type="button" 
                onClick={copyToClipboard} 
                className="btn-secondary" 
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px', 
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}
              >
                {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                {copied ? 'Link Copied!' : 'Copy Link'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
