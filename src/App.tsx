import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopBar } from './components/TopBar';
import { MarketTicker } from './components/MarketTicker';
import { BreakingNews } from './components/BreakingNews';
import { NewsCard } from './components/NewsCard';
import { NewsDetailModal } from './components/NewsDetailModal';
import { Logo } from './components/Logo';
import { AdZone } from './components/AdZone';
import { mockNews } from './data/mockData';
import scrapedNewsData from './data/scrapedNews.json';
import type { NewsItem } from './data/mockData';
import { Bookmark, Search, X } from 'lucide-react';

const scrapedNews = (scrapedNewsData && scrapedNewsData.length > 0) 
  ? (scrapedNewsData as NewsItem[]) 
  : mockNews;

function App() {
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  // Haber listesini state'te tutuyoruz ki görüntülenme sayısı gibi güncellemeler
  // import edilen JSON'u mutasyona uğratmadan React akışıyla yönetilsin.
  const [newsList, setNewsList] = useState<NewsItem[]>(() => scrapedNews.map(n => ({ ...n })));

  useEffect(() => {
    setMounted(true);
  }, []);

  const [savedNewsIds, setSavedNewsIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('saved_news');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleNewsOpen = (news: NewsItem) => {
    const updated = { ...news, views: news.views + 1 };
    setNewsList(prev => prev.map(n => (n.id === news.id ? updated : n)));
    setSelectedNews(updated);
  };

  const handleToggleSave = (id: string) => {
    setSavedNewsIds(prev => {
      const isAlreadySaved = prev.includes(id);
      const updated = isAlreadySaved ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('saved_news', JSON.stringify(updated));
      return updated;
    });
  };

  // RSS haberlerinde isBreaking olmadığı için en son çekilen 4 haberi son dakika yapıyoruz
  const breakingNews = newsList.slice(0, 4);

  const filteredNews = newsList.filter(news => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return news.title.toLowerCase().includes(query) || news.summary.toLowerCase().includes(query);
    }
    if (showSavedOnly && !savedNewsIds.includes(news.id)) return false;
    if (activeCategory !== 'Tümü' && news.category !== activeCategory) return false;
    return true;
  });

  const heroNews = filteredNews[0]; // İlk haber büyük manşet olur
  const gridNews = filteredNews.slice(1); // Geri kalanı iki sütunlu grid

  // Sidebar trends (en çok okunanlar)
  const trendingNews = [...newsList].sort((a, b) => b.views - a.views).slice(0, 5);

  if (!mounted) return null;

  return (
    <div className="app-container">
      <TopBar />

      <Header
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        savedCount={savedNewsIds.length}
        showSavedOnly={showSavedOnly}
        setShowSavedOnly={setShowSavedOnly}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <MarketTicker />

      <BreakingNews newsItems={breakingNews} onNewsClick={handleNewsOpen} />

      <main className="main-content">
        
        {/* Leaderboard Ad */}
        <AdZone type="leaderboard" className="ad-leaderboard" />

        {(showSavedOnly || searchQuery.trim() !== '') && (
          <div className="section-heading" style={{ marginBottom: '30px' }}>
            <h2>{showSavedOnly ? 'Kaydedilen Haberler' : 'Arama Sonuçları'}</h2>
            {searchQuery.trim() !== '' && (
              <button onClick={() => setSearchQuery('')} className="icon-btn" style={{ marginLeft: 'auto', background: 'var(--bg-tertiary)', padding: '5px 15px', borderRadius: '4px', fontSize: '12px' }}>
                Temizle
              </button>
            )}
          </div>
        )}

        {filteredNews.length > 0 ? (
          <div className="portal-layout">
            {/* SOL GÖVDE: Ana Akış */}
            <div className="main-column">
              {!showSavedOnly && searchQuery.trim() === '' && heroNews && (
                <NewsCard 
                  news={heroNews} 
                  variant="hero"
                  onClick={() => handleNewsOpen(heroNews)} 
                />
              )}
              
              <div className="news-grid-2col">
                {gridNews.map((news) => (
                  <NewsCard 
                    key={news.id} 
                    news={news} 
                    onClick={() => handleNewsOpen(news)} 
                  />
                ))}
              </div>
            </div>

            {/* SAĞ SÜTUN: Gündemdekiler ve Reklam */}
            <div className="sidebar-column">
              
              {/* Sidebar Ad 1 */}
              <AdZone type="sidebar-rect" />

              <div>
                <h3 className="section-heading">En Çok Okunanlar</h3>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {trendingNews.map((news) => (
                    <NewsCard 
                      key={`trend-${news.id}`} 
                      news={news} 
                      variant="sidebar"
                      onClick={() => handleNewsOpen(news)} 
                    />
                  ))}
                </div>
              </div>

              {/* Sidebar Ad 2 */}
              <AdZone type="sidebar-tall" className="ad-sticky" />

            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
            <Bookmark size={48} style={{ marginBottom: '20px', opacity: 0.2 }} />
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-heading)' }}>İçerik Bulunamadı</h3>
            <p>Aradığınız kriterlere uygun haber yok.</p>
          </div>
        )}
      </main>

      {/* Classic Footer */}
      <footer className="classic-footer">
        <div className="classic-footer-inner">
          <div>
            <Logo variant="compact" />
            <p style={{ color: 'var(--text-secondary)', marginTop: '20px', fontSize: '14px', lineHeight: 1.8 }}>
              Söz Milletin, Türkiye'nin bağımsız ve ilkeli haber kaynağı. Doğru, tarafsız ve hızlı haberciliğin dijital adresi.
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
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>info@sozmilletin.com</p>
          </div>
        </div>
      </footer>

      {/* Basic Search Overlay */}
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

      {selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
          isSaved={savedNewsIds.includes(selectedNews.id)}
          onToggleSave={() => handleToggleSave(selectedNews.id)}
        />
      )}
    </div>
  );
}

export default App;
