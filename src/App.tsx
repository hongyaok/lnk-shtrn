import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import RedirectPage from './components/RedirectPage';
import ExpiredPage from './components/ExpiredPage';
import StatusIndicator from './components/StatusIndicator';
import { decodeLinkPayload } from './utils/urlEncoder';

type Page = 'landing' | 'redirect' | 'expired';

function App() {
  const [page, setPage] = useState<Page>('landing');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash.length === 0) {
        setPage('landing');
        return;
      }

      // Check if the link is expired before routing
      const decoded = decodeLinkPayload(hash);
      if (decoded && decoded.expiry !== 0 && Date.now() > decoded.expiry) {
        setPage('expired');
      } else {
        setPage('redirect');
      }
    };

    // Initial check
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (page) {
      case 'expired':
        return <ExpiredPage />;
      case 'redirect':
        return <RedirectPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <>
      {renderPage()}
      <StatusIndicator state="fixing" label="Testing" />
      <a 
        href="https://github.com/hongyaok/lnk-shtrn" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="github-link"
        title="View on GitHub"
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
    </>
  );
}

export default App;
