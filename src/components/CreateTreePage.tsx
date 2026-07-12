import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { encodeMicroPagePayload } from '../utils/urlEncoder';
import { type MicroPageData } from '../utils/microPageEncoder';
import ShareModal from './ShareModal';
import { InputBase } from './base/input/input';
import { InputGroup } from './base/input/input-group';
import { Button } from './ui/button';
import { Plus, Trash } from 'lucide-react';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE_URL = '/spline/landingv2.splinecode';

export default function CreateTreePage() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');

  const [links, setLinks] = useState<{ title: string; url: string }[]>([{ title: '', url: '' }]);
  const [shortLink, setShortLink] = useState('');
  const [showModal, setShowModal] = useState(false);
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure URLs are valid format
    const cleanedLinks = links.map(l => {
      let url = l.url.trim();
      if (url && !/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }
      return { title: l.title.trim(), url };
    });

    const data: MicroPageData = { 
      name: name.trim(), 
      bio: bio.trim(), 
      links: cleanedLinks 
    };
    const encoded = encodeMicroPagePayload(data);
    
    const generatedLink = `${window.location.origin}/#${encoded}`;

    try {
      const historyJson = localStorage.getItem('lnk_shrtn_history');
      const history = historyJson ? JSON.parse(historyJson) : [];
      const newLink = {
        id: encoded,
        url: `Micro Page: ${data.name}`,
        shortLink: generatedLink,
        createdAt: Date.now(),
        durationLabel: 'Forever',
        expiry: 0
      };
      const filteredHistory = history.filter((item: any) => item.id !== encoded);
      filteredHistory.unshift(newLink);
      localStorage.setItem('lnk_shrtn_history', JSON.stringify(filteredHistory));
    } catch (e) {
      console.error('Failed to save link to history:', e);
    }

    setShortLink(generatedLink);
    setShowModal(true);
  };

  const updateLink = (index: number, field: 'title' | 'url', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  const addLink = () => {
    if (links.length < 5) {
      setLinks([...links, { title: '', url: '' }]);
    }
  };

  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks);
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

      <div className="content-wrapper" style={{ paddingTop: '5vh', paddingBottom: '10vh' }}>
        <div className="glass-card" style={{ maxWidth: '500px' }}>
          <div className="header">
            <h1 style={{ whiteSpace: 'nowrap', fontSize: 'clamp(1.5rem, 8vw, 2.5rem)' }}>Micro-Landing Page</h1>
            <p>Create a serverless profile page.</p>
          </div>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <InputGroup isRequired label="Display Name">
              <InputBase
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </InputGroup>

            <InputGroup label="Bio (Optional)">
              <InputBase
                id="bio"
                type="text"
                placeholder="A short bio about you"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </InputGroup>

            <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.5rem' }}>Links (Max 5)</h3>
              {links.map((link, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.5rem', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  padding: '0.75rem', 
                  borderRadius: '0',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '0.5rem',
                  position: 'relative'
                }}>
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  )}
                  <div className="input-wrapper">
                    <InputBase
                      type="text"
                      placeholder="Link Title (e.g. My Twitter)"
                      value={link.title}
                      onChange={(e) => updateLink(index, 'title', e.target.value)}
                      required={!!link.url}
                      style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                  <div className="input-wrapper">
                    <InputBase
                      type="text"
                      placeholder="example.com"
                      value={link.url}
                      onChange={(e) => updateLink(index, 'url', e.target.value)}
                      required={!!link.title}
                      style={{ fontSize: '0.9rem', padding: '0.5rem 0.75rem' }}
                    />
                  </div>
                </div>
              ))}
              
              {links.length < 5 && (
                <button 
                  type="button" 
                  onClick={addLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: '0',
                    color: '#fff',
                    fontFamily: "'Pixelify Sans', sans-serif",
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                >
                  <Plus size={16} /> Add Link
                </button>
              )}
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              withArrow
              disabled={!name || links.every(l => !l.title || !l.url)}
              style={{ width: '100%' }}
            >
              Generate Page Link
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
