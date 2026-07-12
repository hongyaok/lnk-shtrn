import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import RedirectPage from './components/RedirectPage';
import ExpiredPage from './components/ExpiredPage';
import MyLinksPage from './components/MyLinksPage';
import AIPage from './components/AIPage';
import StatusIndicator from './components/StatusIndicator';
import { decodeLinkPayload, decodeNotePayload, decodeMicroPagePayload } from './utils/urlEncoder';
import { Sparkles, HelpCircle } from 'lucide-react';
import PrivacyModal from './components/PrivacyModal';
import FeaturesModal from './components/FeaturesModal';
import WelcomeModal from './components/WelcomeModal';
import CreateNotePage from './components/CreateNotePage';
import ViewNotePage from './components/ViewNotePage';
import CreateTreePage from './components/CreateTreePage';
import ViewTreePage from './components/ViewTreePage';

type Page = 'landing' | 'redirect' | 'expired' | 'my-links' | 'ai' | 'create-note' | 'create-tree' | 'view-note' | 'view-tree';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    if (page === 'landing') {
      const lastShown = localStorage.getItem('lnk_shrtn_last_welcome_shown');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in ms

      if (!lastShown || (now - parseInt(lastShown, 10)) > oneDay) {
        setIsWelcomeModalOpen(true);
        localStorage.setItem('lnk_shrtn_last_welcome_shown', now.toString());
      }
    }
  }, [page]);

  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      if (path === '/my-links') {
        setPage('my-links');
        return;
      }
      if (path === '/ai') {
        setPage('ai');
        return;
      }

      if (path === '/create-note') {
        setPage('create-note');
        return;
      }
      if (path === '/create-tree') {
        setPage('create-tree');
        return;
      }

      const hash = window.location.hash.replace(/^#/, '');
      if (hash.length === 0) {
        setPage('landing');
        return;
      }

      const decodedNote = decodeNotePayload(hash);
      if (decodedNote) {
        setPage('view-note');
        return;
      }

      const decodedTree = decodeMicroPagePayload(hash);
      if (decodedTree) {
        setPage('view-tree');
        return;
      }

      // Check if the link is expired before routing
      const decoded = decodeLinkPayload(hash);
      if (decoded && decoded.expiry !== 0 && Date.now() > decoded.expiry) {
        setPage('expired');
      } else if (decoded) {
        setPage('redirect');
      } else {
        // Fallback to landing if totally invalid
        setPage('landing');
      }
    };

    // Initial check
    handleNavigation();

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'expired':
        return <ExpiredPage />;
      case 'redirect':
        return <RedirectPage />;
      case 'my-links':
        return <MyLinksPage />;
      case 'ai':
        return <AIPage />;
      case 'create-note':
        return <CreateNotePage />;
      case 'create-tree':
        return <CreateTreePage />;
      case 'view-note':
        return <ViewNotePage />;
      case 'view-tree':
        return <ViewTreePage />;
      default:
        return <LandingPage />;
    }
  };

  const handleMyLinksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/my-links');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <>
      {renderPage()}
      <div style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <a 
          href="https://github.com/hongyaok/lnk-shtrn" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="github-link"
          title="View on GitHub"
          style={{ position: 'static' }}
        >
          <svg 
            viewBox="0 0 24 24" 
            width="20" 
            height="20" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
        <StatusIndicator state="active" label="online (beta)" />
      </div>
      
      <div style={{
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        {(page === 'landing' || page === 'my-links') && (
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="github-link"
            title="Privacy & Data Info"
            style={{ position: 'static' }}
          >
            <HelpCircle size={20} />
          </button>
        )}
        <button
          onClick={() => setIsFeaturesModalOpen(true)}
          className="github-link"
          title="More Features"
          style={{ position: 'static' }}
        >
          <Sparkles size={20} />
        </button>
        {page !== 'my-links' && (
          <button
            onClick={handleMyLinksClick}
            className="github-link"
            title="My Links"
            style={{ position: 'static' }}
          >
            <svg 
              viewBox="0 0 24 24" 
              width="20" 
              height="20" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
          </button>
        )}
      </div>

      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
      <FeaturesModal
        isOpen={isFeaturesModalOpen}
        onClose={() => setIsFeaturesModalOpen(false)}
      />
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => {
          setIsWelcomeModalOpen(false);
        }}
      />
    </>
  );
}

export default App;
