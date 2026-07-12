import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { ChevronDown } from 'lucide-react';
import { encodeNotePayload } from '../utils/urlEncoder';
import { encryptNote } from '../utils/crypto';
import ShareModal from './ShareModal';
import { InputBase } from './base/input/input';
import { InputGroup } from './base/input/input-group';
import { Button } from './ui/button';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE_URL = '/spline/landingv2.splinecode';

export default function CreateNotePage() {
  const [noteText, setNoteText] = useState('');
  const [password, setPassword] = useState('');
  const [shortLink, setShortLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const [duration, setDuration] = useState('3600000'); // Default 1 hour
  const [customValue, setCustomValue] = useState('30');
  const [customUnit, setCustomUnit] = useState('minutes');
  const [customError, setCustomError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    if (!val) return 'Duration is required';
    if (isNaN(num) || num <= 0) return 'Must be a positive number';
    if (unit === 'seconds' && num < 30) return 'Minimum is 30 seconds';
    let months = 0;
    if (unit === 'seconds') months = num / (30 * 24 * 60 * 60);
    else if (unit === 'minutes') months = num / (30 * 24 * 60);
    else if (unit === 'days') months = num / 30;
    else if (unit === 'months') months = num;
    if (months > 999) return 'Maximum duration is 999 months';
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText || !password) return;

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

    setIsEncrypting(true);
    try {
      const { iv, ciphertext } = await encryptNote(noteText, password);
      const encoded = encodeNotePayload(iv, ciphertext, expiry);
      
      const generatedLink = `${window.location.origin}/#${encoded}`;

      try {
        const historyJson = localStorage.getItem('lnk_shrtn_history');
        const history = historyJson ? JSON.parse(historyJson) : [];
        const newLink = {
          id: encoded,
          url: `Burn Note (Encrypted)`,
          shortLink: generatedLink,
          createdAt: Date.now(),
          durationLabel: selectedLabel,
          expiry: expiry
        };
        const filteredHistory = history.filter((item: any) => item.id !== encoded);
        filteredHistory.unshift(newLink);
        localStorage.setItem('lnk_shrtn_history', JSON.stringify(filteredHistory));
      } catch (e) {
        console.error('Failed to save link to history:', e);
      }

      setShortLink(generatedLink);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to encrypt note', err);
    } finally {
      setIsEncrypting(false);
    }
  };

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

      <div className="content-wrapper">
        <div className="glass-card">
          <div className="header">
            <h1>Burn Note</h1>
            <p>Zero-knowledge encrypted text sharing.</p>
          </div>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <InputGroup isRequired label="Secret Note">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter sensitive text here..."
                required
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  color: 'black',
                  fontFamily: 'inherit',
                  minHeight: '100px',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </InputGroup>

            <InputGroup isRequired label="Encryption Password">
              <InputBase
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                          if (shortLink) setShortLink('');
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
                      if (shortLink) setShortLink('');
                    }}
                    required
                    style={{ borderColor: customError ? '#ef4444' : undefined }}
                  />
                </InputGroup>
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              size="lg"
              withArrow
              disabled={isEncrypting || !noteText || !password || (duration === 'custom' && !!customError)}
              style={{ width: '100%' }}
            >
              {isEncrypting ? 'Encrypting...' : 'Create Encrypted Link'}
            </Button>
            
            <a href="/" className="btn-secondary" style={{ textAlign: 'center', display: 'block', textDecoration: 'none', marginTop: '0.5rem' }}>
              Back to URL Shortener
            </a>
          </form>
        </div>
      </div>

      <ShareModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        shortLink={shortLink}
      />
    </>
  );
}
