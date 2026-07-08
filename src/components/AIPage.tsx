import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { ArrowLeft, ExternalLink, Search, Link, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { encodeLinkPayload } from '../utils/urlEncoder';
import { PixelSpinner } from './PixelSpinner';

const Spline = lazy(() => import('@splinetool/react-spline'));
const SPLINE_SCENE_URL = '/spline/landingv2.splinecode';

interface Article {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
}

interface RankedArticle {
  title: string;
  summary: string;
  tags: string[];
  url: string;
}

export default function AIPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [rankedArticles, setRankedArticles] = useState<RankedArticle[]>([]);
  const [error, setError] = useState('');
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedSummaries, setExpandedSummaries] = useState<Record<number, boolean>>({});

  const handleCopy = (url: string, index: number) => {
    const shortLink = generateShortLink(url);
    navigator.clipboard.writeText(shortLink);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(prev => prev === index ? null : prev);
    }, 2000);
  };

  const toggleSummary = (index: number) => {
    setExpandedSummaries(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const splineContainerRef = useRef<HTMLDivElement>(null);

  // Setup Spline background event blocking (same as LandingPage)
  useEffect(() => {
    const container = splineContainerRef.current;
    if (!container) return;

    const blockEvent = (e: Event) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const eventsToBlock = ['mousedown', 'mouseup', 'click'];
    eventsToBlock.forEach(event => {
      container.addEventListener(event, blockEvent, true);
    });

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          screenX: touch.screenX,
          screenY: touch.screenY,
          bubbles: true,
          cancelable: true
        });
        window.dispatchEvent(mouseEvent);

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

  // Auto-fetch news on mount
  useEffect(() => {
    const cachedArticles = localStorage.getItem('ai_news_cache');
    const cacheTimestamp = localStorage.getItem('ai_news_timestamp');
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;

    if (cachedArticles && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < TWELVE_HOURS) {
      try {
        setRankedArticles(JSON.parse(cachedArticles));
      } catch (e) {
        fetchAndRankNews(false, []);
      }
    } else {
      fetchAndRankNews(false, []);
    }
  }, []);

  const loadMore = async () => {
    setIsLoadingMore(true);
    await fetchAndRankNews(true, rankedArticles);
    setIsLoadingMore(false);
  };

  const fetchAndRankNews = async (isLoadMore: boolean, currentArticles: RankedArticle[]) => {
    if (!isLoadMore) setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/ai-news.json');
      if (!res.ok) throw new Error('Could not load AI news data. Ensure the scraper has run.');
      const rawArticles: Article[] = await res.json();

      if (rawArticles.length === 0) throw new Error('No articles found in ai-news.json.');

      const fetchCount = isLoadMore ? 5 : 10;
      const articlesBatch = rawArticles.slice(0, 50);
      const existingTitles = currentArticles.map(a => a.title);

      const response1 = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articlesBatch, isLoadMore, existingTitles, fetchCount })
      });

      if (!response1.ok) {
        const errorData = await response1.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to communicate with API proxy');
      }

      const result1 = await response1.json();
      let aiContent = result1.choices[0].message.content;
      aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

      const parsedArticles: RankedArticle[] = JSON.parse(aiContent);
      const finalArticles = Array.isArray(parsedArticles)
        ? parsedArticles
        : (Object.values(parsedArticles).find(v => Array.isArray(v)) as RankedArticle[]) || [];

      if (!finalArticles || finalArticles.length === 0) {
        throw new Error('Model returned an invalid format.');
      }

      const newList = isLoadMore ? [...currentArticles, ...finalArticles.slice(0, fetchCount)] : finalArticles.slice(0, fetchCount);
      setRankedArticles(newList);

      localStorage.setItem('ai_news_cache', JSON.stringify(newList));
      if (!isLoadMore) {
        localStorage.setItem('ai_news_timestamp', Date.now().toString());
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while fetching AI news.');
    } finally {
      if (!isLoadMore) setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const generateShortLink = (url: string) => {
    const encoded = encodeLinkPayload({ url, expiry: 0 });
    return `${window.location.origin}/#${encoded}`;
  };

  const filteredArticles = rankedArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

      <div className="content-wrapper ai-content-wrapper">
        <div className="ai-glass-card">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-left">
              <button
                onClick={handleBack}
                className="ai-back-btn"
                title="Back to Home"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="ai-title">AI Updates</h1>
                <p className="ai-subtitle">Groundbreaking news curated by AI</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="ai-search-wrapper">
              <div className="ai-search-icon">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="ai-search-input"
                onFocus={e => e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.3)'}
                onBlur={e => e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'}
              />
            </div>
          </div>

          {/* Article List */}
          <div className="pixel-scrollbar ai-article-list">
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.7)' }}>
                <PixelSpinner size={48} color="#a5b4fc" style={{ marginBottom: '1rem' }} />
                <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)' }}>Refreshing news...</p>
                <p style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', opacity: 0.6 }}>This may take awhile.</p>
              </div>
            ) : error ? (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <h3 style={{ margin: 0 }}>Error Fetching News</h3>
                <p style={{ margin: 0 }}>{error}</p>
                <Button onClick={() => fetchAndRankNews(false, [])} variant="default" style={{ borderRadius: '0' }}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredArticles.map((article, index) => {
                  const isExpanded = expandedSummaries[index] ?? false;
                  return (
                    <div key={index} className="ai-article-card">
                      {/* Title row */}
                      <div className="ai-article-title-row">
                        <div className="ai-article-num">{index + 1}</div>
                        <h3 className="ai-article-title">{article.title}</h3>
                      </div>

                      {/* Collapsible Summary */}
                      <button
                        className="ai-summary-toggle"
                        onClick={() => toggleSummary(index)}
                        aria-expanded={isExpanded}
                      >
                        <span className="ai-summary-toggle-label">
                          {isExpanded ? 'Hide summary' : 'Show summary'}
                        </span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            flexShrink: 0
                          }}
                        />
                      </button>

                      {isExpanded && (
                        <p className="ai-article-summary">{article.summary}</p>
                      )}

                      {/* Tags + Actions */}
                      <div className="ai-article-footer">
                        <div className="ai-tags">
                          {article.tags.map(tag => (
                            <span key={tag} className="ai-tag">#{tag}</span>
                          ))}
                        </div>

                        <div className="ai-actions">
                          <button
                            onClick={() => handleCopy(article.url, index)}
                            className="ai-copy-btn"
                            style={{
                              background: copiedIndex === index ? '#22c55e' : 'rgba(255, 255, 255, 0.05)',
                              border: `2px solid ${copiedIndex === index ? '#22c55e' : 'rgba(255, 255, 255, 0.2)'}`,
                            }}
                            onMouseEnter={e => {
                              if (copiedIndex !== index) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '4px 4px 0px rgba(255, 255, 255, 0.2)';
                              }
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            title="Copy short link"
                          >
                            {copiedIndex === index ? <CheckCircle2 size={14} /> : <Link size={14} />}
                          </button>

                          <a
                            href={generateShortLink(article.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ai-open-btn"
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '4px 4px 0px rgba(255, 255, 255, 0.2)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {rankedArticles.length < 20 && !searchQuery && (
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    style={{
                      margin: '0.75rem auto',
                      borderRadius: '0',
                      fontFamily: "'Pixelify Sans', sans-serif",
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: isLoadingMore ? 'rgba(255, 255, 255, 0.5)' : '#fff',
                      padding: '0.75rem 2rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore && <PixelSpinner size={16} color="currentColor" />}
                    {isLoadingMore ? 'Loading more...' : 'Find More'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
