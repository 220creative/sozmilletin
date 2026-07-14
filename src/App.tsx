import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { AdminApp } from './admin/AdminApp';
import { getMergedNews, getSettings, applyTheme, injectAnalytics } from './admin/adminStore';
import { Header } from './components/Header';
import { TopBar } from './components/TopBar';
import { MarketTicker } from './components/MarketTicker';
import { Logo } from './components/Logo';
import { AdZone } from './components/AdZone';
import { HomePage } from './pages/HomePage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { mockNews } from './data/mockData';
import scrapedNewsData from './data/scrapedNews.json';
import type { NewsItem } from './data/mockData';
import { Search, X } from 'lucide-react';

const scrapedNews = (scrapedNewsData && scrapedNewsData.length > 0)
  ? (scrapedNewsData as NewsItem[])
  : mockNews;

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  // Admin katmanı (elle eklenen/düzenlenen/gizlenen/öne çıkarılan) taban haberlere uygulanır
  const [newsList, setNewsList] = useState<NewsItem[]>(() => getMergedNews(scrapedNews));

  const settings = getSettings();

  useEffect(() => { setMounted(true); applyTheme(); injectAnalytics(); }, []);



  const [savedNewsIds, setSavedNewsIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saved_news');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleView = (id: string) => {
    setNewsList(prev => prev.map(n => (n.id === id ? { ...n, views: n.views + 1 } : n)));
  };

  const handleToggleSave = (id: string) => {
    setSavedNewsIds(prev => {
      const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('saved_news', JSON.stringify(updated));
      return updated;
    });
  };

  const goCategory = (cat: string) => {
    setActiveCategory(cat);
    setShowSavedOnly(false);
    setSearchQuery('');
    navigate('/');
  };

  const goSaved = (val: boolean) => {
    setShowSavedOnly(val);
    setSearchQuery('');
    navigate('/');
  };

  if (!mounted) return null;

  // Yönetim paneli: site başlık/çubukları olmadan tam ekran
  if (location.pathname.startsWith('/admin')) return <AdminApp />;

  return (
    <div className="app-container">
      <TopBar />

      <Header
        activeCategory={activeCategory}
        setActiveCategory={goCategory}
        savedCount={savedNewsIds.length}
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={goSaved}
        onSearchOpen={() => setSearchOpen(true)}
      />

      {settings.showMarketTicker && <MarketTicker />}

      {/* 3 Sütunlu Yerleşim: Sol Reklam | İçerik | Sağ Reklam */}
      <div className="site-layout">

        {/* Sol Reklam Kolonu */}
        <aside className="site-ad-col site-ad-col--left">
          <AdZone type="sidebar-tall" page="home" />
        </aside>

        {/* Ana İçerik */}
        <div className="site-content">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  newsList={newsList}
                  savedNewsIds={savedNewsIds}
                  activeCategory={activeCategory}
                  showSavedOnly={showSavedOnly}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onView={handleView}
                />
              }
            />
            <Route
              path="/haber/:id"
              element={
                <NewsDetailPage
                  newsList={newsList}
                  savedNewsIds={savedNewsIds}
                  onToggleSave={handleToggleSave}
                  onView={handleView}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Sağ Reklam Kolonu */}
        <aside className="site-ad-col site-ad-col--right">
          <AdZone type="sidebar-tall" page="home" />
        </aside>

      </div>

      {/* Alt Tam Genişlik Reklam */}
      <div className="site-bottom-ad">
        <AdZone type="leaderboard" page="home" />
      </div>

      <footer className="classic-footer">
        <div className="classic-footer-inner">
          <div>
            <Logo variant="compact" />
            <p style={{ color: 'var(--text-secondary)', marginTop: '20px', fontSize: '14px', lineHeight: 1.8 }}>
              {settings.footerText}
            </p>
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', marginBottom: '20px', textTransform: 'uppercase' }}>Kurumsal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Hakkımızda</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Künye</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Gizlilik İlkeleri</a>
              <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>İletişim</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '16px', marginBottom: '20px', textTransform: 'uppercase' }}>Bize Ulaşın</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Haber ihbar hatlarımız üzerinden bize ulaşabilirsiniz.</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{settings.contactEmail}</p>
          </div>
        </div>
      </footer>

      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div
            style={{ width: '100%', maxWidth: '600px', background: 'var(--bg-primary)', padding: '30px', borderRadius: '8px', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSearchOpen(false)} className="modal-close-btn" style={{ top: '10px', right: '10px' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', marginBottom: '20px' }}>Haber Ara</h2>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid var(--accent-red)', paddingBottom: '10px' }}>
              <Search size={20} color="var(--accent-red)" style={{ marginRight: '10px' }} />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchOpen(false)}
                placeholder="Aranacak kelimeyi yazın..."
                style={{ flex: 1, border: 'none', background: 'none', fontSize: '18px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
